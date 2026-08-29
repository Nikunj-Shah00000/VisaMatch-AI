import type { User } from '../types';
const TOKEN_KEY = 'visamatch_token';
const USER_KEY = 'visamatch_user';
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function getUser(): User | null { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; }
export function setSession(token: string, user: User) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
