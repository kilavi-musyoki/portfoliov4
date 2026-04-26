/**
 * src/theme.js — Central design token system.
 *
 * Usage:
 *   import { getTheme } from '../theme.js';
 *   const t = getTheme(isDark);
 *   // → t.accentColor, t.dimColor, t.borderColor, ...
 *
 * Components may keep truly layout-specific local vars
 * (e.g. terminalBg, scopeBg) that only appear in one place.
 */

export const getTheme = (isDark) => ({
  // ── Text ──────────────────────────────────────────────────────────────────
  /** Standard body / nav / card text */
  textColor:    isDark ? '#ced0ce'                : '#0F172A',
  /** High-emphasis text — hero H1, contrast headings */
  textBright:   isDark ? '#ffffff'                : '#020617',
  /** Muted secondary text */
  dimColor:     isDark ? 'rgba(206,208,206,0.55)' : 'rgba(15,23,42,0.55)',
  /** Very subtle tertiary text (hints, footer sub-lines) */
  subtleColor:  isDark ? 'rgba(206,208,206,0.45)' : 'rgba(15,23,42,0.35)',

  // ── Accent ────────────────────────────────────────────────────────────────
  accentColor:  isDark ? '#ced0ce'                : '#0D9488',
  accentHover:  isDark ? '#ffffff'                : '#0F766E',
  accentGlow:   isDark ? 'rgba(206,208,206,0.4)'  : 'rgba(13,148,136,0.35)',

  // ── Borders ───────────────────────────────────────────────────────────────
  borderColor:  isDark ? 'rgba(107,113,107,0.5)'  : 'rgba(148,163,184,0.4)',
  borderStrong: isDark ? 'rgba(107,113,107,0.65)' : 'rgba(148,163,184,0.6)',
  borderSubtle: isDark ? 'rgba(107,113,107,0.35)' : 'rgba(148,163,184,0.2)',
  borderHover:  isDark ? 'rgba(206,208,206,0.55)' : 'rgba(13,148,136,0.5)',

  // ── Surfaces ──────────────────────────────────────────────────────────────
  cardBg:       isDark ? 'rgba(156,160,156,0.04)' : 'rgba(255,255,255,0.6)',
  cardBgHover:  isDark ? 'rgba(206,208,206,0.07)' : 'rgba(255,255,255,0.9)',

  // ── Status indicators ─────────────────────────────────────────────────────
  statusGreen:  isDark ? '#4BD8A0'                : '#059669',
  statusRed:    '#FF5A3C',
  statusGold:   '#D4A843',

  // ── Debug / system bar ────────────────────────────────────────────────────
  debugBar:     isDark ? '#4BD8A0'                : '#0D9488',

  // ── Interactive elements ──────────────────────────────────────────────────
  btnTextColor: isDark ? '#394139'                : '#FFFFFF',

  // ── Footer ────────────────────────────────────────────────────────────────
  footerBg:     isDark ? 'rgba(41,47,41,0.9)'     : 'rgba(241,245,249,0.9)',
  footerBorder: isDark ? 'rgba(107,113,107,0.4)'  : 'rgba(148,163,184,0.3)',
  footerSub:    isDark ? 'rgba(206,208,206,0.45)' : 'rgba(15,23,42,0.45)',
});
