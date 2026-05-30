import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const rootfile = join(import.meta.dir, '../src/api/base/_root.ts');
const rootContent = await readFile(rootfile, 'utf-8');

const middlewareDir = join(import.meta.dir, '../src/api/middleware');
const moduleDir = join(import.meta.dir, '../src/api/module');

const files = await readdir(middlewareDir);

const importLib = {
  'middleware-import': [] as string[],
  'middleware-use': [] as string[],
  'module-import': [] as string[],
  'module-use': [] as string[],
};

for (const file of files.sort()) {
  if (!file.endsWith('.mid.ts')) continue;

  const mod = await import(join(middlewareDir, file));
  if (mod.default) {
    importLib['middleware-import'].push(
      `import ${file.replace('.mid.ts', '')}Middleware from "../middleware/${file.replace('.ts', '')}";`,
    );
    importLib['middleware-use'].push(`.use(${file.replace('.mid.ts', '')}Middleware)`);
  }
}

// Scan module directories for router.ts with export default
const moduleDirs = await readdir(moduleDir, { withFileTypes: true });
for (const dir of moduleDirs) {
  if (!dir.isDirectory()) continue;

  const routerPath = join(moduleDir, dir.name, 'router.ts');
  try {
    const mod = await import(routerPath);
    if (mod.default) {
      const name = dir.name + 'Router';
      importLib['module-import'].push(`import ${name} from "../module/${dir.name}/router";`);
      importLib['module-use'].push(`.group("/${dir.name}", (g) => g.use(${name}))`);
    }
  } catch {
    // router.ts doesn't exist or can't be imported, skip
  }
}

function replaceFlag(flag: string, value: string[], content: string) {
  const space = flag.includes('-use') ? '\t' : ''
  let [str1, str2] = content.split(`//[start:${flag}]`);
  str2 = str2.split(`//[end:${flag}]`)[1];
  return str1 + `//[start:${flag}]\n` + value.map(v => space + v).join('\n') + `\n${space}//[end:${flag}]` + str2;
}

let content = rootContent;
Object.entries(importLib).forEach(([key, value]) => {
  content = replaceFlag(key, value, content);
});

if (content !== rootContent) {
  await writeFile(rootfile, content);
}
