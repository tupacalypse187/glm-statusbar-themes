/**
 * Metric module registry.
 *
 * Each module extracts a percentage and optional extra text from the
 * normalized data object. The status bar renders whichever modules the
 * user has enabled in their config, in order.
 */

const MODULES = [
  {
    key: '5h',
    label: '5H',
    description: '5-hour rolling quota %',
    getPct: (d) => d.fiveHourPct,
    getExtra: (d) => d.fiveHourReset ? fmtReset(d.fiveHourReset) : '',
  },
  {
    key: 'mcp',
    label: 'MCP',
    description: 'MCP tool-call quota %',
    getPct: (d) => d.mcpPct,
    getExtra: (d) => d.mcpReset ? fmtReset(d.mcpReset) : '',
  },
  {
    key: 'ctx',
    label: 'Ctx',
    description: 'Context window usage %',
    getPct: (d) => d.contextUsed,
    getExtra: (d) => d.contextSize ? fmtSize(d.contextSize) : '',
  },
  {
    key: 'cache',
    label: 'Cache',
    description: 'Cache hit rate % (cache-read vs total input)',
    getPct: (d) => {
      const total = d.inputTokens + d.cacheCreationTokens + d.cacheReadTokens;
      if (!total) return null;
      return (d.cacheReadTokens / total) * 100;
    },
    getExtra: () => '',
  },
  {
    key: '5h-tokens',
    label: '5hTok',
    description: 'Token consumption in last 5 hours',
    getPct: (d) => {
      // Show as % of 5h quota percentage — acts as a "how much of your 5h window have you burned"
      if (!d.fiveHourTokens || !d.fiveHourPct) return null;
      // Derive a rough token budget from quota % (higher % = more used = show burn)
      return Math.min(100, d.fiveHourPct);
    },
    getExtra: (d) => d.fiveHourTokens ? fmtTok(d.fiveHourTokens) : '',
  },
  {
    key: 'daily',
    label: 'Daily',
    description: 'Daily tokens as % of average daily burn',
    getPct: (d) => {
      if (!d.dailyTokens || !d.monthlyTokens) return null;
      const now = new Date();
      const dayOfMonth = now.getDate();
      if (dayOfMonth === 0) return null;
      const avgDaily = d.monthlyTokens / dayOfMonth;
      if (!avgDaily) return null;
      return Math.min(100, (d.dailyTokens / avgDaily) * 100);
    },
    getExtra: (d) => d.dailyTokens ? fmtTok(d.dailyTokens) : '',
  },
];

const _BY_KEY = {};
for (const m of MODULES) {
  _BY_KEY[m.key] = m;
}

function getModule(key) {
  return _BY_KEY[key] || null;
}

function listModules() {
  return [...MODULES];
}

function resolveModules(configModules) {
  if (!Array.isArray(configModules) || configModules.length === 0) {
    return [getModule('5h'), getModule('cache'), getModule('ctx')];
  }
  const resolved = [];
  for (const key of configModules) {
    const m = getModule(key);
    if (m) resolved.push(m);
  }
  return resolved.length > 0 ? resolved : [getModule('5h'), getModule('cache'), getModule('ctx')];
}

function validateModules(keys) {
  const invalid = [];
  for (const k of keys) {
    if (!_BY_KEY[k]) invalid.push(k);
  }
  return invalid;
}

// ── formatters (shared with styles.js, duplicated here to keep modules self-contained) ──

function fmtTok(n) {
  if (!n) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

function fmtSize(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return (n || 0).toString();
}

function fmtReset(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

module.exports = { MODULES, getModule, listModules, resolveModules, validateModules };
