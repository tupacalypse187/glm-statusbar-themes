/**
 * GLM Coding Plan Statusline
 * Main entry module
 */

const api = require('./api');
const formatter = require('./formatter');
const cache = require('./cache');
const bridge = require('./bridge');
const { getTheme, listThemes } = require('./themes');
const styles = require('./styles');

/**
 * Extract session info from raw Claude Code stdin.
 */
function extractSessionInfo(input) {
  try {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    const sessionId = data?.session_id || '';
    const remaining = data?.context_window?.remaining_percentage;

    const AUTO_COMPACT_BUFFER_PCT = 16.5;
    let usedPct = 0;
    if (remaining != null) {
      const usableRemaining = Math.max(0, ((remaining - AUTO_COMPACT_BUFFER_PCT) / (100 - AUTO_COMPACT_BUFFER_PCT)) * 100);
      usedPct = Math.max(0, Math.min(100, Math.round(100 - usableRemaining)));
    }

    return { sessionId, remainingPercentage: remaining || 0, usedPct };
  } catch (e) {
    return { sessionId: '', remainingPercentage: 0, usedPct: 0 };
  }
}

/**
 * Generate status line with full API data.
 */
async function generateStatusLine(input, options = {}) {
  const context = formatter.parseContext(input);

  const sessionInfo = extractSessionInfo(input);
  if (sessionInfo.sessionId) {
    bridge.writeBridge({
      sessionId: sessionInfo.sessionId,
      remainingPercentage: sessionInfo.remainingPercentage,
      usedPct: sessionInfo.usedPct,
    });
  }

  const usageData = await fetchUsageDataWithCache();

  return formatter.formatStatusLine(context, usageData, options);
}

/**
 * Fetch usage data with caching.
 */
async function fetchUsageDataWithCache() {
  try {
    const cachedQuota = cache.readCache('quota');
    const cachedDaily = cache.readCache('daily');
    const cachedMonthly = cache.readCache('monthly');

    if (cachedQuota && cachedDaily && cachedMonthly) {
      return {
        monthly: cachedMonthly,
        daily: cachedDaily,
        quota: cachedQuota,
        platform: api.detectPlatform(),
      };
    }

    const [monthly, daily, quota] = await Promise.all([
      cachedMonthly ? Promise.resolve(cachedMonthly) : api.fetchMonthlyUsage().catch(() => ({ totalTokens: 0, _error: true })),
      cachedDaily ? Promise.resolve(cachedDaily) : api.fetchDailyUsage().catch(() => ({ dailyTokens: 0, _error: true })),
      cachedQuota ? Promise.resolve(cachedQuota) : api.fetchQuotaLimit().catch(() => ({ mcpUsage: { percentage: 0 }, _error: true })),
    ]);

    if (!cachedMonthly && monthly && !monthly._error) cache.writeCache('monthly', monthly);
    if (!cachedDaily && daily && !daily._error) cache.writeCache('daily', daily);
    if (!cachedQuota && quota && !quota._error) {
      const oldQuota = cache.readCacheIgnoreTTL('quota');
      if (oldQuota) {
        if (!quota.mcpUsage?.nextResetTime && oldQuota.mcpUsage?.nextResetTime) {
          quota.mcpUsage = { ...quota.mcpUsage, nextResetTime: oldQuota.mcpUsage.nextResetTime };
        }
        if (!quota.fiveHourQuota?.nextResetTime && oldQuota.fiveHourQuota?.nextResetTime) {
          quota.fiveHourQuota = { ...quota.fiveHourQuota, nextResetTime: oldQuota.fiveHourQuota.nextResetTime };
        }
      }
      cache.writeCache('quota', quota);
    }

    return { monthly, daily, quota, platform: api.detectPlatform() };
  } catch (error) {
    return { error: error.message, platform: api.detectPlatform() };
  }
}

/**
 * Generate status line using only local context data (no API calls).
 */
function generateLocalStatusLine(input, options = {}) {
  const context = formatter.parseContext(input);
  return formatter.formatStatusLine(context, {}, { ...options, showMCP: false, showMonthly: false, showDaily: false });
}

/**
 * Generate a preview of all theme x style combinations using sample data.
 */
function generatePreview(moduleKeys) {
  const sampleContext = {
    model: 'GLM-5',
    contextUsed: 68,
    contextSize: 200000,
    inputTokens: 85000,
    outputTokens: 42000,
    cacheCreationTokens: 28000,
    cacheReadTokens: 5000,
  };

  const sampleUsage = {
    monthly: { totalTokens: 979_200_000 },
    daily: { dailyTokens: 42_800_000, fiveHourTokens: 12_500_000 },
    quota: {
      fiveHourQuota: { percentage: 22, nextResetTime: Date.now() + 2.5 * 3600 * 1000 },
      mcpUsage: { percentage: 48, nextResetTime: Date.now() + 5 * 24 * 3600 * 1000 },
    },
  };

  const themes = listThemes();
  const styleNames = styles.listStyles();
  const lines = [];

  const RESET = '\x1b[0m';
  const BOLD = '\x1b[1m';
  const DIM = '\x1b[2m';

  for (const theme of themes) {
    lines.push(`${RESET}${BOLD}${theme.name}${RESET} ${DIM}— ${theme.description}${RESET}`);
    for (const styleName of styleNames) {
      const label = `  ${styleName}:`.padEnd(12);
      const output = formatter.formatStatusLine(sampleContext, sampleUsage, {
        theme: theme.name,
        style: styleName,
        modules: moduleKeys,
        warningThreshold: 50,
        criticalThreshold: 80,
      });
      const indented = output.split('\n').map((l, i) => i === 0 ? `${label}${l}` : `${' '.repeat(12)}${l}`).join('\n');
      lines.push(indented);
    }
    lines.push('');
  }

  return lines.join('\n');
}

module.exports = {
  generateStatusLine,
  generateLocalStatusLine,
  fetchUsageDataWithCache,
  generatePreview,
  api,
  formatter,
  cache,
  bridge,
};
