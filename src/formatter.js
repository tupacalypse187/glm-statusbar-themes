/**
 * Status bar formatter.
 * Delegates layout to styles.js and colors to themes.js.
 */

const styles = require('./styles');
const { getTheme, applyColorOverrides, parseHexColor } = require('./themes');
const { resolveModules } = require('./modules');

/**
 * Parse Claude Code context JSON from stdin.
 */
function parseContext(input) {
  try {
    const data = typeof input === 'string' ? JSON.parse(input) : input;

    return {
      model: data?.model?.display_name || 'GLM',
      modelId: data?.model?.id || '',
      contextUsed: data?.context_window?.used_percentage || 0,
      contextSize: data?.context_window?.context_window_size || 0,
      inputTokens: data?.context_window?.current_usage?.input_tokens || 0,
      outputTokens: data?.context_window?.current_usage?.output_tokens || 0,
      cacheCreationTokens: data?.context_window?.current_usage?.cache_creation_input_tokens || 0,
      cacheReadTokens: data?.context_window?.current_usage?.cache_read_input_tokens || 0,
      currentDir: data?.workspace?.current_dir || '',
    };
  } catch (e) {
    return {
      model: 'GLM',
      contextUsed: 0,
      contextSize: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
    };
  }
}

/**
 * Format status line using theme + style system.
 *
 * @param {object} context - parsed context from parseContext()
 * @param {object} usageData - API usage data
 * @param {object} options - { theme, style, warningThreshold, criticalThreshold, twoLines, colorOk, colorWarn, colorHot }
 * @returns {string} ANSI-colored status line
 */
function formatStatusLine(context, usageData, options = {}) {
  const {
    theme: themeName = 'graphite',
    style: styleName = 'classic',
    warningThreshold = 50,
    criticalThreshold = 80,
    twoLines = true,
    modules: moduleKeys = null,
    colorOk = null,
    colorWarn = null,
    colorHot = null,
  } = options;

  let theme = getTheme(themeName);

  // Apply color overrides
  const overrides = {};
  if (colorOk) overrides.ok = parseHexColor(colorOk);
  if (colorWarn) overrides.warn = parseHexColor(colorWarn);
  if (colorHot) overrides.hot = parseHexColor(colorHot);
  theme = applyColorOverrides(theme, overrides);

  const data = styles.normalizeData(context, usageData);
  const modules = resolveModules(moduleKeys);

  return styles.render(styleName, data, theme, modules, {
    warningThreshold,
    criticalThreshold,
    twoLines,
  });
}

module.exports = {
  parseContext,
  formatStatusLine,
  formatTokens: styles.formatTokens,
  formatContextSize: styles.formatContextSize,
  formatResetTime: styles.formatResetTime,
};
