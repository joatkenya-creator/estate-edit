/**
 * "Did you mean" for marketplace search. No dependency: a plain Levenshtein
 * distance over the words buyers can actually find (listing titles, category
 * names, places), plus a short synonym list for words that are spelt right
 * but simply not the word sellers used.
 *
 * ponytail: O(vocabulary × word length²) per zero-result search, fine for a
 * few hundred listings; move to Postgres pg_trgm if the catalogue grows past
 * a few thousand.
 */

const SYNONYM_GROUPS = [
  ["sofa", "couch", "loveseat", "settee"],
  ["jewellery", "jewelry"],
  ["collectibles", "collectables", "collectible", "collectable"],
  ["tv", "television"],
  ["mahogany", "hardwood"],
  ["fridge", "refrigerator"],
  ["car", "vehicle", "vehicles", "cars"],
];

export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

const words = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];

/**
 * Alternative queries to try, best first: synonyms of the query's words, then
 * the query with each misspelt word swapped for its nearest vocabulary word.
 * Never returns the query itself.
 */
export function alternativeQueries(query: string, vocabulary: string[]): string[] {
  const q = query.toLowerCase().trim();
  const qWords = words(q);
  if (!qWords.length) return [];
  const vocab = new Set(vocabulary.flatMap(words).filter((w) => w.length > 2));
  const out: string[] = [];

  for (const group of SYNONYM_GROUPS) {
    for (const w of qWords) {
      if (group.includes(w)) {
        for (const alt of group) if (alt !== w) out.push(q.replace(w, alt));
      }
    }
  }

  // Allow 1 edit for short words, 2 for longer ones; anything looser suggests nonsense.
  const corrected = qWords.map((w) => {
    if (vocab.has(w) || w.length < 4) return w;
    let best = w;
    let bestD = w.length > 6 ? 3 : 2;
    for (const cand of vocab) {
      if (Math.abs(cand.length - w.length) >= bestD) continue;
      const d = levenshtein(w, cand);
      if (d < bestD) [best, bestD] = [cand, d];
    }
    return best;
  });
  const fixed = corrected.join(" ");
  if (fixed !== qWords.join(" ")) out.push(fixed);

  return [...new Set(out)].filter((s) => s !== q);
}
