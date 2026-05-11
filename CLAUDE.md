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
- 6 metric modules, each with `getPct(data)` and `getExtra(data)`
- Config `modules` array selects which modules render as progress bars
- Default: `["5h", "ctx"]`
- `resolveModules()` maps config keys to module objects

### Rendering layer (`src/themes.js`, `src/styles.js`, `src/formatter.js`)
- 9 themes (pure RGB palettes) x 3 styles (layout renderers) = 27 combinations
- 24-bit true color ANSI (`\033[38;2;R;G;Bm`)
- Severity coloring: `< warning` → ok, `< critical` → warn, `>= critical` → hot
- Styles iterate over resolved modules dynamically (no hardcoded metrics)
- All three styles show the same text stats: Model, Session, Daily, Monthly, 5H Tokens

### CLI (`bin/cli.js`)
- `config set/get/reset` subcommands write to `~/.claude/glm-statusbar.json`
- Main path reads stdin from Claude Code, resolves config, calls formatter
- `--preview` renders all 27 combinations with sample data
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

## Testing
```bash
# Quick smoke test (local, no API)
echo '{}' | node bin/cli.js --local --theme dracula --style capsule

# Preview all combinations
node bin/cli.js --preview

# Verify cache + API flow
node bin/cli.js --clear-cache && echo '{}' | node bin/cli.js
```
