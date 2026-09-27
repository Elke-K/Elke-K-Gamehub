const notifEl = document.querySelector("#notification_active");
if (notifEl && notifEl.textContent.trim()) {
  showNotification(notifEl.textContent.trim());
}
