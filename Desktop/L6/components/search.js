export class Search {
    constructor(app) {
        this.app = app;
        this.currentTerm = '';
        this.debounceTimer = null;
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.getElementById('search');
        if (this.container) {
            this.render();
        } else {
            console.warn('Search container not found');
            this.createContainer();
        }
    }

    createContainer() {
        const navSection = document.querySelector('.app-nav');
        if (navSection) {
            this.container = document.createElement('div');
            this.container.id = 'search';
            navSection.appendChild(this.container);
            this.render();
        }
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search...';
        input.className = 'search-input';
        input.value = this.currentTerm;
        
        input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        searchContainer.appendChild(input);
        this.container.appendChild(searchContainer);
    }

    handleSearch(term) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            this.currentTerm = term.trim().toLowerCase();
            if (this.app.router) {
                this.app.router.handleRouteChange();
            }
        }, 300);
    }

    getCurrentTerm() {
        return this.currentTerm;
    }
}