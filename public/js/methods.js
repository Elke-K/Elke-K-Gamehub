const passwordCheckbox = document
  .querySelector("#show_password")
  .addEventListener("change", (e) => showPassword(e));
const notification = document.querySelector("#notification_active");

if (notification != null) {
  showNotification(notification.innerHTML);
}

function showPassword(e) {
  let password =
    document.querySelector("input[type='password']") ||
    document.querySelectorAll("input[type='text']")[1];

  if (e.srcElement.checked) {
    password.type = "text";
  } else {
    password.type = "password";
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
      "position:fixed;bottom:1.25rem;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:20rem;padding:0.75rem 1rem;border-radius:0.5rem;box-shadow:0 10px 30px rgba(0,0,0,0.4);display:none;opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;text-align:center;";
    text = document.createElement("p");
    text.id = "error_text";
    text.style.cssText = "font-size:0.875rem;margin:0;text-align:center;";
    notif.appendChild(text);
    document.body.appendChild(notif);
  }

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
