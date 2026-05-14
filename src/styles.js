/**
 * Status-line layout renderers (style = layout, theme = palette).
 *
 * Each renderer takes normalized data + resolved modules + a Theme and returns an ANSI string.
 * Modules are iterated dynamically — no hardcoded metric positions.
 */

const { calculateCost } = require('./modules');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const MODULE_EMOJI = {
  '5h': '\u{23F1}️',     // stopwatch
  'mcp': '\u{1F527}',          // wrench
  'ctx': '\u{1F9E0}',          // brain
  'cache': '⚡',           // lightning
  '5h-tokens': '\u{1F525}',    // fire
  'daily': '\u{1F4CA}',        // bar chart
  'cost': '\u{1F4B0}',         // money bag
};

const STAT_EMOJI = {
  model: '\u{1F916}',          // robot
  session: '\u{1F4AC}',        // speech bubble
  daily: '\u{1F4C8}',          // chart up
  monthly: '\u{1F4C5}',        // calendar
  fiveHourTokens: '\u{1F525}', // fire
};

function modEmoji(key, on) {
  return on !== false && MODULE_EMOJI[key] ? MODULE_EMOJI[key] + ' ' : '';
}

function statEmoji(which, on) {
  return on !== false && STAT_EMOJI[which] ? STAT_EMOJI[which] + ' ' : '';
}

