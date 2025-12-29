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

// Custom argument parsing to handle -profile syntax and unknown options
const rawArgs = process.argv.slice(2);
const subcommands = ['setup', 'list', 'default', 'delete', 'doctor'];

// Determine if we should let Commander parse (subcommands or help/version flags)
const needsCommanderParsing =
  (rawArgs.length > 0 && subcommands.includes(rawArgs[0])) ||
  rawArgs.includes('-h') ||
  rawArgs.includes('--help') ||
  rawArgs.includes('-V') ||
  rawArgs.includes('--version');

if (needsCommanderParsing) {
  program.parse();
} else {
  // Handle direct execution with custom parsing
  (async () => {
    const config = readConfig();

    // If no profiles configured
    if (config.profiles.length === 0) {
      console.log(chalk.yellow('No profiles configured.'));
      console.log(chalk.blue('Run "ai-claude-start setup" to create your first profile.\n'));
      program.help();
      return;
    }

    // Parse arguments to extract profile name and Claude args
    let profileName: string | undefined;
    let claudeArgs: string[];
    let argsToProcess = [...rawArgs];

    // Check for -profile syntax (e.g., -moonshot)
    if (argsToProcess.length > 0 && argsToProcess[0].startsWith('-')) {
      const potentialProfile = argsToProcess[0].substring(1); // Remove the leading -
      const profileExists = config.profiles.some((p) => p.name === potentialProfile);
      
      if (profileExists) {
        profileName = potentialProfile;
        argsToProcess = argsToProcess.slice(1); // Remove the -profile arg
      } else {
        // Not a valid profile, treat as regular arg for Claude
        profileName = undefined;
      }
    }
    // Check for regular profile name syntax (e.g., moonshot)
    else if (argsToProcess.length > 0 && config.profiles.some((p) => p.name === argsToProcess[0])) {
      profileName = argsToProcess[0];
      argsToProcess = argsToProcess.slice(1);
    } else {
      profileName = undefined; // Use default
    }

    claudeArgs = argsToProcess;

    await executeWithProfile(profileName, claudeArgs);
  })();
}
