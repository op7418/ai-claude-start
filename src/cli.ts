#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import {
  setupProfile,
  listProfiles,
  setDefaultProfile,
  deleteProfile,
  doctor
} from './commands.js';
import { executeWithProfile } from './executor.js';
import { readConfig } from './storage.js';

const program = new Command();

program
  .name('ai-claude-start')
  .description('Multi-profile Claude CLI launcher with secure credential management')
  .version('1.0.0')
  .option('--cmd <binary>', 'Custom command to run instead of claude (for testing)');

program
  .command('setup')
  .description('Setup a new profile (interactive wizard)')
  .action(async () => {
    await setupProfile();
  });

program
  .command('list')
  .description('List all configured profiles')
  .action(async () => {
    await listProfiles();
  });

program
  .command('default <name>')
  .description('Set the default profile')
  .action(async (name: string) => {
    await setDefaultProfile(name);
  });

program
  .command('delete <name>')
  .description('Delete a profile')
  .action(async (name: string) => {
    await deleteProfile(name);
  });

program
  .command('doctor')
  .description('Check system health and configuration')
  .action(async () => {
    await doctor();
  });

// Handle direct execution: claude-start [profile] [args...]
// or: claude-start [args...] (uses default profile)
// or: claude-start [ai-claude-args] -- [claude-args]
program.action(async (options, cmd) => {
  const args = process.argv.slice(2);

  // If no arguments, check if we have any profiles
  if (args.length === 0) {
    const config = readConfig();
    if (config.profiles.length === 0) {
      console.log(chalk.yellow('No profiles configured.'));
      console.log(chalk.blue('Run "ai-claude-start setup" to create your first profile.\n'));
      program.help();
      return;
    }
  }

  // Check if first arg is a subcommand
  const subcommands = ['setup', 'list', 'default', 'delete', 'doctor'];
  if (args.length > 0 && subcommands.includes(args[0])) {
    // Let commander handle it
    return;
  }

  // Support -- separator like dlv: everything before -- is for ai-claude-start,
  // everything after -- is passed directly to claude
  const doubleDashIndex = args.indexOf('--');

  let profileName: string | undefined;
  let claudeArgs: string[];

  if (doubleDashIndex >= 0) {
    // Using -- separator
    const aiArgs = args.slice(0, doubleDashIndex);
    claudeArgs = args.slice(doubleDashIndex + 1);

    // Check if first arg in ai-claude-start section is a profile name
    const config = readConfig();
    const firstArgIsProfile = aiArgs.length > 0 && config.profiles.some((p) => p.name === aiArgs[0]);

    if (firstArgIsProfile) {
      profileName = aiArgs[0];
    } else {
      profileName = undefined; // Use default
    }
  } else {
    // No -- separator, use original logic
    const config = readConfig();
    const firstArgIsProfile = args.length > 0 && config.profiles.some((p) => p.name === args[0]);

    if (firstArgIsProfile) {
      profileName = args[0];
      claudeArgs = args.slice(1);
    } else {
      profileName = undefined; // Use default
      claudeArgs = args;
    }
  }

  await executeWithProfile(profileName, claudeArgs);
});

program.parse();
