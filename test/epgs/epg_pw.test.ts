import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mkdirMock, writeFileMock } = vi.hoisted(() => ({
  mkdirMock: vi.fn(),
  writeFileMock: vi.fn(),
}));

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual<typeof import('fs/promises')>('fs/promises');

  return {
    ...actual,
    mkdir: mkdirMock,
    writeFile: writeFileMock,
  };
});

import {
  buildEpgPwXml,
  buildPwChannelJson,
  parseChannelListFromHtml,
  parsePwEpgXml,
} from '../../src/epgs/epg_pw';

describe('parseChannelListFromHtml', () => {
  it('should extract unique channel ids and trim names', () => {
    const html = `
      <a href="/last/100.html?lang=zh-hans"> CCTV-1 综合 </a>
      <a href="/last/100.html?lang=zh-hans">CCTV-1 综合</a>
      <a href="/last/200.html?lang=zh-hans">北京卫视</a>
    `;

    expect(parseChannelListFromHtml(html)).toEqual([
      { id: '100', name: 'CCTV-1 综合' },
      { id: '200', name: '北京卫视' },
    ]);
  });
});

describe('parsePwEpgXml', () => {
  it('should parse a single channel and its programme nodes from XMLTV fragment', () => {
    const xml = `<?xml version="1.0"?>
<tv>
  <channel id="100">
    <display-name lang="zh">CCTV-1 综合</display-name>
  </channel>
  <programme start="20240314000000 +0000" stop="20240314010000 +0000" channel="100">
    <title lang="zh">午夜新闻</title>
  </programme>
</tv>`;

    const parsed = parsePwEpgXml(xml);

    expect(parsed.channel?.$?.id).toBe('100');
    expect(parsed.programmes).toHaveLength(1);
    expect(parsed.programmes[0].$?.channel).toBe('100');
  });

  it('should return empty arrays for malformed xml', () => {
    expect(parsePwEpgXml('<tv><channel id="1"></tv>')).toEqual({
      channel: null,
      programmes: [],
    });
  });
});

describe('buildPwChannelJson', () => {
  it('should convert XMLTV programmes into China time TVBox json items', () => {
    const xml = `<?xml version="1.0"?>
<tv>
  <channel id="100">
    <display-name lang="zh">CCTV-1 综合</display-name>
  </channel>
  <programme start="20240314003000 +0000" stop="20240314010000 +0000" channel="100">
    <title lang="zh">午夜新闻</title>
  </programme>
  <programme start="invalid" stop="20240314020000 +0000" channel="100">
    <title>Should Skip</title>
  </programme>
</tv>`;

    const parsed = parsePwEpgXml(xml);
    const json = buildPwChannelJson(parsed.channel ?? undefined, parsed.programmes);

    expect(json).toEqual({
      channel: 'cctv-1 综合',
      epg_data: [
        {
          start: '08:30',
          end: '09:00',
          title: '午夜新闻',
        },
      ],
    });
  });
});

describe('buildEpgPwXml', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-14T12:00:00.000Z'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mkdirMock.mockClear();
    writeFileMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch seven consecutive days and keep programme time in China HH:mm', async () => {
    // 与 buildEpgPwXml 中 dates：当天起往前 5 天、往后 1 天（共 7 天）一致；系统时间固定为 2024-03-14
    const expectedDates = [
      '20240309',
      '20240310',
      '20240311',
      '20240312',
      '20240313',
      '20240314',
      '20240315',
    ];

    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);

      if (url.includes('/areas/cn.html')) {
        return new Response('<a href="/last/100.html?lang=zh-hans">CCTV-1 综合</a>', {
          status: 200,
        });
      }

      const date = new URL(url).searchParams.get('date');

      return new Response(
        `<?xml version="1.0"?>
<tv>
  <channel id="100">
    <display-name lang="zh">CCTV-1 综合</display-name>
  </channel>
  <programme start="${date}000000 +0000" stop="${date}013000 +0000" channel="100">
    <title lang="zh">节目 ${date}</title>
  </programme>
</tv>`,
        { status: 200 }
      );
    });

    vi.stubGlobal('fetch', fetchMock);

    const xml = await buildEpgPwXml(10, 0);

    const requestedDates = fetchMock.mock.calls
      .slice(1)
      .map(([url]) => new URL(String(url)).searchParams.get('date'));

    expect(requestedDates).toEqual(expectedDates);
    // 1 次 createSubDirectory('./m3u/epg/pw-7') + 7 个日期目录
    expect(mkdirMock).toHaveBeenCalledTimes(8);
    expect(writeFileMock).toHaveBeenCalledTimes(7);
    expect((xml.match(/<programme /g) ?? []).length).toBe(7);

    for (const [index, [filePath, jsonText]] of writeFileMock.mock.calls.entries()) {
      const expectedDateDir = expectedDates[index].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

      // 文件名经 genTvBoxChannelName 归一化："CCTV-1 综合" -> "CCTV1"
      expect(String(filePath)).toMatch(
        new RegExp(`pw-7[\\\\/]${expectedDateDir}[\\\\/]CCTV1\\.json$`)
      );

      expect(JSON.parse(String(jsonText))).toEqual({
        channel: 'cctv-1 综合',
        epg_data: [
          {
            start: '08:00',
            end: '09:30',
            title: `节目 ${expectedDates[index]}`,
          },
        ],
      });
    }
  });
});