function fg(rgb) { return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`; }
function bg(rgb) { return `\x1b[48;2;${rgb[0]};${rgb[1]};${rgb[2]}m`; }

const ANSI_RE = /\x1b\[[0-9;]*m/g;
function strip(s) { return s.replace(ANSI_RE, ''); }

const FILL = '█';
const EMPTY = '░';

function severityColor(theme, pct, warningThreshold, criticalThreshold) {
  if (pct == null) return theme.mute;
  if (pct >= criticalThreshold) return theme.s_hot;
  if (pct >= warningThreshold) return theme.s_warn;
  return theme.s_ok;
}

function pctText(pct) {
  return pct == null ? '--%' : `${Math.round(pct)}%`;
}

// Pill background palette — rotated when there are more modules than dedicated pill colors
const PILL_PALETTE = [
  (t) => t.pill_5h,
  (t) => t.pill_7d,
  (t) => t.pill_mcp,
  (t) => t.pill_daily,
  (t) => t.pill_model,
  (t) => t.edge,
];

function pillBg(theme, index) {
  const picker = PILL_PALETTE[index % PILL_PALETTE.length];
  return picker(theme);
}

// ── Battery bar (classic style) ──

function buildBatteryBar(pct, width, theme, warningThreshold, criticalThreshold) {
  const clamped = Math.max(0, Math.min(pct, 100));
  let filled = Math.round(clamped / 100 * width);
  if (pct > 0 && filled === 0) filled = 1;
  const text = pct > 100 ? 'MAX' : `${Math.round(pct)}%`;
  const padded = text.padStart(width).padEnd(width);

  const bgFill = bg(severityColor(theme, pct, warningThreshold, criticalThreshold));
  const bgEmpty = bg(theme.edge);
  const fgOverlay = fg(theme.pill_ink);

  let result = '';
  for (let i = 0; i < padded.length; i++) {
    const ch = padded[i];
    if (ch === ' ') {
      result += i < filled ? `${bgFill}${fgOverlay}${FILL}` : `${bgEmpty}${fgOverlay}${EMPTY}`;
    } else {
      result += i < filled ? `${bgFill}${fgOverlay}${ch}` : `${bgEmpty}${fgOverlay}${ch}`;
    }
  }
  result += RESET;
  return result;
}

// ── Mini 3-cell bar (hairline style) ──

function mini3(pct, theme, warningThreshold, criticalThreshold) {
  if (pct == null) return `${fg(theme.mute)}···${RESET}`;
  const cells = [];
  for (let i = 0; i < 3; i++) {
    const slot = (i + 1) * (100 / 3);
    if (pct >= slot) cells.push('█');
    else if (pct >= slot - (100 / 3) * 0.66) cells.push('▖');
    else if (pct >= slot - (100 / 3)) cells.push('▓');
    else cells.push('▁');
  }
  const col = severityColor(theme, pct, warningThreshold, criticalThreshold);
  return `${fg(col)}${cells.join('')}${RESET}`;
}

// ── Gradient bar (gradient style) ──

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function buildGradientBar(pct, width, theme, warningThreshold, criticalThreshold) {
  const clamped = Math.max(0, Math.min(pct, 100));
  let filled = Math.round(clamped / 100 * width);
  if (pct > 0 && filled === 0) filled = 1;
  const text = pct > 100 ? 'MAX' : `${Math.round(pct)}%`;
  const padded = text.padStart(width).padEnd(width);

  // Determine gradient endpoints based on severity
  let startCol, endCol;
  if (pct >= criticalThreshold) {
    startCol = theme.s_warn;
    endCol = theme.s_hot;
  } else if (pct >= warningThreshold) {
    startCol = theme.s_ok;
    endCol = theme.s_hot;
  } else {
    startCol = theme.s_ok;
    endCol = theme.s_warn;
  }

  const bgEmpty = bg(theme.edge);
  const fgOverlay = fg(theme.pill_ink);

  let result = '';
  for (let i = 0; i < padded.length; i++) {
    const ch = padded[i];
    if (i < filled) {
      const t = filled > 1 ? i / (filled - 1) : 0;
      const gradColor = lerpColor(startCol, endCol, t);
      const bgFill = bg(gradColor);
      result += ch === ' '
        ? `${bgFill}${fgOverlay}${FILL}`
        : `${bgFill}${fgOverlay}${ch}`;
    } else {
      result += ch === ' '
        ? `${bgEmpty}${fgOverlay}${EMPTY}`
        : `${bgEmpty}${fgOverlay}${ch}`;
    }
  }
  result += RESET;
  return result;
}

// ── Shared data shape ──

function normalizeData(context, usageData) {
  const sessionTokens = context.inputTokens + context.outputTokens +
    context.cacheCreationTokens + context.cacheReadTokens;

  return {
    model: context.model,
    sessionTokens,
    contextUsed: context.contextUsed,
    contextSize: context.contextSize,
    inputTokens: context.inputTokens || 0,
    outputTokens: context.outputTokens || 0,
    cacheCreationTokens: context.cacheCreationTokens || 0,
    cacheReadTokens: context.cacheReadTokens || 0,
    fiveHourPct: usageData?.quota?.fiveHourQuota?.percentage ?? null,
    fiveHourReset: usageData?.quota?.fiveHourQuota?.nextResetTime ?? null,
    mcpPct: usageData?.quota?.mcpUsage?.percentage ?? null,
    mcpReset: usageData?.quota?.mcpUsage?.nextResetTime ?? null,
    fiveHourTokens: usageData?.daily?.fiveHourTokens ?? 0,
    monthlyTokens: usageData?.monthly?.totalTokens ?? 0,
    monthlyCalls: usageData?.monthly?.totalCalls ?? 0,
    dailyTokens: usageData?.daily?.dailyTokens ?? 0,
    cost: calculateCost(context),
    modelId: context.modelId || '',
  };
}

// ── Style: classic ──

function renderClassic(data, theme, modules, opts = {}) {
  const { warningThreshold = 50, criticalThreshold = 80, twoLines = true, emojis = true } = opts;
  const INK = fg(theme.ink);
  const MUTE = fg(theme.mute);
  const separator = `${MUTE} │${RESET}`;
  const E = emojis;

  // Line 1: model + token stats
  const line1Parts = [];
  line1Parts.push(`${statEmoji('model', E)}${INK}${BOLD}${data.model}${RESET}`);
  line1Parts.push(`${statEmoji('session', E)}${MUTE}Session:${formatTokens(data.sessionTokens)}${RESET}`);
  line1Parts.push(`${statEmoji('daily', E)}${INK}Daily:${formatTokens(data.dailyTokens)}${RESET}`);
  line1Parts.push(`${statEmoji('monthly', E)}${INK}Monthly:${formatTokens(data.monthlyTokens)}${RESET}`);
  line1Parts.push(`${statEmoji('fiveHourTokens', E)}${INK}5H Tokens:${formatTokens(data.fiveHourTokens)}${RESET}`);
  const line1 = line1Parts.join(` ${separator} `);

  // Line 2: dynamic module bars
  const line2Parts = [];
  for (const mod of modules) {
    if (mod.textOnly) {
      const extra = mod.getExtra(data);
      const col = fg(theme.ink);
      line2Parts.push(`${modEmoji(mod.key, E)}${col}${mod.label}${RESET} ${INK}${extra}${RESET}`);
      continue;
    }
    const pct = mod.getPct(data);
    const extra = mod.getExtra(data);
    const bar = buildBatteryBar(pct ?? 0, 10, theme, warningThreshold, criticalThreshold);
    const col = fg(severityColor(theme, pct, warningThreshold, criticalThreshold));
    const extraStr = extra ? ` ${MUTE}(${extra})${RESET}` : '';
    line2Parts.push(`${modEmoji(mod.key, E)}${col}${mod.label}${RESET} ${MUTE}[${RESET}${bar}${MUTE}]${RESET} ${col}${pctText(pct)}${RESET}${extraStr}`);
  }
  const line2 = line2Parts.join(` ${separator} `);

  if (twoLines) return line1 + '\n' + line2;
  return line1 + ` ${separator} ` + line2;
}

// ── Style: capsule ──

function renderCapsule(data, theme, modules, opts = {}) {
  const { warningThreshold = 50, criticalThreshold = 80, emojis = true } = opts;
  const INK = fg(theme.pill_ink);
  const EDGE = fg(theme.edge);
  const E = emojis;

  function pill(bgRgb, body) {
    return `${bg(bgRgb)}${INK} ${body} ${RESET}`;
  }

  function sevDot(pct) {
    if (pct == null) return '';
    const col = severityColor(theme, pct, warningThreshold, criticalThreshold);
    return ` ${fg(col)}●${RESET}`;
  }

  const spacer = `${EDGE} ╱${RESET} `;
  const parts = [];

  // Dynamic module pills
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    const bgRgb = pillBg(theme, i);

    if (mod.textOnly) {
      const extra = mod.getExtra(data);
      const body = `${modEmoji(mod.key, E)}${BOLD}${mod.label}${RESET}${INK}${bg(bgRgb)} ${extra}`;
      parts.push(pill(bgRgb, body));
      continue;
    }

    const pct = mod.getPct(data);
    const extra = mod.getExtra(data);
    const extraLabel = extra ? ` · ${extra}` : '';
    const body = `${modEmoji(mod.key, E)}${BOLD}◷ ${mod.label}${RESET}${INK}${bg(bgRgb)} ${pctText(pct)}${extraLabel}${sevDot(pct)}${INK}${bg(bgRgb)}`;
    parts.push(pill(bgRgb, body));
  }

  // Model pill
  parts.push(pill(theme.pill_model, `${statEmoji('model', E)}${BOLD}◆${RESET}${INK}${bg(theme.pill_model)} ${data.model}${sevDot(data.contextUsed)}${INK}${bg(theme.pill_model)}`));

  // Text stat pills: Session, Daily, Monthly, 5h Tokens
  parts.push(pill(theme.pill_7d, `${statEmoji('session', E)}${BOLD}Session${RESET}${INK}${bg(theme.pill_7d)} ${formatTokens(data.sessionTokens)}`));
  parts.push(pill(theme.pill_daily, `${statEmoji('daily', E)}${BOLD}Daily${RESET}${INK}${bg(theme.pill_daily)} ${formatTokens(data.dailyTokens)}`));
  parts.push(pill(theme.pill_7d, `${statEmoji('monthly', E)}${BOLD}Monthly${RESET}${INK}${bg(theme.pill_7d)} ${formatTokens(data.monthlyTokens)}`));
  parts.push(pill(theme.pill_daily, `${statEmoji('fiveHourTokens', E)}${BOLD}5H Tokens${RESET}${INK}${bg(theme.pill_daily)} ${formatTokens(data.fiveHourTokens)}`));

  return parts.join(spacer);
}

// ── Style: hairline ──

function renderHairline(data, theme, modules, opts = {}) {
  const { warningThreshold = 50, criticalThreshold = 80, emojis = true } = opts;
  const INK = fg(theme.ink);
  const MUTE = fg(theme.mute);
  const EDGE = fg(theme.edge);
  const sep = `${EDGE}┊${RESET}`;
  const E = emojis;
  const parts = [];

  // Dynamic module segments
  for (const mod of modules) {
    if (mod.textOnly) {
      const extra = mod.getExtra(data);
      parts.push(`${modEmoji(mod.key, E)}${MUTE}›${RESET} ${INK}${mod.label}${RESET} ${INK}${extra}${RESET}`);
      continue;
    }
    const pct = mod.getPct(data);
    const extra = mod.getExtra(data);
    const extraStr = extra ? ` ${MUTE}${extra}${RESET}` : '';
    parts.push(`${modEmoji(mod.key, E)}${MUTE}› ${mod.label}${RESET} ${mini3(pct, theme, warningThreshold, criticalThreshold)} ${INK}${pctText(pct)}${RESET}${extraStr}`);
  }

  // Model + stats
  const modelCol = data.contextUsed == null ? INK : fg(severityColor(theme, data.contextUsed, warningThreshold, criticalThreshold));
  parts.push(`${statEmoji('model', E)}${modelCol}${data.model}${RESET}`);
  parts.push(`${statEmoji('session', E)}${MUTE}Session${RESET} ${INK}${formatTokens(data.sessionTokens)}${RESET}`);
  parts.push(`${statEmoji('daily', E)}${MUTE}Daily${RESET} ${INK}${formatTokens(data.dailyTokens)}${RESET}`);
  parts.push(`${statEmoji('monthly', E)}${MUTE}Monthly${RESET} ${INK}${formatTokens(data.monthlyTokens)}${RESET}`);
  parts.push(`${statEmoji('fiveHourTokens', E)}${MUTE}5H Tokens${RESET} ${INK}${formatTokens(data.fiveHourTokens)}${RESET}`);

  return parts.join(sep);
}

// ── Style: gradient ──

function renderGradient(data, theme, modules, opts = {}) {
  const { warningThreshold = 50, criticalThreshold = 80, twoLines = true, emojis = true } = opts;
  const INK = fg(theme.ink);
  const MUTE = fg(theme.mute);
  const separator = `${MUTE} │${RESET}`;
  const E = emojis;

  // Line 1: model + token stats (same as classic)
  const line1Parts = [];
  line1Parts.push(`${statEmoji('model', E)}${INK}${BOLD}${data.model}${RESET}`);
  line1Parts.push(`${statEmoji('session', E)}${MUTE}Session:${formatTokens(data.sessionTokens)}${RESET}`);
  line1Parts.push(`${statEmoji('daily', E)}${INK}Daily:${formatTokens(data.dailyTokens)}${RESET}`);
  line1Parts.push(`${statEmoji('monthly', E)}${INK}Monthly:${formatTokens(data.monthlyTokens)}${RESET}`);
  line1Parts.push(`${statEmoji('fiveHourTokens', E)}${INK}5H Tokens:${formatTokens(data.fiveHourTokens)}${RESET}`);
  const line1 = line1Parts.join(` ${separator} `);

  // Line 2: gradient bars for modules
  const line2Parts = [];
  for (const mod of modules) {
    if (mod.textOnly) {
      const extra = mod.getExtra(data);
      const col = fg(theme.ink);
      line2Parts.push(`${modEmoji(mod.key, E)}${col}${mod.label}${RESET} ${INK}${extra}${RESET}`);
      continue;
    }
    const pct = mod.getPct(data);
    const extra = mod.getExtra(data);
    const bar = buildGradientBar(pct ?? 0, 10, theme, warningThreshold, criticalThreshold);
    const col = fg(severityColor(theme, pct, warningThreshold, criticalThreshold));
    const extraStr = extra ? ` ${MUTE}(${extra})${RESET}` : '';
    line2Parts.push(`${modEmoji(mod.key, E)}${col}${mod.label}${RESET} ${MUTE}[${RESET}${bar}${MUTE}]${RESET} ${col}${pctText(pct)}${RESET}${extraStr}`);
  }
  const line2 = line2Parts.join(` ${separator} `);

  if (twoLines) return line1 + '\n' + line2;
  return line1 + ` ${separator} ` + line2;
}

// ── Dispatcher ──

const RENDERERS = {
  classic: renderClassic,
  capsule: renderCapsule,
  hairline: renderHairline,
  gradient: renderGradient,
};

function render(style, data, theme, modules, opts) {
  const fn = RENDERERS[style] || RENDERERS.classic;
  return fn(data, theme, modules, opts);
}

function listStyles() {
  return Object.keys(RENDERERS);
}

function isKnownStyle(style) {
  return style in RENDERERS;
}

// ── Helpers ──

function formatTokens(tokens) {
  if (!tokens || tokens === 0) return '0';
  if (tokens >= 1e9) return (tokens / 1e9).toFixed(1) + 'B';
  if (tokens >= 1e6) return (tokens / 1e6).toFixed(1) + 'M';
  if (tokens >= 1e3) return (tokens / 1e3).toFixed(1) + 'K';
  return tokens.toString();
}

function formatContextSize(size) {
  if (size >= 1e6) return (size / 1e6).toFixed(0) + 'M';
  if (size >= 1e3) return (size / 1e3).toFixed(0) + 'K';
  return (size || 0).toString();
}

function formatResetTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

module.exports = {
  fg, bg, strip, RESET, BOLD,
  severityColor, pctText,
  buildBatteryBar, mini3,
  normalizeData,
  renderClassic, renderCapsule, renderHairline,
  render, listStyles, isKnownStyle,
  formatTokens, formatContextSize, formatResetTime,
};
