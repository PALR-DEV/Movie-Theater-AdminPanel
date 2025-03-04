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
}

const movieService = new MovieService();
export default movieService;