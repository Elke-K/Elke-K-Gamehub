const collectioncontainer = document.querySelector("#collectioncontainer");
const collection_modal_backdrop = document.querySelector(
  "#collection_modal_backdrop",
);
const modal_body = document.querySelector("#modal_body");
const btn_close_modal = document.querySelector("#btn_close_modal");
const toggle_collections = document.querySelector("#toggle_collections");
const isPublicProfilePage = document.body.classList.contains(
  "public-profile-page",
);

const isLightTheme = () => {
  return document.body.classList.contains("theme-light");
};

const closeCollectionModal = () => {
  if (!collection_modal_backdrop) return;
  collection_modal_backdrop.style.display = "none";
  document.body.style.overflow = "";
  if (modal_body) {
    modal_body.innerHTML = "";
  }
};

const decodeCollectionGames = (value) => {
  if (!value) return [];

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return [];
  }
};

const openCollectionModal = (collectionName, games, allowDelete) => {
  if (!collection_modal_backdrop || !modal_body) return;

  document.body.style.overflow = "hidden";
  collection_modal_backdrop.style.display = "flex";
  modal_body.innerHTML = "";

  if (isPublicProfilePage) {
    modal_body.classList.remove("flex-wrap", "gap-4");
    modal_body.classList.add("flex-col", "items-center", "justify-center");
  }

  if (!games || games.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "m-0 text-zinc-400 text-sm";
    emptyState.textContent = `${collectionName} is leeg.`;
    modal_body.appendChild(emptyState);
    return;
  }

  if (isPublicProfilePage) {
    modal_body.classList.remove("flex-col", "items-center", "justify-center");
    modal_body.classList.add("flex-wrap", "gap-4");
  }

  for (const game of games) {
    const gameContainer = document.createElement("div");
    const gameImage = document.createElement("img");

    const bgClass = isLightTheme() ? "bg-white" : "bg-zinc-800";
    const borderClass = isLightTheme()
      ? "border-slate-300/70"
      : "border-zinc-700";

    gameContainer.classList.add(
      "relative",
      "group",
      "overflow-hidden",
      "rounded-2xl",
      "border",
      borderClass,
      bgClass,
      "shadow-md",
    );
    gameImage.classList.add("w-24", "h-24", "object-cover", "rounded-2xl");
    gameImage.src = game.gameImge;
    gameImage.alt = game.gameName;

    gameContainer.appendChild(gameImage);

    if (allowDelete) {
      const btnDeleteGame = document.createElement("button");

      btnDeleteGame.innerHTML = "X";
      btnDeleteGame.classList.add(
        "delete-image-btn",
        "absolute",
        "top-3",
        "right-3",
        "flex",
        "items-center",
        "justify-center",
        "w-8",
        "h-8",
        "rounded-full",
        "bg-zinc-900/90",
        "text-red-400",
        "text-xl",
        "font-bold",
        "hover:bg-red-500",
        "hover:text-white",
        "transition-all",
        "duration-200",
        "shadow-md",
      );

      gameContainer.classList.add("hover:shadow-lg");

      btnDeleteGame.addEventListener("click", async (event) => {
        event.stopPropagation();
        const user = await fetch("/game-info/userid");
        const userId = await user.json();

        fetch("/profile/deletegame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId.userId,
            name: collectionName,
            gameId: game.gameId,
          }),
        });

        showNotification(
          `"${game.gameName}" verwijderd uit "${collectionName}"`,
        );

        setTimeout(() => {
          location.reload();
        }, 2000);
      });

      gameContainer.appendChild(btnDeleteGame);
    }

    modal_body.appendChild(gameContainer);
  }
};

