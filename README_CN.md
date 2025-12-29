# ai-claude-start

[![npm version](https://badge.fury.io/js/ai-claude-start.svg)](https://www.npmjs.com/package/ai-claude-start)
[![npm downloads](https://img.shields.io/npm/dm/ai-claude-start.svg)](https://www.npmjs.com/package/ai-claude-start)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | 简体中文

多配置 Claude Code 启动器，支持安全的凭证管理。

## 特性

- **简化配置**：只需 3 个字段 - 名称、Base URL 和令牌
- **多配置支持**：管理多个 API 配置（Anthropic、Moonshot、BigModel 或自定义）
- **安全凭证存储**：使用 `keytar` 进行系统级安全存储，不可用时自动降级到本地文件存储
- **环境清洗**：注入前清除所有 `ANTHROPIC_*` 环境变量以防止冲突
- **统一认证**：始终使用 `ANTHROPIC_AUTH_TOKEN` 作为凭证
- **交互式设置**：带 3 个内置预设的向导式配置
- **交互式选择**：多个配置时显示选择菜单
- **模型配置**：可选的模型名称配置，自动传递给 Claude CLI
- **测试支持**：内置 `--cmd` 标志和 `CLAUDE_CMD` 环境变量，无需 Claude CLI 即可测试

## 安装

```bash
npm install -g ai-claude-start
```

或直接使用 `npx`：

```bash
npx ai-claude-start
```

## 快速开始

### 1. 首次设置

运行设置向导创建第一个配置：

```bash
ai-claude-start setup
```

你将被引导选择预设（Anthropic、Moonshot、BigModel）或创建自定义配置。

### 2. 启动 Claude

**交互式选择**（多个配置）：
```bash
claude-start
# 显示选择菜单：
# ? Select a profile to use:
# ❯ anthropic (default)
#   moonshot
#   bigmodel
```

**自动选择**（单个配置）：
```bash
claude-start
# 自动使用唯一的配置
```

**直接指定配置**：
```bash
claude-start my-profile
```

**快捷配置语法**（简写）：
```bash
claude-start -moonshot           # 使用 -配置名 语法
claude-start -bigmodel --version # 结合 Claude 参数
```

**传递参数给 Claude**：
```bash
claude-start my-profile --version
claude-start --help  # 显示选择，然后传递 --help
```

## 命令

### `setup`
设置新配置（交互式向导）。

```bash
ai-claude-start setup
```

### `list`
列出所有已配置的配置及其凭证状态。

```bash
ai-claude-start list
```

### `default <name>`
设置默认配置。

```bash
ai-claude-start default my-profile
```

### `delete <name>`
删除配置。

```bash
ai-claude-start delete my-profile
```

### `doctor`
检查系统健康和配置。

```bash
ai-claude-start doctor
```

## 配置结构

配置只包含 3-4 个字段：

```typescript
{
  name: string;           // 唯一标识符
  baseUrl: string;        // API 基础地址
  model?: string;         // 可选的模型名称
  token: string;          // ANTHROPIC_AUTH_TOKEN（安全存储）
}
```

### 内置预设

1. **Anthropic**（官方）
   - Base URL: `https://api.anthropic.com`
   - Model: `claude-sonnet-4-5-20250929`
   - 用途：Anthropic 官方 API

2. **Moonshot**
   - Base URL: `https://api.moonshot.cn/anthropic`
   - Model: `moonshot-v1-8k`
   - 用途：Moonshot API（兼容 Anthropic）

3. **BigModel (智谱)**
   - Base URL: `https://open.bigmodel.cn/api/anthropic`
   - Model: `glm-4-plus`
   - 用途：智谱清言 API（兼容 Anthropic）

4. **Custom（自定义）**
   - 定义你自己的 Base URL
   - 任何兼容 Anthropic 的 API

## 环境变量处理

### 清洗
启动 Claude 时，所有现有的 `ANTHROPIC_*` 环境变量都会被清除以防止冲突。

### 注入
设置两个环境变量：
- `ANTHROPIC_AUTH_TOKEN`：你的凭证（始终）
- `ANTHROPIC_BASE_URL`：Base URL（仅当不是默认 Anthropic URL 时）

Moonshot 示例：
```bash
ANTHROPIC_AUTH_TOKEN=your-moonshot-token
ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
```

### 模型配置
如果配置了模型，会自动添加 `--model` 参数：
```bash
claude --model glm-4-plus [其他参数...]
```

## 无需 Claude CLI 测试

用于测试或开发，无需安装实际的 Claude CLI：

### 使用 `--cmd` 标志

```bash
ai-claude-start --cmd "node -e 'console.log(process.env.ANTHROPIC_API_KEY)'"
```

### 使用 `CLAUDE_CMD` 环境变量

```bash
export CLAUDE_CMD="node -e 'console.log(process.env.ANTHROPIC_API_KEY)'"
ai-claude-start
```

用途：
- 测试凭证注入
- 调试环境设置
- CI/CD 流水线
- 无 Claude CLI 的开发

## 安全性

### Keytar（首选）
当可用时，凭证存储在操作系统的安全密钥链中：
- **macOS**：Keychain
- **Windows**：Credential Vault
- **Linux**：Secret Service API (libsecret)

### 文件降级
如果 `keytar` 不可用（例如，缺少系统依赖），凭证存储在：

```
~/.ai-claude-profiles.json
```

**⚠️ 警告**：降级模式以**明文**存储凭证。工具会在使用此模式时显示警告。

要启用安全存储，请确保你的系统具有 `keytar` 所需的依赖项。

## 开发

### 设置

```bash
git clone <repository-url>
cd ai-claude-start
npm install
npm run build
npm link
```

### 运行测试

```bash
npm test
```

### 构建

```bash
npm run build
```

### 安全本地测试

不影响真实 Claude Code 配置的测试：

```bash
# 使用隔离配置文件
export AI_CLAUDE_CONFIG_PATH="/tmp/test-config.json"

# 现在所有命令使用测试配置
ai-claude-start setup
ai-claude-start list
ai-claude-start doctor

# 清理
rm /tmp/test-config.json
unset AI_CLAUDE_CONFIG_PATH
```

或运行安全演示脚本：

```bash
./demo-safe.sh
```

查看 [TESTING.md](TESTING.md) 了解全面的测试策略。

## 项目结构

```
ai-claude-start/
├── src/
│   ├── types.ts          # 类型定义和预设
│   ├── storage.ts        # 配置和凭证管理
│   ├── commands.ts       # CLI 命令实现
│   ├── executor.ts       # Claude 执行和环境处理
│   ├── cli.ts            # 主 CLI 入口点
│   ├── executor.test.ts  # 执行器测试
│   └── storage.test.ts   # 存储测试
├── dist/                 # 编译的 JavaScript（生成）
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── LICENSE
├── README.md
├── README_CN.md          # 中文文档
└── 其他文档...
```

## 文档

- [SIMPLE_GUIDE.md](SIMPLE_GUIDE.md) - 简化使用指南
- [MODEL_CONFIG.md](MODEL_CONFIG.md) - 模型配置指南
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - 使用示例
- [TESTING.md](TESTING.md) - 测试策略
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 故障排查
- [CHANGELOG.md](CHANGELOG.md) - 更新日志

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 故障排查

### "keytar not available" 警告

如果看到此警告，`keytar` 无法加载。凭证将以明文存储。修复方法：

**macOS**：通常开箱即用
**Linux**：安装 `libsecret-1-dev`：
```bash
sudo apt-get install libsecret-1-dev  # Debian/Ubuntu
sudo yum install libsecret-devel      # Fedora/RHEL
```

**Windows**：通常开箱即用

然后重新安装：
```bash
npm install -g ai-claude-start --force
```

### "Claude CLI not found"

该工具需要安装 Claude CLI 并在 PATH 中。从 [https://claude.ai](https://claude.ai) 安装，或使用 `--cmd` 标志进行测试。

### 找不到配置

运行 `ai-claude-start list` 查看可用配置，或 `ai-claude-start setup` 创建新配置。

### 环境变量验证

验证环境变量是否正确注入：

```bash
ai-claude-start profile-name --cmd "node -e \"console.log('Token:', process.env.ANTHROPIC_AUTH_TOKEN ? 'SET' : 'NOT SET'); console.log('URL:', process.env.ANTHROPIC_BASE_URL)\""
```

应该看到：
```
Token: SET
URL: https://api.moonshot.cn/anthropic  （如果不是默认 URL）
```

更多故障排查信息，请参阅 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)。

## 使用示例

### 配置多个 API

```bash
# 配置 Anthropic 官方
ai-claude-start setup
# 选择：Anthropic
# 名称：anthropic
# 令牌：[你的 Anthropic API 密钥]

# 配置 Moonshot
ai-claude-start setup
# 选择：Moonshot
# 名称：moonshot
# 令牌：[你的 Moonshot API 密钥]

# 配置智谱
ai-claude-start setup
# 选择：BigModel (智谱)
# 名称：bigmodel
# 模型：glm-4-plus（或留空使用默认）
# 令牌：[你的智谱 API 密钥]
```

### 切换使用

```bash
# 方式 1：交互式选择
claude-start
? Select a profile to use:
❯ anthropic (default)
  moonshot
  bigmodel

# 方式 2：直接指定
claude-start moonshot      # 使用 Moonshot
claude-start bigmodel      # 使用智谱
claude-start anthropic     # 使用 Anthropic

# 方式 3：快捷语法（简写）
claude-start -moonshot     # 使用 -配置名
claude-start -bigmodel     # 输入更快
```

### 设置默认配置

```bash
# 设置常用的为默认
ai-claude-start default moonshot

# 现在直接运行会优先使用 moonshot
claude-start
```

### 创建别名快速切换

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# 快速启动特定配置
alias claude-cn="claude-start moonshot"
alias claude-zp="claude-start bigmodel"
alias claude-official="claude-start anthropic"

# 使用
claude-cn        # 使用 Moonshot（国内）
claude-zp        # 使用智谱
claude-official  # 使用 Anthropic 官方
```

查看 [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) 了解更多实际使用场景。
