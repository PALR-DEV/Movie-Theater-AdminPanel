import { supabase } from "../Config/supabase";

class MovieService {
    async GetAllMovies() {
        const { data, error } = await supabase
            .from('Movies')
            .select('*')
            .order('id', { ascending: true })
        if (error) {
            throw error
        }
        return data
    }

    async GetMovieById(movieId) {
        const { data: movieData, error } = await supabase
            .from('Movies')
            .select('*')
            .eq('id', movieId)
            .single();

        if (error) {
            throw error;
        }
        
        // Format the screenings data to match the UI expectations
        if (movieData && movieData.screenings) {
            // Convert the time_slots format to a format the UI can use
            const formattedScreenings = movieData.screenings.map(screening => {
                // Create a timeSlotsByDay object from time_slots array
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
            });
            
            return {
                ...movieData,
                categories: movieData.categories || [],
                screenings: formattedScreenings || []
            };
        }
        
        return movieData;
    }

    async addMovie(movieData) {
        // Transform the screenings data to match the new structure
        const formattedScreenings = movieData.screenings.map(screening => ({
            sala: screening.sala,
            time_slots: Object.entries(screening.timeSlotsByDate || {}).map(([date, timeSlots]) => ({
                date: date, // Store the date string (e.g., "Tue Mar 22 2025")
                times: timeSlots // Array of time slots for that date (e.g., ["1:00 PM", "4:00 PM"])
            }))
        }));

        const { data, error } = await supabase
            .from('Movies')
            .insert([{
                title: movieData.title,
                trailer_youtube_id: movieData.trailerYouTubeId,
                duration: movieData.duration,
                poster_url: movieData.posterUrl,
                categories: movieData.categories,
                screenings: formattedScreenings // Use the transformed screenings data
            }])
            .select();

        if (error) {
            throw error;
        }
        return data;
    }

    async updateMovie(movieId, movieData) {
        // Transform the screenings data to match the new structure with time_slots
        const formattedScreenings = movieData.screenings.map(screening => ({
            sala: screening.sala,
            time_slots: Object.entries(screening.timeSlotsByDate || {}).map(([date, timeSlots]) => ({
                date: date, // Store the date string
                times: timeSlots // Array of time slots for that date
            }))
        }));
        
        const updateData = {
            title: movieData.title,
            trailer_youtube_id: movieData.trailerYouTubeId,
            duration: movieData.duration,
            poster_url: movieData.posterUrl,
            categories: movieData.categories,
            screenings: formattedScreenings
        };

        try {
            const { data: updatedData, error: updateError } = await supabase
                .from('Movies')
                .update(updateData)
                .eq('id', movieId)
                .select('*');

            if (updateError) throw updateError;
            if (!updatedData || updatedData.length === 0) {
                throw new Error('Movie not found with ID: ' + movieId);
            }

            const updatedMovie = updatedData[0];
            
            // Convert the time_slots format back to a format the UI can use
            const formattedScreenings = updatedMovie.screenings.map(screening => {
                // Create a timeSlotsByDay object from time_slots array
                const timeSlotsByDay = {};
                
                if (screening.time_slots && Array.isArray(screening.time_slots)) {
                    screening.time_slots.forEach(slot => {
                        if (slot.date && Array.isArray(slot.times)) {
                            timeSlotsByDay[slot.date] = slot.times;
                        }
                    });
                }
                
                return {
                    sala: screening.sala,
                    timeSlotsByDay: timeSlotsByDay
                };
            });
            
            return {
                ...updatedMovie,
                categories: updatedMovie.categories || [],
                screenings: formattedScreenings || []
            };

        } catch (error) {
            console.error("Update failed:", error);
            throw error;
        }
    }

    async deleteMovie(movieID) {
        try {
            const { data, error } = await supabase.from('Movies').delete().eq('id', movieID);
            if (error) {
                throw error;
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    async getAllMovieTicketPrices() {
        try {
            const { data, error } = await supabase.from('Prices').select('*');
            if (error) {
                throw error;
            }
            return data;

        } catch (error) {
            throw error;

        }
    }
}

const movieService = new MovieService();
export default movieService;