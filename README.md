# 🌸 Sumire - Anime Discovery Platform

## Overview
Sumire is a modern anime discovery platform that helps users explore upcoming releases, classic series, popular titles, and hidden gems. Built with vanilla JavaScript and a beautiful warm color palette, it provides an intuitive browsing experience with real-time data from the Jikan API.

## ✨ Features
- **🔍 Smart Search**: Instantly search across all anime categories
- **📚 Multiple Collections**: Upcoming, Classics, Popular, Hidden Gems, and Romance categories
- **⭐ Personal Watchlist**: Add and manage your favorite anime
- **🎬 Detailed Views**: Rich modals with trailers, synopsis, and metadata
- **📱 Responsive Design**: Optimized for all screen sizes
- **🚀 Real-time Data**: Live API integration with fallback data
- **♿ Accessible**: Full keyboard navigation and screen reader support

## Project Structure
```
anime-news
├── src
│   ├── assets
│   │   └── styles
│   │       ├── main.css
│   │       └── components.css
│   ├── components
│   │   ├── NewsCard.js
│   │   ├── AnimeDetails.js
│   │   └── WatchList.js
│   ├── services
│   │   ├── newsApi.js
│   │   └── watchlistService.js
│   ├── utils
│   │   └── helpers.js
│   ├── index.html
│   └── app.js
├── public
│   └── index.html
├── package.json
└── README.md
```

## 🚀 Quick Start

### Development
```bash
# Clone the repository
git clone https://github.com/FarHanZzzz/Sumire.git
cd Sumire

# Install dependencies
npm install

# Start development server
npm start
```
The site will be available at `http://localhost:8080` (or another port if 8080 is busy).

### GitHub Pages Deployment
1. Push your code to the `main` branch
2. Go to Repository Settings → Pages
3. Set Source to "Deploy from a branch"
4. Select branch: `main`, folder: `/ (root)`
5. Save and wait for deployment

Your site will be live at: `https://FarHanZzzz.github.io/Sumire/`

## 🎯 Usage
- **🔍 Search**: Use the search bar to find specific anime titles
- **📑 Browse Categories**: Navigate between Upcoming, Classics, Popular, Hidden Gems, and Romance
- **⭐ Watchlist**: Click the watchlist button to save anime for later
- **📖 Details**: Click "Details" or the play button to view full information
- **🎬 Trailers**: Watch YouTube trailers directly from detail modals

## 🛠 Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **API**: Jikan (MyAnimeList API)
- **Storage**: LocalStorage for watchlist and search persistence
- **Dev Server**: live-server with hot reload
- **Deployment**: GitHub Pages (static hosting)

## License
This project is licensed under the ISC License.

http://127.0.0.1:50094/public/index.html