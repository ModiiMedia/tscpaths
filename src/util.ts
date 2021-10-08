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
  baseUrl?: string;
  outDir?: string;
  paths?: { [key: string]: string[] };
}

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

export const loadConfig = async (file: string): Promise<ITSConfig> => {
  const configFile = await load(file);
  const configParams = configFile.config;
  console.log(configParams);
  const config: ITSConfig = {
    baseUrl: configParams?.compilerOptions?.baseUrl,
    outDir: configParams?.compilerOptions?.outDir,
    paths: configParams?.compilerOptions?.paths,
  };

  if (configParams?.extends) {
    const parentConfig = loadConfig(
      resolve(dirname(file), configParams.extends as string)
    );
    return {
      ...parentConfig,
      ...config,
    };
  }

  return config;
};
