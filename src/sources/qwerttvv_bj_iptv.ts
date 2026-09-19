import { collectM3uSource } from '../utils';
import { handle_m3u, ISource, type TSourceFilterResult, type TSources } from './utils';

export const LAN_IP_PREFIXES = [
  ...Array.from({ length: 256 }, (_, index) => `192.168.${index}`),
  '10.0.0',
];

const replaceWithLanProxyUrl = (url: string, lanIpPrefix: string) => {
  const proxyOrigin = `http://${lanIpPrefix}.1:23234`;

  if (url.startsWith('rtp://')) {
    return `${proxyOrigin}/rtp/${url.slice('rtp://'.length)}`;
  }

  return url.replace(/^https?:\/\/[^/]+/, proxyOrigin);
};

export const qwerttvv_bj_iptv_filter: ISource['filter'] = (
  raw,
  caller,
  collectFn,
  filename
): TSourceFilterResult[] => {
  const rawArray = handle_m3u(raw);
  const sourceLines = rawArray.filter((line) => !/^#\s+/.test(line));
  const channelCount = (sourceLines.length - 1) / 2;

  return LAN_IP_PREFIXES.map((lanIpPrefix) => {
    const result = sourceLines.map((line, index) =>
      index > 0 && index % 2 === 0 ? replaceWithLanProxyUrl(line, lanIpPrefix) : line
    );

    if (caller === 'normal' && collectFn) {
      for (let i = 1; i < result.length; i += 2) {
        collectM3uSource(result[i], result[i + 1], collectFn);
      }
    }

    return {
      filename: `${filename}_${lanIpPrefix.replace(/\./g, '_')}`,
      m3u: result.join('\n'),
      channelCount,
    };
  });
};

export const qwerttvv_bj_iptv_sources: TSources = [
  {
    name: 'qwerttvv/Beijing-IPTV IPTV Unicom',
    f_name: 'q_bj_iptv_unicom',
    url: 'https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Unicom.m3u',
    filter: qwerttvv_bj_iptv_filter,
  },
  {
    name: 'qwerttvv/Beijing-IPTV IPTV Unicom Multicast',
    f_name: 'q_bj_iptv_unicom_m',
    url: 'https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Unicom-Multicast.m3u',
    filter: qwerttvv_bj_iptv_filter,
  },
  {
    name: 'qwerttvv/Beijing-IPTV IPTV Mobile',
    f_name: 'q_bj_iptv_mobile',
    url: 'https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Mobile.m3u',
    filter: qwerttvv_bj_iptv_filter,
  },
  {
    name: 'qwerttvv/Beijing-IPTV IPTV Mobile Multicast',
    f_name: 'q_bj_iptv_mobile_m',
    url: 'https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Mobile-Multicast.m3u',
    filter: qwerttvv_bj_iptv_filter,
  },
];
