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
        this.toastContainer = null; // lazy init
        this.lastFocusedElement = null; // restore focus after modal
        this.modalKeydownHandler = null; // focus trap handler ref

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
        // Setup UI first for instant feedback
        this.setupNavigation();
        this.setupModal();
        this.loadWatchlist();
        this.renderSearchBar();
        this.attachLoadMore();
        
        // Show first section and load only that section initially
        this.showSection('new');
        // Load the first section
        await this.loadSection('newAnime', fetchNewUpcomingAnime);
        
        // Preload other sections in background after a much shorter delay
        setTimeout(() => this.preloadOtherSections(), 200);
    }

    async preloadOtherSections() {
        // Load other sections in background, much faster
        const sectionsToLoad = [
            { key: 'popularAnime', fn: fetchPopularAnime },
            { key: 'classicAnime', fn: fetchClassic90sAnime },
            { key: 'underratedAnime', fn: fetchUnderratedAnime },
            { key: 'hotzAnime', fn: fetchHotzAnime }
        ];

        for (const section of sectionsToLoad) {
            try {
                // Only preload if not already loaded
                if (!this.sectionCache[section.key] || this.sectionCache[section.key].length === 0) {
                    await this.loadSection(section.key, section.fn);
                    // Much shorter delay between sections - 100ms instead of 500ms
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.warn(`Failed to preload ${section.key}:`, error);
            }
        }
        console.log('🚀 Background preloading complete');
    }

    async loadSection(key, fetchFn, append = false) {
        const container = this.containers[key];
        if (!append) {
            container.innerHTML = '';
            this.renderSkeletons(container, 6);
        }
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
            this.showToast('Failed to load section', 'error');
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

    renderSearchBar() {
        // Create a simple search bar at top of main if not exist
        if (document.getElementById('search-bar')) return;
        const main = document.querySelector('main');
        const bar = document.createElement('div');
        bar.id = 'search-bar';
        bar.className = 'search-bar';
        bar.innerHTML = `
            <div class="search-group">
                <input type="text" id="searchInput" placeholder="Search anime titles..." class="search-input" />
                <button id="clearSearch" class="search-clear" aria-label="Clear search">✕</button>
            </div>`;
        main.prepend(bar);

        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', () => this.applySearch());
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.applySearch();
        });

        // Load persisted search
        const saved = this.getSavedSearch();
        if (saved && saved.query) {
            searchInput.value = saved.query;
            this.applySearch();
        }
    }

    applySearch() {
        const search = (document.getElementById('searchInput')?.value || '').toLowerCase();

        // Determine current visible section
        const activeBtn = document.querySelector('.nav-btn.active');
        if (!activeBtn) return;
        const sectionKeyMap = {
            new: 'newAnime',
            classic: 'classicAnime',
            popular: 'popularAnime',
            underrated: 'underratedAnime',
            hotz: 'hotzAnime'
        };
        const key = sectionKeyMap[activeBtn.dataset.section];
        if (!key) return;

        const cache = this.sectionCache[key] || [];
        let filtered = cache.slice();
        if (search) {
            filtered = filtered.filter(a => a.title.toLowerCase().includes(search));
        }

        // Re-render container
        const container = this.containers[key];
        container.innerHTML = '';
        if (filtered.length === 0 && search) {
            container.innerHTML = '<div class="no-results">No anime found matching your search</div>';
        } else {
            filtered.forEach((item, idx) => this.createAnimeCard(item, idx, container));
        }

        // Persist search
        this.saveSearch({ query: search, section: activeBtn.dataset.section });
    }

    createAnimeCard(anime, index, container) {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="anime-card__image-container">
                <img loading="lazy" src="${anime.image}" alt="${anime.title}" class="anime-card__image">
                <div class="anime-card__overlay">
                    <button class="play-button" aria-label="View details for ${anime.title}" data-anime-id="${anime.id}">▶️</button>
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
                <div class="anime-card__meta-line meta-line">
                    <span class="meta-pill meta-pill--status">Status: ${anime.status}</span>
                    <span class="meta-pill meta-pill--score">Score: ${anime.score}</span>
                    <span class="meta-pill meta-pill--episodes">Episodes: ${anime.episodes}</span>
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
            this.showToast(`${anime.title} added to watchlist ✓`, 'success');
            this.loadWatchlist();
        } else {
            this.showToast(`${anime.title} already in watchlist`, 'info');
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
            <img loading="lazy" src="${anime.image || 'https://via.placeholder.com/90x135'}" alt="${anime.title}" class="watchlist-item__image">
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
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                
                // Instant navigation - no loading text for fast switching
                try {
                    await this.showSection(section);
                    
                    // Update active state immediately
                    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                } catch (error) {
                    console.error('Error loading section:', error);
                    this.showToast('Failed to load section', 'error');
                }
            });
        });
    }

    setupModal() {
        const closeBtn = this.modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => this.closeModal());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.closeModal();
            }
        });
    }

    closeModal() {
        this.modal.style.display = 'none';
        if (this.modalKeydownHandler) {
            document.removeEventListener('keydown', this.modalKeydownHandler, true);
            this.modalKeydownHandler = null;
        }
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }
    }

    async showAnimeDetails(animeId) {
        this.lastFocusedElement = document.activeElement;
        this.modal.style.display = 'flex';
        // Accessibility: clear previous, set focus after content loads
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = '<div class="loading">Loading anime details...</div>';
        
        const details = await getAnimeDetails(animeId);
        if (details) {
            modalBody.innerHTML = `
                <div class="anime-details">
                    <div class="anime-details__header">
                        <img src="${details.image}" alt="${details.title}" class="anime-details__image">
                        <div class="anime-details__info">
                            <h2 id="modal-title">${details.title}</h2>
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
            this.activateModalFocusTrap();
            const focusTarget = this.modal.querySelector('.close-modal') || this.modal;
            focusTarget.focus();
        } else {
            modalBody.innerHTML = '<div class="error">Failed to load anime details</div>';
            this.showToast('Failed to load details', 'error');
        }
    }

    async showSection(section) {
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
            sections['new'].style.display = 'block';
            section = 'new';
        }
        
        // Load section data on-demand if not already loaded
        await this.ensureSectionLoaded(section);
        
        // Update active navigation state
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[href="#${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Re-apply search automatically on section change
        if (document.getElementById('search-bar')) {
            this.applySearch();
        }

        // Update saved section (persist search if existing)
        const saved = this.getSavedSearch();
        if (saved) {
            saved.section = section;
            this.saveSearch(saved);
        }
    }

    async ensureSectionLoaded(section) {
        const sectionMap = {
            'new': { key: 'newAnime', fn: fetchNewUpcomingAnime },
            'classic': { key: 'classicAnime', fn: fetchClassic90sAnime },
            'popular': { key: 'popularAnime', fn: fetchPopularAnime },
            'underrated': { key: 'underratedAnime', fn: fetchUnderratedAnime },
            'hotz': { key: 'hotzAnime', fn: fetchHotzAnime }
        };

        const sectionConfig = sectionMap[section];
        if (!sectionConfig) return;

        // Check if section is already loaded - instant return for cached sections
        if (this.sectionCache[sectionConfig.key] && this.sectionCache[sectionConfig.key].length > 0) {
            return; // Already loaded - instant switching!
        }

        // Show minimal loading state for uncached sections
        const container = this.containers[sectionConfig.key];
        if (container) {
            container.innerHTML = this.createSkeletonLoader();
        }

        try {
            await this.loadSection(sectionConfig.key, sectionConfig.fn);
        } catch (error) {
            console.error(`Failed to load ${section} section:`, error);
            if (container) {
                container.innerHTML = '<div class="error-state">Failed to load anime. <button onclick="location.reload()" class="retry-btn">Retry</button></div>';
            }
        }
    }

    /* ================= Utility: Toasts ================= */
    ensureToastContainer() {
        if (!this.toastContainer) {
            const div = document.createElement('div');
            div.id = 'toast-container';
            div.setAttribute('role', 'status');
            div.setAttribute('aria-live', 'polite');
            document.body.appendChild(div);
            this.toastContainer = div;
        }
    }

    showToast(message, type = 'info', timeout = 3800) {
        this.ensureToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        // Force reflow for animation
        void toast.offsetWidth; // eslint-disable-line
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 450);
        }, timeout);
    }

    /* ================= Utility: Skeletons ================= */
    renderSkeletons(container, count = 6) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const sk = document.createElement('div');
            sk.className = 'anime-card skeleton-card';
            sk.innerHTML = `
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line short"></div>
                </div>`;
            frag.appendChild(sk);
        }
        container.appendChild(frag);
    }

    /* ================= Utility: Search Persistence ================= */
    saveSearch(obj) {
        try { localStorage.setItem('search', JSON.stringify(obj)); } catch(e) { /* ignore */ }
    }
    getSavedSearch() {
        try { return JSON.parse(localStorage.getItem('search') || 'null'); } catch(e) { return null; }
    }

    /* ================= Utility: Modal Focus Trap ================= */
    activateModalFocusTrap() {
        const focusable = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        this.modalKeydownHandler = (e) => {
            if (this.modal.style.display !== 'flex') return; // not open
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', this.modalKeydownHandler, true);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});