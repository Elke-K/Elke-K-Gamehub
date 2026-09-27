const API_KEY = window.RAWG_API_KEY || "";
const API_BASE_URL = "https://api.rawg.io/api/games";

const select = (selector) => document.querySelector(selector);

function showNotification(message) {
  let notif = document.querySelector("#notification");
  let text = notif ? document.querySelector("#error_text") : null;

  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notification";
    notif.setAttribute("role", "alert");
    notif.style.cssText =
      "position:fixed;top:1.25rem;left:50%;transform:translateX(-50%) translateY(-120px);z-index:9999999;width:90%;max-width:28rem;padding:1rem 1.5rem;border-radius:0.875rem;box-shadow:0 10px 30px rgba(0,0,0,0.3);display:none;opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;text-align:center;border-left:4px solid #10b981;";
    text = document.createElement("p");
    text.id = "error_text";
    text.style.cssText =
      "font-size:0.95rem;margin:0;text-align:center;font-weight:500;letter-spacing:0.3px;";
    notif.appendChild(text);
    document.body.appendChild(notif);
  }

  notif.style.backgroundColor = "red";
  notif.style.borderLeft = "4px solid #ef4444";
  notif.style.color = "#ffffff";
  text.style.color = "#ffffff";

  text.innerHTML = message;
  notif.style.display = "block";
  requestAnimationFrame(() => {
    notif.style.opacity = "1";
    notif.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateX(-50%) translateY(-120px)";
    setTimeout(() => {
      notif.style.display = "none";
    }, 300);
  }, 5000);
}

function createOptimizedImage(imageUrl, gameName, cardElement) {
  const img = document.createElement("img");
  img.src = imageUrl || "";
  img.alt = gameName || "Spel afbeelding";
  img.loading = "lazy";
  img.decoding = "async";

  img.onload = function () {
    if (cardElement) {
      setTimeout(() => {
        cardElement.classList.add("loaded");
      }, Math.random() * 100);
    }
  };

  img.onerror = function () {
    this.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23334155' width='400' height='400'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
    if (cardElement) {
      cardElement.classList.add("loaded");
    }
  };

  return img;
}

