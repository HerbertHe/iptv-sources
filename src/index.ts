import { hrtime } from 'process';

import { updateChannelsJson } from './channels';
import { epgs_sources } from './epgs';
import { buildEpgPwXml } from './epgs/epg_pw';
import {
  cleanFiles,
  getContent,
  mergeSources,
  mergeTxts,
  writeEpgJsonByDate,
  writeEpgXML,
  writeEpgXmlGz,
  writeM3u,
  writeM3uToTxt,
  writeSources,
} from './file';
import { updateChannelList, updateReadme } from './readme';
import { normalizeSourceFilterResults, sources } from './sources';
import { runCustomTask } from './task/custom';
import { writeTvBoxJson as writeTvBoxLiveJson } from './tvbox';
import { Collector } from './utils';

type SourceBuildStatus = 'normal' | 'rollback';

interface ISourceBuildResult {
  name: string;
  filename: string;
  channelCount: number | undefined;
  status: SourceBuildStatus;
}

cleanFiles();

// 执行脚本
(async () => {
  try {
    const sourcesResult = await Promise.allSettled(
      sources.map(async (sr) => {
        console.log(`[TASK] Fetch ${sr.name}`);
        try {
          const [ok, text, now] = await getContent(sr);
          if (ok && !!text) {
            console.log(
              `Fetch m3u from ${sr.name} finished, cost ${
                (parseInt(hrtime.bigint().toString()) - parseInt(now.toString())) / 10e6
              } ms`
            );

            const sourcesCollector = Collector(undefined, (v) => !/^([a-z]+):\/\//.test(v));

            const filterResults = normalizeSourceFilterResults(
              sr.filter(
                text as string,
                ['o_all', 'all'].includes(sr.f_name) ? 'skip' : 'normal',
                sourcesCollector.collect,
                sr.f_name
              )
            );

            await Promise.all(
              filterResults.map(async ({ filename, m3u }) => {
                await writeM3u(filename, m3u);
                await writeM3uToTxt(sr.name, filename, m3u);
                await writeSources(sr.name, filename, sourcesCollector.result());
                updateChannelList(sr.name, filename, m3u);
              })
            );

            return filterResults.map(
              ({ filename, channelCount }): ISourceBuildResult => ({
                name: sr.name,
                filename,
                channelCount,
                status: 'normal',
              })
            );
          }
          console.log(`[WARNING] m3u ${sr.name} get failed!`);
          return [
            {
              name: sr.name,
              filename: sr.f_name,
              channelCount: undefined,
              status: 'normal',
            } satisfies ISourceBuildResult,
          ];
        } catch (e) {
          console.log(e);
          console.log(`[WARNING] m3u ${sr.name} get failed!`);
          return [
            {
              name: sr.name,
              filename: sr.f_name,
              channelCount: undefined,
              status: 'normal',
            } satisfies ISourceBuildResult,
          ];
        }
      })
    );

    const epgs = await Promise.allSettled(
      epgs_sources.map(async (epg_sr) => {
        console.log(`[TASK] Fetch EPG ${epg_sr.name}`);
        try {
          const [ok, text, now] = await getContent(epg_sr);

          if (ok && !!text) {
            console.log(
              `Fetch EPG from ${epg_sr.name} finished, cost ${
                (parseInt(hrtime.bigint().toString()) - parseInt(now.toString())) / 10e6
              } ms`
            );
            await writeEpgXML(epg_sr.f_name, text as string);
            return ['normal'];
          }
          console.log(`[WARNING] EPG ${epg_sr.name} get failed!`);
          return [void 0];
        } catch (_e) {
          console.warn('Error fetching EPG', _e, epg_sr);
          console.log(`[WARNING] EPG ${epg_sr.name} get failed!`);
          return [void 0];
        }
      })
    );

    // epg.pw EPG: 从频道列表页抓取所有频道并逐一拉取 EPG，合并为完整 XML
    // 仅输出 .xml.gz：合并后体积可能超过 Cloudflare Pages 25MB 单文件上限
    try {
      console.log('[TASK] Build EPG from epg.pw ...');
      const epgPwXml = await buildEpgPwXml();
      await writeEpgXmlGz('epg_pw', epgPwXml);
      console.log('[TASK] EPG from epg.pw written successfully');
    } catch (e) {
      console.warn('[WARNING] EPG from epg.pw failed:', e);
    }

    console.log(`[TASK] Write important files`);
    type EpgSettled = PromiseSettledResult<string[] | undefined[]>;
    const generatedSourceGroups = sourcesResult.map((result, index): ISourceBuildResult[] =>
      result.status === 'fulfilled'
        ? result.value
        : [
            {
              name: sources[index].name,
              filename: sources[index].f_name,
              channelCount: undefined,
              status: 'normal',
            },
          ]
    );
    const generatedSources = generatedSourceGroups.flat();
    const outputSources = generatedSources.map(({ name, filename }) => ({
      name,
      f_name: filename,
    }));
    const sources_res = generatedSources.map(
      ({ status, channelCount }): [SourceBuildStatus, number | undefined] => [status, channelCount]
    );
    const readmeSources = generatedSourceGroups.map((group) =>
      group.map(({ name, filename }) => ({ name, f_name: filename }))
    );
    const readmeSourcesRes = generatedSourceGroups.map((group) =>
      group.map(({ status, channelCount }): [SourceBuildStatus, number | undefined] => [
        status,
        channelCount,
      ])
    );
    const epgs_res = epgs.map((r: EpgSettled) =>
      r.status === 'fulfilled' ? r.value : undefined
    ) as Array<[string | undefined]>;
    mergeTxts();
    mergeSources();
    await writeEpgJsonByDate();
    await writeTvBoxLiveJson('tvbox', outputSources);
    updateChannelsJson(outputSources, sources_res, epgs_sources);
    updateReadme(readmeSources, readmeSourcesRes, epgs_sources, epgs_res);

    console.log(`[TASK] Make custom sources`);
    runCustomTask();
  } catch (err) {
    console.error(err);
  }
})();
