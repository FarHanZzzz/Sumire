import { 
    fetchNewUpcomingAnime, 
    fetchClassic90sAnime, 
    fetchPopularAnime, 
    fetchUnderratedAnime,
    getAnimeDetails 
} from './services/newsApi.js';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from './services/watchlistService.js';

class App {
    constructor() {
        this.containers = {
            newAnime: document.getElementById('new-anime-container'),
            classicAnime: document.getElementById('classic-anime-container'),
            popularAnime: document.getElementById('popular-anime-container'),
            underratedAnime: document.getElementById('underrated-anime-container'),
            watchlist: document.getElementById('watchlist-container')
        };
        this.modal = document.getElementById('anime-modal');
        this.init();
    }

    async init() {
        await this.loadAllSections();
        this.setupNavigation();
        this.setupModal();
        this.loadWatchlist();
        
        // Show first section by default
        this.showSection('new-anime');
    }

    async loadAllSections() {
        const sections = [
            { name: 'newAnime', fetch: fetchNewUpcomingAnime, container: this.containers.newAnime },
            { name: 'classicAnime', fetch: fetchClassic90sAnime, container: this.containers.classicAnime },
            { name: 'popularAnime', fetch: fetchPopularAnime, container: this.containers.popularAnime },
            { name: 'underratedAnime', fetch: fetchUnderratedAnime, container: this.containers.underratedAnime }
        ];

        // Load all sections concurrently for better performance
        await Promise.all(sections.map(section => this.loadSection(section)));
    }

    async loadSection(section) {
        try {
            section.container.innerHTML = '<div class="loading">Loading amazing anime...</div>';
            
            const anime = await section.fetch();
            section.container.innerHTML = '';
            
            if (anime && anime.length > 0) {
                anime.forEach((item, index) => {
                    this.createAnimeCard(item, index, section.container);
                });
            } else {
                section.container.innerHTML = '<div class="error">No anime found</div>';
            }
        } catch (error) {
            console.error(`Error loading ${section.name}:`, error);
            section.container.innerHTML = `<div class="error">Failed to load ${section.name}</div>`;
        }
    }

    createAnimeCard(anime, index, container) {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="anime-card__image-container">
                <img src="${anime.image}" alt="${anime.title}" class="anime-card__image">
                <div class="anime-card__overlay">
                    <button class="play-button" data-anime-id="${anime.id}">▶️</button>
                </div>
                <div class="anime-card__score">${anime.score}</div>
            </div>
            <div class="anime-card__content">
                <h3 class="anime-card__title">${anime.title}</h3>
                <div class="anime-card__info">
                    <span class="anime-card__type">${anime.type}</span>
                    <span class="anime-card__episodes">${anime.episodes} EP</span>
                    <span class="anime-card__year">${anime.year}</span>
                </div>
                <p class="anime-card__summary">${anime.summary}</p>
                <div class="anime-card__actions">
                    <button class="button-primary view-details" data-anime-id="${anime.id}">
                        📖 Details
                    </button>
                    <button class="button-secondary add-to-watchlist" data-anime-id="${anime.id}" data-anime-title="${anime.title}" data-anime-image="${anime.image}">
                        ⭐ Watchlist
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const viewDetailsBtn = card.querySelector('.view-details');
        const addToWatchlistBtn = card.querySelector('.add-to-watchlist');
        const playButton = card.querySelector('.play-button');

        viewDetailsBtn.addEventListener('click', () => this.showAnimeDetails(anime.id));
        playButton.addEventListener('click', () => this.showAnimeDetails(anime.id));
        
        addToWatchlistBtn.addEventListener('click', (e) => {
            const animeData = {
                id: e.target.dataset.animeId,
                title: e.target.dataset.animeTitle,
                image: e.target.dataset.animeImage
            };
            this.addToWatchlist(animeData);
        });
        
        container.appendChild(card);
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
    }

    setupModal() {
        const closeBtn = this.modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            this.modal.style.display = 'none';
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }

    async showAnimeDetails(animeId) {
        this.modal.style.display = 'flex';
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = '<div class="loading">Loading anime details...</div>';
        
        const details = await getAnimeDetails(animeId);
        if (details) {
            modalBody.innerHTML = `
                <div class="anime-details">
                    <div class="anime-details__header">
                        <img src="${details.image}" alt="${details.title}" class="anime-details__image">
                        <div class="anime-details__info">
                            <h2>${details.title}</h2>
                            <div class="anime-details__stats">
                                <span class="stat">⭐ ${details.score}</span>
                                <span class="stat">📺 ${details.episodes} Episodes</span>
                                <span class="stat">📅 ${details.year}</span>
                                <span class="stat">📊 ${details.status}</span>
                            </div>
                            <div class="anime-details__genres">
                                ${details.genres ? details.genres.split(', ').map(genre => `<span class="genre-tag">${genre}</span>`).join('') : ''}
                            </div>
                            ${details.trailer ? `
                                <div class="anime-details__trailer">
                                    <a href="https://www.youtube.com/watch?v=${details.trailer}" target="_blank" class="trailer-button">
                                        🎬 Watch Trailer on YouTube
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="anime-details__synopsis">
                        <h3>Synopsis</h3>
                        <p>${details.fullSynopsis || details.summary}</p>
                    </div>
                    ${details.studios ? `
                        <div class="anime-details__production">
                            <h4>Studio: ${details.studios}</h4>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            modalBody.innerHTML = '<div class="error">Failed to load anime details</div>';
        }
    }

    showSection(section) {
        const sections = {
            'new-anime': document.getElementById('new-anime-section'),
            'classic': document.getElementById('classic-anime-section'),
            'popular': document.getElementById('popular-anime-section'),
            'underrated': document.getElementById('underrated-anime-section'),
            'watchlist': document.getElementById('watchlist-section')
        };
        
        // Hide all sections
        Object.values(sections).forEach(sec => sec.style.display = 'none');
        
        // Show selected section
        if (sections[section]) {
            sections[section].style.display = 'block';
        } else {
            // Default to new anime section
            sections['new-anime'].style.display = 'block';
        }
        
        // Update active navigation state
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[href="#${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});