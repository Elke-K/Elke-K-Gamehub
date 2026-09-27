const btn_filter_container = document.querySelector("#btn_filter_container");
const filter_container = document.querySelector("#filter_container");
const filter_close = document.querySelector("#filter_close");
const search_input = document.querySelector("#search_input");
const clear_btn = document.querySelector("#clear_btn");
const games_suggestions = document.querySelector("#games_suggestions");
const games_toolbar = document.querySelector(".games-toolbar");
const body = document.body;

let suggestionTimer = null;
let suggestionRequestId = 0;

function setClearButtonVisibility() {
  if (!clear_btn || !search_input) return;

  if (search_input.value.trim()) {
    clear_btn.classList.remove("hidden");
  } else {
    clear_btn.classList.add("hidden");
  }
}

function renderSuggestions(items) {
  if (!games_suggestions) return;

  games_suggestions.innerHTML = "";

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    games_suggestions.appendChild(option);
  });
}

async function loadGameSuggestions(query) {
  const requestId = ++suggestionRequestId;

  if (!query.trim()) {
    renderSuggestions([]);
    return;
  }

  try {
    const params = new URLSearchParams();
    params.set("q", query.trim());

    const response = await fetch(
      `/games/search-suggestions?${params.toString()}`,
    );
    const data = await response.json();

    if (requestId !== suggestionRequestId) return;

    renderSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
  } catch (error) {
    if (requestId !== suggestionRequestId) return;
    renderSuggestions([]);
  }
}

if (search_input) {
  setClearButtonVisibility();

  search_input.addEventListener("input", () => {
    setClearButtonVisibility();

    if (suggestionTimer) {
      clearTimeout(suggestionTimer);
    }

    suggestionTimer = setTimeout(() => {
      loadGameSuggestions(search_input.value);
    }, 220);
  });

  search_input.addEventListener("focus", () => {
    if (search_input.value.trim()) {
      loadGameSuggestions(search_input.value);
    }
  });

  search_input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      renderSuggestions([]);
    }
  });
}

if (clear_btn && search_input) {
  clear_btn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/games";
  });
}

if (games_toolbar) {
  games_toolbar.addEventListener("submit", () => {
    renderSuggestions([]);
  });
}

const closeFilter = () => {
  filter_container.classList.remove(
    "opacity-100",
    "scale-100",
    "translate-y-0",
  );
  filter_container.classList.add("opacity-0", "scale-95", "-translate-y-2");
  body.classList.remove("filter-open");
  setTimeout(() => {
    filter_container.style.display = "none";
    filter_container.classList.add("hidden");
  }, 300);
};

btn_filter_container.addEventListener("click", () => {
  if (filter_container.classList.contains("opacity-100")) {
    closeFilter();
  } else {
    filter_container.style.display = "flex";
    filter_container.classList.remove(
      "opacity-0",
      "scale-95",
      "-translate-y-2",
    );
    body.classList.add("filter-open");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        filter_container.classList.add(
          "opacity-100",
          "scale-100",
          "translate-y-0",
        );
      });
    });
  }
});

if (filter_close) {
  filter_close.addEventListener("click", () => {
    closeFilter();
  });
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

  const params = new URLSearchParams();
  params.set("page", currentPage);

  const activeSortfield = document.querySelector(
    "input[name='sortfield']:checked",
  );
  if (activeSortfield) params.set("sortfield", activeSortfield.value);

  const res = await fetch(`/games/games-partial?${params}`);
  const { showAllGames, isFirstPage, isLastPage } = await res.json();

  gamesContainer.innerHTML = showAllGames
    .map(
      (game) => `
    <div class="game-card animate-fade-in relative w-full aspect-square">
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
