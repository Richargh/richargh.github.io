import { renderScheduleDocument } from "../../_ui/pages/Schedule/Schedule.ts";
import { groupTalkAppearancesByYear, loadTalkAppearances } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  return renderScheduleDocument(groupTalkAppearancesByYear(await loadTalkAppearances()));
}
