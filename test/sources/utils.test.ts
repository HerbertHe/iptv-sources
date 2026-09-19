import { describe, it, expect } from 'vitest';
import {
  handle_m3u,
  default_m3u_filter,
  default_txt_filter,
  normalizeSourceFilterResults,
} from '../../src/sources/utils';

describe('handle_m3u', () => {
  it('should parse standard m3u and keep #EXTM3U and EXTINF+URL pairs', () => {
    const raw = [
      '#EXTM3U',
      '#EXTINF:-1 tvg-id="cctv1" group-title="央视",CCTV-1',
      'https://example.com/cctv1',
      '',
      '#EXTINF:-1,Other',
      'http://example.com/other',
    ].join('\n');
    const result = handle_m3u(raw);
    expect(result[0]).toBe('#EXTM3U');
    expect(result).toContain('#EXTINF:-1 tvg-id="cctv1" group-title="央视",CCTV-1');
    expect(result).toContain('https://example.com/cctv1');
    expect(result).toContain('#EXTINF:-1,Other');
    expect(result).toContain('http://example.com/other');
  });

  it('should remove \\r and filter empty lines', () => {
    const raw = '#EXTM3U\r\n\r\n#EXTINF:-1,A\r\nhttp://a.com';
    const result = handle_m3u(raw);
    expect(result.filter((s) => s === '')).toHaveLength(0);
    expect(result[0]).toBe('#EXTM3U');
  });
});

describe('normalizeSourceFilterResults', () => {
  const first = { filename: 'first', m3u: '#EXTM3U', channelCount: 1 };
  const second = { filename: 'second', m3u: '#EXTM3U', channelCount: 2 };

  it('normalizes a single result to an array', () => {
    expect(normalizeSourceFilterResults(first)).toEqual([first]);
  });

  it('keeps multiple results unchanged', () => {
    expect(normalizeSourceFilterResults([first, second])).toEqual([first, second]);
  });
});

describe('default_m3u_filter', () => {
  it('should return parsed m3u and correct count when caller is skip', () => {
    const raw = [
      '#EXTM3U',
      '#EXTINF:-1,Channel A',
      'https://a.com',
      '#EXTINF:-1,Channel B',
      'https://b.com',
    ].join('\n');
    const [result] = normalizeSourceFilterResults(
      default_m3u_filter(raw, 'skip', undefined, 'test_m3u')
    );
    expect(result.filename).toBe('test_m3u');
    expect(result.m3u).toContain('#EXTM3U');
    expect(result.m3u).toContain('https://a.com');
    expect(result.channelCount).toBe(2);
  });

  it('should still return correct count when caller is normal and no collectFn', () => {
    const raw = ['#EXTM3U', '#EXTINF:-1,One', 'https://one.com'].join('\n');
    const [result] = normalizeSourceFilterResults(
      default_m3u_filter(raw, 'normal', undefined, 'test_m3u')
    );
    expect(result.channelCount).toBe(1);
  });
});

describe('default_txt_filter', () => {
  it.skip('should return original text and 0 count when caller is skip', () => {
    const raw = 'name1,https://u1.com\nname2,https://u2.com';
    const [result] = normalizeSourceFilterResults(
      default_txt_filter(raw, 'skip', undefined, 'test_txt')
    );
    expect(result.filename).toBe('test_txt');
    expect(result.m3u).toBe(raw);
    expect(result.channelCount).toBe(0);
  });

  it('should recognize #group# group lines', () => {
    const raw = ['#央视#', 'CCTV1,https://cctv1.com', 'CCTV2,https://cctv2.com'].join('\n');
    const [result] = normalizeSourceFilterResults(
      default_txt_filter(
        raw,
        'normal',
        (k, v) => {
          expect(v).toMatch(/https:\/\/cctv\d\.com/);
        },
        'test_txt'
      )
    );
    expect(result.channelCount).toBe(2);
  });

  it('should use lowercase cctv in logo filename', () => {
    const raw = ['#央视#', 'CCTV1,https://cctv1.com'].join('\n');
    const [result] = normalizeSourceFilterResults(
      default_txt_filter(raw, 'normal', () => {}, 'test_txt')
    );
    expect(result.m3u).toContain('tvg-logo="https://tv-res.pages.dev/logo/cctv1.png"');
  });
});
