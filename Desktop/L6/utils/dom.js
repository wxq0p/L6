export class DOM {
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        Object.keys(options).forEach(key => {
            if (key === 'textContent') {
                element.textContent = options[key];
            } else if (key === 'className') {
                element.className = options[key];
            } else if (key.startsWith('on')) {
                element.addEventListener(key.substring(2).toLowerCase(), options[key]);
            } else {
                element.setAttribute(key, options[key]);
            }
        });
        
        return element;
    }
}