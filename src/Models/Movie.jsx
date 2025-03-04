export const Movie = {
    id: null,
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
};