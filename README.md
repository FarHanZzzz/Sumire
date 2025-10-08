# 🌸 Sumire - Anime Discovery Platform

**Live Site:** [https://farhanzzzz.github.io/Sumire/](https://farhanzzzz.github.io/Sumire/)

A modern, responsive anime discovery and tracking web application that helps users explore anime across different categories, manage their watchlist, and discover new shows with beautiful UI/UX design.

![Sumire Preview](public/preview.png)

## ✨ Features

### 🎯 **Core Functionality**
- **Multi-Category Browsing**: Upcoming releases, classic 90s anime, popular shows, hidden gems, and romance collections
- **Smart Search**: Real-time search across all anime with persistent search state
- **Personal Watchlist**: Add and manage your anime watchlist with local storage persistence
- **Detailed Anime Information**: View comprehensive details including synopsis, ratings, episodes, and trailers
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🎨 **Design & Performance**
- **Modern Glass Morphism UI**: Beautiful gradient backgrounds with backdrop blur effects
- **Smooth Animations**: 60 FPS hardware-accelerated animations and transitions
- **Lazy Loading**: Smart section loading for optimal performance
- **Mobile-First**: Touch-optimized interface with proper responsive breakpoints
- **Dark Theme**: Elegant warm orange and dark color scheme

### 🚀 **Technical Features**
- **Vanilla JavaScript**: No framework dependencies, pure ES6+ modules
- **Jikan API Integration**: Real anime data from MyAnimeList
- **Local Storage**: Persistent search and watchlist data
- **Progressive Loading**: Background preloading with skeleton screens
- **Error Handling**: Graceful fallbacks and retry mechanisms

## 🛠️ Technology Stack

### **Frontend**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, grid layouts, flexbox, animations
- **JavaScript ES6+**: Modules, async/await, classes, modern syntax

### **Styling**
- **CSS Grid & Flexbox**: Responsive layouts
- **Custom Properties**: Consistent color scheme and spacing
- **Glass Morphism**: Modern backdrop-filter effects
- **Hardware Acceleration**: GPU-optimized animations

### **API & Data**
- **Jikan API**: Unofficial MyAnimeList API for anime data
- **Local Storage**: Client-side data persistence
- **Fetch API**: Modern HTTP requests with error handling

## 📁 Project Structure

```
sumire/
├── index.html              # Main HTML file
├── README.md              # Documentation
├── LICENSE                # MIT License
├── package.json           # NPM configuration
├── public/                # Static assets
│   ├── favicon.png       # Site favicon
│   └── preview.png       # Social media preview
└── src/                   # Source code
    ├── app.js            # Main application logic
    ├── assets/           # Stylesheets
    │   └── styles/
    │       ├── main.css       # Core styling
    │       └── components.css # Component styles
    ├── components/       # UI Components
    │   ├── AnimeDetails.js   # Modal detail view
    │   ├── NewsCard.js       # Anime card component
    │   └── WatchList.js      # Watchlist management
    ├── services/         # API Services
    │   ├── newsApi.js        # Jikan API integration
    │   └── watchlistService.js # Local storage service
    └── utils/            # Utilities
        └── helpers.js        # Helper functions
```

## 🚀 Getting Started

### **Prerequisites**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Node.js 14+ (for development)
- NPM or Yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/FarHanZzzz/Sumire.git
   cd Sumire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

### **Production Build**
The site is optimized for static hosting and works directly from the file system.

```bash
# For GitHub Pages deployment
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 🎮 How to Use

### **Navigation**
1. **Browse Categories**: Click navigation buttons to switch between anime sections
   - **Upcoming**: Latest and upcoming anime releases
   - **Classics**: Timeless 90s anime masterpieces  
   - **Popular**: Fan favorites and trending hits
   - **Underrated**: Hidden gems worth discovering
   - **DAWN**: Romance, harem, ecchi, and yuri anime
   - **Watchlist**: Your personal anime collection

### **Search Functionality**
2. **Search Anime**: Use the search bar to find specific anime
   - Real-time filtering across current section
   - Persistent search state (remembers your search)
   - Clear search with the ✕ button

### **Anime Management**
3. **View Details**: Click "📖 Details" or the play button for full information
4. **Add to Watchlist**: Click "⭐ Watchlist" to save anime for later
5. **Remove from Watchlist**: Click "Remove" in the watchlist section

### **Mobile Usage**
6. **Touch Navigation**: Optimized for mobile with proper touch targets
7. **Responsive Design**: Adapts to any screen size automatically

## 🔧 Development

### **File Structure Explanation**

#### **Core Application (`src/app.js`)**
```javascript
class App {
    constructor() {
        // Initialize containers, modal, cache
        this.containers = { /* anime section containers */ };
        this.sectionCache = { /* cached API data */ };
        this.modal = document.getElementById('anime-modal');
    }

    async init() {
        // Setup navigation, modal, watchlist
        // Load first section immediately
        // Background preload other sections
    }

    async showSection(section) {
        // Handle section switching
        // Load data on-demand if not cached
        // Update UI and search state
    }
}
```

#### **API Integration (`src/services/newsApi.js`)**
```javascript
// Jikan API endpoints for different anime categories
const API_BASE = 'https://api.jikan.moe/v4';

const fetchNewUpcomingAnime = async () => {
    // Get current season anime
    const response = await fetch(`${API_BASE}/seasons/now?limit=20`);
    return processAnimeData(response);
};

const fetchClassic90sAnime = async () => {
    // Get 90s anime with high ratings
    const response = await fetch(`${API_BASE}/anime?q=&start_date=1990-01-01&end_date=1999-12-31`);
    return processAnimeData(response);
};
```

### **Performance Optimizations**

1. **Lazy Loading**: Sections load on-demand when clicked
2. **Background Preloading**: Other sections load quietly after initial render (200ms delay)
3. **Hardware Acceleration**: `transform: translate3d(0,0,0)` for GPU rendering
4. **Skeleton Screens**: Smooth loading states while fetching data
5. **Caching**: API responses cached in memory for instant section switching

### **Responsive Breakpoints**
```css
/* Mobile First Approach */
@media (max-width: 480px) { /* Small mobile - 1 card */ }
@media (max-width: 768px) { /* Mobile/tablet - 1-2 cards */ }  
@media (max-width: 840px) { /* Tablet - 2-3 cards */ }
@media (min-width: 1200px) { /* Desktop - 3-4 cards */ }
```

## 🎨 Design System

### **Color Palette**
```css
/* Primary Brand Colors */
--brand-orange: #ff7b23     /* Main accent color */
--brand-accent-red: #ff3d2e /* Secondary accent */
--brand-deep: #e85600       /* Dark accent variant */

/* Background Hierarchy */
--bg-deep: #0f141a          /* Deepest background */
--bg-panel: #1b242c         /* Panel/card backgrounds */
--bg-soft: #fef9f5          /* Light content areas */

/* Text Hierarchy */
--text-dark: #1a1f23        /* Primary headings */
--text-light: #6b747c       /* Secondary text */
--text-strong: #14181c      /* Emphasis text */
```

### **Typography Scale**
```css
/* Responsive Typography */
--font-primary: 'Inter', system-ui, sans-serif;
--font-display: 'Plus Jakarta Sans', sans-serif;

/* Fluid Sizing */
.section-title { font-size: clamp(2rem, 6vw, 4.5rem); }
.anime-card__title { font-size: clamp(1.1rem, 2vw, 1.3rem); }
```

## 📱 Mobile Optimization

### **Touch-Friendly Design**
```css
/* Minimum touch target sizes */
.nav-btn { min-height: 36px; min-width: 65px; }
.button-primary { padding: 0.8rem 1rem; }

/* Touch feedback */
button { 
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}
```

### **Performance on Mobile**
- **Reduced animations** on smaller screens
- **Optimized images** with proper aspect ratios
- **Progressive enhancement** approach
- **Touch gesture support** with proper event handling

## 🔌 API Integration

### **Jikan API v4 (MyAnimeList)**
```javascript
// Base configuration
const API_BASE = 'https://api.jikan.moe/v4';

// Common API patterns
const fetchAnime = async (endpoint) => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        return data.data.map(anime => ({
            id: anime.mal_id,
            title: anime.title,
            image: anime.images.jpg.large_image_url,
            score: anime.score || 'N/A',
            synopsis: anime.synopsis,
            // ... more fields
        }));
    } catch (error) {
        console.error('API Error:', error);
        return getFallbackData(); // Graceful fallback
    }
};
```

### **Rate Limiting & Error Handling**
- **Respectful delays**: 100ms between background preloads
- **Retry logic**: Automatic retry for failed requests
- **Fallback data**: Local backup data when API is unavailable
- **Error boundaries**: User-friendly error messages with retry buttons

## 🚀 Deployment

### **GitHub Pages (Current)**
1. **Automatic deployment** from `main` branch
2. **Custom domain ready** (optional)
3. **HTTPS enabled** by default
4. **Global CDN** via GitHub's infrastructure

### **Alternative Hosting Options**

#### **Netlify**
```bash
# Drag and drop deployment
1. Build the project locally
2. Drag dist folder to Netlify
3. Configure redirects if needed
```

#### **Vercel**
```bash
# Git integration
1. Connect GitHub repository
2. Auto-deploy on push
3. Preview deployments for PRs
```

## 🤝 Contributing

### **Getting Started**
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/Sumire.git`
3. **Create branch**: `git checkout -b feature/amazing-feature`
4. **Make changes** following the code style
5. **Test thoroughly** across devices
6. **Commit**: `git commit -m 'Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Create Pull Request**

### **Code Style Guidelines**
```javascript
// Use modern ES6+ features
const fetchData = async () => {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
```

## 📄 License

This project is licensed under the **MIT License**.

## 🙏 Acknowledgments

### **Data & APIs**
- **[Jikan API](https://jikan.moe/)**: Unofficial MyAnimeList API providing anime data
- **[MyAnimeList](https://myanimelist.net/)**: Original source of comprehensive anime information

### **Design & Development**
- **[Google Fonts](https://fonts.google.com/)**: Inter and Plus Jakarta Sans typography
- **Modern Web Standards**: Leveraging latest CSS and JavaScript features

## 📞 Contact & Links

### **Developer**
- **GitHub**: [@FarHanZzzz](https://github.com/FarHanZzzz)
- **Repository**: [https://github.com/FarHanZzzz/Sumire](https://github.com/FarHanZzzz/Sumire)

### **Live Application**
- **Production Site**: [https://farhanzzzz.github.io/Sumire/](https://farhanzzzz.github.io/Sumire/)
- **Development**: `http://localhost:8080` (when running locally)

---

<div align="center">

**Made with ❤️ for anime lovers everywhere** 🌸

[🚀 **Visit Sumire**](https://farhanzzzz.github.io/Sumire/) | [⭐ **Star on GitHub**](https://github.com/FarHanZzzz/Sumire) | [🐛 **Report Issues**](https://github.com/FarHanZzzz/Sumire/issues)

</div>