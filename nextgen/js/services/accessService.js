// Demo access mode: lets reviewers switch between the PUBLIC VISITOR experience and a
// MEMBER PREVIEW of the directory using FICTIONAL profiles.
//
// This is a presentation switch, NOT access control. Anything shipped to the browser (including
// data/members.json) can be read by anyone, which is why it contains fictional people only.
// In Stage 2 the private directory must be served by the backend only after authentication,
// with role-based authorisation (e.g. visitor / pending / member / ambassador / admin) and
// per-field visibility chosen by each member. Never put real member data in this repository.
import { CONFIG } from '../config.js';

export const MODES = { PUBLIC: 'public', MEMBER_PREVIEW: 'member-preview' };
const listeners = new Set();

export function getMode() {
  try { return sessionStorage.getItem(CONFIG.accessModeKey) === MODES.MEMBER_PREVIEW ? MODES.MEMBER_PREVIEW : MODES.PUBLIC; } catch { return MODES.PUBLIC; }
}

export function setMode(mode) {
  try { sessionStorage.setItem(CONFIG.accessModeKey, mode); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(mode));
}

export const isMemberPreview = () => getMode() === MODES.MEMBER_PREVIEW;
export function onModeChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
