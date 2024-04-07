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

    // Check if tickets are sold out
    if (movieDetails.capacity <= movieDetails.tickets_sold) {
      document.getElementById('buy-ticket').disabled = true;
      document.getElementById('buy-ticket').textContent = 'Sold Out';
      const filmItem = document.querySelector(`.film.item[data-id="${movieDetails.id}"]`);
      if (filmItem) {
        filmItem.classList.add('sold-out');
      }
    } else {
      document.getElementById('buy-ticket').disabled = false;
      document.getElementById('buy-ticket').textContent = 'Buy Ticket';
      const filmItem = document.querySelector(`.film.item[data-id="${movieDetails.id}"]`);
      if (filmItem) {
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

      // Fetch updated movie details after purchasing the ticket
      const updatedMovieDetails = await fetchMovieDetails(movieId);
      
      if (updatedMovieDetails) {
        // Update the UI with the new movie details, including the number of available tickets
        updateMovieDetails(updatedMovieDetails);

        // Check if tickets are sold out
        if (updatedMovieDetails.capacity <= updatedMovieDetails.tickets_sold) {
          document.getElementById('buy-ticket').disabled = true;
          document.getElementById('buy-ticket').textContent = 'Sold Out';
          const filmItem = document.querySelector(`.film.item[data-id="${updatedMovieDetails.id}"]`);
          if (filmItem) {
            filmItem.classList.add('sold-out');
          }
        }
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

  // Event listener for the "Buy Ticket" button
  document.getElementById('buy-ticket').addEventListener('click', async () => {
    const selectedMovieItem = document.querySelector('.film.item.active');
    if (selectedMovieItem) {
      const movieId = selectedMovieItem.dataset.id;
      await buyTicket(movieId);
    } else {
      //console.error('No movie selected');
      // You can also display an error message to the user or handle it in another way
    }
  });

  // Example of deleting a film when the "Delete" button is clicked
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
