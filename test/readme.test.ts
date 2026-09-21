import { describe, expect, it } from 'vitest';

import { renderLanIpList, renderSourceRows } from '../src/readme';

describe('renderSourceRows', () => {
  it('renders only the first result when a source has multiple outputs', () => {
    const markdown = renderSourceRows(
      [
        [
          { name: 'Multi source', f_name: 'multi_192_168_0' },
          { name: 'Multi source', f_name: 'multi_192_168_1' },
        ],
        [{ name: 'Single source', f_name: 'single' }],
      ],
      [
        [
          ['normal', 10],
          ['normal', 20],
        ],
        [['rollback', 30]],
      ]
    );

    expect(markdown).toContain('multi_192_168_0.m3u');
    expect(markdown).not.toContain('multi_192_168_1.m3u');
    expect(markdown).toContain('| 10 | - |');
    expect(markdown).toContain('single.m3u');
    expect(markdown).toContain('| 30 | ✅ |');
  });

  it('adds a more link for qwerttvv LAN outputs', () => {
    const markdown = renderSourceRows(
      [
        [
          { name: 'qwerttvv/Beijing-IPTV', f_name: 'q_bj_iptv_192_168_0' },
          { name: 'qwerttvv/Beijing-IPTV', f_name: 'q_bj_iptv_10_0_0' },
        ],
      ],
      [
        [
          ['normal', 10],
          ['normal', 10],
        ],
      ]
    );

    expect(markdown).toContain('**[局域网 IP 列表](/list/q_bj_iptv.more.list)**');
  });

  it('renders LAN IP links to their individual source lists', () => {
    const markdown = renderLanIpList([
      { name: 'qwerttvv/Beijing-IPTV', f_name: 'q_bj_iptv_192_168_0' },
      { name: 'qwerttvv/Beijing-IPTV', f_name: 'q_bj_iptv_10_0_0' },
    ]);

    expect(markdown).toContain('[192.168.0.1](/list/q_bj_iptv_192_168_0.list)');
    expect(markdown).toContain('[10.0.0.1](/list/q_bj_iptv_10_0_0.list)');
  });

  it('ignores an empty source result group', () => {
    expect(renderSourceRows([[]], [[]])).toBe('');
  });
});
