import { fetchAnimeNews } from './services/newsApi.js';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from './services/watchlistService.js';

class App {
    constructor() {
        this.newsContainer = document.getElementById('news-container');
        this.watchlistContainer = document.getElementById('watchlist-container');
        this.init();
    }

    async init() {
        await this.loadNews();
        this.setupNavigation();
        this.loadWatchlist();
    }

    async loadNews() {
        try {
            this.newsContainer.innerHTML = '<div class="loading">Loading anime news...</div>';
            console.log('Starting to fetch news...');
            
            const news = await fetchAnimeNews();
            console.log('Fetched news:', news);
            
            this.newsContainer.innerHTML = '';
            
            if (news && news.length > 0) {
                console.log(`Displaying ${news.length} news articles`);
                news.forEach((article, index) => {
                    this.createNewsCard(article, index);
                });
            } else {
                console.log('No news found, showing error message');
                this.newsContainer.innerHTML = '<div class="error">No news available. Please check your internet connection.</div>';
            }
        } catch (error) {
            console.error('Error loading news:', error);
            this.newsContainer.innerHTML = `<div class="error">Failed to load news: ${error.message}</div>`;
        }
    }

    createNewsCard(article, index) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <img src="${article.image || 'https://via.placeholder.com/300x200'}" alt="${article.title}" class="news-card__image">
            <div class="news-card__content">
                <h3 class="news-card__title">${article.title}</h3>
                <p class="news-card__summary">${article.summary}</p>
                <div class="news-card__meta">
                    <span class="news-card__date">${article.date}</span>
                    <button class="button add-to-watchlist" data-anime-id="${article.id}" data-anime-title="${article.title}" data-anime-image="${article.image}">
                        ⭐ Add to Watchlist
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener for watchlist button
        const addButton = card.querySelector('.add-to-watchlist');
        addButton.addEventListener('click', (e) => {
            const animeData = {
                id: e.target.dataset.animeId,
                title: e.target.dataset.animeTitle,
                image: e.target.dataset.animeImage
            };
            this.addToWatchlist(animeData);
        });
        
        this.newsContainer.appendChild(card);
    }

    addToWatchlist(anime) {
        if (addToWatchlist(anime)) {
            alert(`${anime.title} added to watchlist!`);
            this.loadWatchlist();
        } else {
            alert(`${anime.title} is already in your watchlist!`);
        }
    }

    loadWatchlist() {
        const watchlist = getWatchlist();
        this.watchlistContainer.innerHTML = '';
        
        if (watchlist.length === 0) {
            this.watchlistContainer.innerHTML = '<div class="empty-watchlist">Your watchlist is empty</div>';
            return;
        }
        
        watchlist.forEach((anime, index) => {
            this.createWatchlistItem(anime, index);
        });
    }

    createWatchlistItem(anime, index) {
        const item = document.createElement('div');
        item.className = 'watchlist-item';
        item.style.animationDelay = `${index * 0.1}s`;
        item.innerHTML = `
            <img src="${anime.image || 'https://via.placeholder.com/90x135'}" alt="${anime.title}" class="watchlist-item__image">
            <div class="watchlist-item__info">
                <h4>${anime.title}</h4>
                <p style="color: var(--text-light); margin-top: 0.5rem; font-size: 0.9rem;">Added to watchlist</p>
            </div>
            <button class="watchlist-item__remove" data-anime-id="${anime.id}">🗑️ Remove</button>
        `;
        
        const removeButton = item.querySelector('.watchlist-item__remove');
        removeButton.addEventListener('click', (e) => {
            removeFromWatchlist(e.target.dataset.animeId);
            item.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                this.loadWatchlist();
            }, 300);
        });
        
        this.watchlistContainer.appendChild(item);
    }

    setupNavigation() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
        
        // Add refresh button functionality
        const refreshButton = document.getElementById('refresh-news');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadNews();
            });
        }
    }

    showSection(section) {
        if (section === 'home') {
            this.newsContainer.style.display = 'grid';
            this.watchlistContainer.style.display = 'none';
        } else if (section === 'watchlist') {
            this.newsContainer.style.display = 'none';
            this.watchlistContainer.style.display = 'grid';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});