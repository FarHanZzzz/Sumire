function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function filterAnimeByGenre(animeList, genre) {
    return animeList.filter(anime => anime.genres.includes(genre));
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
    }
    return text;
}

export { formatDate, filterAnimeByGenre, truncateText };