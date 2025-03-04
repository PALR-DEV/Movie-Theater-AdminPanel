import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import movieService from '../Services/MovieService';
import AlertUtils from '../Utils/AlertUtils';

export default function EditMovieView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        trailerYouTubeId: '',
        duration: '',
        posterUrl: '',
        categories: [],
        screenings: Array(5).fill().map(() => ({
            sala: '',
            days: [],
            timeSlots: []
        }))
    });


    const [newTimeSlot, setNewTimeSlot] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [posterPreview, setPosterPreview] = useState('');

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                AlertUtils.showLoading('Loading movie data...');
                const movieData = await movieService.GetMovieById(id);
                
                // Format the data for the form
                setFormData({
                    title: movieData.title || '',
                    trailerYouTubeId: movieData.trailer_youtube_id || '',
                    duration: movieData.duration || '',
                    posterUrl: movieData.poster_url || '',
                    categories: typeof movieData.categories === 'string' 
                        ? JSON.parse(movieData.categories || '[]') 
                        : movieData.categories || [],
                    screenings: movieData.screenings || Array(5).fill().map(() => ({
                        sala: '',
                        days: [],
                        timeSlots: []
                    }))
                });
                
                // Set categories
                const categories = typeof movieData.categories === 'string' 
                    ? JSON.parse(movieData.categories || '[]') 
                    : movieData.categories || [];
                setSelectedCategories(categories);
                
                // Set poster preview
                if (movieData.poster_url) {
                    setPosterPreview(movieData.poster_url);
                }
                
                AlertUtils.closeLoading();
            } catch (error) {
                console.error('Error fetching movie:', error);
                AlertUtils.showError('Failed to load movie data');
                navigate('/movies');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchMovieData();
        }
    }, [id, navigate]);

    const convertTo12HourFormat = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const handleAddTimeSlot = (hallIndex) => {
        if (!newTimeSlot) return;
        
        const formattedTime = convertTo12HourFormat(newTimeSlot);
        
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => {
                if (index === hallIndex && !screening.timeSlots.includes(formattedTime)) {
                    return { ...screening, timeSlots: [...screening.timeSlots, formattedTime] };
                }
                return screening;
            })
        }));
        setNewTimeSlot('');
    };

    const availableDays = [
        'Lunes', 'Martes', 'Miércoles', 'Jueves',
        'Viernes', 'Sábado', 'Domingo'
    ];

    const handleFormSubmit = async(e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.title || !formData.duration) {
            AlertUtils.showError('Please fill in all required fields');
            return;
        }

        // Validate at least one screening is set up
        const hasValidScreening = formData.screenings.some(screening => 
            screening.sala && screening.days.length > 0 && screening.timeSlots.length > 0
        );

        if (!hasValidScreening) {
            AlertUtils.showError('Please set up at least one screening with hall, days, and time slots');
            return;
        }

        // Prepare the final form data
        const finalFormData = {
            ...formData,
            categories: selectedCategories,
            // Filter out empty screenings
            screenings: formData.screenings.filter(screening => 
                screening.sala && screening.days.length > 0 && screening.timeSlots.length > 0
            )
        };
        
        try {
            AlertUtils.showLoading('Updating movie...');
            // TODO: Add updateMovie method to MovieService
            await movieService.updateMovie(id, finalFormData);
            AlertUtils.closeLoading();
            
            AlertUtils.showSuccess('Movie updated successfully!');
            navigate('/movies');
        } catch (error) {
            AlertUtils.closeLoading();
            AlertUtils.showError('Error updating movie: ' + error.message);
        }
    };

    const handleScreeningChange = (hallIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => 
                index === hallIndex
                    ? { ...screening, [field]: value }
                    : screening
            )
        }));
    };

    const toggleDay = (hallIndex, day) => {
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => {
                if (index === hallIndex) {
                    const days = screening.days.includes(day)
                        ? screening.days.filter(d => d !== day)
                        : [...screening.days, day];
                    return { ...screening, days };
                }
                return screening;
            })
        }));
    };

    const toggleTimeSlot = (hallIndex, timeSlot) => {
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => {
                if (index === hallIndex) {
                    const timeSlots = screening.timeSlots.includes(timeSlot)
                        ? screening.timeSlots.filter(t => t !== timeSlot)
                        : [...screening.timeSlots, timeSlot];
                    return { ...screening, timeSlots };
                }
                return screening;
            })
        }));
    };

    // Sample categories - in a real app, this would come from an API
    const availableCategories = [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
        'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'posterUrl' && value) {
            setPosterPreview(value);
        }
    };

    const handlePosterFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPosterPreview(imageUrl);
            setFormData(prev => ({
                ...prev,
                posterUrl: file
            }));
        }
    };

    const toggleCategory = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            }
            return [...prev, category];
        });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                        <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-36 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen py-8 px-4 md:px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Movie</h1>
                        <button 
                            onClick={() => navigate('/movies')} 
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Back to Movies
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Poster Preview */}
                            <div className="space-y-6">
                                <div className="aspect-[2/3] w-full bg-gray-100 rounded-xl overflow-hidden relative group shadow-md">
                                    {posterPreview ? (
                                        <img
                                            src={posterPreview}
                                            alt="Movie poster preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-colors duration-200 border-2 border-white shadow-lg">
                                            Change Poster
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePosterFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">Poster URL</span>
                                        <input
                                            type="url"
                                            name="posterUrl"
                                            value={typeof formData.posterUrl === 'string' ? formData.posterUrl : ''}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/movie-poster.jpg"
                                            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow duration-200"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Right Column - Movie Details */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">Movie Title</span>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow duration-200"
                                            placeholder="Enter movie title"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">YouTube Trailer ID</span>
                                        <input
                                            type="text"
                                            name="trailerYouTubeId"
                                            value={formData.trailerYouTubeId}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow duration-200"
                                            placeholder="e.g. dQw4w9WgXcQ"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">Duration</span>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow duration-200"
                                            placeholder="e.g. 2h 30min"
                                        />
                                    </label>

                                    {/* Categories Section */}
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Categories</span>
                                        <div className="flex flex-wrap gap-2">
                                            {availableCategories.map(category => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => toggleCategory(category)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategories.includes(category)
                                                        ? 'bg-black text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Screening Schedule Section */}
                                <div className="mt-8 space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h2 className="text-xl font-semibold text-gray-900">Screening Schedule</h2>
                                    <div className="space-y-8">
                                        {formData.screenings.slice(0, 1).map((screening, hallIndex) => (
                                            <div key={hallIndex} className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-medium text-gray-800">Selección de Sala</h3>
                                                    <select
                                                        value={screening.sala}
                                                        onChange={(e) => handleScreeningChange(hallIndex, 'sala', e.target.value)}
                                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
                                                    >
                                                        <option value="">Seleccionar Sala</option>
                                                        <option value="Sala de Exposición 1">Sala de Exposición 1</option>
                                                        <option value="Sala de Exposición 2">Sala de Exposición 2</option>
                                                        <option value="Sala de Exposición 3">Sala de Exposición 3</option>
                                                        <option value="Sala de Exposición 4">Sala de Exposición 4</option>
                                                        <option value="Sala de Exposición 5">Sala de Exposición 5</option>
                                                    </select>
                                                </div>

                                                {screening.sala && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Select Days</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {availableDays.map(day => (
                                                                    <button
                                                                        key={day}
                                                                        type="button"
                                                                        onClick={() => toggleDay(hallIndex, day)}
                                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${screening.days.includes(day)
                                                                            ? 'bg-black text-white shadow-md'
                                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                                                                    >
                                                                        {day}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Add Time Slots</h4>
                                                            <div className="space-y-4">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="time"
                                                                        value={newTimeSlot}
                                                                        onChange={(e) => setNewTimeSlot(e.target.value)}
                                                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAddTimeSlot(hallIndex)}
                                                                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                                                                    >
                                                                        Add Time
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                                    {screening.timeSlots.map(timeSlot => (
                                                                        <button
                                                                            key={timeSlot}
                                                                            type="button"
                                                                            className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors duration-200 shadow-sm flex items-center justify-between"
                                                                        >
                                                                            <span>{timeSlot}</span>
                                                                            <span 
                                                                                className="ml-2 text-lg hover:text-red-500"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleTimeSlot(hallIndex, timeSlot);
                                                                                }}
                                                                            >
                                                                                ×
                                                                            </span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* YouTube Trailer Preview - Moved below schedule section */}
                                {formData.trailerYouTubeId && (
                                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 shadow-md mt-8">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${formData.trailerYouTubeId}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                )}

                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/movies')}
                                        className="px-6 py-3 rounded-xl text-black bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl text-white bg-black hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                                    >
                                        Update Movie
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}