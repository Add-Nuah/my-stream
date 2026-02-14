 // Default to Matrix if missing

async function fetchMovieData() {
   const TMDB_API_KEY = '8fab0d67c219e26e7a2b7b8bd11e1d1f';
    const movieId = document.body.getAttribute('data-movie-id') || '603';
    console.log("Attempting to fetch data for Movie ID:", movieId);

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("TMDB API Error Response:", errorData);
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        
        const movie = await response.json();
        console.log("Movie Data Received:", movie);

        // Update Text Content
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-overview').textContent = movie.overview;
        document.getElementById('movie-year').textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : '2024';

        // Set the Background Backdrop
        if (movie.backdrop_path) {
            const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
            document.getElementById('movie-backdrop').style.backgroundImage = `url(${backdropUrl})`;
        }

        // Set the Poster (The part that was stuck loading)
        const posterImg = document.getElementById('movie-poster');
        const skeleton = document.getElementById('poster-skeleton');
        
        if (movie.poster_path) {
            const fullPosterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            console.log("Poster URL:", fullPosterUrl);
            
            posterImg.src = fullPosterUrl;
            
            // This event fires once the browser actually finishes downloading the image
            posterImg.onload = () => {
                console.log("Poster image successfully loaded!");
                posterImg.classList.remove('hidden');
                skeleton.classList.add('hidden');
            };

            posterImg.onerror = () => {
                console.error("Image failed to load at URL:", fullPosterUrl);
                skeleton.innerHTML = "<p style='font-size:10px; padding:10px;'>Image Failed</p>";
            };
        } else {
            console.warn("No poster path found for this movie.");
        }

    } catch (error) {
        console.error("Fetch Fetch Process Failed:", error);
        document.getElementById('movie-title').textContent = "Movie Not Found";
    }
}

// Initialize the fetch
fetchMovieData();

// Import your other modules
import { initChat } from "./scripts/chat.js";
import { initPlayer } from "./scripts/player.js";

initChat();
initPlayer();