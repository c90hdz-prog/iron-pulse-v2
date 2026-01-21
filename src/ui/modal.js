export function renderModalRoot(root, modalHtml, onClose) {
  root.innerHTML = "";

  if (!modalHtml) return;

  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.innerHTML = modalHtml;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) onClose();
  });

  root.appendChild(overlay);

  // ESC to close
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") onClose();
    },
    { once: true }
  );
}
