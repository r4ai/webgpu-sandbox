import "./links";
import html from "./sidebar.html?raw";

class SidebarElement extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.render();
  }

  render() {
    const template = document.createElement("template");
    template.innerHTML = html;
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("wgpu-sidebar", SidebarElement);
