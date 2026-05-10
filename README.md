# 🎨 GLM Statusbar Themes

> A beautifully themed status bar for **Claude Code** running on the **GLM / z.ai** proxy.
> 9 color themes · 3 layout styles · 6 swappable metric modules · Zero dependencies

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-green" />
  <img src="https://img.shields.io/badge/zero-dependencies-blue" />
  <img src="https://img.shields.io/badge/license-MIT-purple" />
</p>

---

## ✨ What it does

This tool runs as Claude Code's `statusLine` command and renders a live, color-themed bar at the bottom of your terminal showing:

- 📊 **Token usage** — session, daily, and monthly token counts
- ⏱️ **Quota monitoring** — 5-hour rolling window usage with reset countdown
- 🧠 **Context window** — how much of your context window is consumed
- 💾 **Cache hit rate** — how effectively your prompt cache is working
- 🎨 **9 color themes** — from dark professional to neon pastel
- 🧩 **3 layout styles** — battery bars, capsule pills, or minimal hairline
- 🔌 **6 swappable modules** — pick which metrics appear as progress bars

---

## 🚀 Quick Start

### 1. Install

```bash
# Clone the repo
git clone https://github.com/your-username/glm-statusbar-themes.git
cd glm-statusbar-themes
```

### 2. Configure Claude Code

Add this to `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-glm-token",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic"
  },
  "statusLine": {
    "type": "command",
    "command": "node /absolute/path/to/glm-statusbar-themes/bin/cli.js"
  }
}
```

### 3. Create your config (optional)

Create `~/.claude/glm-statusbar.json`:

```json
{
  "theme": "tokyo-night",
  "style": "capsule",
  "modules": ["5h", "cache", "ctx"]
}
```

That's it — the status bar appears on the next refresh.

---

## 🎨 Themes

| Theme | Style | Description |
|:---|:---:|:---|
| `graphite` | 🌑 | Dark slate — quiet, professional, dark-terminal friendly |
| `twilight` | 🌆 | Purple twilight — soft purple/rose tones |
| `linen` | ☀️ | Beige linen — light terminal / sunny themes |
| `nord` | ❄️ | Nord — Scandinavian blue palette, classic dev colors |
| `dracula` | 🧛 | Dracula — purple-black high contrast |
| `sakura` | 🌸 | Sakura — pink-warm tones, cute and healing |
| `mono` | ⚫ | Mono — pure grayscale, minimalist |
| `catppuccin-mocha` | 🍫 | Catppuccin Mocha — soft pastel, easy on the eyes |
| `tokyo-night` | 🌃 | Tokyo Night — deep neon blue, vivid but quiet |

### Switch themes

```bash
# From the command line
node bin/cli.js config set theme dracula
node bin/cli.js config set theme tokyo-night

# Or override for one invocation
echo '{}' | node bin/cli.js --theme nord --style capsule --local
```

---

## 🧱 Styles

### Classic — Battery bars

Two-line layout with `[████░░░░]` battery bars and percentage overlays.

```
GLM-5 │ Sess:160.0K │ Day:42.8M │ Mon:979.2M
5h [██░░░░░░░░] 22% ⏰15:38 │ Cache [░░░░░░░░░░] 33% │ Ctx [██████░░░░] 68% (200K)
```

### Capsule — Colored pills

Single-line pill/capsule style with distinct background colors per metric and severity dots.

```
◷ 5H 22% · 15:38 ● ╱ ◷ Cache 33% ● ╱ ◷ Ctx 68% 200K ● ╱ ◆ GLM-5 ● ╱ Sess 160K ╱ Day 42.8M
```

### Hairline — Minimal

Single-line with 3-cell mini progress bars and `┊` separators. Most compact.

```
› 5h ▖▁▁ 22% ↺ 15:38 ┊ › Cache ▖▁▁ 33% ┊ › Ctx ██▁ 42% 200K ┊ GLM-5 ┊ Sess 160K ┊ Day 42.8M
```

### Switch styles

```bash
node bin/cli.js config set style capsule
node bin/cli.js config set style hairline
node bin/cli.js config set style classic
```

---

## 🔌 Modules

The progress bar slots are fully customizable. Pick which metrics you want to see and in what order.

### Available modules

| Key | Label | Description |
|:---|:---:|:---|
| `5h` | `5H` | 5-hour rolling quota % with reset countdown |
| `mcp` | `MCP` | MCP tool-call quota % |
| `ctx` | `Ctx` | Context window usage % |
| `cache` | `Cache` | Cache hit rate % — how much of your input is cache-read vs fresh |
| `5h-tokens` | `5hTok` | Actual token consumption in the last 5 hours |
| `daily` | `Daily` | Daily tokens as a % of your average daily burn rate |

> **Default modules:** `5h`, `cache`, `ctx`
> The `mcp` module is available but not included by default since most users have near-unlimited MCP quota.

### Swap modules

```bash
# Replace cache with daily burn rate
node bin/cli.js config set modules 5h,daily,ctx

# Add MCP back
node bin/cli.js config set modules 5h,mcp,cache,ctx

# Just two bars — keep it minimal
node bin/cli.js config set modules 5h,ctx

# Everything
node bin/cli.js config set modules 5h,mcp,cache,5h-tokens,daily,ctx
```

---

## ⚙️ Configuration

### Config file

