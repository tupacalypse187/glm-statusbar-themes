#!/usr/bin/env node

/**
 * GLM Coding Plan Statusline CLI
 */

const { generateStatusLine, generateLocalStatusLine, generatePreview, cache } = require('../src/index');
const { listThemes } = require('../src/themes');
const styles = require('../src/styles');
const { listModules } = require('../src/modules');
const { resolveConfig, setConfigValue, resetConfig, readConfigFile, CONFIG_PATH, DEFAULTS } = require('../src/config');

// ── Config subcommand ──

function handleConfig(sub, key, value) {
  if (!sub || sub === 'help') {
    console.log(`
glm-statusline config - Manage persistent configuration

Usage:
  glm-statusline config set <key> <value>    Set a config value
  glm-statusline config get [key]            Get current config (or a single key)
  glm-statusline config reset                Reset all config to defaults
  glm-statusline config help                 Show this help

Config keys:
  theme               Color theme
  style               Layout style
  modules             Comma-separated list of bar modules (default: 5h,cache,ctx)
  warning_threshold   Percentage for yellow severity (0-100, default: 50)
  critical_threshold  Percentage for red severity (0-100, default: 80)
  color_ok            Override "ok" severity color (hex like #4ec85b, or "off")
  color_warn          Override "warn" severity color (hex, or "off")
  color_hot           Override "hot" severity color (hex, or "off")
  two_lines           Use two-line layout (true/false)
  emojis              Show emoji prefixes (true/false)

Available modules:
${listModules().map(m => `  ${m.key.padEnd(12)} ${m.description}`).join('\n')}

Available themes:
${listThemes().map(t => `  ${t.name.padEnd(20)} ${t.description}`).join('\n')}

Available styles:
${styles.listStyles().map(s => `  ${s}`).join('\n')}

Examples:
  glm-statusline config set theme dracula
  glm-statusline config set style capsule
  glm-statusline config set modules 5h,cache,ctx
  glm-statusline config set modules 5h,mcp,ctx      # include MCP
  glm-statusline config set modules 5h,ctx           # just two bars
  glm-statusline config set warning_threshold 40
  glm-statusline config set color_ok "#4ec85b"
  glm-statusline config set color_ok off       # clear override
  glm-statusline config get
  glm-statusline config get theme
  glm-statusline config get modules
  glm-statusline config reset

Config file: ${CONFIG_PATH}
`);
    process.exit(0);
  }

  if (sub === 'get') {
    const current = readConfigFile();
    if (key) {
      const val = current[key];
      if (val === undefined) {
        console.log(`Key "${key}" not set (default: ${DEFAULTS[key] ?? 'none'})`);
      } else {
        console.log(`${key} = ${JSON.stringify(val)}`);
      }
    } else {
      console.log(JSON.stringify(current, null, 2));
      console.log(`\nConfig file: ${CONFIG_PATH}`);
    }
    process.exit(0);
  }

  if (sub === 'set') {
    if (!key || value === undefined) {
      console.error('Usage: glm-statusline config set <key> <value>');
      console.error('Run "glm-statusline config help" for available keys.');
      process.exit(1);
    }
    // "off" clears color overrides
    if ((key === 'color_ok' || key === 'color_warn' || key === 'color_hot') && value === 'off') {
      value = null;
    }
    const result = setConfigValue(key, value);
    if (!result.ok) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    console.log(`Set ${key} = ${JSON.stringify(value)}`);
    console.log(`Config saved to ${CONFIG_PATH}`);
    process.exit(0);
  }

  if (sub === 'reset') {
    resetConfig();
    console.log('Config reset to defaults:');
    console.log(JSON.stringify(DEFAULTS, null, 2));
    console.log(`\nConfig file: ${CONFIG_PATH}`);
    process.exit(0);
  }

  console.error(`Unknown config subcommand: "${sub}". Run "glm-statusline config help" for usage.`);
  process.exit(1);
}

// ── Main CLI ──

const args = process.argv.slice(2);

// Intercept "config" subcommand before flag parsing
if (args[0] === 'config') {
  handleConfig(args[1], args[2], args[3]);
  process.exit(0);
}

