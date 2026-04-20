function showToast(message, type = "success", duration = 2500) {
  let container = document.getElementById("toast-container") || createContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <div class="toast-close">&times;</div>
  `;

  container.appendChild(toast);

  setTimeout(() => removeToast(toast), duration);

  toast.querySelector(".toast-close").onclick = () => removeToast(toast);

  function removeToast(el) {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 300);
  }
}

function createContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  document.body.appendChild(container);
  return container;
}
