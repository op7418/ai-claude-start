import { spawn } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readConfig, getCredential } from './storage.js';
import type { Profile } from './types.js';

/**
 * Build --settings argument for claude CLI
 * Uses --settings to set env vars with higher priority than environment variables
 * This allows overriding settings.json in code repositories
 */
export function buildSettingsArg(
  profile: Profile,
  credential: string
): string {
  const settings: { env: Record<string, string> } = {
    env: {
      ANTHROPIC_AUTH_TOKEN: credential
    }
  };

  // Set base URL if not default Anthropic
  if (profile.baseUrl !== 'https://api.anthropic.com') {
    settings.env.ANTHROPIC_BASE_URL = profile.baseUrl;
  }

  return JSON.stringify(settings);
}

/**
 * Execute claude command with profile
 */
export async function executeWithProfile(
  profileName: string | undefined,
  args: string[]
): Promise<void> {
  const config = readConfig();

  // Determine which profile to use
  let targetProfile: Profile | undefined;

  if (profileName) {
    // Profile specified in command line
    targetProfile = config.profiles.find((p) => p.name === profileName);
    if (!targetProfile) {
      console.error(chalk.red(`Profile "${profileName}" not found.`));
      console.log(chalk.yellow('Run "ai-claude-start list" to see available profiles.'));
      process.exit(1);
    }
  } else {
    // No profile specified, show interactive selection
    if (config.profiles.length === 0) {
      console.error(chalk.red('No profiles configured.'));
      console.log(chalk.yellow('Run "ai-claude-start setup" to create a profile.'));
      process.exit(1);
    }

    if (config.profiles.length === 1) {
      // Only one profile, use it automatically
      targetProfile = config.profiles[0];
      console.log(chalk.blue(`Using profile: ${chalk.bold(targetProfile.name)}`));
    } else {
      // Multiple profiles, show selection menu
      const { selectedProfile } = await inquirer.prompt<{ selectedProfile: string }>([
        {
          type: 'list',
          name: 'selectedProfile',
          message: 'Select a profile to use:',
          choices: config.profiles.map((p) => ({
            name: p.name === config.defaultProfile
              ? `${p.name} ${chalk.green('(default)')}`
              : p.name,
            value: p.name
          })),
          default: config.defaultProfile
        }
      ]);

      targetProfile = config.profiles.find((p) => p.name === selectedProfile);
      if (!targetProfile) {
        console.error(chalk.red(`Profile "${selectedProfile}" not found.`));
        process.exit(1);
      }
    }
  }

  // Get credential
  const credential = await getCredential(targetProfile.name);
  if (!credential) {
    console.error(
      chalk.red(`No credential found for profile "${targetProfile.name}".`)
    );
    console.log(chalk.yellow('Run "ai-claude-start setup" to configure credentials.'));
    process.exit(1);
  }

  // Build --settings argument with higher priority than environment variables
  const settingsJson = buildSettingsArg(targetProfile, credential);
  // Wrap JSON in single quotes for shell compatibility
  const settingsArg = `'${settingsJson}'`;

  // Determine command to run
  const cmdBinary = process.env.CLAUDE_CMD || args.find((arg) => arg === '--cmd')
    ? args[args.indexOf('--cmd') + 1]
    : 'claude';

  // Filter out --cmd and its value from args
  let claudeArgs = args;
  const cmdIndex = args.indexOf('--cmd');
  if (cmdIndex >= 0) {
    claudeArgs = [...args.slice(0, cmdIndex), ...args.slice(cmdIndex + 2)];
  }

  // Add --settings parameter at the beginning (before other args for proper parsing)
  claudeArgs = ['--settings', settingsArg, ...claudeArgs];

  // Add --model parameter if profile has model configured and not already specified
  if (targetProfile.model && !claudeArgs.includes('--model')) {
    claudeArgs = ['--model', targetProfile.model, ...claudeArgs];
  }

  console.log(
    chalk.blue(`🚀 Launching with profile: ${chalk.bold(targetProfile.name)}`)
  );
  if (targetProfile.model) {
    console.log(chalk.blue(`   Model: ${targetProfile.model}`));
  }

  // Execute - use process.env directly (settings will override env vars via --settings)
  const child = spawn(cmdBinary, claudeArgs, {
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (error) => {
    console.error(chalk.red(`Failed to execute command: ${error.message}`));
    process.exit(1);
  });
}
