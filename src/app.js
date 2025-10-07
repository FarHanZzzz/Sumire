import { 
    fetchNewUpcomingAnime, 
    fetchClassic90sAnime, 
    fetchPopularAnime, 
    fetchUnderratedAnime,
    fetchHotzAnime,
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
            hotzAnime: document.getElementById('hotz-anime-container'),
            watchlist: document.getElementById('watchlist-container')
        };
        this.modal = document.getElementById('anime-modal');
        this.watchlistContainer = document.getElementById('watchlist-container'); // fix reference used later

        // pagination state per section
        this.pages = {
            newAnime: 1,
            classicAnime: 1,
            popularAnime: 1,
            underratedAnime: 1,
            hotzAnime: 1
        };
        this.pageSize = 12;

        // in-memory registry for dedupe
        this.globalIds = new Set();
        // cache for client-side filtering
        this.sectionCache = {
            newAnime: [],
            classicAnime: [],
            popularAnime: [],
            underratedAnime: [],
            hotzAnime: []
        };

        this.init();
    }

    async init() {
        await this.loadAllSections();
        this.setupNavigation();
        this.setupModal();
        this.loadWatchlist();
        
        // Show first section by default
        this.showSection('new');
    }

    async loadAllSections() {
        await Promise.all([
            this.loadSection('newAnime', fetchNewUpcomingAnime),
            this.loadSection('classicAnime', fetchClassic90sAnime),
            this.loadSection('popularAnime', fetchPopularAnime),
            this.loadSection('underratedAnime', fetchUnderratedAnime),
            this.loadSection('hotzAnime', fetchHotzAnime)
        ]);
        this.attachLoadMore();
        this.renderFilterBar();
    }

    async loadSection(key, fetchFn, append = false) {
        const container = this.containers[key];
        if (!append) container.innerHTML = '<div class="loading">Loading anime...</div>';
        try {
            const page = this.pages[key];
            const data = await fetchFn(page, this.pageSize);
            const existingScroll = container.scrollTop;
            if (!append) container.innerHTML = '';
            if (data?.length) {
                const filtered = [];
                for (const item of data) {
                    if (!this.globalIds.has(item.id)) {
                        this.globalIds.add(item.id);
                        filtered.push(item);
                    }
                }
                if (!append) this.sectionCache[key] = [...(this.sectionCache[key]||[]), ...filtered];
                filtered.forEach((item, idx) => this.createAnimeCard(item, idx + ((page-1)*this.pageSize), container));
                container.scrollTop = existingScroll;
            } else if (!append) {
                container.innerHTML = '<div class="error">No anime found</div>';
            }
        } catch (e) {
            console.error('Section load failed', key, e);
            if (!append) container.innerHTML = '<div class="error">Failed to load</div>';
        }
    }

    attachLoadMore() {
        const mappings = [
            { key: 'newAnime', sectionId: 'new-anime-section' },
            { key: 'classicAnime', sectionId: 'classic-anime-section' },
            { key: 'popularAnime', sectionId: 'popular-anime-section' },
            { key: 'underratedAnime', sectionId: 'underrated-anime-section' },
            { key: 'hotzAnime', sectionId: 'hotz-anime-section' }
        ];
        mappings.forEach(m => {
            const section = document.getElementById(m.sectionId);
            if (!section) return;
            let footer = section.querySelector('.section-footer');
            if (!footer) {
                footer = document.createElement('div');
                footer.className = 'section-footer';
                section.appendChild(footer);
            }
            const btn = document.createElement('button');
            btn.className = 'button load-more-btn';
            btn.textContent = 'Load More';
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                btn.textContent = 'Loading...';
                this.pages[m.key] += 1;
                await this.loadSection(m.key, this.getFetcher(m.key), true);
                btn.disabled = false;
                btn.textContent = 'Load More';
            });
            footer.appendChild(btn);
        });
    }

    getFetcher(key) {
        switch (key) {
            case 'newAnime': return fetchNewUpcomingAnime;
            case 'classicAnime': return fetchClassic90sAnime;
            case 'popularAnime': return fetchPopularAnime;
            case 'underratedAnime': return fetchUnderratedAnime;
            case 'hotzAnime': return fetchHotzAnime;
            default: return fetchNewUpcomingAnime;
        }
    }

    renderFilterBar() {
        // Create a global filter bar at top of main if not exist
        if (document.getElementById('filter-bar')) return;
        const main = document.querySelector('main');
        const bar = document.createElement('div');
        bar.id = 'filter-bar';
        bar.className = 'filter-bar';
        bar.innerHTML = `
            <div class="filter-group">
                <input type="text" id="searchInput" placeholder="Search title..." class="filter-input" />
                <select id="genreSelect" class="filter-input">
                    <option value="">All Genres</option>
                    <option>Action</option>
                    <option>Romance</option>
                    <option>Comedy</option>
                    <option>Drama</option>
                    <option>Fantasy</option>
                    <option>Sci-Fi</option>
                    <option>Harem</option>
                    <option>Ecchi</option>
                    <option>Yuri</option>
                </select>
                <select id="statusSelect" class="filter-input">
                    <option value="">Any Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Upcoming">Upcoming</option>
                </select>
                <select id="sortSelect" class="filter-input">
                    <option value="score_desc">Top Score</option>
                    <option value="score_asc">Low Score</option>
                    <option value="episodes_desc">Episodes (High)</option>
                    <option value="episodes_asc">Episodes (Low)</option>
                    <option value="title_asc">Title A-Z</option>
                    <option value="title_desc">Title Z-A</option>
                </select>
                <button id="applyFilters" class="button" style="min-width:140px;">Apply</button>
                <button id="clearFilters" class="button-secondary" style="min-width:140px;">Reset</button>
            </div>`;
        main.prepend(bar);

        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.resetFilters());
    }

    applyFilters() {
        const search = (document.getElementById('searchInput').value || '').toLowerCase();
        const genre = document.getElementById('genreSelect').value;
        const status = document.getElementById('statusSelect').value;
        const sort = document.getElementById('sortSelect').value;

        // Determine current visible section
        const activeLink = document.querySelector('.nav-links a.active');
        if (!activeLink) return;
        const sectionId = activeLink.getAttribute('href').substring(1);
        const sectionKeyMap = {
            'new-anime': 'newAnime',
            'classic': 'classicAnime',
            'popular': 'popularAnime',
            'underrated': 'underratedAnime',
            'hotz': 'hotzAnime'
        };
        const key = sectionKeyMap[sectionId];
        if (!key) return;

        const cache = this.sectionCache[key] || [];
        let filtered = cache.slice();
        if (search) filtered = filtered.filter(a => a.title.toLowerCase().includes(search));
        if (genre) filtered = filtered.filter(a => (a.genres || []).some(g => g.toLowerCase() === genre.toLowerCase()));
        if (status) filtered = filtered.filter(a => (a.status || '').toLowerCase().includes(status.toLowerCase()));

        const sorters = {
            score_desc: (a,b)=> (b.score||0) - (a.score||0),
            score_asc: (a,b)=> (a.score||0) - (b.score||0),
            episodes_desc: (a,b)=>(parseInt(b.episodes)||0)-(parseInt(a.episodes)||0),
            episodes_asc: (a,b)=>(parseInt(a.episodes)||0)-(parseInt(b.episodes)||0),
            title_asc: (a,b)=> a.title.localeCompare(b.title),
            title_desc: (a,b)=> b.title.localeCompare(a.title)
        };
        filtered.sort(sorters[sort] || sorters.score_desc);

        // Re-render container
        const container = this.containers[key];
        container.innerHTML = '';
        filtered.forEach((item, idx)=> this.createAnimeCard(item, idx, container));
    }

    resetFilters() {
        ['searchInput','genreSelect','statusSelect','sortSelect'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = (id==='sortSelect' ? 'score_desc' : '');
        });
        this.applyFilters();
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
                <h3 class="anime-card__title" style="font-weight:800;letter-spacing:.5px;">${anime.title}</h3>
                <div class="anime-card__info">
                    <span class="anime-card__type">${anime.type}</span>
                    <span class="anime-card__episodes">${anime.episodes} EP</span>
                    <span class="anime-card__year">${anime.year}</span>
                </div>
                <div class="anime-card__meta-line" style="display:flex;flex-wrap:wrap;gap:.6rem;margin:-.4rem 0 1rem;">
                    <span class="meta-pill" style="background:rgba(255,123,35,.12);color:#e85600;padding:.35rem .65rem;border-radius:12px;font-size:.72rem;font-weight:700;letter-spacing:.5px;">Status: ${anime.status}</span>
                    <span class="meta-pill" style="background:rgba(255,61,46,.12);color:#c92f1d;padding:.35rem .65rem;border-radius:12px;font-size:.72rem;font-weight:700;">Score: ${anime.score}</span>
                    <span class="meta-pill" style="background:rgba(27,36,44,.12);color:#1b242c;padding:.35rem .65rem;border-radius:12px;font-size:.72rem;font-weight:700;">Episodes: ${anime.episodes}</span>
                </div>
                <p class="anime-card__summary" style="font-weight:600;color:#2c3e50;">${anime.summary}</p>
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
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
                
                // Update active state
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
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
            'new': document.getElementById('new-anime-section'),
            'classic': document.getElementById('classic-anime-section'),
            'popular': document.getElementById('popular-anime-section'),
            'underrated': document.getElementById('underrated-anime-section'),
            'hotz': document.getElementById('hotz-anime-section'),
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

        // Re-apply filters automatically on section change
        if (document.getElementById('filter-bar')) {
            this.applyFilters();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});