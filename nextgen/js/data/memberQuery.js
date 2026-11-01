// Pure member search/filter/suggestion logic (no DOM, no fetching). In Stage 2 the backend runs
// the equivalent query, after checking the requester is an approved member.

const words = (text) => String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(Boolean);
const STOP = new Set(['a', 'an', 'and', 'the', 'in', 'of', 'for', 'to', 'with', 'who', 'people', 'someone', 'looking', 'interested']);

function index(member, lookups) {
  const loc = lookups.locations[member.location];
  return words([
    member.displayName, member.firstName, member.introduction, member.education, member.profession, member.careerField,
    member.educationLevel, member.connectionPreferences, ...member.hobbies, ...member.lookingFor,
    ...member.interests.map((i) => lookups.interests[i] || i), ...member.preferredActivities.map((a) => lookups.activities[a] || a),
    loc?.name, loc?.region, loc?.country,
  ].join(' '));
}

/** Locations to include for a chosen location: itself, plus nearby areas if requested. */
export function locationSet(locationId, includeNearby, locations) {
  if (!locationId) return null;
  const loc = locations.find((l) => l.id === locationId);
  return new Set([locationId, ...(includeNearby && loc ? loc.nearby : [])]);
}

/**
 * @param {object[]} members
 * @param {object} c { q, location, nearby, region, ageGroup, interest, educationLevel, careerField, activity }
 * @param {{ locations: object[], interestNames: Record<string,string>, activityNames: Record<string,string> }} lookups
 */
export function queryMembers(members, c, lookups) {
  const locById = Object.fromEntries(lookups.locations.map((l) => [l.id, l]));
  const idx = { locations: locById, interests: lookups.interestNames, activities: lookups.activityNames };
  const terms = words(c.q).filter((w) => !STOP.has(w));
  const locs = locationSet(c.location, c.nearby, lookups.locations);
  const items = members.filter((m) => {
    if (locs && !locs.has(m.location)) return false;
    if (c.region && locById[m.location]?.region !== c.region) return false;
    if (c.ageGroup && m.ageGroup !== c.ageGroup) return false;
    if (c.interest && !m.interests.includes(c.interest)) return false;
    if (c.educationLevel && m.educationLevel !== c.educationLevel) return false;
    if (c.careerField && m.careerField !== c.careerField) return false;
    if (c.activity && !m.preferredActivities.includes(c.activity)) return false;
    if (terms.length) {
      const w = index(m, idx);
      if (!terms.every((t) => w.some((x) => x.startsWith(t) || (t.length > 3 && t.endsWith('s') && x.startsWith(t.slice(0, -1)))))) return false;
    }
    return true;
  });
  // Exact location first, then nearby, then alphabetical
  return items.sort((a, b) => (c.location ? Number(b.location === c.location) - Number(a.location === c.location) : 0) || a.displayName.localeCompare(b.displayName));
}

/** Suggested connections for a member: shared interests, activities, nearby location. */
export function suggestConnections(me, members, locations, limit = 3) {
  const near = locationSet(me.location, true, locations);
  return members
    .filter((m) => m.id !== me.id)
    .map((m) => {
      const shared = m.interests.filter((i) => me.interests.includes(i));
      const acts = m.preferredActivities.filter((a) => me.preferredActivities.includes(a));
      const score = shared.length * 3 + acts.length * 2 + (near.has(m.location) ? 4 : 0);
      return { member: m, score, shared, nearby: near.has(m.location) };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
