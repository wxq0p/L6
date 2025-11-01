export class Storage {
    constructor() {
        this.usersKey = 'customUsers';
        this.todosKey = 'customTodos';
    }

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    getUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    deleteUser(userId) {
        const users = this.getUsers().filter(user => user.id !== userId);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        this.deleteUserTodos(userId);
    }

    saveTodo(todo) {
        const todos = this.getTodos();

        const existingIndex = todos.findIndex(t => t.id === todo.id);
        if (existingIndex !== -1) {
            todos[existingIndex] = todo;
        } else {
            todos.push(todo);
        }
        
        localStorage.setItem(this.todosKey, JSON.stringify(todos));
    }

    getTodos() {
        const todos = localStorage.getItem(this.todosKey);
        return todos ? JSON.parse(todos) : [];
    }

    getUserTodos(userId) {
        return this.getTodos().filter(todo => todo.userId === userId);
    }

    deleteUserTodos(userId) {
        const todos = this.getTodos().filter(todo => todo.userId !== userId);
        localStorage.setItem(this.todosKey, JSON.stringify(todos));
    }

    updateTodoStatus(todoId, completed) {
        const todos = this.getTodos();
        const updatedTodos = todos.map(todo => 
            todo.id === todoId ? { ...todo, completed } : todo
        );
        localStorage.setItem(this.todosKey, JSON.stringify(updatedTodos));
    }
}