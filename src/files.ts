/* eslint-disable */
import fastGlob from 'fast-glob';
import { readFile, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { ITSConfig } from './config';
import { replaceBackslashes } from './strings';

export const getFiles = async (dir: string) => {
    const globStr = replaceBackslashes(
        `${resolve(dir)}/**/*.{js,jsx,ts,tsx}`,
        '/'
    );
    const files = await fastGlob(globStr, {
        dot: true,
        onlyFiles: true,
    });
    return files;
};

export const replaceImportStatement = (
    original: string,
    matched: any,
    config: ITSConfig
) => {};

export const replaceAliases = (text: string, config: ITSConfig) => {
    const requireRegex = /(?:import|require)\(['"]([^'"]*)['"]\)/g;
    const importRegex = /(?:import|from) ['"]([^'"]*)['"]/g;
    return text.replace(
        requireRegex,
        ''
        // replaceImportStatement(orig, matched, config)
    );
};

export const handleFile = async (file: string, config: ITSConfig) => {
    const text = await readFile(file, 'utf8');
    const newText = replaceAliases(text, config);
    await writeFile(file, newText);
};
