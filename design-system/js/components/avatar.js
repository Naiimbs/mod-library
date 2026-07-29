/* ============================================
   AVATAR DEMO MODULE
   DGA Design System - Interactive Avatar Demo
   Powers the live demo controls on the Avatar page.
   ============================================ */

const AVATAR_DEMO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 68 68'%3E%3Crect width='68' height='68' fill='%2325935f'/%3E%3Ccircle cx='34' cy='26' r='12' fill='%23f3fcf6'/%3E%3Cellipse cx='34' cy='58' rx='21' ry='16' fill='%23f3fcf6'/%3E%3C/svg%3E";

class AvatarDemoManager {
    constructor() {
        this.preview = document.getElementById('avatar-demo-preview');
        this.typeSelect = document.getElementById('avatar-demo-type');
        this.sizeSelect = document.getElementById('avatar-demo-size');

        if (!this.preview || !this.typeSelect) return;

        this.toggles = {};
        this.initSwitches();
        this.typeSelect.addEventListener('change', () => this.render());
        this.sizeSelect.addEventListener('change', () => this.render());
        this.render();
    }

    initSwitches() {
        document.querySelectorAll('.live-demo__switch[data-toggle]').forEach(btn => {
            const key = btn.dataset.toggle;
            this.toggles[key] = btn.classList.contains('active');

            btn.addEventListener('click', () => {
                this.toggles[key] = !this.toggles[key];
                // Stacked implies group
                if (key === 'stacked' && this.toggles[key]) this.toggles['group'] = true;
                if (key === 'group' && !this.toggles[key]) this.toggles['stacked'] = false;
                this.updateSwitchUI('group');
                this.updateSwitchUI('stacked');
                this.updateSwitchUI(key);
                this.render();
            });
        });
    }

    updateSwitchUI(key) {
        const btn = document.querySelector(`.live-demo__switch[data-toggle="${key}"]`);
        if (btn) {
            btn.classList.toggle('active', !!this.toggles[key]);
            btn.setAttribute('aria-checked', String(!!this.toggles[key]));
        }
    }

    avatarHTML(type, size, initials) {
        const mods = [`avatar--${type}`, `avatar--${size}`];
        if (this.toggles['square']) mods.push('avatar--square');
        if (this.toggles['border']) mods.push('avatar--border');
        let inner = '';
        if (type === 'image') {
            inner = `<img src="${AVATAR_DEMO_IMG}" alt="Sample user photo">`;
        } else if (type === 'icon') {
            inner = `<span class="avatar__icon"><span class="icon dga-icon-user"></span></span>`;
        } else {
            inner = `<span class="avatar__text">${initials}</span>`;
        }
        return `<span class="avatar ${mods.join(' ')}">${inner}</span>`;
    }

    render() {
        const type = this.typeSelect.value;
        const size = this.sizeSelect.value;

        if (this.toggles['group']) {
            const stacked = this.toggles['stacked'] ? ' avatar-group--stacked' : '';
            this.preview.innerHTML =
                `<span class="avatar-group${stacked}">` +
                this.avatarHTML(type, size, 'am') +
                this.avatarHTML(type, size, 'sk') +
                this.avatarHTML(type, size, 'rh') +
                `<span class="avatar avatar--text avatar--${size} avatar-group__more"><span class="avatar__text">+5</span></span>` +
                `</span>`;
        } else {
            this.preview.innerHTML = this.avatarHTML(type, size, 'am');
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvatarDemoManager;
}
