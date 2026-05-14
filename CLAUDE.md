# CLAUDE.md — GLM Statusbar Themes

> Themed status bar for Claude Code running on GLM/z.ai proxy.

## Architecture

Three-layer design: **data** → **modules** → **rendering**.

### Data layer (`src/api.js`, `src/cache.js`)
- Fetches usage data from GLM/z.ai API via `ANTHROPIC_AUTH_TOKEN`
- Three endpoints: `model-usage` (monthly/daily), `quota/limit` (5h/MCP quotas)
- Auto-detects platform (z.ai vs open.bigmodel.cn) from `ANTHROPIC_BASE_URL`
- File-based cache in `/tmp/.glm-statusline-cache/` with per-type TTLs
- **API quirk**: `TIME_LIMIT` is actually MCP quota, `TOKENS_LIMIT` is 5h quota

### Module layer (`src/modules.js`, `src/config.js`)
- 7 metric modules, each with `getPct(data)` and `getExtra(data)`
- Config `modules` array selects which modules render as progress bars
- Default: `["5h", "ctx"]`
- `resolveModules()` maps config keys to module objects
- Modules with `textOnly: true` render as labels without bars (e.g. cost)
- `MODEL_PRICING` map: GLM model IDs → Claude pricing (input/output/cacheRead/cacheWrite per MTok)
- Cost module shows three breakdowns: `S:$X` (session, exact) / `5H:$X` (5h tokens, blended rate) / `M:$X` (monthly tokens, blended rate)
- `estimateCost(tokens, modelId)` uses blended rate: 75% input + 25% output for API token counts

### Rendering layer (`src/themes.js`, `src/styles.js`, `src/formatter.js`)
- 25 themes (pure RGB palettes) x 4 styles (layout renderers) = 100 combinations
- 24-bit true color ANSI (`\033[38;2;R;G;Bm`)
- Severity coloring: `< warning` → ok, `< critical` → warn, `>= critical` → hot
- Styles iterate over resolved modules dynamically (no hardcoded metrics)
- All four styles show the same text stats: Model, Session, Daily, Monthly, 5H Tokens
- Emoji system: `MODULE_EMOJI` map (per module key) + `STAT_EMOJI` map (per text stat), toggled via `emojis` config

### Styles
- **classic**: Two-line battery bars `[████░░░░]` with percentage overlays
- **capsule**: Single-line pill/capsule with distinct bg colors and severity dots
- **hairline**: Single-line with 3-cell mini bars `██▓` and `┊` separators
- **gradient**: Two-line like classic, but bar cells use interpolated gradient colors from s_ok→s_warn→s_hot based on fill position and severity level. Theme-aware via `lerpColor()`.

### CLI (`bin/cli.js`)
- `config set/get/reset` subcommands write to `~/.claude/glm-statusbar.json`
- Main path reads stdin from Claude Code, resolves config, calls formatter
- `--preview` renders all theme x style combinations with sample data
- `--no-emojis` disables emoji prefixes
- Installable via `npx glm-statusbar-themes` or local clone

### Bridge (`src/bridge.js`)
- Writes session state to `/tmp/claude-ctx-{session_id}.json`
- Used by GSD framework's context-monitor hook

## Key patterns
- All API functions return raw `https.request` promises (no fetch, no axios)
- `normalizeData()` in styles.js flattens context + usageData into one object
- Module `getPct()` returns `null` when data is unavailable → renders `--%`
- Config resolution: CLI flag > env var > config file > default
- `nextResetTime` from API is a unix ms timestamp, formatted as 12h AM/PM
- API returns hourly timestamps in CST (UTC+8) — `calculateRecentHoursTokens()` offsets to local time
- Context module `getExtra()` shows tokens used / window size (e.g. `136.0K / 200K`)
- Monthly API data is calendar month (not rolling 30 days)

## Testing
```bash
# Quick smoke test (local, no API)
echo '{}' | node bin/cli.js --local --theme dracula --style capsule

# Preview all combinations
node bin/cli.js --preview

# Test gradient style
echo '{}' | node bin/cli.js --local --theme synthwave --style gradient

# Test cost module
echo '{"model":{"id":"glm-5-1","display_name":"GLM-5-1"},"context_window":{"used_percentage":68,"context_window_size":200000,"current_usage":{"input_tokens":85000,"output_tokens":42000,"cache_creation_input_tokens":28000,"cache_read_input_tokens":5000}}}' | node bin/cli.js --local --theme neon --style classic

# Test emojis off
echo '{}' | node bin/cli.js --local --theme candy --style capsule --no-emojis

# Verify cache + API flow
node bin/cli.js --clear-cache && echo '{}' | node bin/cli.js
```
