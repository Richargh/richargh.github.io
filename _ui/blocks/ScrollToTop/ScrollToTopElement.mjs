const buttonTemplate = document.createElement("template");

buttonTemplate.innerHTML = `
  <button type="button" aria-label="Scroll to top">
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M6 15L12 9L18 15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  </button>
`;

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function createScrollToTopButton() {
  const button = buttonTemplate.content.firstElementChild?.cloneNode(true);
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("ScrollToTopElement template must contain a button as its first element.");
  }

  button.addEventListener("click", scrollToTop);
  return button;
}

class ScrollToTop extends HTMLElement {
  /** @type {HTMLButtonElement} */
  #button = createScrollToTopButton();

  connectedCallback() {
    if (!this.#button.isConnected) {
      this.append(this.#button);
    }
  }
}

if (!customElements.get("scroll-to-top")) {
  customElements.define("scroll-to-top", ScrollToTop);
}
