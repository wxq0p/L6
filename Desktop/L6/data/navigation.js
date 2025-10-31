export const navigationMap = {
    'users': {
        title: 'Пользователи',
        path: '#users',
        parent: null
    },
    'users#todos': {
        title: 'Задачи пользователя',
        path: '#users#todos',
        parent: 'users'
    },
    'users#posts': {
        title: 'Посты пользователя',
        path: '#users#posts',
        parent: 'users'
    },
    'users#posts#comments': {
        title: 'Комментарии к посту',
        path: '#users#posts#comments',
        parent: 'users#posts'
    }
};

export const getBreadcrumbs = (currentPath) => {
    const breadcrumbs = [];
    let current = navigationMap[currentPath];
    
    while (current) {
        breadcrumbs.unshift(current);
        current = current.parent ? navigationMap[current.parent] : null;
    }
    
    return breadcrumbs;
};