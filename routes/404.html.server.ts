import { renderLayout } from "../_layouts/Layout.ts";

export function render(): string {
  return renderLayout({
    title: "404",
    urlPath: "/404.html",
    type: "website",
    showBackToHome: true,
    content: `<style>
  .gHomeNF {
    width: 120px;
    height: 40px;
    font-size: 1.0rem;
    border: 1px solid #ddd;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    color: #555;
    box-shadow: 0 4px 4px 0 #ddd;
  }

  .gHomeNF:hover,
  .gHomeNF:focus {
    background-color: #333333;
    color: #fff;
  }

  .gHomeNF:active {
    box-shadow: 0px 0px;
  }
</style>

<h1>404</h1>

<p><strong>Page not found :(</strong></p>
<p>The requested page could not be found.</p>

<button class="gHomeNF" type="button" onclick="window.location='/'">Go Home</button>`,
  });
}
