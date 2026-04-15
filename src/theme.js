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
  textColor:    isDark ? '#ced0ce'                : '#1C2226',
  /** High-emphasis text — hero H1, contrast headings */
  textBright:   isDark ? '#ffffff'                : '#1C2226',
  /** Muted secondary text */
  dimColor:     isDark ? 'rgba(206,208,206,0.55)' : 'rgba(28,34,38,0.52)',
  /** Very subtle tertiary text (hints, footer sub-lines) */
  subtleColor:  isDark ? 'rgba(206,208,206,0.45)' : 'rgba(28,34,38,0.4)',

  // ── Accent ────────────────────────────────────────────────────────────────
  accentColor:  isDark ? '#ced0ce'                : '#C07838',
  accentHover:  isDark ? '#ffffff'                : '#A0622C',
  accentGlow:   isDark ? 'rgba(206,208,206,0.4)'  : 'rgba(192,120,56,0.4)',

  // ── Borders ───────────────────────────────────────────────────────────────
  borderColor:  isDark ? 'rgba(107,113,107,0.5)'  : 'rgba(104,112,120,0.4)',
  borderStrong: isDark ? 'rgba(107,113,107,0.65)' : 'rgba(104,112,120,0.55)',
  borderSubtle: isDark ? 'rgba(107,113,107,0.35)' : 'rgba(104,112,120,0.25)',
  borderHover:  isDark ? 'rgba(206,208,206,0.55)' : 'rgba(192,120,56,0.6)',

  // ── Surfaces ──────────────────────────────────────────────────────────────
  cardBg:       isDark ? 'rgba(156,160,156,0.04)' : 'rgba(255,255,255,0.35)',
  cardBgHover:  isDark ? 'rgba(206,208,206,0.07)' : 'rgba(255,255,255,0.55)',

  // ── Status indicators ─────────────────────────────────────────────────────
  statusGreen:  isDark ? '#4BD8A0'                : '#3aa87e',
  statusRed:    '#FF5A3C',
  statusGold:   '#D4A843',

  // ── Debug / system bar ────────────────────────────────────────────────────
  debugBar:     isDark ? '#4BD8A0'                : '#C07838',

  // ── Interactive elements ──────────────────────────────────────────────────
  btnTextColor: isDark ? '#394139'                : '#E8EAE7',

  // ── Footer ────────────────────────────────────────────────────────────────
  footerBg:     isDark ? 'rgba(41,47,41,0.9)'     : 'rgba(232,234,231,0.9)',
  footerBorder: isDark ? 'rgba(107,113,107,0.4)'  : 'rgba(104,112,120,0.3)',
  footerSub:    isDark ? 'rgba(206,208,206,0.45)' : 'rgba(28,34,38,0.4)',
});
