import { API } from '../utils/api.js';
import { Storage } from '../utils/storage.js';
import { DOM } from '../utils/dom.js';

export class TodoList {
    constructor(app, userId) {
        this.app = app;
        this.userId = userId;
        this.todos = [];
        this.filteredTodos = [];
        this.storage = new Storage();
        this.user = null;
    }

    async render() {
        await this.loadData();
        
        const container = DOM.createElement('div', { className: 'todo-list' });
        
        const header = this.createHeader();
        const todosContainer = this.createTodosContainer();
        
        container.appendChild(header);
        container.appendChild(todosContainer);
        
        return container;
    }

    createHeader() {
        const header = DOM.createElement('div', { className: 'section-header' });
        
        const userInfo = this.user ? 
            `Todos for ${this.user.name}` : 
            `Todos for User #${this.userId}`;
            
        const title = DOM.createElement('h2', { 
            textContent: userInfo,
            className: 'section-title'
        });
        
        const addButton = DOM.createElement('button', {
            textContent: 'Add Todo',
            className: 'btn btn-primary',
            onclick: () => this.showAddTodoForm()
        });
        
        const stats = this.createStats();
        
        header.appendChild(title);
        header.appendChild(stats);
        header.appendChild(addButton);
        
        return header;
    }

    createStats() {
        const total = this.filteredTodos.length;
        const completed = this.filteredTodos.filter(todo => todo.completed).length;
        const pending = total - completed;
        
        const stats = DOM.createElement('div', { className: 'todo-stats' });
        
        const totalEl = DOM.createElement('span', { 
            textContent: `Total: ${total}`,
            className: 'stat-item'
        });
        
        const completedEl = DOM.createElement('span', { 
            textContent: `Completed: ${completed}`,
            className: 'stat-item stat-completed'
        });
        
        const pendingEl = DOM.createElement('span', { 
            textContent: `Pending: ${pending}`,
            className: 'stat-item stat-pending'
        });
        
        stats.appendChild(totalEl);
        stats.appendChild(completedEl);
        stats.appendChild(pendingEl);
        
        return stats;
    }

    createTodosContainer() {
        const container = DOM.createElement('div', { className: 'todos-container' });
        
        if (this.filteredTodos.length === 0) {
            const emptyMessage = DOM.createElement('div', { 
                className: 'empty-state',
                textContent: 'No todos found'
            });
            container.appendChild(emptyMessage);
            return container;
        }
        
        const todoList = DOM.createElement('div', { className: 'todo-items' });
        
        this.filteredTodos.forEach(todo => {
            const todoItem = this.createTodoItem(todo);
            todoList.appendChild(todoItem);
        });
        
        container.appendChild(todoList);
        return container;
    }

    createTodoItem(todo) {
        const todoItem = DOM.createElement('div', { 
            className: `todo-item ${todo.completed ? 'completed' : ''}`
        });
        
        const checkbox = DOM.createElement('input', {
            type: 'checkbox',
            className: 'todo-checkbox',
            checked: todo.completed,
            onchange: (e) => this.toggleTodo(todo.id, e.target.checked)
        });
        
        const content = DOM.createElement('div', { className: 'todo-content' });
        
        const title = DOM.createElement('span', {
            textContent: todo.title,
            className: 'todo-title'
        });
        
        const meta = DOM.createElement('div', {
            className: 'todo-meta',
            textContent: `ID: ${todo.id} | User ID: ${todo.userId} ${todo.isCustom ? '| Custom' : ''}`
        });
        
        content.appendChild(title);
        content.appendChild(meta);
        
        const deleteBtn = DOM.createElement('button', {
            textContent: 'Delete',
            className: 'btn btn-danger btn-sm',
            onclick: (e) => {
                e.stopPropagation();
                this.deleteTodo(todo.id);
            }
        });
        
        todoItem.appendChild(checkbox);
        todoItem.appendChild(content);
        
        if (todo.isCustom) {
            todoItem.appendChild(deleteBtn);
        }
        
        return todoItem;
    }

    showAddTodoForm() {
        const modal = this.createAddTodoModal();
        document.body.appendChild(modal);
    }

