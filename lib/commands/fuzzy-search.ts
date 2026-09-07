import type { CommandItem } from "@/types/commands";

export function scoreCommand(command: CommandItem, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1; // All items visible if query is empty

  const title = command.title.toLowerCase();
  const desc = (command.description || "").toLowerCase();
  const keywords = command.keywords.map((k) => k.toLowerCase());

  // 1. Exact title match
  if (title === q) return 100;

  // 2. Title starts with query
  if (title.startsWith(q)) return 80;

  // 3. Any word in title starts with query
  const titleWords = title.split(/\s+/);
  if (titleWords.some((w) => w.startsWith(q))) return 70;

  // 4. Exact keyword match
  if (keywords.includes(q)) return 65;

  // 5. Keyword starts with query
  if (keywords.some((k) => k.startsWith(q))) return 55;

  // 6. Substring in title
  if (title.includes(q)) return 45;

  // 7. Substring in description
  if (desc.includes(q)) return 35;

  // 8. Keyword contains query
  if (keywords.some((k) => k.includes(q))) return 30;

  // 9. Fuzzy character match across title
  let qi = 0;
  for (let i = 0; i < title.length && qi < q.length; i++) {
    if (title[i] === q[qi]) {
      qi++;
    }
  }
  if (qi === q.length) return 15;

  return 0;
}

export function searchCommands(commands: CommandItem[], query: string): CommandItem[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return commands;
  }

  const scored = commands
    .map((cmd) => ({
      cmd,
      score: scoreCommand(cmd, trimmed),
    }))
    .filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.cmd);
}
