import * as buttonStories from "../../blocks/Button/Button.stories.ts";
import * as calloutLinkStories from "../../blocks/CalloutLink/CalloutLink.stories.ts";
import { styleBlock, type StyleBlock } from "../../StyleStory.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import { escapeHtml } from "../../../lib/html.ts";

export const stylesTitle = "Styles";
export const stylesUrlPath = "/styles/";
export const stylesDescription = "An interactive catalog of the site's reusable blocks and their variants.";

const blocks = [styleBlock(buttonStories), styleBlock(calloutLinkStories)] satisfies StyleBlock[];

export function renderStylesPageDocument(): string {
  const initialBlock = blocks[0];
  if (initialBlock === undefined) throw new Error("The style catalog needs at least one block");
  const initialVariant = initialBlock.variants[0];
  if (initialVariant === undefined) throw new Error(`${initialBlock.name} needs at least one variant`);

  return renderLayout({
    title: stylesTitle,
    urlPath: stylesUrlPath,
    description: stylesDescription,
    type: "website",
    showBackToHome: true,
    headerToolsHtml: `<button class="styles-menu-trigger" type="button" popovertarget="styles-menu" aria-label="Browse blocks and variants">B</button>`,
    sideNavigation: renderSidebarNavigation("styles-sidebar-wide", initialVariant.id),
    content: `<main>
      <article class="styles-page">
        <h1>${escapeHtml(stylesTitle)}</h1>
        <p>${escapeHtml(stylesDescription)}</p>
        <div class="styles-previews" aria-live="polite">
          ${renderPreviews(initialVariant.id)}
        </div>
      </article>
      <script type="module">
        const links = [...document.querySelectorAll("[data-style-link]")];
        const previews = [...document.querySelectorAll("[data-style-preview]")];

        function showVariant(id, updateUrl = true) {
          if (!previews.some((preview) => preview.id === id)) return;
          for (const preview of previews) preview.hidden = preview.id !== id;
          for (const link of links) {
            if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
          }
          if (updateUrl) history.replaceState(null, "", "#" + id);
          const menu = document.querySelector("#styles-menu");
          if (menu?.matches(":popover-open")) menu.hidePopover();
        }

        for (const link of links) {
          link.addEventListener("click", (event) => {
            event.preventDefault();
            showVariant(link.hash.slice(1));
          });
        }

        if (location.hash) showVariant(location.hash.slice(1), false);
      </script>
    </main>
    ${renderSidebarNavigation("styles-sidebar-popover", initialVariant.id, 'id="styles-menu" popover')}`,
  });
}

function renderSidebarNavigation(placementClass: string, initialVariantId: string, attributes = ""): string {
  return `<nav class="styles-sidebar ${placementClass}" aria-label="Blocks and variants"${attributes ? ` ${attributes}` : ""}>
    ${renderSidebar(initialVariantId)}
  </nav>`;
}

function renderSidebar(initialVariantId: string): string {
  return blocks.map((block) => `<details open>
              <summary>${escapeHtml(block.name)}</summary>
              <ul>
                ${block.variants.map((variant) => `<li><a href="#${escapeHtml(variant.id)}" data-style-link${variant.id === initialVariantId ? ' aria-current="page"' : ""}>${escapeHtml(variant.name)}</a></li>`).join("\n")}
              </ul>
            </details>`).join("\n");
}

function renderPreviews(initialVariantId: string): string {
  return blocks.flatMap((block) => block.variants.map((variant) => `<section
              class="styles-preview"
              id="${escapeHtml(variant.id)}"
              data-style-preview
              data-block="${escapeHtml(block.id)}"
              data-variant-name="${escapeHtml(variant.name)}"${variant.id === initialVariantId ? "" : " hidden"}>
              <h2>${escapeHtml(block.name)} <span>${escapeHtml(variant.name)}</span></h2>
              <div class="styles-preview-canvas">${variant.html}</div>
            </section>`)).join("\n");
}
