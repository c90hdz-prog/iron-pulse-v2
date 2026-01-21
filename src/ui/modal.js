export function renderModalRoot(root, modalHtml, onClose) {
  root.innerHTML = "";

  const setLocked = (locked) => {
    document.body.classList.toggle("noScroll", locked);
  };

  if (!modalHtml) {
    setLocked(false);
    return;
  }

  setLocked(true);

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
