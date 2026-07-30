/* ============================================
   RATING MODULE
   DGA Design System - Rating behavior + live demo
   Hydrates declarative ratings (data-max / data-value), with
   click-to-rate (half detection on the star's start half),
   hover preview, and keyboard support via real buttons.
   ============================================ */

class RatingManager {
    constructor() {
        this.content = document.getElementById('component-content');
        if (!this.content) return;
        /* #component-content persists across routes — anchor the stale-instance
           guard to this page's root so old document listeners self-remove
           instead of stacking (see DropdownManager). */
        this.pageRoot = this.content.firstElementChild;

        this.content.querySelectorAll('.rating[data-max]').forEach(el => this.hydrate(el));

        this._onClick = (e) => {
            if (!this.pageRoot || !this.pageRoot.isConnected) {
                document.removeEventListener('click', this._onClick, true);
                return;
            }
            const star = e.target.closest('.rating__star');
            if (!star || !this.content.contains(star)) return;
            const rating = star.closest('.rating');
            if (rating.classList.contains('rating--readonly')) return;
            const rect = star.getBoundingClientRect();
            const isRTL = getComputedStyle(rating).direction === 'rtl';
            const inStartHalf = isRTL
                ? e.clientX > rect.left + rect.width / 2
                : e.clientX < rect.left + rect.width / 2;
            const value = parseInt(star.dataset.star, 10) - (inStartHalf ? 0.5 : 0);
            rating.dataset.value = String(value);
            this.paint(rating, value);
        };
        document.addEventListener('click', this._onClick, true);

        // hover preview (full stars) — restores the committed value on leave
        this.content.addEventListener('mouseover', (e) => {
            const star = e.target.closest('.rating__star');
            if (!star) return;
            const rating = star.closest('.rating');
            if (rating.classList.contains('rating--readonly')) return;
            this.paint(rating, parseInt(star.dataset.star, 10));
        });
        this.content.addEventListener('mouseout', (e) => {
            const rating = e.target.closest?.('.rating');
            if (rating && !rating.contains(e.relatedTarget)) {
                this.paint(rating, parseFloat(rating.dataset.value) || 0);
            }
        });

        // Live demo (present only on the rating page)
        this.preview = document.getElementById('rating-demo-preview');
        if (this.preview) {
            this.sizeSelect = document.getElementById('rating-demo-size');
            this.toggles = {};
            this.initSwitches();
            this.sizeSelect.addEventListener('change', () => this.render());
            this.render();
        }
    }

    hydrate(el) {
        const max = parseInt(el.dataset.max, 10) || 5;
        const value = parseFloat(el.dataset.value) || 0;
        el.innerHTML = Array.from({ length: max }, (_, i) =>
            `<button type="button" class="rating__star" data-star="${i + 1}" aria-label="${i + 1} of ${max}">
                <span class="icon dga-icon-star" aria-hidden="true"></span>
                <span class="rating__star-fill"><span class="icon dga-icon-star solid rounded" aria-hidden="true"></span></span>
            </button>`).join('');
        el.setAttribute('role', 'radiogroup');
        this.paint(el, value);
    }

    paint(el, value) {
        el.querySelectorAll('.rating__star').forEach(star => {
            const n = parseInt(star.dataset.star, 10);
            star.dataset.fill = value >= n ? 'full' : value >= n - 0.5 ? 'half' : 'none';
        });
        el.setAttribute('aria-label', `${value} out of ${el.querySelectorAll('.rating__star').length} stars`);
    }

    /* ---------- live demo ---------- */
    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.classList.contains('active');

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                btn.classList.toggle('active', this.toggles[key]);
                btn.setAttribute('aria-checked', String(this.toggles[key]));
                this.render();
            });
        });
    }

    render() {
        const size = this.sizeSelect.value;
        const mods = ['rating', `rating--${size}`];
        if (this.toggles['brand']) mods.push('rating--brand');
        if (this.toggles['readonly']) mods.push('rating--readonly');
        const el = document.createElement('div');
        el.className = mods.join(' ');
        el.dataset.max = '5';
        el.dataset.value = '3.5';
        this.hydrate(el);
        this.preview.innerHTML = '';
        this.preview.appendChild(el);
        this.preview.dir = this.toggles['rtl'] ? 'rtl' : '';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RatingManager;
}
