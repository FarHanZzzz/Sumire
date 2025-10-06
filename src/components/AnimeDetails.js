export default function AnimeDetails({ anime }) {
    if (!anime) {
        return <div>No anime selected</div>;
    }

    return (
        <div className="anime-details">
            <h2>{anime.title}</h2>
            <img src={anime.image} alt={anime.title} />
            <p>{anime.summary}</p>
        </div>
    );
}