document.addEventListener("DOMContentLoaded", function () {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const navToggle = document.getElementById("nav_toggle");
  const navLinks = document.getElementById("nav_links");

  const navLabels = {
    nav_home: "Home",
    nav_games: "Games",
    nav_guess: "Guess",
    nav_compare: "Compare",
    nav_community: "Community",
    nav_collections: "Profile",
  };

  Object.keys(navLabels).forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;
    if (link.querySelector(".nav-label")) return;

    const label = document.createElement("span");
    label.className = "nav-label";
    label.textContent = navLabels[id];
    label.style.display = "none";
    label.style.position = "absolute";
    label.style.top = "100%";
    label.style.left = "50%";
    label.style.transform = "translateX(-50%)";
    label.style.fontSize = "0.9rem";
    label.style.marginTop = "0.5rem";
    label.style.whiteSpace = "nowrap";
    label.style.pointerEvents = "none";
    label.style.transition = "opacity 0.2s";
    label.style.opacity = "0";
    link.style.position = "relative";
    link.appendChild(label);

    link.addEventListener("mouseenter", () => {
      label.style.display = "block";
      setTimeout(() => {
        label.style.opacity = "1";
      }, 10);
    });
    link.addEventListener("mouseleave", () => {
      label.style.opacity = "0";
      setTimeout(() => {
        label.style.display = "none";
      }, 200);
    });
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));

      if (window.innerWidth < 1024) {
        const labels = nav.querySelectorAll(".nav-label");
        labels.forEach((label) => {
          label.style.display = isOpen ? "inline-flex" : "none";
          label.style.opacity = isOpen ? "1" : "0";
          label.style.position = isOpen ? "static" : "absolute";
          label.style.left = isOpen ? "auto" : "50%";
          label.style.transform = isOpen ? "none" : "translateX(-50%)";
          label.style.marginTop = isOpen ? "0" : "0.25rem";
          label.style.marginLeft = isOpen ? "0.5rem" : "0";
        });
      }
    });

    navLinks.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("a")) {
        nav.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
});
