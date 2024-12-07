// Initialize the coin count from localStorage or set to 0 if not available
let coins = parseInt(localStorage.getItem("coins")) || 0;
const coinDisplay = document.getElementById("coin-counter"); // Corrected selector
const cardContainer = document.getElementById("card-container");
const pullSingleButton = document.getElementById("pull-single");
const pull10Button = document.getElementById("pull-10");

// Function to update coin count
function updateCoinCount() {
    coinDisplay.textContent = coins;
    localStorage.setItem("coins", coins);
}

// Initialize coin count on page load
window.onload = () => {
    coins = parseInt(localStorage.getItem("coins")) || 0;
    updateCoinDisplay();  // Ensure this function sets the initial coin display
};

// Add a coin when the "Get Coin" button is clicked
document.getElementById("coin-btn")?.addEventListener("click", function () {
    coins++; // Increment coins
    updateCoinCount(); // Update the display and sync with localStorage

    console.log("Coins updated: ", coins); // Debug log for coins

    // Show the one-time popup when the user reaches exactly 30 coins
    if (coins === 30) {
        console.log("Coins reached 30! Checking localStorage...");

        if (!localStorage.getItem("first30CoinsPopupShown")) {
            console.log("Showing the pop-up for the first time.");
            alert("Congratulations! You have 30 coins! Check out the store if you still haven't :)");

            // Set the tracker in localStorage
            localStorage.setItem("first30CoinsPopupShown", "true");
        } else {
            console.log("Popup has already been shown before.");
        }
    }
});

function updateCoinDisplay() {
    coinDisplay.textContent = coins;
}

// Handle the single pull (3 coins)
document.getElementById("pull-single")?.addEventListener("click", function() {
    if (coins >= 3) {
        coins -= 3;  // Deduct 3 coins for a single pull
        updateCoinCount();  // Update the displayed coin count
        drawCard(1);  // Draw 1 card
    } else {
        alert("Not enough coins!");
    }
});

// Handle the 10 pull (30 coins)
document.getElementById("pull-10")?.addEventListener("click", function() {
    if (coins >= 30) {
        coins -= 30;  // Deduct 30 coins for a 10 pull
        updateCoinCount();  // Update the displayed coin count
        drawCard(10);  // Draw 10 cards
    } else {
        alert("Not enough coins!");
    }
});

function drawCard(count) {
    cardContainer.innerHTML = '';  // Clear any existing cards
    flippedCardCount = 0;  // Reset the flipped card counter when drawing new cards

    const cardRarities = ['legendary', 'epic', 'rare'];
    const drawCard = () => {
        const random = Math.random();
        let rarity = 'rare';
        if (random < 0.07) rarity = 'legendary';
        else if (random < 0.30) rarity = 'epic';

        const card = document.createElement('div');
        card.classList.add('card', rarity);
        card.innerHTML = `<div class="card-back">Click to flip</div>`;
        card.addEventListener("click", () => flipCard(card, rarity));
        cardContainer.appendChild(card);
    };

    for (let i = 0; i < count; i++) {
        drawCard();  // Draw the card based on the count
    }

    // Hide the draw buttons by setting visibility to hidden
    pullSingleButton.style.visibility = "hidden";
    pull10Button.style.visibility = "hidden";
}

function replaceButtonsWithPlaceholders() {
    const placeholders = document.querySelectorAll(".button-placeholder");
    if (placeholders.length === 0) {
        // Create placeholders if they don't already exist
        const pullSinglePlaceholder = document.createElement("div");
        pullSinglePlaceholder.className = "button-placeholder";
        pullSinglePlaceholder.style.height = `${pullSingleButton.offsetHeight}px`; // Match button height
        pullSinglePlaceholder.style.margin = `${pullSingleButton.offsetMargin}px`; // Match button margins
        pullSinglePlaceholder.style.visibility = "hidden"; // Make invisible

        const pull10Placeholder = document.createElement("div");
        pull10Placeholder.className = "button-placeholder";
        pull10Placeholder.style.height = `${pull10Button.offsetHeight}px`;
        pull10Placeholder.style.margin = `${pull10Button.offsetMargin}px`;
        pull10Placeholder.style.visibility = "hidden";

        pullSingleButton.replaceWith(pullSinglePlaceholder);
        pull10Button.replaceWith(pull10Placeholder);
    }
}

// Determine card rarity based on random chance
function getCardRarity() {
    const random = Math.random();
    if (random < 0.07) return 'legendary';  // 7% chance
    if (random < 0.30) return 'epic';       // 23% chance
    return 'rare';                          // 70% chance
}

