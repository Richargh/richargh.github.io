import { renderLayout } from "../../_layouts/Layout.ts";
import { escapeHtml } from "../../lib/html.ts";
import { displayTalkDate, groupTalkAppearancesByYear, loadTalkAppearances, type TalkAppearance, type TalkYearGroup } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  return renderScheduleDocument(groupTalkAppearancesByYear(await loadTalkAppearances()));
}

export function renderScheduleDocument(groups: TalkYearGroup[]): string {
  return renderLayout({
    title: "Schedule",
    urlPath: "/schedule/",
    description: "Talk schedule",
    type: "website",
    showBackToHome: true,
    content: `<main>
                <article data-source="_data/talks.yaml">
                  <h1>Schedule</h1>
                  <div class="content">
                    ${groups.map(renderYearGroup).join("\n")}
                  </div>
                </article>
            </main>`,
  });
}

function renderYearGroup(group: TalkYearGroup): string {
  return `<div class="sect1">
<h2 id="${escapeHtml(group.year)}"><a class="anchor" href="#${escapeHtml(group.year)}"></a><a class="link" href="#${escapeHtml(group.year)}">${escapeHtml(group.year)}</a></h2>
<div class="sectionbody">
<table class="tableblock frame-all grid-all stretch">
<colgroup>
<col style="width: 50%;">
<col style="width: 25%;">
<col style="width: 25%;">
</colgroup>
<tbody>
<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">Title</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">Conference</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">Date</p></td>
</tr>
${group.appearances.map(renderTalkRow).join("\n")}
</tbody>
</table>
</div>
</div>`;
}

function renderTalkRow(appearance: TalkAppearance): string {
  return `<tr>
<td class="tableblock halign-left valign-top"><p class="tableblock">${renderTitle(appearance)}</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">${escapeHtml(appearance.conference)}</p></td>
<td class="tableblock halign-left valign-top"><p class="tableblock">${escapeHtml(displayTalkDate(appearance))}</p></td>
</tr>`;
}

function renderTitle(appearance: TalkAppearance): string {
  if (!appearance.eventUrl) return escapeHtml(appearance.title);
  return `<a href="${escapeHtml(appearance.eventUrl)}">${escapeHtml(appearance.title)}</a>`;
}