function applyGlow(button, ratingBox) {
  button.classList.add(
    "ring-4",
    "ring-emerald-400",
    "shadow-[0_0_25px_rgba(16,185,129,0.6)]",
  );
  if (ratingBox && ratingBox.classList) {
    ratingBox.classList.add(
      "border-emerald-400",
      "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    );
  }
}

function resetGlow(leftBtn, rightBtn, leftBox, rightBox) {
  [leftBtn, rightBtn].forEach((btn) => {
    btn.classList.remove(
      "ring-4",
      "ring-emerald-400",
      "shadow-[0_0_25px_rgba(16,185,129,0.5)]",
    );
  });
  [leftBox, rightBox].forEach((box) => {
    if (box && box.classList) {
      box.classList.remove(
        "border-emerald-400",
        "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
      );
    }
  });
}

function checkWinner() {
  const leftBtn = select("#btn_left_game");
  const rightBtn = select("#btn_right_game");
  if (!leftBtn || !rightBtn) return;

  const leftRating = parseFloat(leftBtn.dataset.rating || "");
  const rightRating = parseFloat(rightBtn.dataset.rating || "");
  if (Number.isNaN(leftRating) || Number.isNaN(rightRating)) return;

  const cmpLeft = select("#cmp_left_rating");
  const cmpRight = select("#cmp_right_rating");
  resetGlow(leftBtn, rightBtn, cmpLeft, cmpRight);

  if (leftRating > rightRating) {
    applyGlow(leftBtn, cmpLeft);
  } else if (rightRating > leftRating) {
    applyGlow(rightBtn, cmpRight);
  } else {
    applyGlow(leftBtn, cmpLeft);
    applyGlow(rightBtn, cmpRight);
  }
}

function selectGame(game, sideButton, modal) {
  const leftGame = select("#btn_left_game");
  const rightGame = select("#btn_right_game");

  if (!leftGame || !rightGame || !sideButton || !modal) return;

  const newUrl = `url("${game.background_image}")`;

  // Prevent selecting the same game twice by comparing stored dataset.game ids
  try {
    const leftData = leftGame.dataset.game
      ? JSON.parse(leftGame.dataset.game)
      : null;
    const rightData = rightGame.dataset.game
      ? JSON.parse(rightGame.dataset.game)
      : null;
    if (
      (leftData && leftData.id === game.id) ||
      (rightData && rightData.id === game.id)
    ) {
      showNotification("Dit spel staat al in een van de vergelijkingsvakken");
      return;
    }
  } catch (e) {
    // fallback to comparing backgroundImage string
    if (
      leftGame.style.backgroundImage === newUrl ||
      rightGame.style.backgroundImage === newUrl
    ) {
      showNotification("Dit spel staat al in een van de vergelijkingsvakken");
      return;
    }
  }

  modal.classList.add("hidden");
  modal.classList.remove("flex");

  sideButton.style.backgroundImage = `url(${game.background_image})`;
  sideButton.style.backgroundSize = "cover";
  sideButton.style.backgroundPosition = "center";
  sideButton.classList.add("relative", "overflow-hidden");

  sideButton.innerHTML = "";

  const gameName = document.createElement("h2");
  gameName.classList.add(
    "text-3xl",
    "font-bold",
    "text-white",
    "z-10",
    "text-center",
  );
  gameName.textContent = game.name;

  sideButton.dataset.rating = String(game.rating ?? "");
  sideButton.dataset.game = JSON.stringify(game);
  sideButton.appendChild(gameName);

  checkWinner();

  const leftBtn = select("#btn_left_game");
  const rightBtn = select("#btn_right_game");
  if (leftBtn && rightBtn && leftBtn.dataset.game && rightBtn.dataset.game) {
    try {
      const leftGame = JSON.parse(leftBtn.dataset.game);
      const rightGame = JSON.parse(rightBtn.dataset.game);
      showComparisonPopup(leftGame, rightGame);
    } catch (err) {
      console.error("Failed to parse game data for comparison", err);
    }
  }
}

function revealSequence(nodes, delay = 120) {
  nodes.forEach((n, i) => {
    setTimeout(() => n.classList.add("visible"), i * delay);
  });
}

function showComparisonPopup(leftGame, rightGame) {
  const popup = select("#comparison_popup");
  if (!popup) return;

  // populate cards
  select("#cmp_left_image").style.backgroundImage = leftGame.background_image
    ? `url(${leftGame.background_image})`
    : "none";
  select("#cmp_right_image").style.backgroundImage = rightGame.background_image
    ? `url(${rightGame.background_image})`
    : "none";
  select("#cmp_left_name").textContent = leftGame.name || "-";
  select("#cmp_right_name").textContent = rightGame.name || "-";

  // populate rows
  select("#cmp_left_rating").textContent = String(
    leftGame.rating ?? "None found",
  );
  select("#cmp_right_rating").textContent = String(
    rightGame.rating ?? "None found",
  );

  select("#cmp_left_release").textContent = leftGame.released || "None found";
  select("#cmp_right_release").textContent = rightGame.released || "None found";

  select("#cmp_left_genre").textContent =
    leftGame?.genres?.[0]?.name || "None found";
  select("#cmp_right_genre").textContent =
    rightGame?.genres?.[0]?.name || "None found";

  select("#cmp_left_platform").textContent =
    leftGame?.platforms
      ?.map((p) => p.platform?.name)
      .filter(Boolean)
      .join(", ") || "None found";
  select("#cmp_right_platform").textContent =
    rightGame?.platforms
      ?.map((p) => p.platform?.name)
      .filter(Boolean)
      .join(", ") || "None found";

  // show popup
  popup.classList.remove("hidden");
  popup.classList.add("flex");

  // reset reveal states
  const revealEls = Array.from(popup.querySelectorAll(".reveal"));
  revealEls.forEach((el) => el.classList.remove("visible"));

  // sequence: left card, right card, then rows
  const leftCard = select("#cmp_left_card");
  const rightCard = select("#cmp_right_card");
  const rows = Array.from(popup.querySelectorAll(".cmp-row"));

  const sequence = [leftCard, rightCard, ...rows];
  revealSequence(sequence, 150);

  // close handlers
  const closeBtn = select("#close_comparison_btn");
  const backdrop = select("#comparison_backdrop");
  function hidePopup() {
    popup.classList.add("hidden");
    popup.classList.remove("flex");
  }
  if (closeBtn) closeBtn.onclick = hidePopup;
  if (backdrop) backdrop.onclick = hidePopup;
}

function renderModalResults(games, sideButton, gamesModalContainer, modal) {
  gamesModalContainer.innerHTML = "";

  if (!games || games.length === 0) {
    gamesModalContainer.innerHTML =
      '<p class="text-red-400 col-span-full text-center py-8 italic">Geen spellen gevonden. Probeer een andere zoekopdracht.</p>';
    return;
  }

  games.forEach((game) => {
    const card = document.createElement("div");
    card.classList.add(
      "bg-zinc-900",
      "border-2",
      "border-zinc-700",
      "rounded-xl",
      "overflow-hidden",
      "cursor-pointer",
      "hover:border-emerald-400",
      "hover:scale-105",
      "transition-all",
      "duration-300",
      "group",
    );

    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add(
      "w-full",
      "h-32",
      "overflow-hidden",
      "bg-zinc-800",
    );

    const img = createOptimizedImage(game.background_image, game.name, card);
    img.classList.add(
      "w-full",
      "h-full",
      "object-cover",
      "group-hover:opacity-80",
      "transition-opacity",
    );

    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.classList.add("p-3");

    const name = document.createElement("p");
    name.classList.add("text-white", "font-semibold", "text-sm", "text-wrap");
    name.textContent = game.name;

    info.appendChild(name);
    card.appendChild(imgWrapper);
    card.appendChild(info);

    card.addEventListener("click", () => selectGame(game, sideButton, modal));

    gamesModalContainer.appendChild(card);
  });
}

async function searchGames(query, gamesModalContainer, modal, button) {
  gamesModalContainer.innerHTML =
    '<p class="text-zinc-400 col-span-full text-center py-8 italic animate-pulse">Zoeken...</p>';

  try {
    const response = await fetch(
      `${API_BASE_URL}?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=12`,
    );
    const data = await response.json();
    renderModalResults(data.results, button, gamesModalContainer, modal);
  } catch (error) {
    console.error("Error searching games:", error);
    gamesModalContainer.innerHTML =
      '<p class="text-red-400 col-span-full text-center py-8 italic">Fout bij het laden van spellen. Probeer het opnieuw.</p>';
  }
}

function compareGamesButtons() {
  const leftGame = select("#btn_left_game");
  const rightGame = select("#btn_right_game");
  const sideButtons = [leftGame, rightGame].filter(Boolean);

  const gamesModal = select("#game_search_modal");
  const gamesModalContainer = select("#modal_games_container");
  const closeGamesModal = select("#close_modal_btn");
  const searchGamesBtn = select("#modal_search_btn");
  const searchInputEl = select("#modal_search_input");

  if (
    !gamesModal ||
    !gamesModalContainer ||
    !closeGamesModal ||
    !searchGamesBtn ||
    !searchInputEl ||
    sideButtons.length === 0
  ) {
    return;
  }

  let currentSideButton = null;

  closeGamesModal.addEventListener("click", () => {
    gamesModal.classList.add("hidden");
    gamesModal.classList.remove("flex");
  });

  searchGamesBtn.addEventListener("click", () => {
    const query = searchInputEl.value.trim();
    searchGames(query, gamesModalContainer, gamesModal, currentSideButton);
  });

  searchInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchInputEl.value.trim();
      searchGames(query, gamesModalContainer, gamesModal, currentSideButton);
    }
  });

  sideButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentSideButton = button;
      searchInputEl.value = "";
      gamesModalContainer.innerHTML =
        '<p class="text-zinc-500 col-span-full text-center py-8 italic">Begin met zoeken om spellen te zien...</p>';
      gamesModal.classList.remove("hidden");
      gamesModal.classList.add("flex");
    });
  });
}

function initialize() {
  compareGamesButtons();
}

initialize();
