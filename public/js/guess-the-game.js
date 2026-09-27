const API_KEY = window.RAWG_API_KEY || "";
const API_BASE_URL = "https://api.rawg.io/api/games";
const PAGE_SIZE = 40;
const select = (selector) => document.querySelector(selector);
const elements = {
  body: select("body"),
  gameModeSelection: select("#game_mode_selection"),
  btnImageMode: select("#btn_image_mode"),
  btnTextMode: select("#btn_text_mode"),
  imageGameContainer: select("#image_game_container"),
  imgGameScreenshot: select("#img_game_screenshot"),
  inputImageGuess: select("#input_image_guess"),
  btnSubmitImageGuess: select("#btn_submit_image_guess"),
  imageGuessFeedback: select("#image_guess_feedback"),
  btnShowHint: select("#btn_show_hint"),
  hintDisplay: select("#hint_display"),
  imageScore: select("#image_score"),
  imageStreak: select("#image_streak"),
  btnNextImageGame: select("#btn_next_image_game"),
  btnBackToModes: select("#btn_back_to_modes"),
  textGameContainer: select("#text_game_container"),
  textDescriptionContainer: select("#text_description_container"),
  inputTextGuess: select("#input_text_guess"),
  btnSubmitTextGuess: select("#btn_submit_text_guess"),
  textGuessFeedback: select("#text_guess_feedback"),
  btnShowClue: select("#btn_show_clue"),
  clueDisplay: select("#clue_display"),
  textScore: select("#text_score"),
  textStreak: select("#text_streak"),
  btnNextTextGame: select("#btn_next_text_game"),
  btnBackToModesText: select("#btn_back_to_modes_text"),
  userAvatar: select("#user_avatar"),
  navCollections: select("#nav_collections"),
};
const gameState = {
  allGames: [],
  currentGame: null,
  usedGames: [],
  score: 0,
  streak: 0,
  hintsUsed: 0,
  nameRevealed: false,
  mode: null,
  level: 1,
  xp: 0,
};
function getXPRequiredForLevel(level) {
  if (level <= 0) return 0;
  let totalXP = 0;
  for (let i = 2; i <= level; i += 1) totalXP += i * 50;
  return totalXP;
}
async function checkLevelUp() {
  const xpNeeded = getXPRequiredForLevel(gameState.level + 1);
  if (gameState.xp >= xpNeeded) {
    gameState.level += 1;
    await showLevelUpNotification();
    await saveUserProgressAsync();
    return true;
  }
  return false;
}
function showNotification(message) {
  let notif = select("#notification");
  let text = notif ? select("#error_text") : null;
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notification";
    notif.setAttribute("role", "alert");
    notif.style.cssText =
      "position:fixed;bottom:1.25rem;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:20rem;padding:0.75rem 1rem;border-radius:0.5rem;box-shadow:0 10px 30px rgba(0,0,0,0.4);display:none;opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;text-align:center;";
    text = document.createElement("p");
    text.id = "error_text";
    text.style.cssText = "font-size:0.875rem;margin:0;text-align:center;";
    notif.appendChild(text);
    document.body.appendChild(notif);
  }
  if (!text) return;
  const isDark = localStorage.getItem("darkmode") !== "disabled";
  notif.style.backgroundColor = isDark ? "#10b981" : "#000000";
  text.style.color = isDark ? "#000000" : "#ffffff";
  text.innerHTML = message;
  notif.style.display = "block";
  requestAnimationFrame(() => {
    notif.style.opacity = "1";
    notif.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateX(-50%) translateY(1rem)";
    setTimeout(() => {
      notif.style.display = "none";
    }, 300);
  }, 5000);
}
async function addXP(amount) {
  if (amount <= 0) return;
  gameState.xp += amount;
  await checkLevelUp();
  await saveUserProgressAsync();
}
async function showLevelUpNotification() {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-lg shadow-2xl z-50 animate-bounce";
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
      </svg>
      <div>
        <p class="font-bold text-lg">Level omhoog!</p>
        <p class="text-sm">Je bent nu level ${gameState.level}</p>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add(
      "opacity-0",
      "transition-opacity",
      "duration-500",
    );
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
async function fetchUserInfo(givenId) {
  var _a;
  if (!givenId) return {};
  try {
    const users = await fetch("/users").then((res) => res.json());
    return (_a = users.find((user) => user.id === givenId)) !== null &&
      _a !== void 0
      ? _a
      : {};
  } catch (_b) {
    return {};
  }
}
async function saveUserProgressAsync() {
  const isLoggedIn = localStorage.getItem("loggedIn");
  const userId = localStorage.getItem("userId");
  if (isLoggedIn === "true" && userId) {
    try {
      await fetch(`/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: gameState.level, xp: gameState.xp }),
      });
    } catch (err) {
      console.error("Voortgang opslaan mislukt:", err);
    }
  }
}
async function loadUserProgress() {
  const isLoggedIn = localStorage.getItem("loggedIn");
  const userId = localStorage.getItem("userId");
  if (isLoggedIn === "true" && userId) {
    try {
      const currentUser = await fetchUserInfo(userId);
      gameState.level =
        typeof currentUser.level === "number" ? currentUser.level : 1;
      gameState.xp = typeof currentUser.xp === "number" ? currentUser.xp : 0;
    } catch (error) {
      console.error("Voortgang laden mislukt:", error);
    }
  }
}
async function checkIfLoggedIn() {
  const isLoggedIn = localStorage.getItem("loggedIn");
  const userId = localStorage.getItem("userId");
  if (isLoggedIn === "true" && elements.userAvatar) {
    const currentUser = await fetchUserInfo(userId);
    if (currentUser.profile_picture) {
      elements.userAvatar.src = currentUser.profile_picture;
    }
  }
}
async function fetchAllGames() {
  var _a;
  try {
    const response = await fetch(
      `${API_BASE_URL}?key=${API_KEY}&page_size=${PAGE_SIZE}`,
    );
    const data = await response.json();
    gameState.allGames =
      (_a = data.results) !== null && _a !== void 0 ? _a : [];
  } catch (error) {
    console.error("Spellen ophalen mislukt:", error);
    gameState.allGames = [];
  }
}
function getRandomGame() {
  if (gameState.allGames.length === 0) return null;
  if (gameState.usedGames.length >= gameState.allGames.length) {
    gameState.usedGames = [];
  }
  const availableGames = gameState.allGames.filter(
    (game) => !gameState.usedGames.includes(game.id),
  );
  if (availableGames.length === 0) return null;
  const selectedGame =
    availableGames[Math.floor(Math.random() * availableGames.length)];
  gameState.usedGames.push(selectedGame.id);
  return selectedGame;
}
function isLightTheme() {
  var _a;
  return (
    ((_a = elements.body) === null || _a === void 0
      ? void 0
      : _a.classList.contains("bg-slate-50")) === true
  );
}
function getDescriptionTextClass() {
  return isLightTheme() ? "text-slate-700" : "text-zinc-300";
}
async function startImageMode() {
  gameState.mode = "image";
  gameState.score = 0;
  gameState.streak = 0;
  gameState.usedGames = [];
  await loadNewImageGame();
}
async function loadNewImageGame() {
  var _a, _b, _c;
  gameState.currentGame = getRandomGame();
  gameState.hintsUsed = 0;
  gameState.nameRevealed = false;
  if (!gameState.currentGame) {
    showNotification("Geen spellen beschikbaar. Probeer het later opnieuw.");
    return;
  }
  if (elements.imgGameScreenshot) {
    elements.imgGameScreenshot.src =
      (_a = gameState.currentGame.background_image) !== null && _a !== void 0
        ? _a
        : "../images/placeholder.png";
  }
  if (elements.inputImageGuess) {
    elements.inputImageGuess.value = "";
    elements.inputImageGuess.disabled = false;
  }
  (_b = elements.imageGuessFeedback) === null || _b === void 0
    ? void 0
    : _b.classList.add("hidden");
  (_c = elements.hintDisplay) === null || _c === void 0
    ? void 0
    : _c.classList.add("hidden");
  if (elements.imageScore)
    elements.imageScore.textContent = String(gameState.score);
  if (elements.imageStreak)
    elements.imageStreak.textContent = String(gameState.streak);
  if (elements.btnSubmitImageGuess)
    elements.btnSubmitImageGuess.disabled = false;

  // animate elements sequentially for nicer UX
  try {
    animateElementsSequentially(
      [
        document.getElementById("img_game_screenshot"),
        document.getElementById("input_image_guess")?.closest(".rounded-xl") ||
          document.getElementById("input_image_guess"),
        document.getElementById("btn_submit_image_guess"),
        document.getElementById("btn_next_image_game"),
        document.getElementById("image_guess_feedback"),
        document.getElementById("hint_display"),
        document.getElementById("image_score"),
        document.getElementById("image_streak"),
        document.getElementById("btn_show_hint"),
      ],
      60,
      90,
      "motion-rise",
    );
  } catch (e) {
    // fail silently if DOM queries don't succeed
  }
}
async function checkImageGuess() {
  if (!elements.inputImageGuess || !gameState.currentGame) return false;
  const userGuess = elements.inputImageGuess.value.trim().toLowerCase();
  const correctName = gameState.currentGame.name.toLowerCase();
  if (!userGuess) return false;
  const isCorrect =
    userGuess === correctName ||
    (userGuess.length >= 4 && correctName.includes(userGuess)) ||
    (userGuess.length >= 4 && userGuess.includes(correctName));
  if (elements.imageGuessFeedback) {
    if (isCorrect) {
      const points = gameState.nameRevealed
        ? 0
        : Math.max(10 - gameState.hintsUsed * 3, 1);
      gameState.score += points;
      gameState.streak += 1;
      if (points > 0) {
        await addXP(points);
        const xpProgress =
          gameState.xp - getXPRequiredForLevel(gameState.level);
        const xpForNextLevel =
          getXPRequiredForLevel(gameState.level + 1) -
          getXPRequiredForLevel(gameState.level);
        elements.imageGuessFeedback.textContent = `Juist! +${points} punten | +${points} XP (Level ${gameState.level}: ${xpProgress}/${xpForNextLevel} XP)`;
      } else {
        elements.imageGuessFeedback.textContent =
          "Juist! Maar geen punten (naam was al zichtbaar)";
      }
      elements.imageGuessFeedback.className =
        "mt-4 text-center font-bold text-lg text-emerald-400";
      elements.imageGuessFeedback.classList.remove("hidden");
    } else {
      gameState.streak = 0;
      elements.imageGuessFeedback.textContent = `Fout! Het spel was: ${gameState.currentGame.name}`;
      elements.imageGuessFeedback.className =
        "mt-4 text-center font-bold text-lg text-red-400";
      elements.imageGuessFeedback.classList.remove("hidden");
    }
  }
  if (elements.imageScore)
    elements.imageScore.textContent = String(gameState.score);
  if (elements.imageStreak)
    elements.imageStreak.textContent = String(gameState.streak);
  if (elements.btnSubmitImageGuess)
    elements.btnSubmitImageGuess.disabled = true;
  elements.inputImageGuess.disabled = true;
  return false;
}
async function showImageHint() {
  var _a, _b, _c, _d, _e, _f;
  if (!gameState.currentGame || !elements.hintDisplay) return;
  gameState.hintsUsed += 1;
  const hints = [
    `Genre: ${(_c = (_b = (_a = gameState.currentGame.genres) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : "Onbekend"}`,
    `Uitgebracht: ${(_d = gameState.currentGame.released) !== null && _d !== void 0 ? _d : "Onbekend"}`,
    `Beoordeling: ${(_e = gameState.currentGame.rating) !== null && _e !== void 0 ? _e : "N/B"}/5`,
    `Eerste letter: ${(_f = gameState.currentGame.name[0]) !== null && _f !== void 0 ? _f : "?"}`,
    `Aantal woorden: ${gameState.currentGame.name.split(" ").length}`,
  ];
  if (gameState.hintsUsed <= hints.length) {
    elements.hintDisplay.textContent = `Hint ${gameState.hintsUsed}: ${hints[gameState.hintsUsed - 1]}`;
  } else {
    gameState.nameRevealed = true;
    const shortName = gameState.currentGame.name;
    elements.hintDisplay.textContent = `Spel: ${shortName.substring(0, Math.max(1, shortName.length - 2))}...`;
  }
  elements.hintDisplay.classList.remove("hidden");
}
async function startTextMode() {
  gameState.mode = "text";
  gameState.score = 0;
  gameState.streak = 0;
  gameState.usedGames = [];
  await loadNewTextGame();
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function loadNewTextGame() {
  var _a, _b, _c, _d;
  gameState.currentGame = getRandomGame();
  gameState.hintsUsed = 0;
  gameState.nameRevealed = false;
  if (!gameState.currentGame) {
    showNotification("Geen spellen beschikbaar. Probeer het later opnieuw.");
    return;
  }
  if (elements.textDescriptionContainer) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${gameState.currentGame.id}?key=${API_KEY}`,
      );
      const gameDetails = await response.json();
      let description =
        (_b =
          (_a = gameDetails.description_raw) !== null && _a !== void 0
            ? _a
            : gameDetails.description) !== null && _b !== void 0
          ? _b
          : "";
      if (description) {
        description = description.replace(/<[^>]*>/g, "");
        const gameName = gameState.currentGame.name;
        description = description.replace(
          new RegExp(escapeRegExp(gameName), "gi"),
          "***",
        );
        gameName
          .split(" ")
          .filter(
            (part) =>
              part.length > 3 &&
              !["the", "of", "and", "in", "at", "on", "for"].includes(
                part.toLowerCase(),
              ),
          )
          .forEach((part) => {
            description = description.replace(
              new RegExp(escapeRegExp(part), "gi"),
              "***",
            );
          });
        const sentences = description
          .split(/\.\s+/)
          .filter((s) => s.trim().length > 0);
        const lastSentences = sentences.slice(-Math.min(3, sentences.length));
        description =
          lastSentences.join(". ") + (lastSentences.length > 0 ? "." : "");
      } else {
        description = "Geen beschrijving beschikbaar voor dit spel.";
      }
      const descriptionClass = getDescriptionTextClass();
      elements.textDescriptionContainer.innerHTML = `<p class="${descriptionClass} text-lg leading-relaxed">${description}</p>`;
    } catch (error) {
      console.error("Speldetails ophalen mislukt:", error);
      const descriptionClass = getDescriptionTextClass();
      elements.textDescriptionContainer.innerHTML = `<p class="${descriptionClass} text-lg leading-relaxed">Beschrijving kon niet worden geladen.</p>`;
    }
  }
  if (elements.inputTextGuess) {
    elements.inputTextGuess.value = "";
    elements.inputTextGuess.disabled = false;
  }
  (_c = elements.textGuessFeedback) === null || _c === void 0
    ? void 0
    : _c.classList.add("hidden");
  (_d = elements.clueDisplay) === null || _d === void 0
    ? void 0
    : _d.classList.add("hidden");
  if (elements.textScore)
    elements.textScore.textContent = String(gameState.score);
  if (elements.textStreak)
    elements.textStreak.textContent = String(gameState.streak);
  if (elements.btnSubmitTextGuess) elements.btnSubmitTextGuess.disabled = false;

  // animate elements sequentially for nicer UX
  try {
    animateElementsSequentially(
      [
        document.getElementById("text_description_container"),
        document.getElementById("input_text_guess")?.closest(".rounded-xl") ||
          document.getElementById("input_text_guess"),
        document.getElementById("btn_submit_text_guess"),
        document.getElementById("btn_next_text_game"),
        document.getElementById("text_guess_feedback"),
        document.getElementById("clue_display"),
        document.getElementById("text_score"),
        document.getElementById("text_streak"),
        document.getElementById("btn_show_clue"),
      ],
      60,
      90,
      "motion-rise",
    );
  } catch (e) {
    // ignore failures
  }
}

/**
 * Apply a short staggered animation to an array of elements.
 * elementsArr: array of DOM nodes (may include nulls)
 * baseDelay: starting delay in ms
 * step: incremental delay in ms between items
 * animationClass: CSS animation class to add
 */
function animateElementsSequentially(
  elementsArr,
  baseDelay = 60,
  step = 80,
  animationClass = "motion-rise",
) {
  if (!Array.isArray(elementsArr)) return;
  elementsArr.forEach((el, idx) => {
    if (!el) return;
    // remove any previous animation class and inline delay
    el.classList.remove(animationClass);
    el.style.animationDelay = "";
    // force reflow so the animation can restart
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetWidth;
    // set delay and add class
    el.style.animationDelay = `${baseDelay + idx * step}ms`;
    el.classList.add(animationClass);
  });
}
async function checkTextGuess() {
  if (!elements.inputTextGuess || !gameState.currentGame) return false;
  const userGuess = elements.inputTextGuess.value.trim().toLowerCase();
  const correctName = gameState.currentGame.name.toLowerCase();
  if (!userGuess) return false;
  const isCorrect =
    userGuess === correctName ||
    (userGuess.length >= 4 && correctName.includes(userGuess)) ||
    (userGuess.length >= 4 && userGuess.includes(correctName));
  if (elements.textGuessFeedback) {
    if (isCorrect) {
      const points = gameState.nameRevealed
        ? 0
        : Math.max(10 - gameState.hintsUsed * 3, 1);
      gameState.score += points;
      gameState.streak += 1;
      if (points > 0) {
        await addXP(points);
        const xpProgress =
          gameState.xp - getXPRequiredForLevel(gameState.level);
        const xpForNextLevel =
          getXPRequiredForLevel(gameState.level + 1) -
          getXPRequiredForLevel(gameState.level);
        elements.textGuessFeedback.textContent = `Juist! +${points} punten | +${points} XP (Level ${gameState.level}: ${xpProgress}/${xpForNextLevel} XP)`;
      } else {
        elements.textGuessFeedback.textContent =
          "Juist! Maar geen punten (naam was al zichtbaar)";
      }
      elements.textGuessFeedback.className =
        "mt-4 text-center font-bold text-lg text-emerald-400";
      elements.textGuessFeedback.classList.remove("hidden");
    } else {
      gameState.streak = 0;
      elements.textGuessFeedback.textContent = `Fout! Het spel was: ${gameState.currentGame.name}`;
      elements.textGuessFeedback.className =
        "mt-4 text-center font-bold text-lg text-red-400";
      elements.textGuessFeedback.classList.remove("hidden");
    }
  }
  if (elements.textScore)
    elements.textScore.textContent = String(gameState.score);
  if (elements.textStreak)
    elements.textStreak.textContent = String(gameState.streak);
  if (elements.btnSubmitTextGuess) elements.btnSubmitTextGuess.disabled = true;
  elements.inputTextGuess.disabled = true;
  return false;
}
async function showTextClue() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j;
  if (!gameState.currentGame || !elements.clueDisplay) return;
  gameState.hintsUsed += 1;
  const clues = [
    `Platform: ${(_d = (_c = (_b = (_a = gameState.currentGame.platforms) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.platform) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "Meerdere"}`,
    `Ontwikkelaar: ${(_g = (_f = (_e = gameState.currentGame.developers) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : "Onbekend"}`,
    `Uitgebracht: ${(_h = gameState.currentGame.released) !== null && _h !== void 0 ? _h : "Onbekend"}`,
    `Eerste letter: ${(_j = gameState.currentGame.name[0]) !== null && _j !== void 0 ? _j : "?"}`,
    `Lengte: ${gameState.currentGame.name.length} tekens`,
  ];
  if (gameState.hintsUsed <= clues.length) {
    elements.clueDisplay.textContent = `Hint ${gameState.hintsUsed}: ${clues[gameState.hintsUsed - 1]}`;
  } else {
    gameState.nameRevealed = true;
    const shortName = gameState.currentGame.name;
    elements.clueDisplay.textContent = `Spel: ${shortName.substring(0, Math.max(1, shortName.length - 2))}...`;
  }
  elements.clueDisplay.classList.remove("hidden");
}
function resetGameState() {
  Object.assign(gameState, {
    currentGame: null,
    usedGames: [],
    score: 0,
    streak: 0,
    hintsUsed: 0,
    nameRevealed: false,
    mode: null,
  });
}
function initializeEventListeners() {
  var _a;
  if (
    (_a = elements.userAvatar) === null || _a === void 0
      ? void 0
      : _a.parentElement
  ) {
    elements.userAvatar.parentElement.addEventListener("click", (e) => {
      e.preventDefault();
      const isLoggedIn = localStorage.getItem("loggedIn");
      window.location.href =
        isLoggedIn === "true" ? "./profile?page=info" : "./login";
    });
  }
  if (elements.navCollections) {
    elements.navCollections.addEventListener("click", (e) => {
      e.preventDefault();
      const isLoggedIn = localStorage.getItem("loggedIn");
      window.location.href =
        isLoggedIn === "true" ? "./profile?page=collections" : "./login";
    });
  }
  if (elements.btnImageMode) {
    elements.btnImageMode.addEventListener("click", async (e) => {
      var _a;
      e.preventDefault();
      await fetchAllGames();
      if (elements.gameModeSelection)
        elements.gameModeSelection.style.display = "none";
      (_a = elements.imageGameContainer) === null || _a === void 0
        ? void 0
        : _a.classList.remove("hidden");
      await startImageMode();
    });
  }
  if (elements.btnTextMode) {
    elements.btnTextMode.addEventListener("click", async (e) => {
      var _a;
      e.preventDefault();
      await fetchAllGames();
      if (elements.gameModeSelection)
        elements.gameModeSelection.style.display = "none";
      (_a = elements.textGameContainer) === null || _a === void 0
        ? void 0
        : _a.classList.remove("hidden");
      await startTextMode();
    });
  }
  if (elements.btnBackToModes) {
    elements.btnBackToModes.addEventListener("click", async (e) => {
      var _a;
      e.preventDefault();
      (_a = elements.imageGameContainer) === null || _a === void 0
        ? void 0
        : _a.classList.add("hidden");
      if (elements.gameModeSelection)
        elements.gameModeSelection.style.display = "block";
      resetGameState();
    });
  }
  if (elements.btnBackToModesText) {
    elements.btnBackToModesText.addEventListener("click", async (e) => {
      var _a;
      e.preventDefault();
      (_a = elements.textGameContainer) === null || _a === void 0
        ? void 0
        : _a.classList.add("hidden");
      if (elements.gameModeSelection)
        elements.gameModeSelection.style.display = "block";
      resetGameState();
    });
  }
  if (elements.btnSubmitImageGuess) {
    elements.btnSubmitImageGuess.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await checkImageGuess();
    });
  }
  if (elements.inputImageGuess) {
    elements.inputImageGuess.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        await checkImageGuess();
      }
    });
  }
  if (elements.btnShowHint) {
    elements.btnShowHint.addEventListener("click", async () => {
      await showImageHint();
    });
  }
  if (elements.btnNextImageGame) {
    elements.btnNextImageGame.addEventListener("click", async () => {
      await loadNewImageGame();
    });
  }
  if (elements.btnSubmitTextGuess) {
    elements.btnSubmitTextGuess.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await checkTextGuess();
    });
  }
  if (elements.inputTextGuess) {
    elements.inputTextGuess.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        await checkTextGuess();
      }
    });
  }
  if (elements.btnShowClue) {
    elements.btnShowClue.addEventListener("click", async () => {
      await showTextClue();
    });
  }
  if (elements.btnNextTextGame) {
    elements.btnNextTextGame.addEventListener("click", async () => {
      await loadNewTextGame();
    });
  }
}
async function initialize() {
  initializeEventListeners();
  await checkIfLoggedIn();
  await loadUserProgress();
}
void initialize();
