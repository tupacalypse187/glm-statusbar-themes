# GLM Statusbar Themes

> A beautifully themed status bar for **Claude Code** running on the **GLM / z.ai** proxy.
> 25 color themes · 4 layout styles · 7 swappable metric modules · Zero dependencies

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-green" />
  <img src="https://img.shields.io/badge/zero-dependencies-blue" />
  <img src="https://img.shields.io/badge/license-MIT-purple" />
  <img src="https://img.shields.io/npm/v/glm-statusbar-themes" />
</p>

---

## What it does

This tool runs as Claude Code's `statusLine` command and renders a live, color-themed bar at the bottom of your terminal showing:

- **Token usage** — Session, Daily, Monthly, and 5H token counts
- **Quota monitoring** — 5-hour rolling window usage with reset time
- **Context window** — percentage used + actual tokens used / window size
- **Cache hit rate** — how effectively your prompt cache is working
- **Estimated cost** — API cost based on Claude Code pricing equivalents
- **Emojis** — visual indicators for every metric (togglable)
- **25 color themes** — from dark professional to vivid neon, light to cosmic
- **4 layout styles** — battery bars, capsule pills, minimal hairline, or gradient
- **7 swappable modules** — pick which metrics appear as progress bars

All four styles show the same information: **progress bar modules** (configurable) + **text stats** (Model, Session, Daily, Monthly, 5H Tokens).

**Install:** `npm install -g glm-statusbar-themes` or just use `npx glm-statusbar-themes` — no install needed.

**npm:** [https://www.npmjs.com/package/glm-statusbar-themes](https://www.npmjs.com/package/glm-statusbar-themes)

---

## Quick Start

### Option A: npx (recommended)

The fastest way to get going — no global install required. Add this to `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-glm-token",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic"
  },
  "statusLine": {
    "type": "command",
    "command": "npx -y glm-statusbar-themes"
  }
}
```

### Option B: Local clone

```bash
git clone https://github.com/tupacalypse187/glm-statusbar-themes.git
cd glm-statusbar-themes
```

Then point `statusLine.command` at the local path:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /absolute/path/to/glm-statusbar-themes/bin/cli.js"
  }
}
```

### Create your config (optional)

Create `~/.claude/glm-statusbar.json`:

```json
{
  "theme": "tokyo-night",
  "style": "capsule",
  "modules": ["5h", "ctx"]
}
```

That's it — the status bar appears on the next refresh.

---

## Themes

25 built-in color palettes. Every theme works with every style.

### Dark themes

| Theme | Vibe | OK (green) | Warning | Critical |
|:---|:---|:---|:---|:---|
| `graphite` | Dark slate, quiet professional | Teal `#78c8c0` | Amber `#e8b260` | Red `#e87474` |
| `twilight` | Purple twilight, soft rose | Muted green `#a0d2b4` | Orange `#e8a05a` | Pink `#e4648c` |
| `nord` | Scandinavian blue, classic dev | Forest `#a3be8c` | Yellow `#ebcb8b` | Red `#bf616a` |
| `dracula` | Purple-black, high contrast | Neon `#50fa7b` | Yellow `#f1fa8c` | Red `#ff5555` |
| `mono` | Pure grayscale, minimalist | Light gray `#b4b4b4` | Mid gray `#dcdcdc` | White `#fafafa` |
| `catppuccin-mocha` | Soft pastel, easy on eyes | Mint `#a6e3a1` | Peach `#fab387` | Pink `#f38ba8` |
| `tokyo-night` | Deep neon blue | Lime `#9ece6a` | Orange `#e0af68` | Pink `#f7768e` |
| `solarized-dark` | Classic warm/cool, Ethan Schoonover | Olive `#859900` | Amber `#b58900` | Red `#dc322f` |
| `gruvbox` | Warm retro groove, earthy oranges | Olive `#98971a` | Orange `#d79921` | Red `#cc241d` |
| `one-dark` | Atom editor, balanced warm dark | Green `#98c379` | Gold `#e5c07b` | Red `#e06c75` |
| `rose-pine` | Soft pink, muted pastel, elegant | Teal `#9ccfd8` | Pink `#ea9dbb` | Rose `#eb6f92` |
| `github-dark` | Clean, professional, code review | Green `#3fb950` | Gold `#e3b341` | Red `#f85149` |
| `night-owl` | Vivid on dark blue, Sarah Drasner | Mint `#7fdbb3` | Orange `#ffb74d` | Pink `#ff5571` |
| `material` | Google Material Design, bold | Green `#81c784` | Yellow `#ffd54f` | Red `#ef5350` |
| `everforest` | Warm green, nature-inspired | Olive `#a8c67e` | Gold `#e6b45a` | Red `#d66a6a` |
| `ayu` | Warm dark, dusty orange accents | Green `#82c882` | Gold `#ffc850` | Red `#ff5f5f` |
| `palenight` | Soft purple/pink, muted cosmic | Lime `#c4d88e` | Peach `#ffc878` | Pink `#ff828c` |
| `synthwave` | 80s neon, hot pink and cyan | Cyan `#00FFFF` | Magenta `#FF00FF` | Hot pink `#FF1493` |
| `cyberpunk` | Acid green, electric blue | Electric green `#00FF88` | Orange `#FF6600` | Magenta `#FF0066` |
| `neon` | Maximum brightness, vivid saturated | Neon green `#39FF14` | Neon yellow `#FFFF00` | Hot pink `#FF006E` |
| `candy` | Bright pastels, bubblegum and mint | Mint `#64FFB4` | Lemon `#FFDC64` | Bubblegum `#FF5082` |
| `lava` | Molten reds and oranges, fiery | Gold `#FFB432` | Orange `#FF781E` | Lava red `#FF2814` |

