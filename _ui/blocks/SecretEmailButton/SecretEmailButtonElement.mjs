import { decryptEmail } from "#secret-email-cipher";

const encryptedRecipient = "ExsEAEwRC0ATEwwHEjIKCUQBABwaFgwYBxRJDEg=";

export class SecretEmailButtonElement extends HTMLElement {
  static define(tag = "secret-email-button") {
    customElements.define(tag, this);
  }

  connectedCallback() {
    const button = this.querySelector("button");
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener("click", () => this.openEmailClient());
  }

  openEmailClient() {
    const recipient = decryptEmail(encryptedRecipient ?? "");
    if (!isPlausibleEmailAddress(recipient)) return;

    const subject = this.getAttribute("subject") ?? "";
    const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
    window.location.href = `mailto:${recipient}${query}`;
  }
}

function isPlausibleEmailAddress(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

if (!customElements.get("secret-email-button")) {
  SecretEmailButtonElement.define();
}

