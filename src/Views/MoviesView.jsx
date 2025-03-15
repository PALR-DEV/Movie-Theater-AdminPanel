import Layout from "./Layout";
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import movieService from "../Services/MovieService";
import AlertUtils from "../Utils/AlertUtils";
export default function MoviesView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAll = async() => {
            await fetchMovies();
        }
        initAll();
    }, [])

    const fetchMovies = async () => {
        try {
            AlertUtils.showLoading('Loading movies...');
            const moviesData = await movieService.GetAllMovies();
            const formattedMovies = moviesData.map(movie => {
                // Convert time_slots format to timeSlotsByDate for UI display
                const formattedScreenings = movie.screenings?.map(screening => {
                    const timeSlotsByDate = {};
                    
                    if (screening.time_slots && Array.isArray(screening.time_slots)) {
                        screening.time_slots.forEach(slot => {
                            if (slot.date && Array.isArray(slot.times)) {
                                timeSlotsByDate[slot.date] = slot.times;
                            }
                        });
                    }
                    
                    return {
                        sala: screening.sala,
                        timeSlotsByDate: timeSlotsByDate
                    };
                }) || [];
                
                return {
                    id: movie.id,
                    title: movie.title,
                    duration: movie.duration,
                    status: 'Now Showing',
                    screenings: formattedScreenings,
                    poster: movie.poster_url,
                    categories: typeof movie.categories === 'string' ? JSON.parse(movie.categories || '[]') : movie.categories,
                    trailerYouTubeId: movie.trailer_youtube_id
                };
            });
            setMovies(formattedMovies);
            AlertUtils.closeLoading();
        } catch (error) {
            console.error('Error fetching movies:', error);
            AlertUtils.showError('Failed to load movies');
        }
        setIsLoading(false);
    }

    // Remove the hardcoded movies array

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || movie.status.toLowerCase() === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <Layout>
            <div className="min-h-screen text-gray-900">
                {/* Header Section */}
                <div className="py-8 px-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Movies</h1>
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <Link
                                to="/movies/add"
                                className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-white hover:text-black border-2 border-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Movie
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Movies Grid */}
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
                    {!isLoading && filteredMovies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No movies found</h3>
                            <p className="text-gray-500">Try adjusting your search or add a new movie.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredMovies.map(movie => (
                            <div key={movie.id} className="group rounded-xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 shadow-md hover:shadow-lg border-0 h-full flex flex-col bg-gray-50">
                                <div className="relative aspect-[2/3]">
                                    <img
                                        src={movie.poster}
                                        alt={movie.title}
                                        className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-1">
                                        <h3 className="text-xl font-bold leading-tight">{movie.title}</h3>
                                        {/* <p className="text-xs text-gray-300">{movie.director}</p> */}
                                    </div>
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold tracking-wide ${movie.status === 'Now Showing' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                                            {movie.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 flex-grow">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-700">{movie.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <span className="text-gray-700">{movie.sala}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Screenings</h4>
                                        <div className="space-y-2">
                                            {movie.screenings.map((screening, screeningIndex) => (
                                                <div key={screeningIndex} className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-700">Sala {screening.sala}</p>
                                                    {Object.entries(screening.timeSlotsByDate || {}).map(([date, times]) => (
                                                        times.length > 0 && (
                                                            <div key={date} className="flex flex-wrap items-center gap-2">
                                                                <span className="text-xs font-medium text-gray-500">{date}:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {times.map((time, timeIndex) => (
                                                                        <span
                                                                            key={timeIndex}
                                                                            className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                                                                        >
                                                                            {time}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Days Section */}
                                    {movie.days && movie.days.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Days</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {movie.days.map((day, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                                                    >
                                                        {day}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Categories Section */}
                                    {movie.categories && movie.categories.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {movie.categories.map((category, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border border-gray-200"
                                                    >
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <Link 
                                        to={`/movies/edit/${movie.id}`}
                                        className="block w-full py-2 mt-auto bg-black text-white rounded-lg text-sm font-medium hover:bg-white hover:text-black border-2 border-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-center"
                                        >
                                        Edit Movie
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}