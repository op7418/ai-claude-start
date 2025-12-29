# ai-claude-start

[![npm version](https://img.shields.io/npm/v/ai-claude-start.svg)](https://www.npmjs.com/package/ai-claude-start)
[![npm downloads](https://img.shields.io/npm/dm/ai-claude-start.svg)](https://www.npmjs.com/package/ai-claude-start)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

English | [简体中文](README_CN.md)

Multi-profile Claude Code launcher with secure credential management.

## Features

- **Simplified Configuration**: Only 3-4 fields needed - name, base URL, optional model, and token
- **Multi-Profile Support**: Manage multiple API configurations (Anthropic, Moonshot, BigModel, or custom)
- **Secure Credential Storage**: Uses `keytar` for OS-level secure storage, with automatic fallback to local file storage
- **Environment Sanitization**: Cleans all `ANTHROPIC_*` variables before injection to prevent conflicts
- **Unified Authentication**: Always uses `ANTHROPIC_AUTH_TOKEN` for credentials
- **Interactive Setup**: Guided wizard with 3 built-in presets
- **Interactive Selection**: Shows a selection menu when multiple profiles are configured
- **Model Configuration**: Optional model name configuration, automatically passed to Claude CLI
- **Testing Support**: Built-in `--cmd` flag and `CLAUDE_CMD` environment variable for testing without Claude CLI

## Installation

```bash
npm install -g ai-claude-start
```

Or use directly with `npx`:

```bash
npx ai-claude-start
```

## Quick Start

### 1. First-time Setup

Run the setup wizard to create your first profile:

```bash
ai-claude-start setup
```

You'll be guided through selecting a preset (Anthropic, Moonshot, IMDS) or creating a custom profile.

### 2. Launch Claude

**With interactive selection** (multiple profiles):
```bash
claude-start
# Shows selection menu:
# ? Select a profile to use:
# ❯ anthropic (default)
#   moonshot
#   bigmodel
```

**Auto-select** (single profile):
```bash
claude-start
# Automatically uses the only profile
```

**Specify profile directly**:
```bash
claude-start my-profile
```

**Quick profile syntax** (shorthand):
```bash
claude-start -moonshot           # Use -profilename syntax
claude-start -bigmodel --version # Combine with Claude arguments
```

**Pass arguments to Claude**:
```bash
claude-start my-profile --version
claude-start --help  # Shows selection, then passes --help
```

## Commands

### `setup`
Interactive wizard to create or update a profile.

```bash
ai-claude-start setup
```

### `list`
Display all configured profiles with their settings and credential status.

```bash
ai-claude-start list
```

### `default <name>`
Set the default profile to use when no profile is specified.

```bash
ai-claude-start default my-profile
```

### `delete <name>`
Delete a profile and its stored credentials.

```bash
ai-claude-start delete my-profile
```

### `doctor`
Check system health: keytar availability, profiles, credentials, and Claude CLI presence.

```bash
ai-claude-start doctor
```

## Profile Configuration

A profile consists of 3-4 fields:

```typescript
{
  name: string;           // Unique identifier
  baseUrl: string;        // API base URL
  model?: string;         // Optional model name
  token: string;          // ANTHROPIC_AUTH_TOKEN (stored securely)
}
```

### Built-in Presets

1. **Anthropic** (Official)
   - Base URL: `https://api.anthropic.com`
   - Model: `claude-sonnet-4-5-20250929`
   - Use: Official Anthropic API

2. **Moonshot**
   - Base URL: `https://api.moonshot.cn/anthropic`
   - Model: `moonshot-v1-8k`
   - Use: Moonshot API (Anthropic-compatible)

3. **BigModel (智谱)**
   - Base URL: `https://open.bigmodel.cn/api/anthropic`
   - Model: `glm-4-plus`
   - Use: 智谱清言 API (Anthropic-compatible)

4. **Custom**
   - Define your own base URL and model
   - Any Anthropic-compatible API

## Environment Handling

### Sanitization
When launching Claude, all existing `ANTHROPIC_*` environment variables are removed to prevent conflicts.

### Injection
Two environment variables are set:
- `ANTHROPIC_AUTH_TOKEN`: Your credential (always)
- `ANTHROPIC_BASE_URL`: The base URL (only if not the default Anthropic URL)

Example for Moonshot:
```bash
ANTHROPIC_AUTH_TOKEN=your-moonshot-token
ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
```

### Model Configuration
If a model is configured in the profile, the `--model` parameter is automatically added:
```bash
claude --model glm-4-plus [other arguments...]
```

## Testing Without Claude CLI

For testing or development without the actual Claude CLI installed:

### Using `--cmd` Flag

```bash
ai-claude-start --cmd "node -e 'console.log(process.env.ANTHROPIC_API_KEY)'"
```

### Using `CLAUDE_CMD` Environment Variable

```bash
export CLAUDE_CMD="node -e 'console.log(process.env.ANTHROPIC_API_KEY)'"
ai-claude-start
```

This is useful for:
- Testing credential injection
- Debugging environment setup
- CI/CD pipelines
- Development without Claude CLI

## Security

### Keytar (Preferred)
When available, credentials are stored in your operating system's secure keychain:
- **macOS**: Keychain
- **Windows**: Credential Vault
- **Linux**: Secret Service API (libsecret)

### File Fallback
If `keytar` is unavailable (e.g., missing system dependencies), credentials are stored in:

```
~/.ai-claude-profiles.json
```

**⚠️ Warning**: Fallback mode stores credentials in **plaintext**. The tool will display a warning when using this mode.

To enable secure storage, ensure your system has the required dependencies for `keytar`.

## Development

### Setup

```bash
git clone <repository-url>
cd ai-claude-start
npm install
npm run build
npm link
```

### Running Tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Safe Local Testing

To test without affecting your real Claude Code configuration:

```bash
# Use isolated config file
export AI_CLAUDE_CONFIG_PATH="/tmp/test-config.json"

# Now all commands use the test config
ai-claude-start setup
ai-claude-start list
ai-claude-start doctor

# Clean up
rm /tmp/test-config.json
unset AI_CLAUDE_CONFIG_PATH
```

Or run the safe demo script:

```bash
./demo-safe.sh
```

See [TESTING.md](TESTING.md) for comprehensive testing strategies.

## Project Structure

```
ai-claude-start/
├── src/
│   ├── types.ts          # Type definitions and presets
│   ├── storage.ts        # Configuration and credential management
│   ├── commands.ts       # CLI command implementations
│   ├── executor.ts       # Claude execution and environment handling
│   ├── cli.ts            # Main CLI entry point
│   ├── executor.test.ts  # Tests for executor
│   └── storage.test.ts   # Tests for storage
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── LICENSE
├── README.md
├── README_CN.md          # Chinese documentation
└── Other docs...
```

## Documentation

- [SIMPLE_GUIDE.md](SIMPLE_GUIDE.md) - Simplified usage guide
- [MODEL_CONFIG.md](MODEL_CONFIG.md) - Model configuration guide
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Usage examples
- [TESTING.md](TESTING.md) - Testing strategies
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Troubleshooting guide
- [CHANGELOG.md](CHANGELOG.md) - Change log

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

### "keytar not available" Warning

If you see this warning, `keytar` couldn't be loaded. Credentials will be stored in plaintext. To fix:

**macOS**: Usually works out of the box
**Linux**: Install `libsecret-1-dev`:
```bash
sudo apt-get install libsecret-1-dev  # Debian/Ubuntu
sudo yum install libsecret-devel      # Fedora/RHEL
```

**Windows**: Usually works out of the box

Then reinstall:
```bash
npm install -g ai-claude-start --force
```

### "Claude CLI not found"

The tool requires the Claude CLI to be installed and in your PATH. Install it from [https://claude.ai](https://claude.ai) or use the `--cmd` flag for testing.

### Profile Not Found

Run `ai-claude-start list` to see available profiles, or `ai-claude-start setup` to create a new one.

### Environment Variable Verification

Verify that environment variables are correctly injected:

```bash
ai-claude-start profile-name --cmd "node -e \"console.log('Token:', process.env.ANTHROPIC_AUTH_TOKEN ? 'SET' : 'NOT SET'); console.log('URL:', process.env.ANTHROPIC_BASE_URL)\""
```

Should output:
```
Token: SET
URL: https://api.moonshot.cn/anthropic  (if not default URL)
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more troubleshooting information.

## Usage Examples

### Configure Multiple APIs

```bash
# Configure Anthropic official
ai-claude-start setup
# Choose: Anthropic
# Name: anthropic
# Token: [your Anthropic API key]

# Configure Moonshot
ai-claude-start setup
# Choose: Moonshot
# Name: moonshot
# Token: [your Moonshot API key]

# Configure BigModel
ai-claude-start setup
# Choose: BigModel (智谱)
# Name: bigmodel
# Model: glm-4-plus (or leave empty for default)
# Token: [your BigModel API key]
```

### Switch Between APIs

```bash
# Method 1: Interactive selection
claude-start
? Select a profile to use:
❯ anthropic (default)
  moonshot
  bigmodel

# Method 2: Direct specification
claude-start moonshot      # Use Moonshot
claude-start bigmodel      # Use BigModel
claude-start anthropic     # Use Anthropic

# Method 3: Quick syntax (shorthand)
claude-start -moonshot     # Use -profilename
claude-start -bigmodel     # Faster typing
```

### Set Default Profile

```bash
# Set the most commonly used as default
ai-claude-start default moonshot

# Now direct run will use moonshot by default
claude-start
```

### Create Aliases for Quick Switching

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Quick launch specific profiles
alias claude-cn="claude-start moonshot"
alias claude-zp="claude-start bigmodel"
alias claude-official="claude-start anthropic"

# Usage
claude-cn        # Use Moonshot (China)
claude-zp        # Use BigModel (智谱)
claude-official  # Use Anthropic official
```

See [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for more real-world usage scenarios.