### Light themes

| Theme | Vibe | OK (green) | Warning | Critical |
|:---|:---|:---|:---|:---|
| `linen` | Beige, light/sunny terminal | Sage `#508c78` | Gold `#be823c` | Red `#be5050` |
| `sakura` | Pink-warm, cute | Soft green `#78aa82` | Orange `#dc965a` | Pink `#d25a6e` |
| `solarized-light` | Classic warm/cool, light variant | Olive `#859900` | Amber `#b58900` | Red `#dc322f` |

### Switch themes

```bash
# Via config (persists)
npx glm-statusbar-themes config set theme dracula

# Or override for one invocation
echo '{}' | npx glm-statusbar-themes --theme nord --local
```

---

## Styles

4 layout renderers. All styles show the same data — just different visual presentation.

### Classic — Battery bars

Two-line layout with `[████░░░░]` battery bars and percentage overlays.

```
🤖 GLM-5  │ 💬 Session:160.0K  │ 📈 Daily:42.8M  │ 📅 Monthly:979.2M  │ 🔥 5H Tokens:12.5M
⏱️ 5H [██░░░░░░░░] 22% (12:39 PM)  │ 🧠 Context [██████░░░░] 68% (136.0K / 200K)  │ 💰 Cost S:$1.76 5H:$125.00 M:$9,792.00
```

### Capsule — Colored pills

Single-line pill/capsule style with distinct background colors per metric and severity dots.

```
⏱️ ◷ 5H 22% · 12:39 PM ● ╱ 🧠 ◷ Context 68% · 136.0K / 200K ● ╱ 💰 Cost S:$1.76 5H:$125.00 M:$9,792.00 ╱ 🤖 ◆ GLM-5 ● ╱ 💬 Session 160K ╱ 📈 Daily 42.8M ╱ 📅 Monthly 979.2M ╱ 🔥 5H Tokens 12.5M
```

### Hairline — Minimal

Single-line with 3-cell mini progress bars and `┊` separators. Most compact.

```
⏱️ › 5H ▖▁▁ 22% 12:39 PM ┊ 🧠 › Context ██▓ 68% 136.0K / 200K ┊ 💰 › Cost S:$1.76 5H:$125.00 M:$9,792.00 ┊ 🤖 GLM-5 ┊ 💬 Session 160K ┊ 📈 Daily 42.8M ┊ 📅 Monthly 979.2M ┊ 🔥 5H Tokens 12.5M
```

### Gradient — Color-shifting bars

Two-line layout where bar colors shift smoothly from cool (ok) to warm (critical) based on usage level. Each cell in the bar gets an interpolated color, creating a gradient effect that intensifies as usage grows.

```
🤖 GLM-5  │ 💬 Session:160.0K  │ 📈 Daily:42.8M  │ 📅 Monthly:979.2M  │ 🔥 5H Tokens:12.5M
⏱️ 5H [░░░░░░░░░░] --%  │ 🧠 Context [██████░░░░] 68% (136.0K / 200K)  │ 💰 Cost S:$1.76 5H:$125.00 M:$9,792.00
```

The gradient uses the theme's own severity colors as endpoints — ok to warn at low usage, warn to critical at high usage — so it adapts to every theme.

### Switch styles

