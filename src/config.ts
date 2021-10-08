import { dirname, resolve } from 'path';
import { load } from 'tsconfig';

/*
"baseUrl": ".",
"outDir": "lib",
"paths": {
  "src/*": ["src/*"]
},
*/

export interface IRawTSConfig {
    extends?: string;
    compilerOptions?: {
        baseUrl?: string;
        outDir?: string;
        paths?: { [key: string]: string[] };
    };
}

export interface ITSConfig {
    baseUrl: string;
    outDir: string;
    paths: { [key: string]: string[] };
}

export type PartialITSConfig = Partial<ITSConfig>;

export const mapPaths = (
    paths: { [key: string]: string[] },
    // eslint-disable-next-line no-unused-vars
    mapper: (x: string) => string
): { [key: string]: string[] } => {
    const dest = {} as { [key: string]: string[] };
    Object.keys(paths).forEach((key) => {
        dest[key] = paths[key].map(mapper);
    });
    return dest;
};

export const validateConfig = (config: PartialITSConfig): ITSConfig => {
    const { baseUrl, outDir, paths } = config;

    if (!baseUrl) {
        throw new Error('compilerOptions.baseUrl is not set');
    }
    if (!paths) {
        throw new Error('compilerOptions.paths is not set');
    }
    if (!outDir) {
        throw new Error('compilerOptions.outDir is not set');
    }
    return config as ITSConfig;
};

export const loadConfig = async (file: string): Promise<ITSConfig> => {
    const configFile = await load(file);
    const configParams = configFile.config as IRawTSConfig;
    let config: PartialITSConfig = {
        baseUrl: configParams?.compilerOptions?.baseUrl,
        outDir: configParams?.compilerOptions?.outDir,
        paths: configParams?.compilerOptions?.paths,
    };

    if (configParams?.extends) {
        const parentConfig = loadConfig(
            resolve(dirname(file), configParams.extends as string)
        );
        config = {
            ...parentConfig,
            ...config,
        };
    }
    return validateConfig(config);
};

export const getConfigAliases = (configDir: string, config: ITSConfig) => {
    const { paths, baseUrl } = config;
    const basePath = resolve(configDir, baseUrl);
    return Object.keys(paths)
        .map((alias) => ({
            prefix: alias.replace(/\*$/, ''),
            aliasPaths: paths[alias as keyof typeof paths].map((p) =>
                resolve(basePath, p.replace(/\*$/, ''))
            ),
        }))
        .filter(({ prefix }) => prefix);
};
