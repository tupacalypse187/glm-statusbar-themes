/**
 * Configuration manager.
 *
 * Resolution order: CLI flag > env var > config file > default.
 * Config file: ~/.claude/glm-statusbar.json
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.claude', 'glm-statusbar.json');

const DEFAULTS = {
  theme: 'graphite',
  style: 'classic',
  warning_threshold: 50,
  critical_threshold: 80,
  color_ok: null,
  color_warn: null,
  color_hot: null,
  two_lines: true,
  modules: ['5h', 'cache', 'ctx'],
  emojis: true,
};

function readConfigFile() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function resolveConfig(cliFlags = {}) {
  const file = readConfigFile();

  return {
    theme:
      cliFlags.theme ||
      process.env.CLAUDE_STATUSBAR_THEME ||
      file.theme ||
      DEFAULTS.theme,
    style:
      cliFlags.style ||
      process.env.CLAUDE_STATUSBAR_STYLE ||
      file.style ||
      DEFAULTS.style,
    warningThreshold:
      Number(cliFlags.warningThreshold) ||
      Number(process.env.CLAUDE_STATUSBAR_WARNING_THRESHOLD) ||
      file.warning_threshold ||
      DEFAULTS.warning_threshold,
    criticalThreshold:
      Number(cliFlags.criticalThreshold) ||
      Number(process.env.CLAUDE_STATUSBAR_CRITICAL_THRESHOLD) ||
      file.critical_threshold ||
      DEFAULTS.critical_threshold,
    colorOk: cliFlags.colorOk || process.env.CLAUDE_STATUSBAR_COLOR_OK || file.color_ok || null,
    colorWarn: cliFlags.colorWarn || process.env.CLAUDE_STATUSBAR_COLOR_WARN || file.color_warn || null,
    colorHot: cliFlags.colorHot || process.env.CLAUDE_STATUSBAR_COLOR_HOT || file.color_hot || null,
    twoLines: cliFlags.compact ? false : (file.two_lines ?? DEFAULTS.two_lines),
    modules: cliFlags.modules || file.modules || DEFAULTS.modules,
    emojis: cliFlags.noEmojis ? false : (process.env.CLAUDE_STATUSBAR_EMOJIS ? process.env.CLAUDE_STATUSBAR_EMOJIS === 'true' : (file.emojis ?? DEFAULTS.emojis)),
  };
}

function writeConfigFile(obj) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(obj, null, 2) + '\n');
}

/**
 * Set a single config value and write to disk.
 * Validates theme/style names and threshold ranges.
 */
function setConfigValue(key, value) {
  const validKeys = ['theme', 'style', 'warning_threshold', 'critical_threshold', 'color_ok', 'color_warn', 'color_hot', 'two_lines', 'modules', 'emojis'];

  if (!validKeys.includes(key)) {
    return { ok: false, error: `Unknown key "${key}". Valid keys: ${validKeys.join(', ')}` };
  }

  // Validate theme
  if (key === 'theme') {
    const { getTheme } = require('./themes');
    const t = getTheme(value);
    if (t.name !== value) {
      const { listThemes } = require('./themes');
      const names = listThemes().map(t => t.name);
      return { ok: false, error: `Unknown theme "${value}". Available: ${names.join(', ')}` };
    }
  }

  // Validate style
  if (key === 'style') {
    const { isKnownStyle, listStyles } = require('./styles');
    if (!isKnownStyle(value)) {
      return { ok: false, error: `Unknown style "${value}". Available: ${listStyles().join(', ')}` };
    }
  }

  // Validate thresholds
  if (key === 'warning_threshold' || key === 'critical_threshold') {
    const n = Number(value);
    if (isNaN(n) || n < 0 || n > 100) {
      return { ok: false, error: `${key} must be a number between 0 and 100` };
    }
    value = n;
  }

  // Validate two_lines
  if (key === 'two_lines') {
    value = value === 'true' || value === '1';
  }

  // Validate emojis
  if (key === 'emojis') {
    value = value === 'true' || value === '1';
  }

  // Validate modules — comma-separated list
  if (key === 'modules') {
    const keys = value.split(',').map(s => s.trim()).filter(Boolean);
    const { validateModules } = require('./modules');
    const invalid = validateModules(keys);
    if (invalid.length > 0) {
      const { listModules } = require('./modules');
      const valid = listModules().map(m => m.key);
      return { ok: false, error: `Unknown modules: ${invalid.join(', ')}. Available: ${valid.join(', ')}` };
    }
    value = keys;
  }

  // Color values are stored as-is (hex string)
  const current = readConfigFile();
  current[key] = value;
  writeConfigFile(current);
  return { ok: true, config: current };
}

/**
 * Reset config to defaults and write to disk.
 */
function resetConfig() {
  writeConfigFile(DEFAULTS);
  return { ok: true, config: DEFAULTS };
}

module.exports = { CONFIG_PATH, DEFAULTS, readConfigFile, writeConfigFile, resolveConfig, setConfigValue, resetConfig };
