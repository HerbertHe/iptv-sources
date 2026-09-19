import { describe, expect, it } from 'vitest';

import { renderSourceRows } from '../src/readme';

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

  it('ignores an empty source result group', () => {
    expect(renderSourceRows([[]], [[]])).toBe('');
  });
});
