import { API } from '../utils/api.js';
import { DOM } from '../utils/dom.js';

export class CommentList {
    constructor(app, postId) {
        this.app = app;
        this.postId = postId;
        this.comments = [];
        this.filteredComments = [];
        this.post = null;
    }

    async render() {
        await this.loadData();
        
        const container = DOM.createElement('div', { className: 'comment-list' });
        
        const header = this.createHeader();
        const commentsContainer = this.createCommentsContainer();
        
        container.appendChild(header);
        container.appendChild(commentsContainer);
        
        return container;
    }

    createHeader() {
        const header = DOM.createElement('div', { className: 'section-header' });
        
        const postInfo = this.post ? 
            `Comments for: "${this.post.title}"` : 
            `Comments for Post #${this.postId}`;
            
        const title = DOM.createElement('h2', { 
            textContent: postInfo,
            className: 'section-title'
        });
        
        const stats = DOM.createElement('div', { className: 'comment-stats' });
        stats.textContent = `${this.filteredComments.length} comments`;
        
        const backBtn = DOM.createElement('button', {
            textContent: 'Back to Posts',
            className: 'btn btn-secondary',
            onclick: () => {
                // Возвращаемся к постам пользователя
                const userId = this.post ? this.post.userId : null;
                if (userId) {
                    this.app.navigateTo(`users#posts#${userId}`);
                } else {
                    this.app.navigateTo('users');
                }
            }
        });
        
        header.appendChild(title);
        header.appendChild(stats);
        header.appendChild(backBtn);
        
        return header;
    }

    createCommentsContainer() {
        const container = DOM.createElement('div', { className: 'comments-container' });
        
        if (this.filteredComments.length === 0) {
            const emptyMessage = DOM.createElement('div', { 
                className: 'empty-state',
                textContent: 'No comments found for this post'
            });
            container.appendChild(emptyMessage);
            return container;
        }
        
        const commentList = DOM.createElement('div', { className: 'comment-items' });
        
        this.filteredComments.forEach(comment => {
            const commentItem = this.createCommentItem(comment);
            commentList.appendChild(commentItem);
        });
        
        container.appendChild(commentList);
        return container;
    }

    createCommentItem(comment) {
        const commentItem = DOM.createElement('div', { className: 'comment-item' });
        
        const header = DOM.createElement('div', { className: 'comment-header' });
        
        const name = DOM.createElement('h4', {
            textContent: comment.name,
            className: 'comment-name'
        });
        
        const email = DOM.createElement('span', {
            textContent: comment.email,
            className: 'comment-email'
        });
        
        header.appendChild(name);
        header.appendChild(email);
        
        const body = DOM.createElement('p', {
            textContent: comment.body,
            className: 'comment-body'
        });
        
        const meta = DOM.createElement('div', {
            className: 'comment-meta',
            textContent: `Comment ID: ${comment.id}`
        });
        
        commentItem.appendChild(header);
        commentItem.appendChild(body);
        commentItem.appendChild(meta);
        
        return commentItem;
    }

    async loadData() {
        try {
            console.log('Loading comments for post:', this.postId);
            
            const allPosts = await API.getAllPosts();
            this.post = allPosts.find(post => post.id === this.postId);
            
            this.comments = await API.getPostComments(this.postId);
            this.filterComments();
            
            console.log('Loaded comments:', this.comments);
        } catch (error) {
            console.error('Error loading comments:', error);
            this.comments = [];
            this.filterComments();
        }
    }

    filterComments() {
        const searchTerm = this.app.getSearchTerm();
        
        if (!searchTerm) {
            this.filteredComments = this.comments;
            return;
        }
        
        this.filteredComments = this.comments.filter(comment => 
            comment.name.toLowerCase().includes(searchTerm) ||
            comment.body.toLowerCase().includes(searchTerm) ||
            comment.email.toLowerCase().includes(searchTerm)
        );
    }
}