// Function to flip a card and show the picture or video
function flipCard(card, rarity) {
    if (card.classList.contains('flipped')) {
        // Open modal directly if already flipped
        const content = card.querySelector('img');
        openCardModal(content.outerHTML);
        return;
    }

    let cardIndex;
    if (rarity === 'legendary') {
        cardIndex = Math.floor(Math.random() * 5) + 1;   // 1-5
    } else if (rarity === 'epic') {
        cardIndex = Math.floor(Math.random() * 15) + 6;  // 6-20
    } else {
        cardIndex = Math.floor(Math.random() * 30) + 21; // 21-50
    }

    const collection = initializeCollection();
    const isNew = collection[cardIndex] === 0;

    // Use thumbnail for epic and legendary cards
    let mediaElement;
    if (rarity === 'legendary' || rarity === 'epic') {
        mediaElement = `
            <div class="video-thumbnail">
                <img src="pictures/catto${cardIndex}.png" alt="Cat Thumbnail ${cardIndex}" />
                <div class="play-icon">&#9658;</div>
            </div>`;
    } else {
        const imageType = cardIndex >= 40 ? 'jpg' : 'png';
        mediaElement = `<img src="pictures/videos/cat${cardIndex}.${imageType}" alt="Cat Picture ${cardIndex}" />`;
        card.addEventListener('click', () => openCardModal(mediaElement));
    }

    // Set the card content and style
    card.innerHTML = mediaElement;
    card.classList.add('flipped');

    if (isNew) {
        const newLabel = document.createElement('div');
        newLabel.classList.add('new-label');
        newLabel.textContent = 'NEW';
        card.appendChild(newLabel);
    }

    updateCollection(cardIndex);
    saveToCollection(rarity, cardIndex);

    // Attach modal logic for the flipped card
    if (rarity === 'legendary' || rarity === 'epic') {
        card.addEventListener('click', () => {
            const modalVideo = `
                <video width="100%" controls autoplay>
                    <source src="pictures/videos/cat${cardIndex}.mp4" type="video/mp4">
                </video>`;
            openCardModal(modalVideo);
        });
    } else { // For rare cards
        const imageType = cardIndex >= 40 ? 'jpg' : 'png';
        const imageSrc = `pictures/videos/cat${cardIndex}.${imageType}`;
        card.addEventListener('click', () => {
            const modalImage = `<img src="${imageSrc}" alt="Cat Picture ${cardIndex}" />`;
            openCardModal(modalImage);
        });
    }

    // Show draw buttons if all cards are flipped
    if (document.querySelectorAll('.card.flipped').length === document.querySelectorAll('.card').length) {
        showDrawButtons();
    }
}

function showDrawButtons() {
    pullSingleButton.style.visibility = "visible";
    pull10Button.style.visibility = "visible";
}


// Get a random cat image number based on rarity
function getRandomCatNumber(rarity) {
    if (rarity === 'legendary') return Math.floor(Math.random() * 5) + 1;        // 1-5
    if (rarity === 'epic') return Math.floor(Math.random() * 15) + 6;            // 6-20
    return Math.floor(Math.random() * 30) + 21;                                  // 21-50
}

// Save drawn cards to localStorage for collection
function saveToCollection(rarity, cardIndex) {
    let collection = JSON.parse(localStorage.getItem(rarity + 'Cats')) || []; // Get the rarity-specific collection
    collection.push(cardIndex);  // Add the card index to the collection
    localStorage.setItem(rarity + 'Cats', JSON.stringify(collection)); // Save updated collection
}

// Reset the game (coins and collections)
document.getElementById("reset-game")?.addEventListener("click", function() {
    if (confirm("Are you sure you want to reset the game?")) {
        coins = 0;
        localStorage.clear();  // Clears both coins and collection
        localStorage.removeItem("popupShown"); // Reset the tutorial pop-up flag
        updateCoinCount();
        cardContainer.innerHTML = '';
    }
});

// Initialize the coin count on page load
updateCoinCount();

// Initialize the collection data from localStorage if not already set
function initializeCollection() {
    let collection = JSON.parse(localStorage.getItem("collection")) || {};
    if (Object.keys(collection).length === 0) {
        // Initialize the collection if it's not set
        for (let i = 1; i <= 50; i++) {
            collection[i] = 0; // Set the initial collection count for all cards
        }
        localStorage.setItem("collection", JSON.stringify(collection));
    }
    return collection;
}

