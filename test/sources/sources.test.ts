import { describe, expect, it } from 'vitest';
import { getContent } from '../../src/file';
import { normalizeSourceFilterResults, sources } from '../../src/sources';
import { hotel_tvn_sources } from '../../src/sources/hotel_tvn';
import { youhun_sources } from '../../src/sources/youhun';
import { zbds_sources } from '../../src/sources/zbds';
import { Collector, m3u2txt } from '../../src/utils';
describe('sources', () => {
  it('sources should be a non-empty array', () => {
    expect(Array.isArray(sources)).toBe(true);
    expect(sources.length).toBeGreaterThan(0);
  });

  it('each source should match ISource structure', () => {
    for (const sr of sources) {
      expect(sr).toHaveProperty('name');
      expect(sr).toHaveProperty('f_name');
      expect(sr).toHaveProperty('url');
      expect(sr).toHaveProperty('filter');
      expect(typeof sr.filter).toBe('function');
    }
  });
});

describe('zbds_sources', () => {
  it('should contain ipv4 and ipv6 sources', () => {
    expect(zbds_sources).toHaveLength(2);
    const names = zbds_sources.map((s) => s.f_name);
    expect(names).toContain('zbds_ipv4');
    expect(names).toContain('zbds_ipv6');
  });

  it('url should point to m3u', () => {
    for (const s of zbds_sources) {
      expect(s.url).toMatch(/\.m3u$/);
    }
  });
});

describe('hotel_tvn_sources', () => {
  it('should contain hotel_tvn source', () => {
    expect(hotel_tvn_sources).toHaveLength(1);
    expect(hotel_tvn_sources[0].f_name).toBe('hotel_tvn');
  });
});

describe('youhun_sources', () => {
  it('should collect youhun live data and get m3u data structure', { timeout: 15000 }, async () => {
    const sr = youhun_sources[0];
    const [ok, text] = await getContent(sr);
    expect(ok).toBe(true);
    expect(text).toBeDefined();
    expect(typeof text).toBe('string');
    expect((text as string).length).toBeGreaterThan(0);

    const collector = Collector(undefined, (v) => !/^([a-z]+):\/\//.test(v));
    const [result] = normalizeSourceFilterResults(
      sr.filter(text as string, 'normal', collector.collect, sr.f_name)
    );

    expect(result.filename).toBe(sr.f_name);
    expect(result.channelCount).toBeGreaterThan(0);
    expect(result.m3u).toBeDefined();
    expect(typeof result.m3u).toBe('string');
    const lines = result.m3u
      .trim()
      .split('\n')
      .filter((l) => l.trim());
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0].startsWith('#EXTM3U')).toBe(true);

    const collected = collector.result();
    expect(collected.size).toBeGreaterThan(0);
    for (const [, urls] of collected) {
      expect(Array.isArray(urls)).toBe(true);
      expect(urls.length).toBeGreaterThan(0);
      expect(urls.every((u) => typeof u === 'string' && u.length > 0)).toBe(true);
    }

    const txt = m3u2txt(lines);
    expect(txt).toBeDefined();
    expect(typeof txt).toBe('string');
    expect(txt.length).toBeGreaterThan(0);
  });
});
