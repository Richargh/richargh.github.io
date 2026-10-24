import { mastodonInstanceOrigin } from "./FederatedPostUrl.mjs";

class FederatedPostPickerElement extends HTMLElement {
  connectedCallback() {
    if (this.controller) return;
    this.controller = new AbortController();
    const { signal } = this.controller;
    const form = this.querySelector("form");
    const input = form?.querySelector('[name="instance"]');
    if (!form || !input) return;
    const storageKey = `preferred-instance:${this.getAttribute("platform")}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) input.value = new URL(mastodonInstanceOrigin(saved)).hostname;
    } catch { /* Storage can be unavailable or contain an invalid value. */ }
    input.addEventListener("input", () => input.setCustomValidity(""), { signal });
    form.addEventListener("formdata", (event) => event.formData.delete("instance"), { signal });
    form.addEventListener("submit", (event) => {
      let origin;
      try {
        origin = mastodonInstanceOrigin(input.value);
      } catch {
        event.preventDefault();
        input.setCustomValidity("Enter an HTTPS instance domain, for example mastodon.social.");
        input.reportValidity();
        return;
      }
      // Use native form navigation to avoid popup blockers and preserve the new tab.
      form.action = `${origin}/share`;
      try { localStorage.setItem(storageKey, origin); } catch { /* Optional preference. */ }
    }, { signal });
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.controller = undefined;
  }
}

if (!customElements.get("federated-post-picker")) customElements.define("federated-post-picker", FederatedPostPickerElement);
