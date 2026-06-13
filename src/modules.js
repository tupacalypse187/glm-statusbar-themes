/**
 * Metric module registry.
 *
 * Each module extracts a percentage and optional extra text from the
 * normalized data object. The status bar renders whichever modules the
 * user has enabled in their config, in order.
 *
 * Modules with `textOnly: true` are rendered as text labels without
 * progress bars. The cost module is an example — it shows a dollar
 * figure, not a percentage.
 */

const MODEL_PRICING = {
  'glm-5-2':      { label: 'Opus 4.7',   input: 5.00, output: 25.00, cacheRead: 0.50, cacheWrite: 10.00 },
  'glm-5-1':      { label: 'Opus 4.6',   input: 5.00, output: 25.00, cacheRead: 0.50, cacheWrite: 10.00 },
  'glm-5-turbo':  { label: 'Sonnet 4.6', input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 6.00 },
  'glm-5v-turbo': { label: 'Sonnet 4.6', input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 6.00 },
  'glm-4.7-flash':{ label: 'Haiku 4.5',  input: 1.00, output: 5.00,  cacheRead: 0.10, cacheWrite: 2.00 },
};

function normalizeModelId(raw) {
  return (raw || '').toLowerCase().replace(/[\s.]/g, '-').replace(/\[.*?\]/g, '');
}

function calculateCost(context) {
  const modelId = normalizeModelId(context.modelId);
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) return null;
  return (
    ((context.inputTokens || 0) / 1e6) * pricing.input +
    ((context.outputTokens || 0) / 1e6) * pricing.output +
    ((context.cacheCreationTokens || 0) / 1e6) * pricing.cacheWrite +
    ((context.cacheReadTokens || 0) / 1e6) * pricing.cacheRead
  );
}

function estimateCost(tokens, modelId) {
  const pricing = MODEL_PRICING[normalizeModelId(modelId)];
  if (!pricing || !tokens) return null;
  // Blended rate: average of input + output (typical ~3:1 input:output ratio)
  const blendedRate = (pricing.input * 0.75 + pricing.output * 0.25);
  return (tokens / 1e6) * blendedRate;
}

function formatCost(cost) {
  if (cost == null) return '--';
  if (cost < 0.01) return '$' + cost.toFixed(4);
  return '$' + cost.toFixed(2);
}

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
    label: 'Context',
    description: 'Context window usage %',
    getPct: (d) => d.contextUsed,
    getExtra: (d) => {
      if (!d.contextSize) return '';
      const used = d.contextUsed != null ? Math.round(d.contextSize * d.contextUsed / 100) : 0;
      return fmtTok(used) + ' / ' + fmtSize(d.contextSize);
    },
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
    label: '5H Tokens',
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
  {
    key: 'cost',
    label: 'Cost',
    description: 'Estimated API cost: session / 5H / monthly (Claude Code pricing)',
    textOnly: true,
    getPct: () => null,
    getExtra: (d) => {
      const modelId = d.modelId || '';
      const parts = [];
      if (d.cost != null) parts.push('S:' + formatCost(d.cost));
      const cost5h = estimateCost(d.fiveHourTokens, modelId);
      if (cost5h != null) parts.push('5H:' + formatCost(cost5h));
      const costMonthly = estimateCost(d.monthlyTokens, modelId);
      if (costMonthly != null) parts.push('M:' + formatCost(costMonthly));
      return parts.length ? parts.join(' ') : '--';
    },
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
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + ampm;
}

module.exports = { MODULES, MODEL_PRICING, getModule, listModules, resolveModules, validateModules, normalizeModelId, calculateCost, estimateCost, formatCost };
