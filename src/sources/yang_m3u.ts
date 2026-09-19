import { replace_github_raw_proxy_url, collectM3uSource } from '../utils';
import { handle_m3u, type TSources, converter, ISource, type TSourceFilterResult } from './utils';

export const yang_m3u_filter: ISource['filter'] = (
  raw,
  caller,
  collectFn,
  filename
): TSourceFilterResult => {
  const rawArray = handle_m3u(replace_github_raw_proxy_url(raw));

  if (caller === 'normal' && collectFn) {
    for (let i = 1; i < rawArray.length; i += 2) {
      collectM3uSource(rawArray[i], rawArray[i + 1], collectFn);
    }
  }

  return {
    filename,
    m3u: converter(rawArray.join('\n')),
    channelCount: (rawArray.length - 1) / 2,
  };
};

export const yang_m3u_sources: TSources = [
  {
    name: 'YanG-1989 Gather',
    f_name: 'y_g',
    url: 'https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u',
    filter: yang_m3u_filter,
  },
];
