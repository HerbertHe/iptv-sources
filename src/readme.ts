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

export const renderSourceRows = (sources: TREADMESources, sourcesResults: TREADMESourceResults) =>
  sources
    .map((sourceGroup, index) => {
      const source = sourceGroup[0];
      const sourceResult = sourcesResults[index]?.[0];

      if (!source) return '';

      return `| ${source.name} | [${source.f_name}.m3u](/${source.f_name}.m3u) <br> [${
        source.f_name
      }.txt](/txt/${source.f_name}.txt) | [List for ${source.name}](/list/${
        source.f_name
      }.list) | ${
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

  if (!fs.existsSync(list_p)) {
    fs.mkdirSync(list_p);
  }

  fs.writeFileSync(path.join(list_p, `${f_name}.list.md`), after);
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

  if (!fs.existsSync(path.join(path.resolve(), 'm3u'))) {
    fs.mkdirSync(path.join(path.resolve(), 'm3u'));
  }

  fs.writeFileSync(path.join(path.resolve(), 'm3u', 'README.md'), after);
};
