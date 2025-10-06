export function addToWatchlist(anime) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    
    // Check if anime is already in watchlist
    if (watchlist.some(item => item.id === anime.id)) {
        return false; // Already exists
    }
    
    watchlist.push(anime);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    return true;
}

export function removeFromWatchlist(animeId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(anime => anime.id !== animeId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

export function getWatchlist() {
    return JSON.parse(localStorage.getItem('watchlist')) || [];
}