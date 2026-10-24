export function renderJavaScriptImportMap(): string {
  const imports = {
    "microlighter": "/assets/vendor/microlighter/microlighter.js",
    "scroll-to-top-element": "/assets/elements/ScrollToTopElement.mjs",
    "randomizer-element": "/assets/elements/RandomizerElement.mjs",
    "dialog-element": "/assets/elements/DialogElement.mjs",
    "federated-post-picker-element": "/assets/elements/FederatedPostPickerElement.mjs",
    "#secret-email-button-element": "/assets/elements/SecretEmailButtonElement.mjs",
    "#secret-email-cipher": "/assets/js/SecretEmailCipher.mjs",
  } satisfies Record<string, string>;

  return `<script type="importmap">${JSON.stringify({ imports }, null, 2)}</script>`;
}
