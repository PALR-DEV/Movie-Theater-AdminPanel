import { supabase } from "../Config/supabase";
import { Movie } from "../Models/Movie";

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
                categories: movieData.categories, // Array of strings
                screenings: movieData.screenings // Array of objects
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
            screenings: movieData.screenings
        };
        
        try {
            // Perform the update and get updated data immediately
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

            if (updateError) throw updateError;
            if (!updatedData) throw new Error('No data returned from update');

            // Parse the JSON strings back to arrays
            return {
                ...updatedData,
                categories: updatedData.categories || [],
                screenings: updatedData.screenings || []
            };

        } catch (error) {
            console.error("Update failed:", error);
            throw error;
        }
    }
}

const movieService = new MovieService();
export default movieService;