```bash
npx glm-statusbar-themes config set style capsule
npx glm-statusbar-themes config set style hairline
npx glm-statusbar-themes config set style classic
npx glm-statusbar-themes config set style gradient
```

---

## Modules

The progress bar slots are fully customizable. Pick which metrics you want to see as bars and in what order. Text stats (Model, Session, Daily, Monthly, 5H Tokens) are always shown regardless of module selection.

### Available modules

| Key | Label | Source | Bar Shows | Extra Info |
|:---|:---:|:---|:---|:---|
| `5h` | `5H` | API quota | 5-hour rolling quota % | Reset time (12h AM/PM) |
| `mcp` | `MCP` | API quota | MCP tool-call quota % | Reset time (12h AM/PM) |
| `ctx` | `Context` | stdin | Context window usage % | Tokens used / window size (e.g. `136.0K / 200K`) |
| `cache` | `Cache` | derived | Cache hit rate % | — |
| `5h-tokens` | `5H Tokens` | API daily | Token consumption in last 5h | Token count |
| `daily` | `Daily` | API + derived | Daily tokens vs avg burn rate | Token count |
| `cost` | `Cost` | derived (text-only) | — | Session / 5H / Monthly cost (e.g. `S:$1.76 5H:$125.00 M:$9,792.00`) |

### Cost estimation

The `cost` module estimates API spending as if using Claude Code models. It shows three cost breakdowns:

| Label | Scope | Calculation |
|:---|:---|:---|
| `S:` | This session | Exact: input + output + cache write + cache read at per-token rates |
| `5H:` | Last 5 hours | Estimated: total 5H tokens × blended rate (75% input + 25% output) |
| `M:` | Calendar month | Estimated: monthly tokens × blended rate (75% input + 25% output) |

Monthly is calendar month (resets on the 1st), not a rolling 30-day window.

Pricing per million tokens:

| GLM Model | Claude Equivalent | Input | Output | Cache Read | Cache Write |
|:---|:---|:---|:---|:---|:---|
| `glm-5-1` | Opus 4.6 | $5.00 | $25.00 | $0.50 | $10.00 |
| `glm-5-turbo` | Sonnet 4.6 | $3.00 | $15.00 | $0.30 | $6.00 |
| `glm-5v-turbo` | Sonnet 4.6 | $3.00 | $15.00 | $0.30 | $6.00 |
| `glm-4.7-flash` | Haiku 4.5 | $1.00 | $5.00 | $0.10 | $2.00 |

The cost module is **text-only** — it shows as a label with dollar amounts, not a progress bar.

### Text stats (always shown)

These appear alongside the module bars in every style:

| Stat | Source | Example |
|:---|:---|:---|
| Model | stdin | `GLM-5` |
| Session | stdin (derived) | `160.0K` |
| Daily | API | `42.8M` |
| Monthly | API | `979.2M` |
| 5H Tokens | API | `12.5M` |

### Swap modules

```bash
# Minimal — just the real limits
npx glm-statusbar-themes config set modules 5h,ctx

# With cost tracking
npx glm-statusbar-themes config set modules 5h,ctx,cost

# Add MCP back
npx glm-statusbar-themes config set modules 5h,mcp,ctx

# Everything
npx glm-statusbar-themes config set modules 5h,mcp,cache,5h-tokens,daily,ctx,cost
```

---

## Severity Colors

Metrics change color based on usage level. Thresholds and colors are fully customizable.

| Level | Default range | Meaning |
|:---|:---|:---|
| **OK** (green) | < warning threshold | Healthy, plenty of headroom |
| **Warning** (yellow) | >= warning threshold | Getting close to limit |
| **Critical** (red) | >= critical threshold | Approaching or at limit |

### Custom severity colors

Override the green/yellow/red with any hex color:

```bash
npx glm-statusbar-themes config set color_ok "#50fa7b"
npx glm-statusbar-themes config set color_warn "#f1fa8c"
npx glm-statusbar-themes config set color_hot "#ff5555"

# Clear an override
npx glm-statusbar-themes config set color_ok off
```

### Custom thresholds

```bash
npx glm-statusbar-themes config set warning_threshold 40
npx glm-statusbar-themes config set critical_threshold 75
```

---

## Configuration

### Config file

`~/.claude/glm-statusbar.json` — all keys are optional:

```json
{
  "theme": "tokyo-night",
  "style": "capsule",
  "modules": ["5h", "ctx"],
  "warning_threshold": 50,
  "critical_threshold": 80,
  "emojis": true,
  "color_ok": "#a6e3a1",
  "color_warn": "#fab387",
  "color_hot": "#f38ba8"
}
```

