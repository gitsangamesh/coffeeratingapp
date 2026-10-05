const coffeeGrid = document.getElementById("coffeeGrid");
const leaderboard = document.getElementById("leaderboard");


// Load coffees
async function loadCoffees() {

    const response = await fetch("/api/coffees");

    const coffees = await response.json();

    displayCoffees(coffees);
    displayLeaderboard(coffees);
}


// Display coffee cards
function displayCoffees(coffees) {

    coffeeGrid.innerHTML = "";

    coffees.forEach((coffee) => {

        const card = document.createElement("div");

        card.className = "coffee-card";

        card.innerHTML = `
            <div class="coffee-icon">☕</div>

            <h3>${coffee.name}</h3>

            <p>${coffee.description}</p>

            <div class="vote-count">
                ❤️ ${coffee.votes} votes
            </div>

            <button onclick="vote(${coffee.id})">
                Vote
            </button>
        `;

        coffeeGrid.appendChild(card);
    });
}


// Vote function
async function vote(id) {

    try {

        const response = await fetch(
            `/api/coffees/${id}/vote`,
            {
                method: "POST"
            }
        );

        const updatedCoffee = await response.json();

        if (!response.ok) {
            alert(updatedCoffee.error);
            return;
        }

        // Reload data without page refresh
        loadCoffees();

    } catch (error) {

        console.error(error);

        alert("Unable to submit vote.");

    }
}


// Display leaderboard
function displayLeaderboard(coffees) {

    leaderboard.innerHTML = "";

    const topFive = coffees
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5);

    topFive.forEach((coffee, index) => {

        const item = document.createElement("div");

        item.className = "leaderboard-item";

        item.innerHTML = `
            <span class="rank">
                #${index + 1}
            </span>

            <span class="coffee-name">
                ☕ ${coffee.name}
            </span>

            <span class="votes">
                ${coffee.votes} votes
            </span>
        `;

        leaderboard.appendChild(item);
    });
}


// Initial loading
loadCoffees();