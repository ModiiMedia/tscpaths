#! /usr/bin/env node
/* eslint-disable */
/* eslint-disable no-console */
import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'fs-extra';
import fastGlob from 'fast-glob';
import { dirname, relative, resolve } from 'path';
import { getConfigAliases, loadConfig, validateConfig } from './config';
import initLogs from './logs';

const program = new Command();

program
    .version('0.0.1')
    .option('-p, --project <file>', 'path to tsconfig.json')
    .option('-s, --src <path>', 'source root path')
    .option('-o, --out <path>', 'output root path')
    .option('-v, --verbose', 'output logs');

program.on('--help', () => {
    console.log(`
  $ tscpath -p tsconfig.json
`);
});

program.parse(process.argv);

const { project, src, out, verbose } = program.opts() as {
    project?: string;
    src?: string;
    out?: string;
    verbose?: boolean;
};

const { verboseLog, log } = initLogs(verbose);

if (!project) {
    throw new Error('--project must be specified');
}
if (!src) {
    throw new Error('--src must be specified');
}
if (!out) {
    throw new Error('--out must be specified');
}

const main = async () => {
    const configPath = resolve(project);
    const config = await loadConfig(configPath);
    const srcRoot = resolve(src);
    const outRoot = resolve(out);
    log(`tscpaths --project ${configPath} --src ${srcRoot} --out ${outRoot}`);

    const { baseUrl, outDir, paths } = config;
    verboseLog(`baseUrl: ${baseUrl}`);
    verboseLog(`outDir: ${outDir}`);
    verboseLog(`paths: ${JSON.stringify(paths, null, 2)}`);

    const aliases = getConfigAliases(dirname(configPath), config);
    verboseLog(`aliases: ${JSON.stringify(aliases, null, 2)}`);

    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'];

    let replaceCount = 0;
};

main();
