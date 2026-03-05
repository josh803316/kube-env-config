import chalk from 'chalk';

const DEBUG = process.env.KEC_DEBUG === '1';

export const logger = {
  info: (msg: string, ...args: unknown[]) => console.log(chalk.blue('ℹ'), msg, ...args),
  success: (msg: string, ...args: unknown[]) => console.log(chalk.green('✓'), msg, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn(chalk.yellow('⚠'), msg, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(chalk.red('✗'), msg, ...args),
  debug: (msg: string, ...args: unknown[]) => {
    if (DEBUG) console.log(chalk.gray('[debug]'), msg, ...args);
  },
};
