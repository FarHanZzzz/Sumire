/**
 * Generic JSON fetch with retry and rate-limit backoff for Jikan (simple 429 handling)
 */
async function requestJSON(url, { retries = 3, delay = 600 } = {}) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (res.status === 429) { // rate limited
                const wait = delay * (attempt + 1);
                await new Promise(r => setTimeout(r, wait));
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (attempt === retries - 1) {
                console.warn('requestJSON failed:', e.message, 'url:', url);
                return null;
            }
            await new Promise(r => setTimeout(r, delay * (attempt + 1)));
        }
    }
    return null;
}

function trimSummary(text, max = 220) {
    if (!text) return 'No description available';
    if (text.length <= max) return text;
    return text.substring(0, max).trim() + '...';
}

function normalizeAnime(anime) {
    return {
        id: anime.mal_id,
        title: anime.title_english || anime.title || 'Unknown Anime',
        summary: trimSummary(anime.synopsis),
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/400x560/1e3a5f/FFFFFF?text=No+Image',
        score: anime.score ?? 'N/A',
        episodes: anime.episodes ?? 'TBA',
        year: anime.year || (anime.aired?.prop?.from?.year) || '—',
        status: anime.status || 'Unknown',
        type: anime.type || 'TV',
        genres: (anime.genres || []).map(g => g.name)
    };
}

function mapList(list) { return list.map(normalizeAnime); }

// Upcoming / New
export async function fetchNewUpcomingAnime(page = 1, limit = 12) {
    const url = `https://api.jikan.moe/v4/seasons/upcoming?page=${page}&limit=${limit}`;
    const json = await requestJSON(url);
    if (json?.data?.length) return mapList(json.data);
    return getNewAnimeFallback();
}

// Classic 90s
export async function fetchClassic90sAnime(page = 1, limit = 12) {
    // Jikan pagination via page param; filter by start/end dates
    const url = `https://api.jikan.moe/v4/anime?start_date=1990-01-01&end_date=1999-12-31&page=${page}&limit=${limit}&order_by=score&sort=desc`; 
    const json = await requestJSON(url);
    if (json?.data?.length) return mapList(json.data);
    return getClassicAnimeFallback();
}

// Popular (Top)
export async function fetchPopularAnime(page = 1, limit = 12) {
    const url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=${limit}`;
    const json = await requestJSON(url);
    if (json?.data?.length) return mapList(json.data);
    return getPopularAnimeFallback();
}

// Underrated – heuristic: moderate score, fewer members (order by members asc)
export async function fetchUnderratedAnime(page = 1, limit = 12) {
    const url = `https://api.jikan.moe/v4/anime?min_score=7&max_score=8.4&page=${page}&limit=${limit}&order_by=members&sort=asc`; 
    const json = await requestJSON(url);
    if (json?.data?.length) return mapList(json.data);
    return getUnderratedAnimeFallback();
}

// HOTZ: romance (22), harem (35), ecchi (9), yuri (34)
export async function fetchHotzAnime(page = 1, limit = 24) {
    // We'll fetch each genre separately (limit quarter) then merge & dedupe
    const genreIds = [22,35,9,34];
    const per = Math.max(3, Math.ceil(limit / genreIds.length));
    const results = [];
    for (const gid of genreIds) {
        const url = `https://api.jikan.moe/v4/anime?genres=${gid}&page=${page}&limit=${per}&order_by=score&sort=desc`;
        const json = await requestJSON(url);
        if (json?.data?.length) {
            results.push(...json.data);
        }
    }
    if (!results.length) return getHotzFallback();
    // Dedupe by mal_id preserving order
    const seen = new Set();
    const merged = [];
    for (const a of results) {
        if (!seen.has(a.mal_id)) { seen.add(a.mal_id); merged.push(a); }
    }
    return mapList(merged).slice(0, limit);
}

export async function getAnimeDetails(id) {
    const [meta, videos] = await Promise.all([
        requestJSON(`https://api.jikan.moe/v4/anime/${id}`),
        requestJSON(`https://api.jikan.moe/v4/anime/${id}/videos`)
    ]);
    if (meta?.data) {
        const base = normalizeAnime(meta.data);
        const trailer = meta.data.trailer?.youtube_id || videos?.data?.promo?.[0]?.trailer?.youtube_id || null;
        return {
            ...base,
            fullSynopsis: meta.data.synopsis || base.summary,
            studios: meta.data.studios?.map(s => s.name).join(', ') || '',
            genres: meta.data.genres?.map(g => g.name).join(', ') || '',
            source: meta.data.source || '',
            duration: meta.data.duration || '',
            trailer
        };
    }
    return null;
}

// ---- FALLBACK DATA (unchanged below except formatting) ----

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
        
// (Legacy leftover removed)

function getHotzFallback() {
    return [
        {
            id: 501,
            title: 'High School DxD',
            summary: 'An ecchi supernatural harem action series following Issei and devil house conflicts.',
            image: 'https://cdn.myanimelist.net/images/anime/8/50859l.jpg',
            score: 7.2,
            episodes: 12,
            year: 2012,
            status: 'Completed',
            type: 'TV',
            genres: ['Ecchi','Harem','Romance','Fantasy']
        },
        {
            id: 502,
            title: 'Toradora!',
            summary: 'A fiery tsundere and a gentle boy form an unlikely alliance to pursue their crushes, leading to heartfelt romance.',
            image: 'https://cdn.myanimelist.net/images/anime/13/22128l.jpg',
            score: 8.1,
            episodes: 25,
            year: 2008,
            status: 'Completed',
            type: 'TV',
            genres: ['Romance','Comedy','School']
        },
        {
            id: 503,
            title: 'Bloom Into You',
            summary: 'A delicate yuri romance exploring identity, affection, and emotional growth between two students.',
            image: 'https://cdn.myanimelist.net/images/anime/1993/93826l.jpg',
            score: 7.9,
            episodes: 13,
            year: 2018,
            status: 'Completed',
            type: 'TV',
            genres: ['Yuri','Romance','Drama']
        }
    ];
}