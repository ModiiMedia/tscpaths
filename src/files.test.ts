import { ensureDir, ensureFile, remove } from 'fs-extra';
import { getFiles, toRelativePath } from './files';
import { ITSConfig } from './config';

const rootDir = './.temp/fileTests';
const files = [
    '1.ts',
    '1.tsx',
    '1.js',
    '1.jsx',
    '1.blarg.js',
    '1.cpp',
    '1.md',
    'subdir/2.ts',
    'subdir/2.blarg.ts',
    'subdir/2.cpp',
    'subdir/subsubdir/3.js',
];
beforeAll(async () => {
    await remove(rootDir);
    await ensureDir(`${rootDir}/subdir/subsubdir`);
    await ensureDir(`${rootDir}/out`);

    const tasks: Promise<unknown>[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
        tasks.push(ensureFile(`${rootDir}/${file}`));
    }
    await Promise.all(tasks);
});

// eslint-disable-next-line no-unused-vars
const config: ITSConfig = {
    outDir: './temp/fileTests/out',
    baseUrl: './temp/fileTests',
    paths: {
        '@helpers/*': ['src/helpers/*'],
        '@utils/*': ['src/helpers/utilities/*'],
    },
};

test('Get Files', async () => {
    const fileList = await getFiles(rootDir);
    expect(fileList.length).toBe(8);
});

describe('To Relative Path Conversion', () => {
    test('Import from subdirectory', () => {
        const path1 = 'C://Users/johndoe/Documents/my-project/src';
        const path2 =
            'C://Users/johndoe/Documents/my-project/src/utilities/strings';
        const path3 =
            'C://Users/johndoe/Documents/my-project/src/utilities/auth/models/users';
        const result1 = toRelativePath(path1, path2);
        const result2 = toRelativePath(path1, path3);
        expect(result1).toBe('./utilities/strings');
        expect(result2).toBe('./utilities/auth/models/users');
    });
    test('Import from parent directory', () => {
        const projectRoot = 'C://Users/johndoe/Documents/my-project';
        const path1 = `${projectRoot}/src/utilities/auth/models/users`;
        const path2 = `${projectRoot}/src/utilities/checkout`;
        const path3 = `${projectRoot}/src/utilities`;
        const result1 = toRelativePath(path1, path2);
        const result2 = toRelativePath(path1, path3);
        expect(result1).toBe('../../../checkout');
        expect(result2).toBe('../../..');
    });
});

// test('Replace Import Statements', () => {
//   const text = `import blarg from "@helpers/myBlarg/myBlargSubdir";
// import blarg2 from "@utils/myUtil;`;
//   const newText = replaceImportStatements(text, config);
//   expect(newText).toBe(
//     `import blarg from "${replaceBackslashes(
//       resolve('./.temp/out'),
//       '/'
//     )}/myBlarg/myBlargSubdir;
// import blarg2 from "${replaceBackslashes(resolve('./.temp/out'), '/')}/myUtil;"`
//   );
// });
