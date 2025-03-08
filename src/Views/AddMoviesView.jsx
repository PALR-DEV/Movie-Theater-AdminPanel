import { useState } from 'react';
import Layout from './Layout';
import movieService from '../Services/MovieService';
import AlertUtils from '../Utils/AlertUtils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/datepicker-custom.css';

export default function AddMoviesView() {
    const [formData, setFormData] = useState({
        title: '',
        trailerYouTubeId: '',
        duration: '',
        posterUrl: '',
        categories: [],
        screenings: Array(5).fill().map(() => ({
            sala: '',
            selectedDates: [], // Replace 'days' with 'selectedDates'
            timeSlotsByDate: {} // Replace 'timeSlotsByDay' with 'timeSlotsByDate'
        }))
    });

    const [newTimeSlot, setNewTimeSlot] = useState('');

    const convertTo12HourFormat = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const handleAddTimeSlot = (hallIndex, date) => {
        if (!newTimeSlot) return;

        const formattedTime = convertTo12HourFormat(newTimeSlot);
        const dateKey = date.toDateString(); // Use date string as key

        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => {
                if (index === hallIndex) {
                    const newTimeSlots = [...(screening.timeSlotsByDate[dateKey] || []), formattedTime];
                    return {
                        ...screening,
                        timeSlotsByDate: {
                            ...screening.timeSlotsByDate,
                            [dateKey]: [...new Set(newTimeSlots)]
                        }
                    };
                }
                return screening;
            })
        }));
        setNewTimeSlot('');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.duration) {
            AlertUtils.showError('Please fill in all required fields');
            return;
        }

        const hasValidScreening = formData.screenings.some(screening => {
            if (!screening.sala || screening.selectedDates.length === 0) return false;
            const hasTimeSlots = Object.values(screening.timeSlotsByDate).some(slots => slots.length > 0);
            return hasTimeSlots;
        });

        if (!hasValidScreening) {
            AlertUtils.showError('Please set up at least one screening with hall, selected dates, and time slots');
            return;
        }

        const finalFormData = {
            ...formData,
            categories: selectedCategories,
            screenings: formData.screenings
                .filter(screening =>
                    screening.sala &&
                    screening.selectedDates.length > 0 &&
                    Object.values(screening.timeSlotsByDate).some(slots => slots.length > 0)
                )
                .map(screening => ({
                    sala: screening.sala,
                    selectedDates: screening.selectedDates.map(date => date.toISOString()), // Convert dates to ISO string
                    timeSlotsByDate: screening.timeSlotsByDate
                }))
        };

        try {
            AlertUtils.showLoading('Adding movie...');
            await movieService.addMovie(finalFormData);
            AlertUtils.closeLoading();
            AlertUtils.showSuccess('Movie added successfully!');

            setFormData({
                title: '',
                trailerYouTubeId: '',
                duration: '',
                posterUrl: '',
                categories: [],
                screenings: Array(5).fill().map(() => ({
                    sala: '',
                    selectedDates: [],
                    timeSlotsByDate: {}
                }))
            });
            setSelectedCategories([]);
            setPosterPreview('');
            setNewTimeSlot('');
        } catch (error) {
            AlertUtils.closeLoading();
            AlertUtils.showError('Error adding movie: ' + error.message);
        }
    };

    const handleScreeningChange = (hallIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) =>
                index === hallIndex ? { ...screening, [field]: value } : screening
            )
        }));
    };

    const handleDateChange = (hallIndex, dates) => {
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => {
                if (index === hallIndex) {
                    // If dates is a single date (not an array), handle select/deselect
                    if (!Array.isArray(dates)) {
                        // Check if the date already exists in selectedDates
                        const dateExists = screening.selectedDates.some(
                            selectedDate => selectedDate.toDateString() === dates.toDateString()
                        );

                        // If date exists, remove it (deselect). If not, add it (select)
                        const updatedDates = dateExists
                            ? screening.selectedDates.filter(
                                selectedDate => selectedDate.toDateString() !== dates.toDateString()
                            )
                            : [...screening.selectedDates, dates];

                        // If we're removing a date, also remove its time slots
                        const updatedTimeSlotsByDate = { ...screening.timeSlotsByDate };
                        if (dateExists) {
                            delete updatedTimeSlotsByDate[dates.toDateString()];
                        }

                        return { 
                            ...screening, 
                            selectedDates: updatedDates,
                            timeSlotsByDate: updatedTimeSlotsByDate
                        };
                    } else {
                        // Handle the case when dates is an array (from selectsMultiple)
                        // Find dates that were removed
                        const removedDates = screening.selectedDates.filter(
                            oldDate => !dates.some(newDate => newDate.toDateString() === oldDate.toDateString())
                        );
                        
                        // Create a new timeSlotsByDate object without the removed dates
                        const updatedTimeSlotsByDate = { ...screening.timeSlotsByDate };
                        removedDates.forEach(date => {
                            const dateKey = date.toDateString();
                            delete updatedTimeSlotsByDate[dateKey];
                        });
                        
                        return { 
                            ...screening, 
                            selectedDates: dates,
                            timeSlotsByDate: updatedTimeSlotsByDate
                        };
                    }
                }
                return screening;
            })
        }));
    };

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [posterPreview, setPosterPreview] = useState('');

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
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    return (
        <Layout>
            <div className="min-h-screen py-8 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Add New Movie</h1>

                    <form onSubmit={handleFormSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Poster Preview */}
                            <div className="space-y-6">
                                <div className="aspect-[2/3] w-full bg-gray-100 rounded-xl overflow-hidden relative group">
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
                                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-colors duration-200 border-2 border-white">
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

                                    {/* Screening Schedule Section */}
                                    <div className="mt-8 space-y-6 bg-white p-6 rounded-xl border border-gray-200">
                                        <h2 className="text-xl font-semibold">Screening Schedule</h2>
                                        <div className="space-y-8">
                                            {formData.screenings.slice(0, 1).map((screening, hallIndex) => (
                                                <div key={hallIndex} className="space-y-4 p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-medium">Selección de Sala</h3>
                                                        <select
                                                            value={screening.sala}
                                                            onChange={(e) => handleScreeningChange(hallIndex, 'sala', e.target.value)}
                                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Select Dates</h4>
                                                                <DatePicker
                                                                    selected={screening.selectedDates[0] || null}
                                                                    onChange={(dates) => handleDateChange(hallIndex, dates)}
                                                                    selectsMultiple
                                                                    inline
                                                                    highlightDates={screening.selectedDates}
                                                                    className="w-full border border-gray-300 rounded-lg shadow-md"
                                                                    dayClassName={date => {
                                                                        // Check if the date is in selectedDates
                                                                        return screening.selectedDates.some(selectedDate => 
                                                                            selectedDate.toDateString() === date.toDateString()
                                                                        ) ? 'react-datepicker__day--highlighted' : undefined;
                                                                    }}
                                                                />
                                                                
                                                                {/* Display selected dates with remove buttons */}
                                                                {screening.selectedDates.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Dates:</h5>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {screening.selectedDates.map((date, dateIndex) => (
                                                                                <div key={dateIndex} className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                                                                                    <span className="text-sm">
                                                                                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                                    </span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const newDates = screening.selectedDates.filter((_, idx) => idx !== dateIndex);
                                                                                            handleDateChange(hallIndex, newDates);
                                                                                        }}
                                                                                        className="ml-2 text-gray-500 hover:text-red-500"
                                                                                    >
                                                                                        <span>×</span>
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Add Time Slots</h4>
                                                                <div className="space-y-4">
                                                                    {screening.selectedDates.map(date => (
                                                                        <div key={date.toDateString()} className="space-y-4 p-4 bg-gray-100 rounded-lg mb-4">
                                                                            <h4 className="font-medium text-gray-700">{date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="time"
                                                                                    value={newTimeSlot}
                                                                                    onChange={(e) => setNewTimeSlot(e.target.value)}
                                                                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleAddTimeSlot(hallIndex, date)}
                                                                                    className="px-4 py-2 bg-black text-white rounded-lg"
                                                                                >
                                                                                    Add Time
                                                                                </button>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                                {(screening.timeSlotsByDate[date.toDateString()] || []).map(timeSlot => (
                                                                                    <button
                                                                                        key={timeSlot}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setFormData(prev => ({
                                                                                                ...prev,
                                                                                                screenings: prev.screenings.map((s, i) => {
                                                                                                    if (i === hallIndex) {
                                                                                                        const filtered = s.timeSlotsByDate[date.toDateString()].filter(t => t !== timeSlot);
                                                                                                        return {
                                                                                                            ...s,
                                                                                                            timeSlotsByDate: {
                                                                                                                ...s.timeSlotsByDate,
                                                                                                                [date.toDateString()]: filtered
                                                                                                            }
                                                                                                        };
                                                                                                    }
                                                                                                    return s;
                                                                                                })
                                                                                            }));
                                                                                        }}
                                                                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                                                                    >
                                                                                        {timeSlot}
                                                                                        <span className="ml-2">×</span>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

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
                                                        ? 'bg-black text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {formData.trailerYouTubeId && (
                                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100">
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
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                className="px-6 py-3 rounded-xl text-black bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-xl text-white bg-black hover:bg-gray-800 transition-colors duration-200"
                            >
                                Add Movie
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}