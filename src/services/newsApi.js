// Fetch New Upcoming Anime
export const fetchNewUpcomingAnime = async () => {
    try {
        const response = await fetch('https://api.jikan.moe/v4/seasons/upcoming?limit=12');
        if (response.ok) {
            const data = await response.json();
            return data.data ? formatAnimeData(data.data) : getNewAnimeFallback();
        }
    } catch (error) {
        console.log('Using fallback for new anime');
    }
    return getNewAnimeFallback();
};

// Fetch Classic 90s Anime
export const fetchClassic90sAnime = async () => {
    try {
        const response = await fetch('https://api.jikan.moe/v4/anime?start_date=1990-01-01&end_date=1999-12-31&order_by=score&sort=desc&limit=12');
        if (response.ok) {
            const data = await response.json();
            return data.data ? formatAnimeData(data.data) : getClassicAnimeFallback();
        }
    } catch (error) {
        console.log('Using fallback for classic anime');
    }
    return getClassicAnimeFallback();
};

// Fetch Popular Anime
export const fetchPopularAnime = async () => {
    try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=12');
        if (response.ok) {
            const data = await response.json();
            return data.data ? formatAnimeData(data.data) : getPopularAnimeFallback();
        }
    } catch (error) {
        console.log('Using fallback for popular anime');
    }
    return getPopularAnimeFallback();
};

// Fetch Underrated Anime
export const fetchUnderratedAnime = async () => {
    try {
        const response = await fetch('https://api.jikan.moe/v4/anime?min_score=7&max_score=8.5&order_by=members&sort=asc&limit=12');
        if (response.ok) {
            const data = await response.json();
            return data.data ? formatAnimeData(data.data) : getUnderratedAnimeFallback();
        }
    } catch (error) {
        console.log('Using fallback for underrated anime');
    }
    return getUnderratedAnimeFallback();
};

// Get detailed anime information
export const getAnimeDetails = async (id) => {
    try {
        const [animeResponse, videosResponse] = await Promise.all([
            fetch(`https://api.jikan.moe/v4/anime/${id}`),
            fetch(`https://api.jikan.moe/v4/anime/${id}/videos`)
        ]);
        
        const animeData = animeResponse.ok ? await animeResponse.json() : null;
        const videosData = videosResponse.ok ? await videosResponse.json() : null;
        
        if (animeData?.data) {
            return {
                ...formatAnimeData([animeData.data])[0],
                fullSynopsis: animeData.data.synopsis,
                trailer: videosData?.data?.promo?.[0]?.trailer?.youtube_id || null,
                studios: animeData.data.studios?.map(s => s.name).join(', '),
                genres: animeData.data.genres?.map(g => g.name).join(', '),
                status: animeData.data.status,
                source: animeData.data.source,
                duration: animeData.data.duration
            };
        }
    } catch (error) {
        console.error('Error fetching anime details:', error);
    }
    return null;
};

// Format anime data helper function
function formatAnimeData(animeList) {
    return animeList.map(anime => ({
        id: anime.mal_id,
        title: anime.title || anime.title_english || 'Unknown Anime',
        summary: anime.synopsis ? anime.synopsis.substring(0, 200) + '...' : 'No description available',
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x400',
        score: anime.score || 'N/A',
        episodes: anime.episodes || 'TBA',
        year: anime.year || new Date().getFullYear(),
        status: anime.status || 'Unknown',
        type: anime.type || 'TV'
    }));
}

// Fallback data functions
function getNewAnimeFallback() {
    return [
        {
            id: 101,
            title: "Demon Slayer: Infinity Castle Arc",
            summary: "The highly anticipated continuation of Demon Slayer featuring the Infinity Castle battle with stunning animation and intense demon fights.",
            image: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
            score: 9.2,
            episodes: "TBA",
            year: 2024,
            status: "Upcoming",
            type: "Movie"
        },
        {
            id: 102,
            title: "Chainsaw Man Season 2",
            summary: "Denji returns with more chaotic devil hunting adventures in this highly anticipated second season of the blood-pumping series.",
            image: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",
            score: 8.8,
            episodes: "TBA",
            year: 2024,
            status: "Upcoming",
            type: "TV"
        },
        {
            id: 103,
            title: "Solo Leveling Season 2",
            summary: "Sung Jin-Woo continues his journey as the world's strongest hunter in this action-packed supernatural adventure.",
            image: "https://cdn.myanimelist.net/images/anime/1520/140362l.jpg",
            score: 8.5,
            episodes: 12,
            year: 2025,
            status: "Upcoming",
            type: "TV"
        }
    ];
}

