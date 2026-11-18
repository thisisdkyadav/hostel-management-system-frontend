/**
 * Fuzzy score for jumping to a tab by name. Higher is better; 0 means no match.
 * Whole-name prefix > word prefix > substring > initials > letters in order.
 * Shared by V3-style quick jumps (V6 Warp, V7 command bar).
 */
export const scoreNavName = (name, query) => {
  const hay = String(name || "").toLowerCase()
  if (!query) return 1
  if (hay.startsWith(query)) return 100 - hay.length / 100
  const words = hay.split(/[\s/&-]+/)
  if (words.some((word) => word.startsWith(query))) return 80
  if (hay.includes(query)) return 60
  if (words.map((word) => word[0]).join("").startsWith(query)) return 50
  let at = 0
  for (const char of query) {
    at = hay.indexOf(char, at)
    if (at === -1) return 0
    at += 1
  }
  return 20
}
