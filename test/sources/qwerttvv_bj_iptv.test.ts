import { describe, expect, it, vi } from 'vitest';

import { LAN_IP_PREFIXES, qwerttvv_bj_iptv_filter } from '../../src/sources/qwerttvv_bj_iptv';
import { normalizeSourceFilterResults } from '../../src/sources/utils';

const raw = [
  '#EXTM3U',
  '#EXTINF:-1,HTTP Channel',
  'http://192.168.123.1:23234/rtp/239.3.1.118:8001',
  '#EXTINF:-1,RTP Channel',
  'rtp://239.3.1.159:8000',
].join('\n');

describe('qwerttvv_bj_iptv_filter', () => {
  it('creates one result for every supported LAN IP prefix', () => {
    const results = normalizeSourceFilterResults(
      qwerttvv_bj_iptv_filter(raw, 'skip', undefined, 'q_bj_iptv')
    );

    expect(LAN_IP_PREFIXES).toHaveLength(257);
    expect(results).toHaveLength(257);
    expect(results[0].filename).toBe('q_bj_iptv_192_168_0');
    expect(results[255].filename).toBe('q_bj_iptv_192_168_255');
    expect(results[256].filename).toBe('q_bj_iptv_10_0_0');
    expect(new Set(results.map(({ filename }) => filename)).size).toBe(257);
  });

  it('rewrites HTTP and RTP channel URLs to each LAN gateway', () => {
    const results = normalizeSourceFilterResults(
      qwerttvv_bj_iptv_filter(raw, 'skip', undefined, 'q_bj_iptv')
    );
    const result = results.find(({ filename }) => filename === 'q_bj_iptv_192_168_31');

    expect(result).toBeDefined();
    expect(result?.m3u).toContain('http://192.168.31.1:23234/rtp/239.3.1.118:8001');
    expect(result?.m3u).toContain('http://192.168.31.1:23234/rtp/239.3.1.159:8000');
    expect(result?.m3u).not.toContain('192.168.123.1');
    expect(result?.channelCount).toBe(2);
  });

  it('collects rewritten URLs from every generated result', () => {
    const collectFn = vi.fn();

    qwerttvv_bj_iptv_filter(raw, 'normal', collectFn, 'q_bj_iptv');

    expect(collectFn).toHaveBeenCalledTimes(257 * 2);
    expect(collectFn).toHaveBeenCalledWith(
      'http channel',
      'http://10.0.0.1:23234/rtp/239.3.1.118:8001'
    );
  });
});