function getClassicAnimeFallback() {
    return [
        {
            id: 201,
            title: "Neon Genesis Evangelion",
            summary: "A psychological mecha masterpiece that redefined anime with its complex themes, stunning visuals, and unforgettable characters.",
            image: "https://cdn.myanimelist.net/images/anime/1314/108941l.jpg",
            score: 8.5,
            episodes: 26,
            year: 1995,
            status: "Completed",
            type: "TV"
        },
        {
            id: 202,
            title: "Cowboy Bebop",
            summary: "Space bounty hunters in a jazz-fueled adventure that combines film noir, westerns, and incredible soundtrack.",
            image: "https://cdn.myanimelist.net/images/anime/4/19644l.jpg",
            score: 8.8,
            episodes: 26,
            year: 1998,
            status: "Completed",
            type: "TV"
        },
        {
            id: 203,
            title: "Dragon Ball Z",
            summary: "The legendary battles of Goku and friends that defined shounen anime with epic power-ups and unforgettable moments.",
            image: "https://cdn.myanimelist.net/images/anime/1277/142999l.jpg",
            score: 8.7,
            episodes: 291,
            year: 1989,
            status: "Completed",
            type: "TV"
        }
    ];
}

function getPopularAnimeFallback() {
    return [
        {
            id: 301,
            title: "Attack on Titan",
            summary: "Humanity's struggle against giant titans in this dark, intense series that captivated audiences worldwide.",
            image: "https://cdn.myanimelist.net/images/anime/1988/122803l.jpg",
            score: 9.0,
            episodes: 75,
            year: 2013,
            status: "Completed",
            type: "TV"
        },
        {
            id: 302,
            title: "Your Name",
            summary: "A breathtaking romantic fantasy about two teenagers who mysteriously swap bodies across time and space.",
            image: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg",
            score: 8.4,
            episodes: 1,
            year: 2016,
            status: "Completed",
            type: "Movie"
        },
        {
            id: 303,
            title: "Jujutsu Kaisen",
            summary: "Modern supernatural action with incredible fight scenes as students battle cursed spirits in contemporary Japan.",
            image: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
            score: 8.5,
            episodes: 24,
            year: 2020,
            status: "Ongoing",
            type: "TV"
        }
    ];
}

function getUnderratedAnimeFallback() {
    return [
        {
            id: 401,
            title: "Mushishi",
            summary: "A meditative journey through mystical encounters with supernatural creatures called Mushi in beautiful, atmospheric storytelling.",
            image: "https://cdn.myanimelist.net/images/anime/2/73862l.jpg",
            score: 8.7,
            episodes: 26,
            year: 2005,
            status: "Completed",
            type: "TV"
        },
        {
            id: 402,
            title: "Monster",
            summary: "A psychological thriller following a doctor's pursuit of a dangerous patient in this mature, complex narrative.",
            image: "https://cdn.myanimelist.net/images/anime/10/18793l.jpg",
            score: 9.0,
            episodes: 74,
            year: 2004,
            status: "Completed",
            type: "TV"
        },
        {
            id: 403,
            title: "Planetes",
            summary: "Space debris collectors deal with realistic space exploration themes in this scientifically accurate anime.",
            image: "https://cdn.myanimelist.net/images/anime/1445/111792l.jpg",
            score: 8.3,
            episodes: 26,
            year: 2003,
            status: "Completed",
            type: "TV"
        }
    ];
}
        
        // Fallback data if API fails
        return [
            {
                id: 1,
                title: "Attack on Titan: Final Season",
                summary: "The final season of the epic anime series continues with intense battles and revelations about the truth behind the walls.",
                image: "https://cdn.myanimelist.net/images/anime/1988/122803l.jpg",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 9.0,
                episodes: 28
            },
            {
                id: 2,
                title: "Demon Slayer: Kimetsu no Yaiba",
                summary: "Follow Tanjiro's journey as he continues to fight demons and search for a cure for his sister Nezuko.",
                image: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 8.7,
                episodes: 44
            },
            {
                id: 3,
                title: "Jujutsu Kaisen",
                summary: "Yuji Itadori joins a secret organization of Jujutsu Sorcerers to kill a powerful Curse named Ryomen Sukuna.",
                image: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 8.5,
                episodes: 24
            },
            {
                id: 4,
                title: "My Hero Academia",
                summary: "In a world where people with superpowers are the norm, Izuku Midoriya dreams of becoming a hero despite being born without powers.",
                image: "https://cdn.myanimelist.net/images/anime/10/78745l.jpg",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 7.9,
                episodes: 138
            },
            {
                id: 5,
                title: "One Piece",
                summary: "Follow Monkey D. Luffy and his crew as they continue their epic adventure to find the legendary treasure known as One Piece.",
                image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 9.0,
                episodes: 1000
            },
            {
                id: 6,
                title: "Spirited Away",
                summary: "A magical tale of a young girl who enters a world ruled by gods, witches, and spirits where humans are transformed into beasts.",
                image: "https://cdn.myanimelist.net/images/anime/6/179l.jpg",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 9.3,
                episodes: 1
            }
        ];
}