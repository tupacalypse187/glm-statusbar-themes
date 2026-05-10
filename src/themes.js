/**
 * Color theme palettes for the status line.
 *
 * A Theme is a pure palette — it has no opinion about layout. Any Style can
 * render with any Theme. Ported from claude-code-usage-bar/src/claude_statusbar/themes.py.
 */

class Theme {
  constructor(name, description, colors) {
    this.name = name;
    this.description = description;
    // Text
    this.ink = colors.ink;       // primary text (numbers, model name)
    this.mute = colors.mute;     // secondary text (labels, separators)
    this.edge = colors.edge;     // faint dividers / outlines
    // Severity (calm / warning / critical)
    this.s_ok = colors.s_ok;
    this.s_warn = colors.s_warn;
    this.s_hot = colors.s_hot;
    // Capsule fills — one distinct hue per metric type
    this.pill_5h = colors.pill_5h;
    this.pill_7d = colors.pill_7d;
    this.pill_model = colors.pill_model;
    this.pill_mcp = colors.pill_mcp;
    this.pill_daily = colors.pill_daily;
    this.pill_ink = colors.pill_ink;   // text color on pill backgrounds
  }

  /** Return a new Theme with specified overrides applied. */
  with(overrides) {
    const merged = { ...this, ...overrides };
    return new Theme(this.name, this.description, merged);
  }
}

const BUILTIN_THEMES = [
  new Theme('graphite', 'Dark slate — quiet, professional, dark-terminal friendly', {
    ink: [218, 221, 225], mute: [120, 125, 132], edge: [75, 80, 88],
    s_ok: [120, 200, 192], s_warn: [232, 178, 96], s_hot: [232, 116, 116],
    pill_5h: [38, 70, 83], pill_7d: [42, 56, 79],
    pill_model: [60, 47, 65], pill_mcp: [52, 65, 47], pill_daily: [48, 56, 50],
    pill_ink: [238, 235, 224],
  }),
  new Theme('twilight', 'Purple twilight — soft purple/rose tones', {
    ink: [232, 225, 240], mute: [140, 130, 160], edge: [85, 75, 105],
    s_ok: [160, 210, 180], s_warn: [232, 160, 90], s_hot: [228, 100, 140],
    pill_5h: [58, 52, 90], pill_7d: [72, 46, 82],
    pill_model: [86, 52, 72], pill_mcp: [50, 72, 90], pill_daily: [52, 68, 80],
    pill_ink: [245, 238, 250],
  }),
  new Theme('linen', 'Beige linen — light terminal / sunny themes', {
    ink: [60, 55, 50], mute: [130, 120, 110], edge: [190, 180, 165],
    s_ok: [80, 140, 120], s_warn: [190, 130, 60], s_hot: [190, 80, 80],
    pill_5h: [214, 200, 178], pill_7d: [222, 210, 196],
    pill_model: [208, 196, 200], pill_mcp: [202, 210, 194], pill_daily: [198, 200, 192],
    pill_ink: [45, 40, 38],
  }),
  new Theme('nord', 'Nord — Scandinavian blue palette, classic dev colors', {
    ink: [216, 222, 233], mute: [129, 161, 193], edge: [76, 86, 106],
    s_ok: [163, 190, 140], s_warn: [235, 203, 139], s_hot: [191, 97, 106],
    pill_5h: [46, 52, 64], pill_7d: [59, 66, 82],
    pill_model: [67, 76, 94], pill_mcp: [46, 52, 64], pill_daily: [52, 58, 64],
    pill_ink: [229, 233, 240],
  }),
  new Theme('dracula', 'Dracula — purple-black high contrast', {
    ink: [248, 248, 242], mute: [98, 114, 164], edge: [68, 71, 90],
    s_ok: [80, 250, 123], s_warn: [241, 250, 140], s_hot: [255, 85, 85],
    pill_5h: [40, 42, 54], pill_7d: [68, 71, 90],
    pill_model: [80, 50, 100], pill_mcp: [50, 80, 60], pill_daily: [52, 70, 62],
    pill_ink: [248, 248, 242],
  }),
  new Theme('sakura', 'Sakura — pink-warm tones, cute and healing', {
    ink: [75, 50, 60], mute: [160, 110, 130], edge: [220, 180, 195],
    s_ok: [120, 170, 130], s_warn: [220, 150, 90], s_hot: [210, 90, 110],
    pill_5h: [245, 215, 220], pill_7d: [238, 200, 215],
    pill_model: [225, 210, 230], pill_mcp: [220, 230, 215], pill_daily: [218, 222, 212],
    pill_ink: [75, 50, 60],
  }),
  new Theme('mono', 'Mono — pure grayscale, minimalist', {
    ink: [228, 228, 228], mute: [140, 140, 140], edge: [70, 70, 70],
    s_ok: [180, 180, 180], s_warn: [220, 220, 220], s_hot: [250, 250, 250],
    pill_5h: [45, 45, 45], pill_7d: [60, 60, 60],
    pill_model: [75, 75, 75], pill_mcp: [50, 50, 50], pill_daily: [60, 60, 60],
    pill_ink: [235, 235, 235],
  }),
  new Theme('catppuccin-mocha', 'Catppuccin Mocha — soft pastel, easy on the eyes', {
    ink: [205, 214, 244],
    mute: [127, 132, 156],
    edge: [69, 71, 90],
    s_ok: [166, 227, 161],
    s_warn: [250, 179, 135],
    s_hot: [243, 139, 168],
    pill_5h: [49, 50, 68],
    pill_7d: [57, 50, 80],
    pill_model: [73, 49, 70],
    pill_mcp: [58, 70, 60],
    pill_daily: [70, 58, 48],
    pill_ink: [205, 214, 244],
  }),
  new Theme('tokyo-night', 'Tokyo Night — deep neon blue, vivid but quiet', {
    ink: [192, 202, 245],
    mute: [86, 95, 137],
    edge: [65, 72, 104],
    s_ok: [158, 206, 106],
    s_warn: [224, 175, 104],
    s_hot: [247, 118, 142],
    pill_5h: [48, 50, 80],
    pill_7d: [56, 44, 72],
    pill_model: [72, 56, 88],
    pill_mcp: [46, 60, 50],
    pill_daily: [58, 50, 44],
    pill_ink: [192, 202, 245],
  }),
];

const _BY_NAME = {};
for (const t of BUILTIN_THEMES) {
  _BY_NAME[t.name] = t;
}

function getTheme(name) {
  return _BY_NAME[name] || BUILTIN_THEMES[0];
}

function listThemes() {
  return [...BUILTIN_THEMES];
}

function parseHexColor(s) {
  s = s.trim().replace(/^#/, '');
  if (s.length === 3) {
    s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  }
  if (s.length !== 6) {
    throw new Error(`color must be hex like '#4ec85b', got '${s}'`);
  }
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function applyColorOverrides(theme, { ok, warn, hot } = {}) {
  const overrides = {};
  if (ok != null) overrides.s_ok = ok;
  if (warn != null) overrides.s_warn = warn;
  if (hot != null) overrides.s_hot = hot;
  if (Object.keys(overrides).length === 0) return theme;
  return theme.with(overrides);
}

module.exports = { Theme, BUILTIN_THEMES, getTheme, listThemes, parseHexColor, applyColorOverrides };
