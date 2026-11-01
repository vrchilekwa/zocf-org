// Data access for NextGen. Views only call these functions, so replacing the JSON files with the
// FastAPI backend changes this file and data/api.js, not the pages.
//
// Stage 2 endpoint sketch (all member endpoints require an authenticated, approved member):
//   GET  /members?location=&nearby=&interest=…   -> member summaries, shared fields only
//   GET  /members/{id}                           -> profile, respecting the member's visibility settings
//   GET  /activities, POST /activities/{id}/interest
//   GET  /opportunities?status=approved, POST /opportunities (status "pending" until an admin approves)
//   GET  /stories?status=published,      POST /stories (moderated)
//   POST /membership-requests            -> verification workflow
import { fetchJson } from '../data/api.js';
import { queryMembers, suggestConnections } from '../data/memberQuery.js';

export const getTaxonomy = () => fetchJson('taxonomy.json');
export const getMembers = () => fetchJson('members.json');
export const getActivities = () => fetchJson('activities.json');
export const getOpportunities = async () => (await fetchJson('opportunities.json')).filter((o) => o.status === 'approved');
export const getStories = async () => (await fetchJson('stories.json')).filter((s) => s.status === 'published');
export const getRegions = () => fetchJson('regions.json');
export const getAnnouncements = () => fetchJson('announcements.json');

/** Name lookups used across pages. */
export async function getLookups() {
  const t = await getTaxonomy();
  return {
    ...t,
    interestNames: Object.fromEntries(t.interests.map((i) => [i.id, i.name])),
    activityNames: Object.fromEntries(t.activityCategories.map((a) => [a.id, a.name])),
    opportunityNames: Object.fromEntries(t.opportunityCategories.map((a) => [a.id, a.name])),
    locationById: Object.fromEntries(t.locations.map((l) => [l.id, l])),
  };
}

export async function getMemberById(id) {
  return (await getMembers()).find((m) => m.id === id) || null;
}

export async function searchMembers(criteria) {
  const [members, lookups] = await Promise.all([getMembers(), getLookups()]);
  return queryMembers(members, criteria, lookups);
}

export async function getSuggestions(member, limit = 3) {
  const [members, t] = await Promise.all([getMembers(), getTaxonomy()]);
  return suggestConnections(member, members, t.locations, limit);
}

export async function getActivityById(id) {
  return (await getActivities()).find((a) => a.id === id) || null;
}

export async function getUpcomingActivities(limit = 3, today = new Date().toISOString().slice(0, 10)) {
  return (await getActivities()).filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit);
}

export async function getStoryById(id) {
  return (await getStories()).find((s) => s.id === id) || null;
}
