const add_to_collection_btn = document.querySelector("#add_to_collection_btn");
const addToCollectionMenu = document.querySelector("#addToCollectionMenu");
const allCollectionsNames = document.querySelector("#allCollectionsNames");
const loading_collections = document.querySelector("#loading_collections");
const modal_backdrop = document.querySelector("#modal_backdrop");
const delete_collection_btn = document.querySelector("#delete_collection_btn");
const create_collection_btn = document.querySelector("#create_collection_btn");
const createCollectionModal = document.querySelector("#createCollectionModal");
const btn_close_create_modal = document.querySelector(
  "#btn_close_create_modal",
);
const btn_submit_create_collection = document.querySelector(
  "#btn_submit_create_collection",
);
const new_collection_name = document.querySelector("#new_collection_name");
const scroll_to_reviews_btn = document.querySelector("#scroll_to_reviews_btn");
const review_container = document.querySelector("#review_container");

const isLightTheme = document.body.classList.contains("theme-light");
let currentGameData = null;

const applyCollectionMenuTheme = () => {
  if (!addToCollectionMenu) return;

  addToCollectionMenu.style.backgroundColor = isLightTheme
    ? "rgba(255, 255, 255, 0.96)"
    : "rgba(15, 23, 42, 0.95)";
  addToCollectionMenu.style.borderColor = isLightTheme ? "#cbd5e1" : "#10b981";
  addToCollectionMenu.style.boxShadow = isLightTheme
    ? "0 24px 60px rgba(148, 163, 184, 0.28)"
    : "0 24px 60px rgba(15, 23, 42, 0.45)";
};

const fetchGameData = async () => {
  const pathParts = window.location.pathname.split("/");
  const gameId = pathParts[pathParts.length - 1];
  let newGameId = Number(gameId);

  if (newGameId < 0) newGameId = newGameId * -1;
  console.log(typeof newGameId);
  const url = `https://api.rawg.io/api/games/${String(newGameId)}?key=0dd5b24612bc410abab2e6e861057278`;
  const response = await fetch(url);
  currentGameData = await response.json();
  return currentGameData;
};

