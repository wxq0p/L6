import { UserList } from './userList.js';
import { TodoList } from './todoList.js';
import { PostList } from './postList.js';
import { CommentList } from './commentList.js';

export class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            'users': this.showUsers.bind(this),
            'users#todos': this.showUserTodos.bind(this),
            'users#posts': this.showUserPosts.bind(this),
            'users#posts#comments': this.showPostComments.bind(this)
        };
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRouteChange());
        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1) || 'users';
        console.log('Route changed to:', hash);
        this.navigateTo(hash);
    }

    navigateTo(path) {
        console.log('Navigating to:', path);
        
        if (path.startsWith('users#todos#')) {
            this.showUserTodos();
            this.updateBrowserHistory(path);
        } else if (path.startsWith('users#posts#')) {
            this.showUserPosts();
            this.updateBrowserHistory(path);
        } else if (path.startsWith('users#posts#comments#')) {
            this.showPostComments();
            this.updateBrowserHistory(path);
        } else {
            const handler = this.routes[path];
            if (handler) {
                handler();
                this.updateBrowserHistory(path);
            } else {
                this.showUsers();
            }
        }
    }

    updateBrowserHistory(path) {
        window.history.replaceState(null, null, `#${path}`);
        this.updateBreadcrumbs(path);
    }

    updateBreadcrumbs(path) {
        const paths = path.split('#');
        const breadcrumbPaths = paths.map((p, index) => {
            const cleanPath = isNaN(p) ? p : this.getBreadcrumbNameForId(p, index, paths);
            return {
                name: cleanPath,
                path: paths.slice(0, index + 1).join('#')
            };
        });
        this.app.updateBreadcrumbs(breadcrumbPaths);
    }

    getBreadcrumbNameForId(id, index, paths) {
        if (index === 2 && paths[1] === 'todos') return `User ${id} Todos`;
        if (index === 2 && paths[1] === 'posts') return `User ${id} Posts`;
        if (index === 3 && paths[2] === 'comments') return `Post ${id} Comments`;
        return id;
    }

    async showUsers() {
        try {
            console.log('Showing users list');
            const userList = new UserList(this.app);
            const view = await userList.render();
            this.app.setView(view);
        } catch (error) {
            console.error('Error showing users:', error);
            this.showError('Failed to load users');
        }
    }

    async showUserTodos() {
        try {
            const userId = this.getUserIdFromHash();
            console.log('Showing todos for user:', userId);
            
            if (userId) {
                const todoList = new TodoList(this.app, userId);
                const view = await todoList.render();
                this.app.setView(view);
            } else {
                console.log('No user ID found, showing users list');
                this.showUsers();
            }
        } catch (error) {
            console.error('Error showing todos:', error);
            this.showError('Failed to load todos');
        }
    }

    async showUserPosts() {
        try {
            const userId = this.getUserIdFromHash();
            console.log('Showing posts for user:', userId);
            
            if (userId) {
                const postList = new PostList(this.app, userId);
                const view = await postList.render();
                this.app.setView(view);
            } else {
                console.log('No user ID found, showing users list');
                this.showUsers();
            }
        } catch (error) {
            console.error('Error showing posts:', error);
            this.showError('Failed to load posts');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>Error</h2>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
        `;
        this.app.setView(errorDiv);
    }

    async showPostComments() {
        const postId = this.getPostIdFromHash();
        console.log('Showing comments for post:', postId);
        
        if (postId) {
            const commentList = new CommentList(this.app, postId);
            const view = await commentList.render();
            this.app.setView(view);
        } else {
            this.showUsers();
        }
    }

    getUserIdFromHash() {
        const hash = window.location.hash.substring(1);
        console.log('Current hash:', hash);
        
        const match1 = hash.match(/users#todos#(\d+)/);
        const match2 = hash.match(/users#posts#(\d+)/);
        
        if (match1) {
            return parseInt(match1[1]);
        } else if (match2) {
            return parseInt(match2[1]);
        }
        
        return null;
    }

    getPostIdFromHash() {
        const hash = window.location.hash.substring(1);
        const match = hash.match(/users#posts#comments#(\d+)/);
        return match ? parseInt(match[1]) : null;
    }
}