// Update the collection count in localStorage
function updateCollection(catIndex) {
    let collection = initializeCollection();
    collection[catIndex]++;
    localStorage.setItem("collection", JSON.stringify(collection));
    displayCollection(); // Refresh collection display after update
}

function displayCollection() {
    const rarityConfig = [
        { name: 'legendary', rangeStart: 1, rangeEnd: 5 },
        { name: 'epic', rangeStart: 6, rangeEnd: 20 },
        { name: 'rare', rangeStart: 21, rangeEnd: 50 }
    ];

    rarityConfig.forEach(({ name, rangeStart, rangeEnd }) => {
        const container = document.getElementById(`${name}-collection`);
        
        if (!container) return;  // Skip if the container doesn't exist
        
        container.innerHTML = '';  // Clear existing content

        for (let i = rangeStart; i <= rangeEnd; i++) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('collection-card', name);

            const collection = JSON.parse(localStorage.getItem(name + 'Cats')) || [];
            const isCollected = collection.includes(i);

            if (isCollected) {
                const count = collection.filter(c => c === i).length;
                cardDiv.innerHTML = generateMediaElement(name, i) + `<div class="count">x${count}</div>`;
            } else {
                cardDiv.innerHTML = `<div class="missing-card">?</div>`;
            }

            container.appendChild(cardDiv);
        }
    });
}

// Generate the appropriate video or image element
function generateMediaElement(rarity, index) {
    let mediaElement;
    if (rarity === 'legendary' || rarity === 'epic') {
        const videoSource = `pictures/videos/cat${index}.mp4`;
        mediaElement = `
            <div class="video-thumbnail" onclick='openCardModal(\`
                <video width="100%" controls autoplay>
                    <source src="${videoSource}" type="video/mp4">
                </video>
            \`)'>
                <img src="pictures/catto${index}.png" alt="Cat Thumbnail ${index}" />
                <div class="play-icon">&#9658;</div>
            </div>`;
    } else {
        const imageType = index >= 40 ? 'jpg' : 'png';
        const imageSource = `pictures/videos/cat${index}.${imageType}`;
        mediaElement = `
            <img src="${imageSource}" alt="Cat Picture ${index}" onclick='openCardModal(\`
                <img src="${imageSource}" alt="Cat Picture ${index}" />
            \`)' />`;
    }
    return mediaElement;
}

document.addEventListener("DOMContentLoaded", () => {
    // Update coin display on every page
    updateCoinCount();

    // If we are on the collections page, display the collection
    if (window.location.pathname.endsWith("collections.html")) {
        displayCollection();
    }
});

// Modal elements
const modal = document.getElementById("card-modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.querySelector(".close");

// Open the modal with card content
function openCardModal(content) {
    modalBody.innerHTML = content; // Directly set the modal content
    modal.style.display = "flex"; // Show the modal
}

// Close modal when clicking the close button
closeModal.onclick = () => {
    modal.style.display = "none";
    modalBody.innerHTML = "";  // Clear content when closing
};

// Close modal when clicking outside of it
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        modalBody.innerHTML = "";
    }
};

document.addEventListener("DOMContentLoaded", function() {
    const unlockAllButton = document.getElementById("unlock-all");
    if (unlockAllButton) {
        unlockAllButton.addEventListener("click", unlockAllCards);
    }
});

function unlockAllCards() {
    const rarities = ['legendary', 'epic', 'rare'];
    const rarityLimits = {
        legendary: { start: 1, end: 5 },
        epic: { start: 6, end: 20 },
        rare: { start: 21, end: 50 }
    };

    rarities.forEach(rarity => {
        const collection = [];
        for (let i = rarityLimits[rarity].start; i <= rarityLimits[rarity].end; i++) {
            collection.push(i);  // Unlock each card
        }
        localStorage.setItem(`${rarity}Cats`, JSON.stringify(collection));
    });
    
    alert("All cards have been unlocked!");
    displayCollection();  // Refresh the collection display
}

document.getElementById("coin-btn")?.addEventListener("click", function() {
    coins++;
    updateCoinCount();

    // Show the message when the user first gets 30 coins
    if (coins === 30 && !localStorage.getItem("first30CoinsPopupShown")) {
        // Show the pop-up or any other notification here
        alert("Congratulations! You have 30 coins! Check out the store.");
        
        // Set flag in localStorage to prevent showing this message again
        localStorage.setItem("first30CoinsPopupShown", "true");
    }
});