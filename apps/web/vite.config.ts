import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

interface ParsedSpecItem {
  id: string;
  title: string;
  type: string;
  status: string;
  tags: string[];
  created?: string;
  filePath: string;
}

// YAML フロントマター (--- ... ---) の簡易パーサー（外部依存なし）
const parseFrontmatter = (markdown: string): Record<string, string | string[]> => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return {};

  const result: Record<string, string | string[]> = {};
  const lines = match[1].split(/\r?\n/);
  let currentListKey: string | null = null;

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem?.[1] && currentListKey) {
      const prev = result[currentListKey];
      const arr = Array.isArray(prev) ? prev : [];
      arr.push(listItem[1].replace(/^['"]|['"]$/g, '').trim());
      result[currentListKey] = arr;
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv?.[1]) {
      const key = kv[1].trim();
      const val = (kv[2] ?? '').trim();
      if (val === '') {
        currentListKey = key;
        result[key] = [];
      } else {
        currentListKey = null;
        result[key] = val.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return result;
};

// docs/ 配下の Markdown ファイルを再帰走査して public/specs-manifest.json を生成
const generateSpecsManifest = (docsRoot: string, outFile: string): ParsedSpecItem[] => {
  const items: ParsedSpecItem[] = [];

  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relPath = path.relative(path.resolve(docsRoot, '..'), fullPath).replace(/\\/g, '/');
        const content = fs.readFileSync(fullPath, 'utf-8');
        const fm = parseFrontmatter(content);
        const h1Match = content.match(/^#\s+(.+)$/m);
        const title =
          (typeof fm.title === 'string' && fm.title) ||
          h1Match?.[1]?.trim() ||
          entry.name.replace(/\.md$/, '');
        const id = `DOC-${relPath.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}`;

        items.push({
          id,
          title,
          type: typeof fm.type === 'string' ? fm.type : 'document',
          status: typeof fm.status === 'string' ? fm.status : 'active',
          tags: Array.isArray(fm.tags) ? fm.tags : [],
          created: typeof fm.created === 'string' ? fm.created : undefined,
          filePath: relPath,
        });
      }
    }
  };

  walk(docsRoot);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ syncedAt: new Date().toISOString(), items }, null, 2));
  return items;
};

const obsidianDocsSyncPlugin = (): Plugin => {
  const docsDir = path.resolve(__dirname, '../../docs');
  const manifestPath = path.resolve(__dirname, 'public/specs-manifest.json');

  return {
    name: 'obsidian-docs-sync',
    buildStart() {
      generateSpecsManifest(docsDir, manifestPath);
    },
    configureServer(server) {
      generateSpecsManifest(docsDir, manifestPath);
      server.watcher.add(docsDir);
      const onDocsChange = (changedPath: string) => {
        if (changedPath.endsWith('.md')) {
          generateSpecsManifest(docsDir, manifestPath);
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.on('change', onDocsChange);
      server.watcher.on('add', onDocsChange);
      server.watcher.on('unlink', onDocsChange);
    },
  };
};

export default defineConfig({
  plugins: [react(), obsidianDocsSyncPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
