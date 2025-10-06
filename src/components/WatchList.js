import React, { useState, useEffect } from 'react';
import { getWatchList, addToWatchList, removeFromWatchList } from '../services/watchlistService';

const WatchList = () => {
    const [watchList, setWatchList] = useState([]);

    useEffect(() => {
        const fetchWatchList = async () => {
            const list = await getWatchList();
            setWatchList(list);
        };
        fetchWatchList();
    }, []);

    const handleAdd = async (anime) => {
        await addToWatchList(anime);
        setWatchList([...watchList, anime]);
    };

    const handleRemove = async (animeId) => {
        await removeFromWatchList(animeId);
        setWatchList(watchList.filter(anime => anime.id !== animeId));
    };

    return (
        <div className="watchlist">
            <h2>Your Watch List</h2>
            <ul>
                {watchList.map(anime => (
                    <li key={anime.id}>
                        <h3>{anime.title}</h3>
                        <button onClick={() => handleRemove(anime.id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => handleAdd({ id: 'new-anime-id', title: 'New Anime' })}>
                Add New Anime
            </button>
        </div>
    );
};

export default WatchList;