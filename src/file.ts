import fs from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { hrtime } from 'process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { gzip } from 'zlib';

import type { TEPGSource } from './epgs/utils';
import type { ISource } from './sources';
import { with_github_raw_url_proxy } from './sources';
import { m3u2txt } from './utils';

import { mergeByDateAndChannel, parseEpgXml, sanitizeChannelFileName } from './epgs/parser';

const gzipAsync = promisify(gzip);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * 假设你这个项目里，projectRoot 最终是项目根目录：
  E:\kuaipan\code\pages\iptv-sources

  • 开发运行时（tsx src/index.ts）
    __dirname 是 E:\kuaipan\code\pages\iptv-sources\src，.. 后就是根目录

  • 构建后运行时（node dist/index.js）
    __dirname 是 E:\kuaipan\code\pages\iptv-sources\dist，.. 后也还是根目录

  所以这三句在你当前结构下会稳定得到同一个 projectRoot。
 */
export const projectRoot = path.resolve(__dirname, '..');

export const createSubDirectory = async (...parts: string[]) => {
  const subDir = path.join(projectRoot, ...parts);
  await mkdir(subDir, { recursive: true });
  return subDir;
};

/**
 * 解析输出文件的完整路径，并确保其父目录存在。
 * f_name 允许带 `/` 分隔的文件夹前缀（如 `fmml/ipv6`），
 * 会被展开为 `<base>/fmml/ipv6.<ext>`。
 */
export const resolveOutputFile = async (baseDir: string, f_name: string, ext: string) => {
  const target = path.join(baseDir, ...f_name.split('/').filter(Boolean)) + ext;
  await mkdir(path.dirname(target), { recursive: true });
  return target;
};

/** 递归列出目录下所有文件（返回绝对路径），忽略子目录本身 */
const listFilesRecursive = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return fs.statSync(full).isDirectory() ? listFilesRecursive(full) : [full];
  });
};

export const getContent = async (src: ISource | TEPGSource) => {
  const now = hrtime.bigint();
  const url = /^https:\/\/raw.githubusercontent.com\//.test(src.url)
    ? with_github_raw_url_proxy(src.url)
    : src.url;

  const res = await fetch(url);
  return [res.ok, await res.text(), now];
};

export const writeM3u = async (name: string, m3u: string) => {
  const m3uDir = await createSubDirectory('m3u');
  await writeFile(await resolveOutputFile(m3uDir, name, '.m3u'), m3u);
};

export const writeSources = async (
  name: string,
  f_name: string,
  sources: Map<string, string[]>
) => {
  const srcs: Record<string, string[]> = {};
  for (const [k, v] of sources) {
    srcs[k] = v;
  }

  const sourcesDir = await createSubDirectory('m3u', 'sources');
  await writeFile(
    await resolveOutputFile(sourcesDir, f_name, '.json'),
    JSON.stringify({
      name,
      sources: srcs,
    })
  );
};

export const writeM3uToTxt = async (name: string, f_name: string, m3u: string) => {
  const m3uArray = m3u.split('\n');
  const txt = m3u2txt(m3uArray);

  const txtDir = await createSubDirectory('m3u', 'txt');
  await writeFile(await resolveOutputFile(txtDir, f_name, '.txt'), txt);
};

export const mergeTxts = () => {
  const txts_p = path.resolve('m3u', 'txt');

  const files = listFilesRecursive(txts_p).filter((f) => path.extname(f) === '.txt');

  const txts = files.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');

  fs.writeFileSync(path.join(txts_p, 'merged.txt'), txts);
};

export const mergeSources = () => {
  const sources_p = path.resolve('m3u', 'sources');
  type Source = Record<string, string[]>; // 频道/分类名 -> URL 数组
  const files = listFilesRecursive(sources_p).filter((f) => path.extname(f) === '.json');

  const res = {
    name: 'Sources',
    sources: {} as Source,
  };

  files.forEach((f) => {
    const so = JSON.parse(fs.readFileSync(f, 'utf-8')).sources;

    Object.keys(so).forEach((k) => {
      if (!res.sources[k]) {
        res.sources[k] = so[k];
      } else {
        res.sources[k] = [...new Set([...res.sources[k], ...so[k]])];
      }
    });
  });

  fs.writeFileSync(path.join(sources_p, 'sources.json'), JSON.stringify(res));
};

export const writeEpgXML = async (f_name: string, xml: string) => {
  const epgDir = await createSubDirectory('m3u', 'epg');
  await writeFile(path.join(epgDir, `${f_name}.xml`), xml);
};

export const writeEpgXmlGz = async (f_name: string, xml: string) => {
  const epgDir = await createSubDirectory('m3u', 'epg');
  const compressedXml = await gzipAsync(xml);
  await writeFile(path.join(epgDir, `${f_name}.xml.gz`), compressedXml);
};
export async function makeEpgDir() {
  return await createSubDirectory('m3u', 'epg');
}
/**
 * 将单份 XMLTV XML 解析为 TVBox 所需的按日期、频道 JSON 文件
 * 输出路径: m3u/epg/{provider}/{YYYY-MM-DD}/{频道名}.json
 */
export const writeEpgJsonFromXml = async (provider: string, xml: string) => {
  const epgDir = await makeEpgDir();

  const allItems = parseEpgXml(xml);
  const byDateChannel = mergeByDateAndChannel(allItems);
  console.log(
    `[TASK] Merge EPG JSON (${provider}) by date and channel, total ${byDateChannel.size} items`
  );
  for (const [key, data] of byDateChannel) {
    const [date, channel] = key.split('\t');
    const dateDir = path.join(epgDir, provider, date);
    await mkdir(dateDir, { recursive: true });
    const fileName = `${sanitizeChannelFileName(channel)}.json`;
    fs.writeFileSync(path.join(dateDir, fileName), JSON.stringify(data, null, 2));
    console.log(`[TASK] Write EPG JSON for ${provider} ${date} ${channel}`);
  }
};

/**
 * 解析 m3u/epg 下所有 .xml，按日期(YYYYmmdd)、频道生成 JSON 到 epg/{provider}/{date}/channelname.json
 */
export const writeEpgJsonByDate = async () => {
  const epgDir = path.join(projectRoot, 'm3u', 'epg');
  if (!fs.existsSync(epgDir)) return;

  const files = fs.readdirSync(epgDir);
  const xmlFiles = files.filter(
    (f) => path.extname(f) === '.xml' && fs.statSync(path.join(epgDir, f)).isFile()
  );

  for (const f of xmlFiles) {
    const provider = f.split('.')[0];
    const xml = fs.readFileSync(path.join(epgDir, f), 'utf-8');
    await writeEpgJsonFromXml(provider, xml);
  }
};

const cleanDir = (p: string) => {
  if (fs.existsSync(p)) {
    fs.readdirSync(p).forEach((file) => {
      const isDir = fs.statSync(path.join(p, file)).isDirectory();
      if (isDir) {
        cleanDir(path.join(p, file));
      } else {
        fs.unlinkSync(path.join(p, file));
      }
    });
  }
};

export const cleanFiles = () => cleanDir(path.join(projectRoot, 'm3u'));
