// Demonstration "I'm interested" registrations for activities, kept in this browser's
// localStorage. Stage 2: POST /activities/{id}/interest for the signed-in member.
import { CONFIG } from '../config.js';

const KEY = CONFIG.interestStorageKey;
const listeners = new Set();

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}
function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn(data));
}

export const isInterested = (activityId) => Boolean(read()[activityId]);
export const getInterestedIds = () => Object.keys(read());
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

/** Count shown on cards: the demo baseline plus this visitor's own interest. */
export const displayCount = (activity) => activity.interestedCount + (isInterested(activity.id) ? 1 : 0);

export function canRegister(activity) {
  return activity.status === 'open' && activity.interestedCount < activity.capacity;
}

/** Toggle interest. Returns { ok, interested, message }. */
export function toggleInterest(activity) {
  const data = read();
  if (data[activity.id]) {
    delete data[activity.id];
    write(data);
    return { ok: true, interested: false, message: `You are no longer marked as interested in ${activity.title}.` };
  }
  if (!canRegister(activity)) return { ok: false, interested: false, message: `${activity.title} is fully booked.` };
  data[activity.id] = { at: new Date().toISOString() };
  write(data);
  return { ok: true, interested: true, message: `Thanks! Your interest in ${activity.title} is saved on this device (demo).` };
}
