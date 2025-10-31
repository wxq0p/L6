import { API } from '../utils/api.js';
import { Storage } from '../utils/storage.js';
import { DOM } from '../utils/dom.js';

export class UserList {
    constructor(app) {
        this.app = app;
        this.users = [];
        this.filteredUsers = [];
        this.storage = new Storage();
    }

    async render() {
        await this.loadData();
        
        const container = DOM.createElement('div', { className: 'user-list' });
        
        const header = this.createHeader();
        const userGrid = this.createUserGrid();
        
        container.appendChild(header);
        container.appendChild(userGrid);
        
        return container;
    }

    createHeader() {
        const header = DOM.createElement('div', { className: 'section-header' });
        
        const title = DOM.createElement('h2', { 
            textContent: 'Users',
            className: 'section-title'
        });
        
        const addButton = DOM.createElement('button', {
            textContent: 'Add User',
            className: 'btn btn-primary',
            onclick: () => this.showAddUserForm()
        });
        
        header.appendChild(title);
        header.appendChild(addButton);
        
        return header;
    }

    createUserGrid() {
        const grid = DOM.createElement('div', { className: 'user-grid' });
        
        this.filteredUsers.forEach(user => {
            const userCard = this.createUserCard(user);
            grid.appendChild(userCard);
        });
        
        return grid;
    }

    createUserCard(user) {
        const card = DOM.createElement('div', { className: 'user-card' });
        
        const name = DOM.createElement('h3', { 
            textContent: user.name,
            className: 'user-name'
        });
        
        const email = DOM.createElement('p', { 
            textContent: user.email,
            className: 'user-email'
        });
        
        const actions = this.createUserActions(user);
        
        card.appendChild(name);
        card.appendChild(email);
        card.appendChild(actions);
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.user-actions')) {
                this.app.navigateTo(`users#todos#${user.id}`);
            }
        });
        
        return card;
    }

    createUserActions(user) {
        const actions = DOM.createElement('div', { className: 'user-actions' });
        
        const todosBtn = DOM.createElement('button', {
            textContent: 'Todos',
            className: 'btn btn-secondary btn-sm',
            onclick: (e) => {
                e.stopPropagation();
                this.app.navigateTo(`users#todos#${user.id}`);
            }
        });
        
        const postsBtn = DOM.createElement('button', {
            textContent: 'Posts',
            className: 'btn btn-secondary btn-sm',
            onclick: (e) => {
                e.stopPropagation();
                this.app.navigateTo(`users#posts#${user.id}`);
            }
        });
        
        const deleteBtn = DOM.createElement('button', {
            textContent: 'Delete',
            className: 'btn btn-danger btn-sm',
            onclick: (e) => {
                e.stopPropagation();
                this.deleteUser(user.id);
            }
        });
        
        actions.appendChild(todosBtn);
        actions.appendChild(postsBtn);
        
        if (user.isCustom) {
            actions.appendChild(deleteBtn);
        }
        
        return actions;
    }

    showAddUserForm() {
        const modal = this.createAddUserModal();
        document.body.appendChild(modal);
    }

    createAddUserModal() {
        const overlay = DOM.createElement('div', { className: 'modal-overlay' });
        const modal = DOM.createElement('div', { className: 'modal' });
        
        const title = DOM.createElement('h3', { textContent: 'Add New User' });
        
        const form = DOM.createElement('form', {
            onsubmit: (e) => this.handleAddUser(e)
        });
        
        const nameInput = this.createFormInput('name', 'Name', 'text', true);
        const emailInput = this.createFormInput('email', 'Email', 'email', true);
        const usernameInput = this.createFormInput('username', 'Username', 'text', true);
        
        const buttonGroup = DOM.createElement('div', { className: 'form-actions' });
        
        const submitBtn = DOM.createElement('button', {
            type: 'submit',
            textContent: 'Add User',
            className: 'btn btn-primary'
        });
        
        const cancelBtn = DOM.createElement('button', {
            type: 'button',
            textContent: 'Cancel',
            className: 'btn btn-secondary',
            onclick: () => overlay.remove()
        });
        
        buttonGroup.appendChild(cancelBtn);
        buttonGroup.appendChild(submitBtn);
        
        form.appendChild(nameInput);
        form.appendChild(emailInput);
        form.appendChild(usernameInput);
        form.appendChild(buttonGroup);
        
        modal.appendChild(title);
        modal.appendChild(form);
        overlay.appendChild(modal);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        return overlay;
    }

    createFormInput(name, label, type, required = false) {
        const group = DOM.createElement('div', { className: 'form-group' });
        
        const labelEl = DOM.createElement('label', { 
            textContent: label,
            htmlFor: name
        });
        
        const input = DOM.createElement('input', {
            type: type,
            id: name,
            name: name,
            required: required
        });
        
        group.appendChild(labelEl);
        group.appendChild(input);
        
        return group;
    }

    async handleAddUser(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            username: formData.get('username'),
            isCustom: true,
            id: Date.now()
        };
        
        this.storage.saveUser(userData);
        
        e.target.closest('.modal-overlay').remove();
        await this.loadData();
        this.app.router.handleRouteChange();
    }

    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.storage.deleteUser(userId);
            await this.loadData();
            this.app.router.handleRouteChange();
        }
    }

async loadData() {
    try {
        console.log('Loading users data...');
        const apiUsers = await API.getUsers();
        const customUsers = this.storage.getUsers();
        
        this.users = [...apiUsers, ...customUsers];
        this.filterUsers();
        
        console.log('Loaded users:', this.users);
    } catch (error) {
        console.error('Error loading users:', error);
        this.users = this.storage.getUsers();
        this.filterUsers();
    }
}

    filterUsers() {
        const searchTerm = this.app.getSearchTerm();
        
        if (!searchTerm) {
            this.filteredUsers = this.users;
            return;
        }
        
        this.filteredUsers = this.users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
}