const renderCollectionsList = async (collections) => {
  if (!allCollectionsNames) return;

  allCollectionsNames.innerHTML = "";

  if (collections.length === 0) {
    allCollectionsNames.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: #94a3b8;">
        <p style="margin: 0; font-size: 0.95rem;">📭 Geen collecties beschikbaar</p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem;">Maak een nieuwe collectie aan om dit spel toe te voegen</p>
      </div>
    `;
    return;
  }

  const collectionsList = document.createElement("div");
  collectionsList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 350px;
    overflow-y: auto;
    padding-right: 0.5rem;
  `;
  const pathParts = window.location.pathname.split("/");
  const gameId = pathParts[pathParts.length - 1];
  let addCollection = false;
  for (let collection of collections) {
    if (collection.allGames.length > 0) {
      for (let game of collection.allGames) {
        if (game.gameId === gameId) {
          addCollection = false;
        } else {
          addCollection = true;
        }
      }
    } else {
      addCollection = true;
    }

    if (addCollection === true) {
      const collectionItem = document.createElement("div");
      collectionItem.style.cssText = `
      padding: 1rem;
      border: 2px solid ${isLightTheme ? "#e2e8f0" : "#334155"};
      border-radius: 0.875rem;
      background-color: ${isLightTheme ? "rgba(248, 250, 252, 0.5)" : "rgba(30, 41, 59, 0.4)"};
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    `;

      collectionItem.onmouseover = () => {
        collectionItem.style.borderColor = "#10b981";
        collectionItem.style.backgroundColor = isLightTheme
          ? "rgba(240, 253, 250, 0.8)"
          : "rgba(16, 185, 129, 0.08)";
        collectionItem.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.2)";
        collectionItem.style.transform = "translateY(-2px)";
      };

      collectionItem.onmouseout = () => {
        collectionItem.style.borderColor = isLightTheme ? "#e2e8f0" : "#334155";
        collectionItem.style.backgroundColor = isLightTheme
          ? "rgba(248, 250, 252, 0.5)"
          : "rgba(30, 41, 59, 0.4)";
        collectionItem.style.boxShadow = "none";
        collectionItem.style.transform = "translateY(0)";
      };

      const collectionInfo = document.createElement("div");
      collectionInfo.style.cssText = "flex: 1; min-width: 0;";
      const gamesCount = collection.allGames.length;
      const gamesLabel = gamesCount === 1 ? "game" : "games";

      collectionInfo.innerHTML = `
      <p style="margin: 0; font-weight: 600; color: ${isLightTheme ? "#0f172a" : "#f1f5f9"}; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${collection.collectionName}
      </p>
      <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: ${isLightTheme ? "#64748b" : "#94a3b8"};">
        ${gamesCount} ${gamesLabel}
      </p>
    `;

      const checkmark = document.createElement("div");
      checkmark.style.cssText = `
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.7rem;
      font-weight: bold;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
      checkmark.innerHTML = "✓";

      collectionItem.appendChild(collectionInfo);
      collectionItem.appendChild(checkmark);

      let isProcessing = false;

      const setCollectionItemLoading = (loading) => {
        collectionItem.style.opacity = loading ? "0.7" : "1";
        collectionItem.style.pointerEvents = loading ? "none" : "auto";
      };

      collectionItem.addEventListener("click", async () => {
        if (isProcessing) return;
        isProcessing = true;
        setCollectionItemLoading(true);
        if (!currentGameData) {
          await fetchGameData();
        }

        const pathParts = window.location.pathname.split("/");
        const gameId = pathParts[pathParts.length - 1];

        try {
          const userId = (
            await fetch("/game-info/userid").then((r) => r.json())
          ).userId;

          setTimeout(async () => {
            await fetch("/game-info/addToCollection");

            if (collection.collectionName === "Momenteel aan het spelen") {
              const deleteRes = await fetch("/game-info/deleteGames", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId,
                  collectionName: collection.collectionName,
                  allGames: [],
                }),
              });

              if (!deleteRes.ok) {
                showNotification("⚠️ Kon huidige collectie niet leegmaken");
                return;
              }
            }

            const addRes = await fetch("/game-info/addToCollection", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                newCollection: {
                  collectionName: collection.collectionName,
                  allGames: [
                    {
                      gameId: gameId,
                      gameName: currentGameData.name,
                      gameImge: currentGameData.background_image,
                    },
                  ],
                },
              }),
            });

            if (!addRes.ok) {
              showNotification("⚠️ Spel toevoegen mislukt, probeer opnieuw");
              return;
            }

            showNotification(
              `"${currentGameData.name}" toegevoegd aan "${collection.collectionName}"`,
            );
          });
        } catch (error) {
          console.error("Add to collection failed:", error);
          showNotification("⚠️ Er ging iets mis, probeer opnieuw");
          return;
        } finally {
          isProcessing = false;
          setCollectionItemLoading(false);
        }

        //if (collection_filed) {
        //collection_filed.style.display = "none";
        //}

        if (addToCollectionMenu) {
          addToCollectionMenu.style.display = "none";
        }
        if (modal_backdrop) {
          modal_backdrop.style.display = "none";
        }
      });

      collectionItem.addEventListener("mouseenter", () => {
        checkmark.style.opacity = "1";
      });

      collectionItem.addEventListener("mouseleave", () => {
        checkmark.style.opacity = "0";
      });

      collectionsList.appendChild(collectionItem);
    } else {
      continue;
    }
  }

  allCollectionsNames.appendChild(collectionsList);
};

const loadCollections = async () => {
  if (!allCollectionsNames) return;

  if (loading_collections) {
    loading_collections.style.display = "block";
  }

  try {
    const response = await fetch("/game-info/collections/list");
    const data = await response.json();

    if (loading_collections) {
      loading_collections.style.display = "none";
    }

    allCollectionsNames.style.display = "block";
    renderCollectionsList(data.collections || []);
  } catch (error) {
    console.error("Error loading collections:", error);
    if (loading_collections) {
      loading_collections.style.display = "none";
    }
    allCollectionsNames.innerHTML =
      '<p style="color: #ef4444; text-align: center;">Fout bij laden van collecties</p>';
  }
};

applyCollectionMenuTheme();

if (scroll_to_reviews_btn && review_container) {
  scroll_to_reviews_btn.addEventListener("click", () => {
    review_container.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (add_to_collection_btn) {
  add_to_collection_btn.addEventListener("click", async () => {
    if (!addToCollectionMenu) return;

    applyCollectionMenuTheme();
    await fetchGameData();
    await loadCollections();

    if (addToCollectionMenu) {
      addToCollectionMenu.style.display = "block";
      addToCollectionMenu.style.animation = "showInput 100ms linear forwards";
    }
    if (modal_backdrop) {
      modal_backdrop.style.display = "block";
    }
  });
}

if (delete_collection_btn && addToCollectionMenu) {
  delete_collection_btn.addEventListener("click", () => {
    addToCollectionMenu.style.display = "none";
    addToCollectionMenu.style.animation = "";
    if (modal_backdrop) {
      modal_backdrop.style.display = "none";
    }
    allCollectionsNames.innerHTML = "";
  });
}

if (create_collection_btn) {
  create_collection_btn.addEventListener("click", () => {
    if (createCollectionModal) {
      createCollectionModal.style.display = "block";
      createCollectionModal.style.animation = "showInput 100ms linear forwards";
      new_collection_name.focus();
    }
  });
}

if (btn_close_create_modal) {
  btn_close_create_modal.addEventListener("click", () => {
    if (createCollectionModal) {
      createCollectionModal.style.display = "none";
      new_collection_name.value = "";
    }
  });
}

if (btn_submit_create_collection) {
  btn_submit_create_collection.addEventListener("click", async () => {
    if (!new_collection_name.value.trim()) {
      showNotification("⚠️ Voer een collectienaam in");
      return;
    }

    const user = await fetch("/game-info/userid");
    const userId = await user.json();

    const pathParts = window.location.pathname.split("/");
    const gameId = pathParts[pathParts.length - 1];

    if (!currentGameData) {
      await fetchGameData();
    }

    await fetch("/game-info/addToCollection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId.userId,
        newCollection: {
          collectionName: new_collection_name.value,
          allGames: [
            {
              gameId: gameId,
              gameName: currentGameData.name,
              gameImge: currentGameData.background_image,
            },
          ],
        },
      }),
    });

    showNotification(
      `✨ Collectie "${new_collection_name.value}" gemaakt en spel toegevoegd!`,
    );

    new_collection_name.value = "";
    if (createCollectionModal) {
      createCollectionModal.style.display = "none";
    }

    await loadCollections();
  });
}

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
    document.querySelector(".games-header")?.appendChild(notif) ??
      document.body.appendChild(notif);
  }

  notif.style.backgroundColor = "#10b981";
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