`~/.claude/glm-statusbar.json` — all keys are optional:

```json
{
  "theme": "tokyo-night",
  "style": "capsule",
  "modules": ["5h", "cache", "ctx"],
  "warning_threshold": 50,
  "critical_threshold": 80,
  "color_ok": "#a6e3a1",
  "color_warn": "#fab387",
  "color_hot": "#f38ba8"
}
```

| Key | Type | Default | Description |
|:---|:---|:---|:---|
| `theme` | string | `"graphite"` | Color palette |
| `style` | string | `"classic"` | Layout renderer |
| `modules` | array | `["5h","cache","ctx"]` | Which metrics to show as progress bars |
| `warning_threshold` | number | `50` | Percentage for yellow severity |
| `critical_threshold` | number | `80` | Percentage for red severity |
| `color_ok` | string | `null` | Override green severity color (hex) |
| `color_warn` | string | `null` | Override yellow severity color (hex) |
| `color_hot` | string | `null` | Override red severity color (hex) |

### Resolution order

CLI flag → environment variable → config file → built-in default

### Environment variables

| Variable | Description |
|:---|:---|
| `ANTHROPIC_AUTH_TOKEN` | GLM/z.ai API token (required for API data) |
| `ANTHROPIC_BASE_URL` | API base URL (auto-detects platform) |
| `CLAUDE_STATUSBAR_THEME` | Override theme |
| `CLAUDE_STATUSBAR_STYLE` | Override style |
| `CLAUDE_STATUSBAR_WARNING_THRESHOLD` | Override warning % |
| `CLAUDE_STATUSBAR_CRITICAL_THRESHOLD` | Override critical % |

---

## 🛠️ CLI Reference

```
glm-statusbar [options]              Render status line (reads stdin from Claude Code)
glm-statusbar config <subcommand>    Manage persistent configuration
```

### Render options

| Flag | Description |
|:---|:---|
| `--local`, `-l` | Local mode only (no API calls) |
| `--compact`, `-c` | Compact single-line mode |
| `--preview`, `-p` | Preview all theme × style combinations |
| `--theme <name>` | Override theme for this invocation |
| `--style <name>` | Override style for this invocation |
| `--list-themes` | List available themes |
| `--list-styles` | List available styles |
| `--list-modules` | List available metric modules |
| `--clear-cache` | Clear all cached API data |
| `--help`, `-h` | Show help |

### Config commands

```bash
glm-statusbar config set <key> <value>    # Set a config value
glm-statusbar config get [key]            # Get current config (or single key)
glm-statusbar config reset                # Reset all config to defaults
glm-statusbar config help                 # Show detailed config help
```

#### Examples

```bash
# Theme & style
glm-statusbar config set theme dracula
glm-statusbar config set style hairline

# Modules
glm-statusbar config set modules 5h,cache,ctx
glm-statusbar config set modules 5h,daily,ctx

# Severity thresholds
glm-statusbar config set warning_threshold 40
glm-statusbar config set critical_threshold 75

# Color overrides
glm-statusbar config set color_ok "#a6e3a1"
glm-statusbar config set color_warn "#fab387"
glm-statusbar config set color_ok off       # clear override

# Inspect
glm-statusbar config get
glm-statusbar config get theme
glm-statusbar config get modules

# Reset everything
glm-statusbar config reset
```

---

## 🖼️ Preview all combinations

See every theme × style with sample data:

```bash
node bin/cli.js --preview
```

Or test a specific combo with your own data:

```bash
echo '{"model":{"display_name":"GLM-5"},"context_window":{"used_percentage":42,"context_window_size":200000,"current_usage":{"input_tokens":50000,"output_tokens":25000,"cache_creation_input_tokens":10000,"cache_read_input_tokens":30000}}}' | node bin/cli.js --local --theme dracula --style capsule
```

---

## 📁 Project Structure

```
glm-statusbar-themes/
├── bin/
│   └── cli.js            # CLI entry point + config subcommand
├── src/
│   ├── index.js          # Main orchestrator — data fetching, caching, bridge
│   ├── api.js            # GLM/z.ai HTTPS client (quota, usage endpoints)
│   ├── themes.js         # 9 color palettes with severity overrides
│   ├── styles.js         # 3 layout renderers (classic, capsule, hairline)
│   ├── modules.js        # 6 metric module definitions
│   ├── formatter.js      # Context parser + theme/style delegation
│   ├── config.js         # Config file reader/writer with validation
│   ├── cache.js          # File-based API response cache in /tmp
│   └── bridge.js         # GSD session bridge for context monitoring
├── package.json
├── CLAUDE.md
├── LICENSE
└── README.md
```

---

## 🙏 Credits

This project was built on the shoulders of two excellent projects:

- **[glm-coding-plan-statusline](https://github.com/wangjs-jacky/glm-coding-plan-statusline)** by [@wangjs-jacky](https://github.com/wangjs-jacky) — the GLM/z.ai API client, usage data fetching, and session bridge that powers the data layer
- **[claude-code-usage-bar](https://github.com/leeguooooo/claude-code-usage-bar)** by [@leeguooooo](https://github.com/leeguooooo) — the theme system, style renderers, and 24-bit true color ANSI engine that powers the visual layer

This project merges the best of both: GLM-native data fetching with rich themed rendering.

---

## 📄 License

MIT
