document.addEventListener('DOMContentLoaded', () => {
  const filmsList = document.getElementById('films');
  const poster = document.getElementById('poster');
  const title = document.getElementById('title');
  const runtime = document.getElementById('runtime');
  const showtime = document.getElementById('showtime');
  const availableTickets = document.getElementById('ticket-num');

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3000/films/${movieId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  const updateMovieDetails = (movieDetails) => {
    poster.src = movieDetails.poster;
    title.textContent = movieDetails.title;
    runtime.textContent = `${movieDetails.runtime} minutes`;
    showtime.textContent = movieDetails.showtime;
    availableTickets.textContent = movieDetails.capacity - movieDetails.tickets_sold;

    const buyTicketButton = document.getElementById('buy-ticket');

    if (movieDetails.capacity <= movieDetails.tickets_sold) {
      buyTicketButton.disabled = true;
      buyTicketButton.textContent = 'Sold Out';
    } else {
      buyTicketButton.disabled = false;
      buyTicketButton.textContent = 'Buy Ticket';
    }

    const filmItem = document.querySelector(`.film.item[data-id="${movieDetails.id}"]`);
    if (filmItem) {
      if (movieDetails.capacity <= movieDetails.tickets_sold) {
        filmItem.classList.add('sold-out');
      } else {
        filmItem.classList.remove('sold-out');
      }
    }
  };

  const buyTicket = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3000/films/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickets_sold: parseInt(availableTickets.textContent) + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to buy ticket');
      }

      const updatedMovieDetails = await fetchMovieDetails(movieId);
      
      if (updatedMovieDetails) {
        updateMovieDetails(updatedMovieDetails);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFilm = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3000/films/${movieId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete film');
      }
      // Optionally, you can update the UI after deleting the film
    } catch (error) {
      console.error(error);
    }
  };

  filmsList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('film')) {
      const movieId = event.target.dataset.id;
      const movieDetails = await fetchMovieDetails(movieId);
      if (movieDetails) {
        updateMovieDetails(movieDetails);
      }
    }
  });

  document.getElementById('buy-ticket').addEventListener('click', async () => {
    const selectedMovieItem = document.querySelector('.film.item.active');
    if (selectedMovieItem) {
      const movieId = selectedMovieItem.dataset.id;
      await buyTicket(movieId);
    }
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const movieId = event.target.dataset.id;
      await deleteFilm(movieId);
      // Optionally, you can update the UI after deleting the film
    });
  });

  const fetchFirstMovieDetails = async () => {
    try {
      const response = await fetch('http://localhost:3000/films/1');
      if (!response.ok) {
        throw new Error('Failed to fetch first movie details');
      }
      const firstMovieDetails = await response.json();
      updateMovieDetails(firstMovieDetails);
    } catch (error) {
      console.error(error);
    }
  };

  fetchFirstMovieDetails();
});
