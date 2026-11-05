import { renderTalkDocument } from "../../../_ui/pages/Talk/Talk.ts";
import { loadTalks } from "../../../lib/talks.ts";
import { loadRelatedGroups } from "../../../lib/cross-links.ts";

export async function render(talkId: string, appearanceId: string): Promise<string> {
  const [talks, relatedGroups] = await Promise.all([loadTalks(), loadRelatedGroups()]);
  const talk = talks.find((candidate) => candidate.id === talkId);
  if (!talk) throw new Error(`Unknown talk id: ${talkId}`);
  const appearance = talk.appearances.find((candidate) => candidate.id === appearanceId);
  if (!appearance) throw new Error(`Unknown appearance id for ${talkId}: ${appearanceId}`);
  return renderTalkDocument(talk, appearance, relatedGroups);
}
