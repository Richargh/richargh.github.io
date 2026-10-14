class RandomizerElement extends HTMLElement {
  connectedCallback() {
    const children = [...this.children];
    for (let index = children.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const currentChild = children[index];
      children[index] = children[randomIndex];
      children[randomIndex] = currentChild;
    }
    this.replaceChildren(...children);
  }
}

if (!customElements.get("randomize-elements")) {
  customElements.define("randomize-elements", RandomizerElement);
}
