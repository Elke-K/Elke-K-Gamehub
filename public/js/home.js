//JS code for home page!
const body = document.querySelector("body");
const header = document.querySelector("header");
const logo = document.querySelector("#logo");
const nav_home = document.querySelector("#nav_home");
const nav_games = document.querySelector("#nav_games");
const nav_guess = document.querySelector("#nav_guess");
const nav_compare = document.querySelector("#nav_compare");
const nav_collections = document.querySelector("#nav_collections");
const nav_contact = document.querySelector("#nav_contact");
const currently_game = document.querySelector("#currently_game");
const div_popular_games = document.querySelector("#div_popular_games");
const div_recent_games = document.querySelector("#div_recent_games");
const div_all_games = document.querySelector("#div_all_games");
const slider = document.querySelector(".slider");
const user_avatar = document.querySelector("#user_avatar");

if (user_avatar) {
  // Do not override the anchor click behavior here — let the server handle auth redirects.
}

// nav_collections is an anchor; avoid client-side auth checks and let server-side session control access.

async function checkIfLoggedIn() {
  const isLoggedIn = localStorage.getItem("loggedIn");
  const userId = localStorage.getItem("userId");

  if (isLoggedIn === "true") {
    const currentUser = await fetchUserInfo(userId);

    if (currentUser.profile_picture && currentUser?.profile_picture != "") {
      user_avatar.src = currentUser.profile_picture;
    }
  }
}

async function fetchUserInfo(givenId) {
  const users = await fetch("/users")
    .then((res) => res.json())
    .then((res) => {
      return res;
    });

  let userInfo = {};

  users.forEach((user) => {
    if (user.id === givenId) {
      userInfo = user;
    }
  });

  return userInfo;
}

async function checkCurrentGame() {
  const currentGame = document.querySelector("#current_game");
  if (!currentGame) return;

  const disableLink = () => {
    currentGame.parentElement.removeAttribute("href");
    currentGame.parentElement.style.cursor = "default";
    currentGame.parentElement.style.pointerEvents = "none";
  };

  try {
    const isLoggedIn = localStorage.getItem("loggedIn");
    const userId = localStorage.getItem("userId");

    if (isLoggedIn !== "true" || !userId) {
      disableLink();
      return;
    }

    const userInfo = await fetchUserInfo(userId);

    if (!userInfo || !Array.isArray(userInfo.collection_more)) {
      disableLink();
      return;
    }

    const userCurrentlyPlaying = userInfo.collection_more.find((c) => {
      const name = c.collectionName.toLowerCase();
      return name.includes("currently playing") || name.includes("momenteel");
    });

    if (
      userCurrentlyPlaying &&
      userCurrentlyPlaying.allGames &&
      userCurrentlyPlaying.allGames.length > 0
    ) {
      currentGame.innerHTML = userCurrentlyPlaying.allGames[0].gameName;
      currentGame.parentElement.href = `/game-info/${userCurrentlyPlaying.allGames[0].gameId}`;
    } else {
      disableLink();
    }
  } catch (err) {
    console.error("checkCurrentGame error:", err);
  }
}

// === Pagination ===
const btnLeft = document.querySelector("#btn_left");
const btnRight = document.querySelector("#btn_right");
const gamesContainer = document.querySelector("#games_container");

if (btnLeft) btnLeft.disabled = true;

let currentPage = 0;

async function loadGamesPage(direction) {
  if (direction === "prev") currentPage = Math.max(0, currentPage - 1);
  if (direction === "next") currentPage += 1;

  const params = new URLSearchParams({ page: currentPage });

  const res = await fetch(`/home/games-partial?${params}`);
  const { showAllGames, isFirstPage, isLastPage } = await res.json();

  gamesContainer.innerHTML = showAllGames
    .map(
      (game) => `
    <div class="game-card relative w-full aspect-square">
      <div class="absolute inset-0">
        <img class="w-full h-full object-cover" alt="${game.name}" src="${game.background_image}" loading="lazy" decoding="async">
      </div>
      <a class="absolute inset-0 z-10" href="/game-info/${game.id}" target="_self" aria-label="Ga naar ${game.name}">
        <p class="game-card-title absolute inset-x-0 bottom-0 p-4 text-center text-white font-bold text-base drop-shadow">${game.name}</p>
      </a>
    </div>
  `,
    )
    .join("");

  btnLeft.disabled = isFirstPage;
  btnRight.disabled = isLastPage;
}

btnLeft?.addEventListener("click", () => loadGamesPage("prev"));
btnRight?.addEventListener("click", () => loadGamesPage("next"));
