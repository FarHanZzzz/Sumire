export const fetchAnimeNews = async () => {
    try {
        console.log('Fetching anime news...');
        
        // Try multiple endpoints
        let response;
        let data;
        
        // First try - Top anime with news
        try {
            response = await fetch('https://api.jikan.moe/v4/top/anime?limit=20');
            if (response.ok) {
                data = await response.json();
                console.log('API Response:', data);
                
                if (data.data && data.data.length > 0) {
                    return data.data.map((anime, index) => ({
                        id: anime.mal_id || index,
                        title: anime.title || 'Unknown Anime',
                        summary: anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'No description available',
                        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x400',
                        url: anime.url || '#',
                        date: new Date().toLocaleDateString(),
                        score: anime.score,
                        episodes: anime.episodes
                    }));
                }
            }
        } catch (topAnimeError) {
            console.log('Top anime API failed, trying seasons...');
        }
        
        // Second try - Current season anime
        try {
            response = await fetch('https://api.jikan.moe/v4/seasons/now?limit=20');
            if (response.ok) {
                data = await response.json();
                console.log('Seasons API Response:', data);
                
                if (data.data && data.data.length > 0) {
                    return data.data.map((anime, index) => ({
                        id: anime.mal_id || index,
                        title: anime.title || 'Unknown Anime',
                        summary: anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'Currently airing anime',
                        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x400',
                        url: anime.url || '#',
                        date: new Date().toLocaleDateString(),
                        score: anime.score,
                        episodes: anime.episodes
                    }));
                }
            }
        } catch (seasonsError) {
            console.log('Seasons API failed, using fallback...');
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
        
    } catch (error) {
        console.error('Error fetching anime news:', error);
        
        // Return fallback data even on error
        return [
            {
                id: 1,
                title: "Attack on Titan: Final Season",
                summary: "The final season of the epic anime series continues with intense battles and revelations.",
                image: "https://via.placeholder.com/300x400/2b4c7e/ffffff?text=Attack+on+Titan",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 9.0
            },
            {
                id: 2,
                title: "Demon Slayer: Entertainment District Arc",
                summary: "Tanjiro and his friends face new challenges in the Entertainment District.",
                image: "https://via.placeholder.com/300x400/567ebb/ffffff?text=Demon+Slayer",
                url: "#",
                date: new Date().toLocaleDateString(),
                score: 8.7
            }
        ];
    }
};