const cliFlags = {
  local: false,
  compact: false,
  help: false,
  clearCache: false,
  preview: false,
  listThemes: false,
  listStyles: false,
  listModules: false,
  theme: null,
  style: null,
  warningThreshold: null,
  criticalThreshold: null,
  noEmojis: false,
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '--local':
    case '-l':
      cliFlags.local = true;
      break;
    case '--compact':
    case '-c':
      cliFlags.compact = true;
      break;
    case '--help':
    case '-h':
      cliFlags.help = true;
      break;
    case '--clear-cache':
      cliFlags.clearCache = true;
      break;
    case '--preview':
    case '-p':
      cliFlags.preview = true;
      break;
    case '--list-themes':
      cliFlags.listThemes = true;
      break;
    case '--list-styles':
      cliFlags.listStyles = true;
      break;
    case '--list-modules':
      cliFlags.listModules = true;
      break;
    case '--theme':
      cliFlags.theme = args[++i];
      break;
    case '--style':
      cliFlags.style = args[++i];
      break;
    case '--warning-threshold':
      cliFlags.warningThreshold = Number(args[++i]);
      break;
    case '--critical-threshold':
      cliFlags.criticalThreshold = Number(args[++i]);
      break;
    case '--no-emojis':
      cliFlags.noEmojis = true;
      break;
  }
}

// Help
if (cliFlags.help) {
  console.log(`
GLM Coding Plan Statusline - GLM Coding Plan status bar with themes

Usage:
  glm-statusline [options]              Render status line (reads stdin from Claude Code)
  glm-statusline config <subcommand>    Manage persistent configuration

Render options:
  --local, -l            Local mode only (no API calls)
  --compact, -c          Compact single-line mode
  --preview, -p          Preview all theme x style combinations
  --theme <name>         Override theme for this invocation
  --style <name>         Override style for this invocation
  --warning-threshold <n>  Override warning % for this invocation
  --critical-threshold <n>  Override critical % for this invocation
  --no-emojis            Disable emoji prefixes for this invocation
  --list-themes          List available themes
  --list-styles          List available styles
  --list-modules         List available metric modules
  --clear-cache          Clear all cached API data
  --help, -h             Show this help

Config commands:
  config set <key> <value>   Set a persistent config value
  config get [key]           Get current config (or a single key)
  config reset               Reset all config to defaults
  config help                Show detailed config help

Config keys: theme, style, modules, warning_threshold, critical_threshold,
             color_ok, color_warn, color_hot, two_lines, emojis

Environment variables:
  CLAUDE_STATUSBAR_THEME                  Override theme
  CLAUDE_STATUSBAR_STYLE                  Override style
  CLAUDE_STATUSBAR_WARNING_THRESHOLD      Override warning %
  CLAUDE_STATUSBAR_CRITICAL_THRESHOLD     Override critical %
  CLAUDE_STATUSBAR_EMOJIS                 Override emoji display (true/false)

Config file: ${CONFIG_PATH}
`);
  process.exit(0);
}

// Clear cache
if (cliFlags.clearCache) {
  cache.clearAllCache();
  console.log('Cache cleared');
  process.exit(0);
}

// List themes
if (cliFlags.listThemes) {
  const themes = listThemes();
  console.log('Available themes:\n');
  for (const t of themes) {
    console.log(`  ${t.name.padEnd(20)} ${t.description}`);
  }
  process.exit(0);
}

// List styles
if (cliFlags.listStyles) {
  const styleList = styles.listStyles();
  console.log('Available styles:\n');
  for (const s of styleList) {
    console.log(`  ${s}`);
  }
  process.exit(0);
}

// List modules
if (cliFlags.listModules) {
  const modules = listModules();
  console.log('Available modules:\n');
  for (const m of modules) {
    console.log(`  ${m.key.padEnd(12)} ${m.description}`);
  }
  process.exit(0);
}

// Preview mode
if (cliFlags.preview) {
  console.log(generatePreview());
  process.exit(0);
}

// ── Status line render (stdin mode) ──

const config = resolveConfig(cliFlags);

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', () => {
      resolve('{}');
    });

    setTimeout(() => {
      if (!data) {
        resolve('{}');
      }
    }, 100);
  });
}

async function main() {
  try {
    const input = await readStdin();

    const options = {
      theme: config.theme,
      style: config.style,
      modules: config.modules,
      warningThreshold: config.warningThreshold,
      criticalThreshold: config.criticalThreshold,
      twoLines: !cliFlags.compact,
      emojis: config.emojis,
    };

    if (cliFlags.local) {
      const output = generateLocalStatusLine(input, options);
      console.log(output);
    } else {
      const output = await generateStatusLine(input, options);
      console.log(output);
    }
  } catch (error) {
    console.log('GLM │ Statusline Error');
    process.exit(0);
  }
}

main();
