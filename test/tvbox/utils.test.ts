import { promises as fsPromises } from 'fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/utils', () => ({
  get_custom_url: vi.fn(() => 'https://custom.example.com'),
}));

import { writeTvBoxJson } from '../../src/tvbox/utils';

describe('writeTvBoxJson', () => {
  beforeEach(() => {
    vi.spyOn(fsPromises, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fsPromises, 'writeFile').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when srcs is empty', async () => {
    await expect(writeTvBoxJson('tvbox', [])).rejects.toThrow('No sources for tvbox found!');
  });

  it('creates tvbox directory and writes json under m3u/tvbox', async () => {
    await writeTvBoxJson('channels', [{ name: 'Src A', f_name: 'cn' }]);

    expect(fsPromises.mkdir).toHaveBeenCalledWith(expect.stringMatching(/m3u[/\\]tvbox$/), {
      recursive: true,
    });
    expect(fsPromises.writeFile).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fsPromises.writeFile).mock.calls[0][0]).toMatch(/tvbox[/\\]channels\.json$/);
  }, 20_000);

  it('merges remote tvbox config with lives built from srcs (real fetch)', async () => {
    await writeTvBoxJson('all', [
      { name: 'One', f_name: 'a' },
      { name: 'Two', f_name: 'b' },
    ]);

    const payload = JSON.parse(vi.mocked(fsPromises.writeFile).mock.calls[0][1] as string);

    expect(payload.lives).toHaveLength(2);
    expect(payload.lives[0]).toEqual({
      name: 'One',
      type: 0,
      url: 'https://custom.example.com/txt/a.txt',
      epg: 'https://custom.example.com/epg/pw-7/{date}/{name}.json',
      logo: 'https://tv-res.pages.dev/logo/{name}.png',
    });
    expect(payload.lives[1]).toEqual({
      name: 'Two',
      type: 0,
      url: 'https://custom.example.com/txt/b.txt',
      epg: 'https://custom.example.com/epg/pw-7/{date}/{name}.json',
      logo: 'https://tv-res.pages.dev/logo/{name}.png',
    });
  }, 20_000);
});