| Key | Type | Default | Description |
|:---|:---|:---|:---|
| `theme` | string | `"graphite"` | Color palette |
| `style` | string | `"classic"` | Layout renderer |
| `modules` | array | `["5h","ctx"]` | Which metrics to show as progress bars |
| `warning_threshold` | number | `50` | Percentage for yellow severity |
| `critical_threshold` | number | `80` | Percentage for red severity |
| `emojis` | boolean | `true` | Show emoji prefixes |
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
| `CLAUDE_STATUSBAR_EMOJIS` | Override emoji display (`true`/`false`) |

---

## CLI Reference

```
npx glm-statusbar-themes [options]              Render status line (reads stdin from Claude Code)
npx glm-statusbar-themes config <subcommand>    Manage persistent configuration
```

### Render options

| Flag | Description |
|:---|:---|
| `--local`, `-l` | Local mode only (no API calls) |
| `--compact`, `-c` | Compact single-line mode |
| `--preview`, `-p` | Preview all theme x style combinations |
| `--theme <name>` | Override theme for this invocation |
| `--style <name>` | Override style for this invocation |
| `--list-themes` | List available themes |
| `--list-styles` | List available styles |
| `--list-modules` | List available metric modules |
| `--clear-cache` | Clear all cached API data |
| `--no-emojis` | Disable emoji prefixes for this invocation |
| `--help`, `-h` | Show help |

### Config commands

```bash
npx glm-statusbar-themes config set <key> <value>    # Set a config value
npx glm-statusbar-themes config get [key]            # Get current config (or single key)
npx glm-statusbar-themes config reset                # Reset all config to defaults
npx glm-statusbar-themes config help                 # Show detailed config help
```

#### Examples

```bash
# Theme & style
npx glm-statusbar-themes config set theme dracula
npx glm-statusbar-themes config set style hairline

# Modules
npx glm-statusbar-themes config set modules 5h,ctx
npx glm-statusbar-themes config set modules 5h,mcp,cache,ctx

# Severity thresholds
npx glm-statusbar-themes config set warning_threshold 40
npx glm-statusbar-themes config set critical_threshold 75

# Emojis
npx glm-statusbar-themes config set emojis false     # disable
npx glm-statusbar-themes config set emojis true       # enable

# Color overrides
npx glm-statusbar-themes config set color_ok "#a6e3a1"
npx glm-statusbar-themes config set color_warn "#fab387"
npx glm-statusbar-themes config set color_ok off       # clear override

# Inspect
npx glm-statusbar-themes config get
npx glm-statusbar-themes config get theme
npx glm-statusbar-themes config get modules

# Reset everything
npx glm-statusbar-themes config reset
```

---

## Preview all combinations

See every theme x style with sample data:

```bash
npx glm-statusbar-themes --preview
```

Or test a specific combo with your own data:

```bash
echo '{"model":{"display_name":"GLM-5"},"context_window":{"used_percentage":42,"context_window_size":200000,"current_usage":{"input_tokens":50000,"output_tokens":25000,"cache_creation_input_tokens":10000,"cache_read_input_tokens":30000}}}' | npx glm-statusbar-themes --local --theme dracula --style capsule
```

---

## Project Structure

```
glm-statusbar-themes/
├── bin/
│   └── cli.js            # CLI entry point + config subcommand
├── src/
│   ├── index.js          # Main orchestrator — data fetching, caching, bridge
│   ├── api.js            # GLM/z.ai HTTPS client (quota, usage endpoints)
│   ├── themes.js         # 25 color palettes with severity overrides
│   ├── styles.js         # 4 layout renderers (classic, capsule, hairline, gradient)
│   ├── modules.js        # 7 metric module definitions with MODEL_PRICING
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

## Credits

This project was built on the shoulders of two excellent projects:

- **[glm-coding-plan-statusline](https://github.com/wangjs-jacky/glm-coding-plan-statusline)** by [@wangjs-jacky](https://github.com/wangjs-jacky) — the GLM/z.ai API client, usage data fetching, and session bridge that powers the data layer
- **[claude-code-usage-bar](https://github.com/leeguooooo/claude-code-usage-bar)** by [@leeguooooo](https://github.com/leeguooooo) — the theme system, style renderers, and 24-bit true color ANSI engine that powers the visual layer

This project merges the best of both: GLM-native data fetching with rich themed rendering.

---

## License

MIT
