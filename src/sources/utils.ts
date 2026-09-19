import 'dotenv/config';

import * as OpenCC from 'opencc-js';
import { collectM3uSource, get_github_raw_proxy_url } from '../utils';

export interface TSourceFilterResult {
  filename: string;
  m3u: string;
  channelCount: number;
}

export interface ISource {
  name: string;
  f_name: string;
  url: string;
  filter: (
    raw: string,
    caller: 'normal' | 'skip' | 'rollback',
    collectFn: ((k: string, v: string) => void) | undefined,
    filename: string
  ) => TSourceFilterResult | TSourceFilterResult[];
}

export type TSources = ISource[];

export const normalizeSourceFilterResults = (
  result: TSourceFilterResult | TSourceFilterResult[]
): TSourceFilterResult[] => (Array.isArray(result) ? result : [result]);

export const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });

export const handle_m3u = (r: string) => {
  const raw = r
    .trim()
    .replace(/\r/g, '')
    .split('\n')
    .filter((r) => !!r);

  let result: string[] = [];

  const extM3uRegExp = /#EXTM3U/;
  const extinfRegExp = /#EXTINF:-1([^,]*),(.*)/;
  const hostRegExp = /^([^:]+):\/\/([^/]+)/;

  for (let i = 0; i < raw.length; i++) {
    if (extM3uRegExp.test(raw[i])) {
      result.push(raw[i]);
      continue;
    }

    if (extinfRegExp.test(raw[i]) && hostRegExp.test(raw[i + 1])) {
      result = result.concat([raw[i], raw[i + 1]]);
      i++;
      continue;
    }
  }

  return result;
};

export const with_github_raw_url_proxy = (u: string) => {
  return process.env.CLOSE_SOURCE_PROXY?.trim() === 'true'
    ? u
    : `${get_github_raw_proxy_url()}/${u}`;
};

export const default_m3u_filter: ISource['filter'] = (
  raw,
  caller,
  collectFn,
  filename
): TSourceFilterResult => {
  const rawArray = handle_m3u(raw);

  if (caller === 'normal' && collectFn) {
    for (let i = 1; i < rawArray.length; i += 2) {
      collectM3uSource(rawArray[i], rawArray[i + 1], collectFn);
    }
  }

  return {
    filename,
    m3u: rawArray.join('\n'),
    channelCount: (rawArray.length - 1) / 2,
  };
};

export const default_txt_filter: ISource['filter'] = (
  raw,
  caller,
  collectFn,
  filename
): TSourceFilterResult => {
  const rawArray = raw
    .trim()
    .replace(/\r/g, '')
    .split('\n')
    .filter((r) => !!r);
  let count = 0;
  let group = '未分类';
  const m3uLines: string[] = ['#EXTM3U x-tvg-url="https://tv.whyun.com/epg/51zmt.xml"'];
  if (caller === 'normal' && collectFn) {
    for (let i = 0; i < rawArray.length; i++) {
      const line = rawArray[i].trim();
      const [name, url] = line.split(',');
      if (url == '#genre#') {
        group = name.trim();
        continue;
      }

      if (!url) {
        continue;
      }
      const logoName = name.replace(/CCTV/g, 'cctv');
      const extinf = `#EXTINF:-1 tvg-id="${name}" tvg-name="${name}" \
tvg-logo="https://tv-res.pages.dev/logo/${logoName}.png" group-title="${group}",${name}`;
      collectM3uSource(extinf, url, collectFn);
      m3uLines.push(extinf, url);
      count++;
    }
  }

  return { filename, m3u: m3uLines.join('\n'), channelCount: count };
};
