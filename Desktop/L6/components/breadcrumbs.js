export class Breadcrumbs {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.getElementById('breadcrumbs');
        if (!this.container) {
            console.warn('Breadcrumbs container not found');
            this.createContainer();
        }
    }

    createContainer() {
        const navSection = document.querySelector('.app-nav');
        if (navSection) {
            this.container = document.createElement('div');
            this.container.id = 'breadcrumbs';
            navSection.prepend(this.container);
        }
    }

    update(paths) {
        if (!this.container) {
            this.init();
            if (!this.container) return;
        }
        
        this.container.innerHTML = '';
        
        const breadcrumbElements = paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            return this.createBreadcrumb(path, isLast);
        });

        breadcrumbElements.forEach(element => {
            this.container.appendChild(element);
        });
    }

    createBreadcrumb(path, isLast) {
        const breadcrumb = document.createElement('span');
        breadcrumb.className = 'breadcrumb';
        
        if (!isLast) {
            const link = document.createElement('a');
            link.href = `#${path.path}`;
            link.textContent = path.name;
            breadcrumb.appendChild(link);
            
            const separator = document.createElement('span');
            separator.textContent = ' / ';
            separator.className = 'breadcrumb-separator';
            breadcrumb.appendChild(separator);
        } else {
            breadcrumb.textContent = path.name;
            breadcrumb.className += ' breadcrumb-current';
        }
        
        return breadcrumb;
    }
}