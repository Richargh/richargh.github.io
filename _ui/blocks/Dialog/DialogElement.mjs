// Native invoker commands and closedby handle this in supporting browsers.
// Keep the same behavior when either feature is unavailable.
class LightDismissDialogElement extends HTMLElement {
  connectedCallback() {
    if (this.controller) return;
    this.controller = new AbortController();
    const { signal } = this.controller;
    const dialog = this.querySelector("dialog");
    if (!dialog) return;
    if (!("commandForElement" in HTMLButtonElement.prototype)) {
      document.addEventListener("click", (event) => {
        const button = event.target.closest?.("button[commandfor]");
        if (button?.getAttribute("commandfor") !== dialog.id) return;
        if (button.getAttribute("command") === "show-modal" && !dialog.open) dialog.showModal();
        if (button.getAttribute("command") === "close") dialog.close();
      }, { signal });
    }
    if (!("closedBy" in HTMLDialogElement.prototype)) {
      let startedOutside = false;
      const isOutside = (event) => {
        const rect = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
      };
      dialog.addEventListener("pointerdown", (event) => { startedOutside = isOutside(event); }, { signal });
      dialog.addEventListener("click", (event) => {
        if (dialog.getAttribute("closedby") === "any" && startedOutside && isOutside(event)) dialog.close();
        startedOutside = false;
      }, { signal });
    }
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.controller = undefined;
  }
}

if (!customElements.get("light-dismiss-dialog")) customElements.define("light-dismiss-dialog", LightDismissDialogElement);