    createAddTodoModal() {
        const overlay = DOM.createElement('div', { className: 'modal-overlay' });
        const modal = DOM.createElement('div', { className: 'modal' });
        
        const title = DOM.createElement('h3', { 
            textContent: 'Add New Todo' 
        });
        
        const form = DOM.createElement('form', {
            onsubmit: (e) => this.handleAddTodo(e)
        });
        
        const titleInput = this.createFormInput('title', 'Todo Title', 'text', true);
        
        const completedGroup = DOM.createElement('div', { className: 'form-group checkbox' });
        const completedLabel = DOM.createElement('label', {
            textContent: 'Completed'
        });
        
        const completedInput = DOM.createElement('input', {
            type: 'checkbox',
            id: 'completed',
            name: 'completed'
        });
        
        completedLabel.appendChild(completedInput);
        completedGroup.appendChild(completedLabel);
        
        const buttonGroup = DOM.createElement('div', { className: 'form-actions' });
        
        const submitBtn = DOM.createElement('button', {
            type: 'submit',
            textContent: 'Add Todo',
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
        
        form.appendChild(titleInput);
        form.appendChild(completedGroup);
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

    async handleAddTodo(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const todoData = {
            userId: this.userId,
            title: formData.get('title'),
            completed: formData.get('completed') === 'on',
            isCustom: true,
            id: Date.now()
        };
        
        this.storage.saveTodo(todoData);
        
        e.target.closest('.modal-overlay').remove();
        await this.loadData();
        this.app.router.handleRouteChange();
    }

    async toggleTodo(todoId, completed) {
        console.log('Toggling todo:', todoId, 'to:', completed);
        
        const todoIndex = this.todos.findIndex(t => t.id === todoId);
        if (todoIndex === -1) {
            console.error('Todo not found:', todoId);
            return;
        }
        
        const todo = this.todos[todoIndex];
        
        if (todo.isCustom) {
            console.log('Updating custom todo in storage');
            todo.completed = completed;
            
            const customTodos = this.storage.getTodos();
            const updatedTodos = customTodos.map(t => 
                t.id === todoId ? { ...t, completed } : t
            );
            localStorage.setItem('customTodos', JSON.stringify(updatedTodos));
            
        } else {

            console.log('Creating custom copy of API todo');
            const customTodo = {
                ...todo,
                completed: completed,
                isCustom: true,
                originalId: todo.id, 
                id: `custom_${todo.id}_${Date.now()}` 
            };
            
            this.storage.saveTodo(customTodo);
        }
        

        this.todos[todoIndex].completed = completed;
        this.filterTodos();
        

        await this.loadData();
        this.app.router.handleRouteChange();
    }

    async deleteTodo(todoId) {
        if (confirm('Are you sure you want to delete this todo?')) {
            const todos = this.storage.getTodos().filter(todo => todo.id !== todoId);
            localStorage.setItem('customTodos', JSON.stringify(todos));
            
            await this.loadData();
            this.app.router.handleRouteChange();
        }
    }

    async loadData() {
        try {

            const users = await API.getUsers();
            this.user = users.find(user => user.id === this.userId);
            

            const apiTodos = await API.getUserTodos(this.userId);
            
            const customTodos = this.storage.getUserTodos(this.userId);
            
            const allTodos = [...apiTodos, ...customTodos];
            
            this.todos = allTodos.reduce((unique, todo) => {
                if (todo.isCustom && todo.originalId) {
                    const originalIndex = unique.findIndex(t => t.id === todo.originalId && !t.isCustom);
                    if (originalIndex !== -1) {
                        unique.splice(originalIndex, 1);
                    }
                }
                
                const existingIndex = unique.findIndex(t => t.id === todo.id);
                if (existingIndex === -1) {
                    unique.push(todo);
                } else {
                    if (todo.isCustom) {
                        unique[existingIndex] = todo;
                    }
                }
                
                return unique;
            }, []);
            
            this.filterTodos();
            
            console.log('Loaded todos:', this.todos);
            
        } catch (error) {
            console.error('Error loading todos:', error);
            this.todos = this.storage.getUserTodos(this.userId);
            this.filterTodos();
        }
    }

    filterTodos() {
        const searchTerm = this.app.getSearchTerm();
        
        if (!searchTerm) {
            this.filteredTodos = this.todos;
            return;
        }
        
        this.filteredTodos = this.todos.filter(todo => 
            todo.title.toLowerCase().includes(searchTerm)
        );
    }
}