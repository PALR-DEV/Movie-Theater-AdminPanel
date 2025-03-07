import { supabase } from "../Config/supabase";

class MovieService {
    async GetAllMovies() {
        const { data, error } = await supabase
            .from('Movies')
            .select('*')
            .order('id', { ascending: true })
        if(error) {
            throw error
        }
        return data
    }

    async GetMovieById(movieId) {
        const { data, error } = await supabase
        .from('Movies')
        .select('*')
        .eq('id', movieId)
        .single();

        if (error) {
            throw error;
        }
        return data;
    }

    async addMovie(movieData) {
        const { data, error } = await supabase
            .from('Movies')
            .insert([{
                title: movieData.title,
                trailer_youtube_id: movieData.trailerYouTubeId,
                duration: movieData.duration,
                poster_url: movieData.posterUrl,
                categories: movieData.categories,
                screenings: movieData.screenings.map(screening => ({
                    sala: screening.sala,
                    timeSlotsByDay: screening.timeSlotsByDay || {}
                }))
            }])
            .select();
        
        if (error) {
            throw error;
        }
        return data;
    }
    
    async updateMovie(movieId, movieData) {
        const updateData = {
            title: movieData.title,
            trailer_youtube_id: movieData.trailerYouTubeId,
            duration: movieData.duration,
            poster_url: movieData.posterUrl,
            categories: movieData.categories,
            screenings: movieData.screenings.map(screening => ({
                sala: screening.sala,
                timeSlotsByDay: screening.timeSlotsByDay || {}
            }))
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
            return {
                ...updatedMovie,
                categories: updatedMovie.categories || [],
                screenings: updatedMovie.screenings.map(screening => ({
                    sala: screening.sala,
                    timeSlotsByDay: screening.timeSlotsByDay || {}
                })) || []
            };

        } catch (error) {
            console.error("Update failed:", error);
            throw error;
        }
    }

    async deleteMovie(movieID) {
        try {
            const {data, error} = await supabase.from('Movies').delete().eq('id', movieID);
            if(error) {
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