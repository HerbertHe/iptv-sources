import fs from 'fs';
import path from 'path';

import { handle_m3u } from './sources';
import type { TEPGSource } from './epgs/utils';
import { get_from_info } from './utils';

export interface IREADMESource {
  name: string;
  f_name: string;
  count?: number | undefined;
}

export type TREADMESources = IREADMESource[][];
export type TREADMESourceResult = [status: string, channelCount: number | undefined];
export type TREADMESourceResults = TREADMESourceResult[][];
export type TREADMEEPGSources = TEPGSource[];

const QWERTTVV_SOURCE_PREFIX = 'qwerttvv/';
const LAN_IP_FILENAME_SUFFIX = /_(192_168_\d+|10_0_0)$/;

const getLanIpDetails = (sourceGroup: IREADMESource[]) =>
  sourceGroup
    .map((source) => {
      const match = LAN_IP_FILENAME_SUFFIX.exec(source.f_name);
      if (!match) return undefined;

      return {
        ip: `${match[1].replace(/_/g, '.')}.1`,
        source,
      };
    })
    .filter((detail): detail is { ip: string; source: IREADMESource } => detail !== undefined);

const getMoreListName = (sourceGroup: IREADMESource[]) => {
  const firstSource = sourceGroup[0];
  if (!firstSource) return undefined;

  return firstSource.f_name.replace(LAN_IP_FILENAME_SUFFIX, '');
};

export const renderLanIpList = (sourceGroup: IREADMESource[]) => {
  const source = sourceGroup[0];
  if (!source) return '';

  const links = getLanIpDetails(sourceGroup)
    .map(({ ip, source: ipSource }) => `- [${ip}](/list/${ipSource.f_name}.list)`)
    .join('\n');

  return `# LAN IPs for **${source.name}**\n\n${links}\n\nUpdated at **${new Date()}**`;
};

const writeLanIpLists = (sources: TREADMESources) => {
  const listPath = path.join(path.resolve(), 'm3u', 'list');

  sources.forEach((sourceGroup) => {
    const source = sourceGroup[0];
    const moreListName = getMoreListName(sourceGroup);

    if (
      !source?.name.startsWith(QWERTTVV_SOURCE_PREFIX) ||
      sourceGroup.length <= 1 ||
      !moreListName
    ) {
      return;
    }

    fs.mkdirSync(listPath, { recursive: true });
    fs.writeFileSync(
      path.join(listPath, `${moreListName}.more.list.md`),
      renderLanIpList(sourceGroup)
    );
  });
};

export const renderSourceRows = (sources: TREADMESources, sourcesResults: TREADMESourceResults) =>
  sources
    .map((sourceGroup, index) => {
      const source = sourceGroup[0];
      const sourceResult = sourcesResults[index]?.[0];

      if (!source) return '';

      const moreListName = getMoreListName(sourceGroup);
      const moreLink =
        source.name.startsWith(QWERTTVV_SOURCE_PREFIX) && sourceGroup.length > 1 && moreListName
          ? `<br> **[局域网 IP 列表](/list/${moreListName}.more.list)**`
          : '';

      return `| ${source.name} | [${source.f_name}.m3u](/${source.f_name}.m3u) <br> [${
        source.f_name
      }.txt](/txt/${source.f_name}.txt) | [List for ${source.name}](/list/${
        source.f_name
      }.list)${moreLink} | ${
        sourceResult?.[1] === undefined ? 'update failed' : sourceResult[1]
      } | ${sourceResult?.[0] === 'rollback' ? '✅' : '-'} |`;
    })
    .filter(Boolean)
    .join('\n');

export const updateChannelList = (
  name: string,
  f_name: string,
  m3u: string,
  rollback: boolean = false
) => {
  const list_temp_p = path.join(path.resolve(), 'LIST.temp.md');
  const list = fs.readFileSync(list_temp_p, 'utf8').toString();

  const m3uArray = handle_m3u(m3u);
  const channelRegExp = /#EXTINF:-1([^,]*),(.*)/;
  let i = 1;
  const channels: Array<string>[] = [];
  while (i < m3uArray.length) {
    const reg = channelRegExp.exec(m3uArray[i]) as RegExpExecArray;
    channels.push([
      reg[2].replace(/\|/g, '').trim(),
      get_from_info(m3uArray[i + 1]),
      m3uArray[i + 1],
    ]);
    i += 2;
  }

  const after = list
    .replace(
      '<!-- list_title_here -->',
      `# List for **${name}**${
        rollback ? '(Rollback)' : ''
      }\n\n> M3U: [${f_name}.m3u](/${f_name}.m3u), TXT: [${f_name}.txt](/txt/${f_name}.txt)`
    )
    .replace(
      '<!-- channels_here -->',
      `${channels
        ?.map((c, idx) => `| ${idx + 1} | ${c[0].replace('|', '')} | ${c[1]} | <${c[2]}> |`)
        .join('\n')}\n\nUpdated at **${new Date()}**`
    );

  const list_p = path.join(path.resolve(), 'm3u', 'list');
  // f_name 可能带文件夹前缀（如 `fmml/ipv6`），需要递归创建父目录
  const list_file = path.join(list_p, ...f_name.split('/').filter(Boolean)) + '.list.md';

  fs.mkdirSync(path.dirname(list_file), { recursive: true });

  fs.writeFileSync(list_file, after);
};

export const updateReadme = (
  sources: TREADMESources,
  sources_res: TREADMESourceResults,
  epgs: TREADMEEPGSources,
  epgs_res: Array<[string | undefined]>
) => {
  const readme_temp_p = path.join(path.resolve(), 'README.temp.md');
  const readme = fs.readFileSync(readme_temp_p, 'utf8').toString();

  const after = readme
    .replace('<!-- channels_here -->', renderSourceRows(sources, sources_res))
    .replace(
      '<!-- epgs_here -->',
      `${epgs
        ?.map(
          (e, idx) =>
            `| ${e.name} | [${e.f_name}.xml](/epg/${e.f_name}.xml) | ${
              epgs_res?.[idx]?.[0]
                ? epgs_res?.[idx]?.[0] === 'rollback'
                  ? '✅'
                  : '-'
                : 'update failed'
            } |`
        )
        .join('\n')}
| epg.pw（中国地区聚合） | [epg_pw.xml.gz](/epg/epg_pw.xml.gz) | 独立构建 |

\n\nUpdated at **${new Date()}**`
    );

  writeLanIpLists(sources);

  if (!fs.existsSync(path.join(path.resolve(), 'm3u'))) {
    fs.mkdirSync(path.join(path.resolve(), 'm3u'));
  }

  fs.writeFileSync(path.join(path.resolve(), 'm3u', 'README.md'), after);
};
