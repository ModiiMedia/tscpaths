#! /usr/bin/env node

/* eslint-disable no-console */
import { Command } from 'commander';
import { existsSync, readFileSync, writeFile } from 'fs-extra';
import { dirname, relative, resolve } from 'path';
import { getConfigAliases, loadConfig } from './config';
import initLogs from './logs';
import { getFiles } from './files';

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

const verboseLog = initLogs(verbose);

if (!project) {
    throw new Error('--project must be specified');
}
if (!src) {
    throw new Error('--src must be specified');
}

const main = async () => {
    const configFile = resolve(project);
    const srcRoot = resolve(src);
    const outRoot = out && resolve(out);

    console.log(
        `tscpaths --project ${configFile} --src ${srcRoot} --out ${outRoot}`
    );

    const config = await loadConfig(configFile);
    const { baseUrl, outDir, paths } = config;
    verboseLog(`baseUrl: ${baseUrl}`);
    verboseLog(`outDir: ${outDir}`);
    verboseLog(`paths: ${JSON.stringify(paths, null, 2)}`);

    const configDir = dirname(configFile);

    const basePath = resolve(configDir, baseUrl);
    verboseLog(`basePath: ${basePath}`);

    const outPath = outRoot || resolve(basePath, outDir);
    verboseLog(`outPath: ${outPath}`);
    const outFileToSrcFile = (x: string): string =>
        resolve(srcRoot, relative(outPath, x));

    const aliases = getConfigAliases(configDir, config);
    verboseLog(`aliases: ${JSON.stringify(aliases, null, 2)}`);

    const toRelative = (from: string, x: string): string => {
        const rel = relative(from, x);
        return (rel.startsWith('.') ? rel : `./${rel}`).replace(/\\/g, '/');
    };

    const exts = ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'];

    let replaceCount = 0;

    const absToRel = (modulePath: string, outFile: string): string => {
        const alen = aliases.length;
        for (let j = 0; j < alen; j += 1) {
            const { prefix, aliasPaths } = aliases[j];

            if (modulePath.startsWith(prefix)) {
                const modulePathRel = modulePath.substring(prefix.length);
                const srcFile = outFileToSrcFile(outFile);
                const outRel = relative(basePath, outFile);
                verboseLog(
                    `${outRel} (source: ${relative(basePath, srcFile)}):`
                );
                verboseLog(`\timport '${modulePath}'`);
                const len = aliasPaths.length;
                for (let i = 0; i < len; i += 1) {
                    const apath = aliasPaths[i];
                    const moduleSrc = resolve(apath, modulePathRel);
                    if (
                        existsSync(moduleSrc) ||
                        exts.some((ext) => existsSync(moduleSrc + ext))
                    ) {
                        const rel = toRelative(dirname(srcFile), moduleSrc);
                        replaceCount += 1;
                        verboseLog(
                            `\treplacing '${modulePath}' -> '${rel}' referencing ${relative(
                                basePath,
                                moduleSrc
                            )}`
                        );
                        return rel;
                    }
                }
                console.log(`could not replace ${modulePath}`);
            }
        }
        return modulePath;
    };

    const requireRegex = /(?:import|require)\(['"]([^'"]*)['"]\)/g;
    const importRegex = /(?:import|from) ['"]([^'"]*)['"]/g;

    const replaceImportStatement = (
        orig: string,
        matched: string,
        outFile: string
    ): string => {
        const index = orig.indexOf(matched);
        return (
            orig.substring(0, index) +
            absToRel(matched, outFile) +
            orig.substring(index + matched.length)
        );
    };

    const replaceAlias = (text: string, outFile: string): string =>
        text
            .replace(requireRegex, (orig, matched) =>
                replaceImportStatement(orig, matched, outFile)
            )
            .replace(importRegex, (orig, matched) =>
                replaceImportStatement(orig, matched, outFile)
            );

    // import relative to absolute path
    console.log(outPath);
    const files = await getFiles(outPath);

    let changedFileCount = 0;

    const flen = files.length;
    const writeTasks: Promise<unknown>[] = [];
    for (let i = 0; i < flen; i += 1) {
        const file = files[i];
        const text = readFileSync(file, 'utf8');
        const prevReplaceCount = replaceCount;
        const newText = replaceAlias(text, file);
        if (text !== newText) {
            changedFileCount += 1;
            console.log(
                `${file}: replaced ${replaceCount - prevReplaceCount} paths`
            );
            writeTasks.push(writeFile(file, newText, 'utf8'));
        }
    }
    await Promise.all(writeTasks);

    console.log(`Replaced ${replaceCount} paths in ${changedFileCount} files`);
};

main();
