import { site } from "../../../lib/config.ts";
import { escapeHtml } from "../../../lib/html.ts";
import type { AppCounters } from "../CollectionStats/CollectionStats.ts";
import { renderNavItem } from "../NavItem/NavItem.ts";

export function renderHeader({ showBackToHome = false, appCounters }: { showBackToHome?: boolean; appCounters?: AppCounters } = {}): string {
  return `<header>
    <div class="dashboard disable-select">
        <div class="site-heading profile-board-col">
           <h4 class="medium"><a href="/">${escapeHtml(site.title)}</a></h4>
        </div>

        <div class="userboard profile-board-col">
            <div class="username">
                <p class="title-sans">${escapeHtml(site.name)}</p>
            </div>
            <div class="userdesc">
                <p class="title-sans">${escapeHtml(site.tagLine)}</p>
            </div>
            <a class="header-rss-link" href="${escapeHtml(site.feedUrl)}" aria-label="RSS feed">
                ${rssIcon()}
                <span>RSS</span>
            </a>
        </div>
    </div>
    <div class="avatar disable-select">
        <a class="avatar-link" href="/">
            <img src="/assets/img/profile.jpg" class="avatar-img" alt="avatar"/>
        </a>
    </div>

    <!-- Navbar -->
    <div class="main-site-subheader menu disable-select">
        ${renderMainNav(appCounters)}
    </div>
    <div class="searchbar search-container">
        <i class="fa fa-search" aria-hidden="true"></i>
        <label for="search-input"></label>
        <input type="text" oninput="changeResultContainerDisp(this.value)" id="search-input" autocomplete="off" placeholder="Search the Blog..."/>
        <ul id="results-container"></ul>
    </div>
    <script src="/assets/js/simple-jekyll-search.min.js"></script>
    <script>
        function changeResultContainerDisp(val) {
            if (val) {
                document.getElementById("results-container").style.display = "block";
                document.getElementById("search-input").addEventListener('blur', function() {
                    document.addEventListener('click', function(event) {
                        var isClickInside = document.getElementById("results-container").contains(event.target);
                        if (!isClickInside) {
                            document.getElementById("results-container").style.display = "none";
                        }
                    })
                })
            }  else {
                document.getElementById("results-container").style.display = "none";
            }
        }
        var sjs = SimpleJekyllSearch({
                    searchInput: document.getElementById('search-input'),
                    resultsContainer: document.getElementById('results-container'),
                    json: '/search.json',
                    searchResultTemplate: '<li class="search_res" style="list-style: none;"><a href="${site.url}{url}" style="text-decoration: none; color: var(--color-text);"><p style="font-size: 1.0rem; font-family: var(--font-heading) !important; font-weight: 600;">{title}</p></a></li>',
                    noResultsText: 'No results found',
                    fuzzy: false,
                    limit: 4
                    })
    </script>
    ${showBackToHome ? renderBackToHome() : ""}
</header>`;
}

function renderMainNav(appCounters: AppCounters | undefined): string {
  return [
    renderNavItem({ className: "blog", href: "/posts", label: "Blog", iconHtml: blogIcon(), labelClassName: "blog-p" }),
    renderNavItem({ className: "talks", href: "/talks", label: "Talks", iconHtml: talksIcon(), labelClassName: "home-p", counter: appCounters?.appearances }),
    renderNavItem({ className: "published", href: "/articles", label: "Articles", iconHtml: articleIcon(), labelClassName: "published-p", counter: appCounters?.publications }),
    renderNavItem({ className: "interviews", href: "/interviews", label: "Interviews", iconHtml: interviewIcon(), labelClassName: "published-p", counter: appCounters?.interviews }),
    renderNavItem({ className: "built", href: "/built", label: "Built", iconHtml: builtIcon(), labelClassName: "built-p" }),
  ].join("\n");
}

function blogIcon(): string {
  return `<svg class="icon-blog" width="18" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 20H8L18.5 9.5L14.5 5.5L4 16V20Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13.5 6.5L17.5 10.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 5L20 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
}

function talksIcon(): string {
  return `<svg class="icon-talks" width="18" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20V15H4V4Z" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 20L12 15L16 20" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 11L11 9L13 10.5L16 7.5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
}

function articleIcon(): string {
  return `<svg class="icon-published" width="20" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2.5H14.5L20 8V21.5H6V2.5Z" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M14.5 2.5V8H20" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M9 12H17" stroke-width="2" stroke-linecap="round"/>
                    <path d="M9 16H17" stroke-width="2" stroke-linecap="round"/>
                </svg>`;
}

function interviewIcon(): string {
  return `<svg class="icon-published" width="20" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14C14.2091 14 16 12.2091 16 10V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V10C8 12.2091 9.79086 14 12 14Z" stroke-width="2"/>
                    <path d="M5 10C5 13.866 8.13401 17 12 17C15.866 17 19 13.866 19 10" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 17V22" stroke-width="2" stroke-linecap="round"/>
                    <path d="M9 22H15" stroke-width="2" stroke-linecap="round"/>
                </svg>`;
}

function builtIcon(): string {
  return `<svg class="icon-built" width="18" height="19" viewBox="0 0 14 23" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 23V13a7.551 7.551 0 0 0 4-6.682A6.992 6.992 0 0 0 10 0v6.318a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V0a6.992 6.992 0 0 0-4 6.318A7.551 7.551 0 0 0 4 13v10h2v-8h2v8z"/>
                </svg>`;
}

function rssIcon(): string {
  return `<svg class="icon-rss" width="18" height="19" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 11.5C6.38695 11.5 8.67613 12.4482 10.364 14.136C12.0518 15.8239 13 18.1131 13 20.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 4.5C8.24346 4.5 12.3131 6.18571 15.3137 9.18629C18.3143 12.1869 20 16.2565 20 20.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 20.5C5.55228 20.5 6 20.0523 6 19.5C6 18.9477 5.55228 18.5 5 18.5C4.44772 18.5 4 18.9477 4 19.5C4 20.0523 4.44772 20.5 5 20.5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
}

function renderBackToHome(): string {
  return `<div class="main-site-subheader disable-select" id="scroll-head" onclick="window.location.assign('/');">
        <div class="back-icon">
            <svg class="ripple" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/>
            </svg>
        </div>
        <p class="back-p">Home</p>
    </div>`;
}
