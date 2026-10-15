import * as articleCardStories from "../../blocks/ArticleCard/ArticleCard.stories.ts";
import * as buttonStories from "../../blocks/Button/Button.stories.ts";
import * as calloutLinkStories from "../../blocks/CalloutLink/CalloutLink.stories.ts";
import * as exampleCardStories from "../../blocks/ExampleCard/ExampleCard.stories.ts";
import { styleBlock, type StyleBlock } from "../../StyleStory.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import { escapeHtml } from "../../../lib/html.ts";

export const stylesTitle = "Styles";
export const stylesUrlPath = "/styles/";
export const stylesDescription = "An interactive catalog of the site's reusable blocks and their variants.";

const blocks = [
  styleBlock(articleCardStories),
  styleBlock(buttonStories),
  styleBlock(calloutLinkStories),
  styleBlock(exampleCardStories),
] satisfies StyleBlock[];

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
        const variantLinks = [...document.querySelectorAll("[data-style-link]")];
        const blockLinks = [...document.querySelectorAll("[data-style-block-link]")];
        const links = [...variantLinks, ...blockLinks];
        const previews = [...document.querySelectorAll("[data-style-preview]")];

        function finishSelection(hash, updateUrl) {
          for (const link of links) {
            if (link.hash === hash) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
          }
          if (updateUrl) history.replaceState(null, "", hash);
          const menu = document.querySelector("#styles-menu");
          if (menu?.matches(":popover-open")) menu.hidePopover();
        }

        function showVariant(id, updateUrl = true) {
          if (!previews.some((preview) => preview.id === id)) return;
          for (const preview of previews) preview.hidden = preview.id !== id;
          finishSelection("#" + id, updateUrl);
        }

        function showBlock(blockId, updateUrl = true) {
          if (!previews.some((preview) => preview.dataset.block === blockId)) return;
          for (const preview of previews) preview.hidden = preview.dataset.block !== blockId;
          finishSelection("#block-" + blockId, updateUrl);
        }

        for (const link of variantLinks) {
          link.addEventListener("click", (event) => {
            event.preventDefault();
            showVariant(link.hash.slice(1));
          });
        }
        for (const link of blockLinks) {
          link.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            showBlock(link.dataset.block);
          });
        }

        if (location.hash.startsWith("#block-")) showBlock(location.hash.slice(7), false);
        else if (location.hash) showVariant(location.hash.slice(1), false);
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
              <summary><a href="#block-${escapeHtml(block.id)}" data-style-block-link data-block="${escapeHtml(block.id)}">${escapeHtml(block.name)}</a></summary>
              <ul>
                ${block.variants.map((variant) => `<li><a href="#${escapeHtml(variant.id)}" data-style-link${variant.id === initialVariantId ? ' aria-current="page"' : ""}>${escapeHtml(variant.name)}</a></li>`).join("\n")}
              </ul>
            </details>`).join("\n");
}

function renderPreviews(initialVariantId: string): string {
  return blocks.map((block) => `<div class="styles-block-previews" id="block-${escapeHtml(block.id)}">
    ${block.variants.map((variant) => `<section
              class="styles-preview"
              id="${escapeHtml(variant.id)}"
              data-style-preview
              data-block="${escapeHtml(block.id)}"
              data-variant-name="${escapeHtml(variant.name)}"${variant.id === initialVariantId ? "" : " hidden"}>
              <h2>${escapeHtml(block.name)} <span>${escapeHtml(variant.name)}</span></h2>
              <div class="styles-preview-canvas">${variant.html}</div>
            </section>`).join("\n")}
  </div>`).join("\n");
}
