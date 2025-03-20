import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import movieService from '../Services/MovieService';
import AlertUtils from '../Utils/AlertUtils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/datepicker-custom.css';
import { supabase } from '../Config/supabase';

export default function AddMovieView() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        trailerYouTubeId: '',
        duration: '',
        posterUrl: '',
        categories: [],
        screenings: [{
            sala: '',
            selectedDates: [],
            timeSlotsByDate: {}
        }]
    });
    const [newTimeSlot, setNewTimeSlot] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [posterPreview, setPosterPreview] = useState('');

    const convertTo12HourFormat = (time24) => {
        if (!time24) return '';
        try {
            const [hours, minutes] = time24.split(':');
            if (!hours || !minutes) return '';

            const hour = parseInt(hours);
            if (isNaN(hour)) return '';

            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (error) {
            console.error('Error converting time format:', error);
            return '';
        }
    };

    const handleAddTimeSlot = (hallIndex, date) => {
        if (!newTimeSlot) return;
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            AlertUtils.showError('Invalid date selected');
            return;
        }

        const formattedTime = convertTo12HourFormat(newTimeSlot);
        const dateKey = date.toDateString();

        setFormData(prev => {
            const existingTimeSlots = prev.screenings[hallIndex]?.timeSlotsByDate[dateKey] || [];

            if (existingTimeSlots.includes(formattedTime)) {
                AlertUtils.showError('This time slot already exists');
                return prev;
            }

            return {
                ...prev,
                screenings: prev.screenings.map((screening, index) =>
                    index === hallIndex ? {
                        ...screening,
                        timeSlotsByDate: {
                            ...screening.timeSlotsByDate,
                            [dateKey]: [...existingTimeSlots, formattedTime].sort()
                        }
                    } : screening
                )
            };
        });

        setNewTimeSlot('');
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

    const handleDateChange = (hallIndex, date) => {
        setFormData(prev => {
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return prev; // Skip invalid dates (removed the date < new Date() check)
            }

            // Create a new Date object for today with time set to 00:00:00
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // If the date is before today (not including today), skip it
            if (date < today) {
                return prev;
            }
            
            return {
                ...prev,
                screenings: prev.screenings.map((screening, index) => {
                    if (index !== hallIndex) return screening;

                    const dateKey = date.toDateString();
                    const currentDates = screening.selectedDates;

                    // Add new date only if it doesn't exist
                    if (!currentDates.some(d => d.toDateString() === dateKey)) {
                        return {
                            ...screening,
                            selectedDates: [...currentDates, date].sort((a, b) => a.getTime() - b.getTime()),
                            timeSlotsByDate: { ...screening.timeSlotsByDate }
                        };
                    }
                    return screening; // No change if date already exists
                })
            };
        });
    };

    const handleRemoveTimeSlot = (hallIndex, date, timeSlot) => {
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => {
                if (index === hallIndex) {
                    const dateKey = date.toDateString();
                    const currentTimeSlots = screening.timeSlotsByDate[dateKey] || [];
                    const updatedTimeSlots = currentTimeSlots.filter(slot => slot !== timeSlot);
                    const updatedTimeSlotsByDate = { ...screening.timeSlotsByDate };

                    if (updatedTimeSlots.length === 0) {
                        delete updatedTimeSlotsByDate[dateKey];
                    } else {
                        updatedTimeSlotsByDate[dateKey] = updatedTimeSlots;
                    }

                    return {
                        ...screening,
                        timeSlotsByDate: updatedTimeSlotsByDate
                    };
                }
                return screening;
            })
        }));
    };

    const handleRemoveDate = (hallIndex, date) => {
        setFormData(prev => ({
            ...prev,
            screenings: prev.screenings.map((screening, index) => {
                if (index === hallIndex) {
                    const dateKey = date.toDateString();
                    const updatedTimeSlots = { ...screening.timeSlotsByDate };
                    delete updatedTimeSlots[dateKey];

                    return {
                        ...screening,
                        selectedDates: screening.selectedDates.filter(
                            d => d.toDateString() !== dateKey
                        ),
                        timeSlotsByDate: updatedTimeSlots
                    };
                }
                return screening;
            })
        }));
    };

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            AlertUtils.showLoading('Creating movie...');
            const finalFormData = {
                title: formData.title.trim(),
                trailer_youtube_id: formData.trailerYouTubeId || '',
                duration: formData.duration.trim(),
                poster_url: formData.posterUrl || '',
                categories: selectedCategories,
                client_id:(await supabase.auth.getUser()).data.user.id,
                screenings: formData.screenings
                    .filter(screening =>
                        screening.sala &&
                        screening.selectedDates.length > 0 &&
                        Object.values(screening.timeSlotsByDate).some(slots => slots.length > 0)
                    )
                    .map(screening => ({
                        sala: screening.sala,
                        time_slots: screening.selectedDates.map(date => ({
                            date: date.toDateString(),
                            times: screening.timeSlotsByDate[date.toDateString()] || []
                        }))
                    }))
            };

            const newMovie = await movieService.addMovie(finalFormData);
            // console.table(finalFormData);
            AlertUtils.showSuccess('Movie created successfully!');
            navigate('/movies');
        } catch (error) {
            console.error('Creation error:', error);
            AlertUtils.showError(`Error creating movie: ${error.message}`);
        } finally {
            AlertUtils.closeLoading();
        }
    };

    return (
        <Layout>
            <div className="min-h-screen py-8 px-4 md:px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Add Movie</h1>
                        <button
                            onClick={() => navigate('/movies')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Back to Movies
                        </button>
                    </div>
                    <form onSubmit={handleFormSubmit} className="space-y-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                            Upload Poster
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
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Categories</span>
                                        <div className="flex flex-wrap gap-2">
                                            {['Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
                                                'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
                                                'Mystery', 'Romance', 'Sci-Fi', 'Thriller'].map(category => (
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
                                <div className="mt-8 space-y-6 bg-white p-6 rounded-xl border border-gray-200">
                                    <h2 className="text-xl font-semibold">Screening Schedule</h2>
                                    <div className="space-y-8">
                                        {formData.screenings.map((screening, hallIndex) => (
                                            <div key={hallIndex} className="space-y-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-medium">Screening Room</h3>
                                                    <select
                                                        value={screening.sala}
                                                        onChange={(e) => handleScreeningChange(hallIndex, 'sala', e.target.value)}
                                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                                    >
                                                        <option value="">Select Room</option>
                                                        {[1, 2, 3, 4, 5].map(num => (
                                                            <option key={num} value={`Screening Room ${num}`}>
                                                                Screening Room {num}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {screening.sala && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Select Dates</h4>
                                                            <DatePicker
                                                                onChange={(date) => handleDateChange(hallIndex, date)}
                                                                inline
                                                                selected={null}
                                                                highlightDates={screening.selectedDates}
                                                                className="w-full border border-gray-300 rounded-lg shadow-md"
                                                                dayClassName={date =>
                                                                    screening.selectedDates.some(selectedDate =>
                                                                        selectedDate.toDateString() === date.toDateString()
                                                                    ) ? 'bg-black text-white rounded-full' : undefined
                                                                }
                                                                minDate={(() => {
                                                                    const today = new Date();
                                                                    today.setHours(0, 0, 0, 0);
                                                                    return today;
                                                                })()}
                                                                placeholderText="Select dates"
                                                                dateFormat="MMMM d, yyyy"
                                                                isClearable={false}
                                                                shouldCloseOnSelect={false}
                                                                calendarStartDay={1}
                                                            />
                                                            {screening.selectedDates.length > 0 && (
                                                                <div className="mb-4">
                                                                    <label className="block text-gray-700 text-sm font-bold mb-2">Screening Dates and Times</label>
                                                                    <div className="flex flex-wrap gap-4">
                                                                        {screening.selectedDates.map((date, dateIndex) => (
                                                                            <div key={dateIndex} className="bg-white p-4 rounded-xl shadow-md w-64 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                                                                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                                                                    <span className="font-semibold">{date.toDateString()}</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleRemoveDate(hallIndex, date)}
                                                                                        className="text-black hover:text-gray-700 transition-colors duration-200"
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <div className="flex gap-2">
                                                                                        <input
                                                                                            type="time"
                                                                                            value={newTimeSlot}
                                                                                            onChange={(e) => setNewTimeSlot(e.target.value)}
                                                                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow duration-200"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleAddTimeSlot(hallIndex, date)}
                                                                                            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                                                                                        >
                                                                                            Add
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                                                        {screening.timeSlotsByDate[date.toDateString()]?.map((timeSlot, timeIndex) => (
                                                                                            <div key={timeIndex} className="bg-gray-100 px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                                                                                                <span className="font-medium">{timeSlot}</span>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleRemoveTimeSlot(hallIndex, date, timeSlot)}
                                                                                                    className="text-black hover:text-gray-700 transition-colors duration-200"
                                                                                                >
                                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                                    </svg>
                                                                                                </button>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Add Time Slots</h4>
                                                            <div className="space-y-4">
                                                                {screening.selectedDates.map(date => (
                                                                    <div key={date.toDateString()} className="space-y-4 p-4 bg-gray-100 rounded-lg mb-4">
                                                                        <h4 className="font-medium text-gray-700">
                                                                            {date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                                        </h4>
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
                                                                                    onClick={() => handleRemoveTimeSlot(hallIndex, date, timeSlot)}
                                                                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                                                                >
                                                                                    {timeSlot} ×
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
                                <div className="flex flex-col gap-4 pt-4">
                                    <div className="flex justify-end gap-4">
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
                                            Create Movie
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}