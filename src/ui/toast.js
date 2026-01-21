export function toast(message) {
  const root = document.getElementById("toastRoot");
  if (!root) return;

  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;

  root.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 250ms ease";
  }, 1400);

  setTimeout(() => el.remove(), 1800);
}
