#!/bin/bash

echo "=== 测试 1: 无参数调用（应该显示 profile 选择或自动使用） ==="
echo "Running: node dist/cli.js --cmd echo"
node dist/cli.js --cmd "echo" "test" 2>&1 | head -n 10
echo ""

echo "=== 测试 2: --help 参数（应该显示帮助信息） ==="
echo "Running: node dist/cli.js --help"
node dist/cli.js --help 2>&1 | head -n 5
echo ""

echo "=== 测试 3: -h 参数（应该显示帮助信息） ==="
echo "Running: node dist/cli.js -h"
node dist/cli.js -h 2>&1 | head -n 5
echo ""

echo "=== 测试 4: list 子命令（应该列出 profiles） ==="
echo "Running: node dist/cli.js list"
node dist/cli.js list 2>&1
echo ""

echo "=== 测试 5: --version 参数（应该显示版本） ==="
echo "Running: node dist/cli.js --version"
node dist/cli.js --version 2>&1
echo ""
