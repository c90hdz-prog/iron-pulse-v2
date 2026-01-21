export const MODAL_AFTERBURN = "AFTERBURN";
export function renderAfterburnCard(el, onOpen) {
  el.innerHTML = `
    <h3>Afterburn</h3>
    <div class="row">
      <div class="big">Quick finisher</div>
      <button class="btn btnPrimary" id="btnAfterburn">Open</button>
    </div>
    <div style="margin-top:10px; color: var(--muted); font-size: 12px;">
      Tomorrow: simple timer + “Complete” with a satisfying stamp.
    </div>
  `;
  el.querySelector("#btnAfterburn")?.addEventListener("click", onOpen);
}
