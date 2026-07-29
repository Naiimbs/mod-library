/* ============================================
   SERVICE PAGE TEMPLATE MODULE
   Tabs, related-services carousel (scroll-snap + dots), mobile
   menu, page-feedback buttons and rating hydration for the
   service page screen template.
   ============================================ */

class ServicePageManager {
    constructor() {
        this.root = document.querySelector('.service-page');
        if (!this.root) return;
        this.toastTimer = null;
        this.renderCards();
        this.bindTabs();
        this.bindCarousel();
        this.bindStamp();
        this.bindMobileMenu();
        this.bindFeedback();
        this.hydrateRating();
    }

    /* ------------------------------------------
       TABS (Steps | Conditions | Required Documents)
       ------------------------------------------ */
    bindTabs() {
        const tabs = this.root.querySelectorAll('[data-sp-tab]');
        tabs.forEach(tab => tab.addEventListener('click', () => {
            tabs.forEach(t => {
                const active = t === tab;
                t.classList.toggle('active', active);
                t.setAttribute('aria-selected', String(active));
            });
            this.root.querySelectorAll('[data-sp-panel]').forEach(p => {
                p.hidden = p.dataset.spPanel !== tab.dataset.spTab;
            });
        }));
    }

    /* ------------------------------------------
       RELATED SERVICES CARDS + DOTS
       ------------------------------------------ */
    renderCards() {
        const track = this.root.querySelector('#sp-cards-track');
        if (!track) return;
        // real cards component anatomy: card-icon + card-content + card-footer
        const card = () => `
            <article class="card sp-card">
                <div class="card-icon">
                    <span class="icon dga-icon-checkmark-circle-02" aria-hidden="true"></span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Card Title</h3>
                    <p class="card-body">Card content placeholder text goes here.</p>
                </div>
                <div class="sp-card__tags">
                    <span class="tag tag--success">Tag 1</span>
                    <span class="tag tag--success">Tag 2</span>
                    <span class="tag tag--success">Tag 3</span>
                </div>
                <div class="card-footer">
                    <button type="button" class="btn btn-secondary-outline btn-small">Action</button>
                    <button type="button" class="btn btn-primary btn-small">Action</button>
                </div>
            </article>`;
        track.innerHTML = card() + card() + card() + card() + card();
    }

    bindCarousel() {
        const track = this.root.querySelector('#sp-cards-track');
        const dotsBox = this.root.querySelector('#sp-cards-dots');
        if (!track || !dotsBox) return;

        const pageCount = () => Math.max(1, Math.ceil((track.scrollWidth - track.clientWidth) /
            Math.max(1, track.clientWidth)) + 1);

        const renderDots = () => {
            const n = pageCount();
            dotsBox.innerHTML = '';
            for (let i = 0; i < n; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'sp-cards__dot';
                dot.setAttribute('aria-label', 'Go to page ' + (i + 1));
                dot.addEventListener('click', () => {
                    track.scrollTo({ left: i * track.clientWidth * (this.isRTL() ? -1 : 1), behavior: 'smooth' });
                });
                dotsBox.appendChild(dot);
            }
            paint();
        };

        const paint = () => {
            const n = dotsBox.children.length;
            if (!n) return;
            const progress = Math.abs(track.scrollLeft) / Math.max(1, track.scrollWidth - track.clientWidth);
            const active = Math.min(n - 1, Math.round(progress * (n - 1)));
            [...dotsBox.children].forEach((d, i) =>
                d.classList.toggle('sp-cards__dot--active', i === active));
        };

        track.addEventListener('scroll', () => paint(), { passive: true });
        window.addEventListener('resize', renderDots);
        renderDots();
    }

    isRTL() {
        return getComputedStyle(this.root).direction === 'rtl';
    }

    /* ------------------------------------------
       DIGITAL STAMP (component toggle)
       ------------------------------------------ */
    bindStamp() {
        const stamp = this.root.querySelector('.sp-govbar__stamp');
        if (!stamp) return;
        const toggle = stamp.querySelector('.digital-stamp__toggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            const open = stamp.classList.toggle('digital-stamp--opened');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    /* ------------------------------------------
       MOBILE MENU
       ------------------------------------------ */
    bindMobileMenu() {
        const burger = this.root.querySelector('.sp-nav__burger');
        const panel = this.root.querySelector('.sp-nav__mobile-panel');
        if (!burger || !panel) return;
        burger.addEventListener('click', () => {
            const open = panel.hidden;
            panel.hidden = !open;
            burger.setAttribute('aria-expanded', String(open));
        });
    }

    /* ------------------------------------------
       FEEDBACK (useful yes/no + demo buttons)
       ------------------------------------------ */
    bindFeedback() {
        this.root.querySelectorAll('[data-sp-useful]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.root.querySelectorAll('[data-sp-useful]').forEach(b =>
                    b.classList.remove('btn-primary'));
                this.root.querySelectorAll('[data-sp-useful]').forEach(b =>
                    b.classList.add('btn-secondary-outline'));
                btn.classList.remove('btn-secondary-outline');
                btn.classList.add('btn-primary');
                this.toast('Thanks for your feedback!');
            });
        });

        const demo = [
            ['.sp-start-btn', 'This is a demo — the service flow would start here.'],
            ['.sp-ratingbar__btn', 'This is a demo — the rating dialog would open here.'],
            ['.sp-manual-btn', 'This is a demo — the user manual would download here.'],
            ['.sp-video__play', 'This is a demo — the walkthrough video would play here.']
        ];
        demo.forEach(([sel, msg]) => {
            const el = this.root.querySelector(sel);
            if (el) el.addEventListener('click', () => this.toast(msg));
        });
        const contact = [...this.root.querySelectorAll('.sp-comments .btn')];
        contact.forEach(b => b.addEventListener('click', () => this.toast('This is a demo — the contact form would open here.')));
    }

    /* ------------------------------------------
       RATING (reuse the Rating component hydrator)
       ------------------------------------------ */
    hydrateRating() {
        if (typeof RatingManager !== 'undefined') {
            new RatingManager();
        }
    }

    toast(message) {
        let toast = document.getElementById('sp-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sp-toast';
            toast.setAttribute('aria-live', 'polite');
            toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
                'background:var(--gray-900);color:var(--gray-25);padding:10px 20px;' +
                'border-radius:var(--radius-md);font-size:var(--font-size-sm);z-index:1000;' +
                'opacity:0;transition:opacity .2s ease;pointer-events:none;max-width:90vw;text-align:center;';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
    }
}
