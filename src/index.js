document.addEventListener('DOMContentLoaded', () => {
  // Grab references to various HTML elements
  let filmsList = document.getElementById('films');
  let poster = document.getElementById('poster');
  let title = document.getElementById('title');
  let runtime = document.getElementById('runtime');
  let showtime = document.getElementById('showtime');
  let availableTickets = document.getElementById('ticket-num');

  // Function to fetch movie details from the server
  let fetchMovieDetails = movieId => {
    return fetch(`http://localhost:3000/films/${movieId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        return response.json();
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  };

  // Function to update UI with movie details
  let updateMovieDetails = movieDetails => {
    poster.src = movieDetails.poster;
    title.textContent = movieDetails.title;
    runtime.textContent = `${movieDetails.runtime} minutes`;
    showtime.textContent = movieDetails.showtime;
    availableTickets.textContent = movieDetails.capacity - movieDetails.tickets_sold;

    // Update Buy Ticket button and film item class based on ticket availability
    let buyTicketButton = document.getElementById('buy-ticket');
    let soldOut = movieDetails.capacity <= movieDetails.tickets_sold;

    buyTicketButton.disabled = soldOut;
    buyTicketButton.textContent = soldOut ? 'Sold Out' : 'Buy Ticket';

    let filmItem = document.querySelector(`.film.item[data-id="${movieDetails.id}"]`);
    if (filmItem) filmItem.classList.toggle('sold-out', soldOut);
  };

  // Function to handle buying tickets
  let buyTicket = movieId => {
    return fetch(`http://localhost:3000/films/${movieId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets_sold: parseInt(availableTickets.textContent) + 1 })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to buy ticket');
      }
      return fetchMovieDetails(movieId);
    })
    .then(updatedMovieDetails => {
      updateMovieDetails(updatedMovieDetails);
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
  };

  // Function to handle deleting films
  let deleteFilm = movieId => {
    return fetch(`http://localhost:3000/films/${movieId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete film');
      }
      // Optionally, update the UI after deleting the film
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
  };

  // Event listener for clicking on a film item
  filmsList.addEventListener('click', event => {
    if (event.target.classList.contains('film')) {
      fetchMovieDetails(event.target.dataset.id)
        .then(movieDetails => {
          updateMovieDetails(movieDetails);
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  // Event listener for clicking on the "Buy Ticket" button
  document.getElementById('buy-ticket').addEventListener('click', () => {
    let selectedMovieItem = document.querySelector('.film.item.active');
    if (selectedMovieItem) {
      buyTicket(selectedMovieItem.dataset.id)
        .catch(error => {
          console.error(error);
        });
    }
  });

  // Event listener for clicking on delete buttons
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', event => {
      deleteFilm(event.target.dataset.id)
        .catch(error => {
          console.error(error);
        });
      // Optionally, update the UI after deleting the film
    });
  });

  // Fetch details of the first movie when the page loads
  fetch(`http://localhost:3000/films/1`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch first movie details');
      }
      return response.json();
    })
    .then(firstMovieDetails => {
      updateMovieDetails(firstMovieDetails);
    })
    .catch(error => {
      console.error(error);
    });
});