async function main() {
  if (!collectioncontainer) return;

  if (isPublicProfilePage) {
    const collectionItems = collectioncontainer.querySelectorAll(".collection");

    collectionItems.forEach((collectionItem) => {
      const collectionButton = collectionItem.querySelector(".btn_collection");
      if (!(collectionButton instanceof HTMLButtonElement)) return;

      const games = decodeCollectionGames(collectionButton.dataset.games);
      const collectionName =
        collectionButton.textContent?.trim() ?? "Collectie";

      const openReadOnlyCollection = () => {
        openCollectionModal(collectionName, games, false);
      };

      collectionItem.addEventListener("click", openReadOnlyCollection);
      collectionButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openReadOnlyCollection();
      });
    });
  } else {
    const res = await fetch("/profile/collection");
    const data = await res.json();
    const user = data.user;

    if (!user?.collection_more) return;

    for (const userinfo of user.collection_more) {
      const collectionContainerOfGames = document.createElement("div");
      const btnCollectionName = document.createElement("button");
      const collectionMeta = document.createElement("p");
      const gamesCount = userinfo.allGames.length;
      const gamesLabel = gamesCount === 1 ? "game" : "games";
      const btnDeleteCollection = document.createElement("button");

      collectionContainerOfGames.classList.add(
        "collection",
        "relative",
        "flex",
        "items-center",
        "justify-between",
        "gap-3",
        "px-4",
        "py-3",
        "border-2",
        "rounded-xl",
        "shadow-md",
        "hover:shadow-emerald-500/30",
        "hover:scale-[1.02]",
        "transition-all",
        "duration-300",
        "min-w-[220px]",
      );

      collectionContainerOfGames.dataset.games = encodeURIComponent(
        JSON.stringify(userinfo.allGames),
      );

      btnCollectionName.classList.add(
        "btn_collection",
        "text-emerald-400",
        "font-semibold",
        "tracking-wide",
        "text-sm",
        "uppercase",
        "hover:text-emerald-300",
        "transition-colors",
        "duration-200",
      );

      btnCollectionName.innerHTML = userinfo.collectionName;

      collectionMeta.classList.add("text-xs", "text-zinc-400", "font-medium");
      collectionMeta.textContent = `${gamesCount} ${gamesLabel}`;

      const openCollectionModalForUser = () => {
        openCollectionModal(userinfo.collectionName, userinfo.allGames, true);
      };

      collectionContainerOfGames.addEventListener(
        "click",
        openCollectionModalForUser,
      );

      btnCollectionName.addEventListener("click", (event) => {
        event.stopPropagation();
        openCollectionModalForUser();
      });

      if (userinfo.collectionName !== "Momenteel aan het spelen") {
        btnDeleteCollection.classList.add(
          "btn_delete_collection",
          "flex",
          "items-center",
          "justify-center",
          "w-8",
          "h-8",
          "rounded-full",
          "bg-zinc-700",
          "text-red-400",
          "text-lg",
          "font-bold",
          "hover:bg-red-500",
          "hover:text-white",
          "transition-all",
          "duration-200",
          "shadow-sm",
        );

        btnDeleteCollection.dataset.name = "delbtn";
        btnDeleteCollection.setAttribute("aria-label", "Verwijder collectie");
        btnDeleteCollection.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 7.5h12m-10.5 0 .75 12.75A1.125 1.125 0 0 0 9.375 21h5.25a1.125 1.125 0 0 0 1.125-1.125L16.5 7.5m-8.25 0V6.375A1.125 1.125 0 0 1 9.375 5.25h5.25A1.125 1.125 0 0 1 15.75 6.375V7.5m-8.25 0h8.25m-6 3v6m3-6v6" />
        </svg>
      `;

        btnDeleteCollection.addEventListener("click", async (event) => {
          event.stopPropagation();
          const user = await fetch("/game-info/userid");
          const userId = await user.json();

          fetch("/profile/deletecollection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userId.userId,
              name: userinfo.collectionName,
            }),
          });

          showNotification(`Collectie "${userinfo.collectionName}" verwijderd`);
          setTimeout(() => {
            location.reload();
          }, 2000);
        });

        collectionContainerOfGames.appendChild(btnCollectionName);
        collectionContainerOfGames.appendChild(collectionMeta);

        collectionContainerOfGames.appendChild(btnDeleteCollection);
      } else {
        collectionContainerOfGames.appendChild(btnCollectionName);
        collectionContainerOfGames.appendChild(collectionMeta);
      }

      collectioncontainer.appendChild(collectionContainerOfGames);
    }
  }

  if (btn_close_modal) {
    btn_close_modal.addEventListener("click", closeCollectionModal);
  }

  if (collection_modal_backdrop) {
    collection_modal_backdrop.addEventListener("click", (event) => {
      if (event.target === collection_modal_backdrop) {
        closeCollectionModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCollectionModal();
    }
  });

  if (toggle_collections) {
    toggle_collections.addEventListener("click", () => {
      const isHidden = collectioncontainer.classList.toggle("hidden");
      toggle_collections.textContent = isHidden ? "Toon" : "Verberg";
      showNotification(
        isHidden ? "Collecties verborgen" : "Collecties zichtbaar",
      );
    });
  }
}

function showNotification(message) {
  let notif = document.querySelector("#notification");
  let text = notif ? document.querySelector("#error_text") : null;

  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notification";
    notif.setAttribute("role", "alert");
    notif.style.cssText =
      "position:fixed;top:1.25rem;left:50%;transform:translateX(-50%) translateY(-120px);z-index:10000000;width:90%;max-width:28rem;padding:1rem 1.5rem;border-radius:0.875rem;box-shadow:0 10px 30px rgba(0,0,0,0.3);display:none;opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;text-align:center;border-left:4px solid #10b981;backdrop-filter:none;filter:none;isolation:isolate;";
    text = document.createElement("p");
    text.id = "error_text";
    text.style.cssText =
      "font-size:0.95rem;margin:0;text-align:center;font-weight:500;letter-spacing:0.3px;";
    notif.appendChild(text);
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

// Handle profile picture change
const profilePicInput = document.querySelector("#change_pic");
if (profilePicInput) {
  profilePicInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("Selecteer alstublieft een afbeeldingsbestand");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result;
      if (!imageData) return;

      try {
        const response = await fetch("/profile/picture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        });

        const result = await response.json();
        if (result.success) {
          showNotification("Profielfoto bijgewerkt!");
          const profilePic = document.querySelector("#profile_pic");
          if (profilePic) {
            profilePic.src = imageData;
          }
          // Reset input
          profilePicInput.value = "";
        } else {
          showNotification("Fout bij bijwerken profielfoto");
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        showNotification("Fout bij bijwerken profielfoto");
      }
    };
    reader.readAsDataURL(file);
  });
}

main();
