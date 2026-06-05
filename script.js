const API_KEY = "9f787869bb77eae36fb58d415dd45d6e";
const movieContainer = document.getElementById("movie-container");
const searchBox = document.getElementById("searchBox");

const modal = document.getElementById("movieModal");
const modalTitle = document.getElementById("modalTitle");
const modalPoster = document.getElementById("modalPoster");
const modalPlot = document.getElementById("modalPlot");
const modalGenre = document.getElementById("modalGenre");
const modalRuntime = document.getElementById("modalRuntime");
const modalRating = document.getElementById("modalRating");
const modalReviews = document.getElementById("modalReviews");
const watchTrailerBtn = document.getElementById("mWatchTrailer");

async function fetchMovieDetails(movieId) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos`);
    return await res.json();
}

async function searchMovies(query) {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();
    return data.results;
}

function renderMovies(movies) {
    movieContainer.innerHTML = "";
    movies.forEach(movie => {
        if (movie.poster_path) {
            const card = document.createElement("div");
            card.className = "movie-card";
            
            // Updated HTML structure for the hover overlay effect
            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                </div>
            `;
            
            card.onclick = async () => {
                const fullDetails = await fetchMovieDetails(movie.id);
                openModal(fullDetails);
            };
            movieContainer.appendChild(card);
        }
    });
}

async function searchMovie() {
    const query = searchBox.value.trim();
    if (!query) {
        alert("Please enter a movie title.");
        return;
    }
    const movies = await searchMovies(query);
    if (movies.length > 0) {
        renderMovies(movies);
    } else {
        alert("No movies found for this search.");
    }
}

// Allow pressing 'Enter' to search
searchBox.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchMovie();
  }
});

function openModal(movie) {
    modalTitle.textContent = movie.title;
    modalPoster.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://placehold.co/200x300?text=No+Poster";
    modalPlot.textContent = movie.overview;
    
    // Convert genres to stylized span badges
    modalGenre.innerHTML = movie.genres.map(g => `<span class="genre-badge">${g.name}</span>`).join('');
    
    modalRuntime.textContent = `${movie.runtime} min`;
    modalRating.textContent = movie.vote_average.toFixed(1);

    const trailer = movie.videos?.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    
    if (trailer) {
        watchTrailerBtn.href = `https://www.youtube.com/watch?v=${trailer.key}`;
        watchTrailerBtn.style.display = 'inline-block';
    } else {
        watchTrailerBtn.style.display = 'none';
    }

    modalReviews.innerHTML = "";
    const rating = movie.vote_average;
    let positiveReviews = ["A must-watch!", "Stunning and powerful.", "An instant classic."];
    let negativeReviews = ["Disappointing.", "A slow and forgettable plot.", "Good concept, poor execution."];

    if (rating >= 7.0) {
        modalReviews.innerHTML = `<h5 style="margin-top:0; color:#4caf50;">👍 Positive Buzz</h5><ul>${positiveReviews.map(r => `<li>${r}</li>`).join('')}</ul>`;
    } else if (rating < 5.0) {
        modalReviews.innerHTML = `<h5 style="margin-top:0; color:#f44336;">👎 Negative Buzz</h5><ul>${negativeReviews.map(r => `<li>${r}</li>`).join('')}</ul>`;
    } else {
        modalReviews.innerHTML = `<h5 style="margin-top:0; color:#ff9800;">🤔 Mixed Reviews</h5><p style="margin:0; font-size: 14px; color: var(--text-muted);">Audiences had mixed feelings about this one.</p>`;
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent background scrolling when modal is open
}

function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore background scrolling
}

// Close modal if user clicks outside of it
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

async function initialLoad() {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await res.json();
    renderMovies(data.results);
}

initialLoad();
