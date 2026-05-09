import { resolvePageLimit, toPaginatedResult } from './pagination.dto';

describe('pagination helpers', () => {
  it('bounds mobile page limits', () => {
    expect(resolvePageLimit(undefined)).toBe(20);
    expect(resolvePageLimit(0)).toBe(1);
    expect(resolvePageLimit(250)).toBe(100);
  });

  it('returns a next cursor when one extra item is present', () => {
    const result = toPaginatedResult(
      [{ id: 'one' }, { id: 'two' }, { id: 'three' }],
      2,
    );

    expect(result).toEqual({
      data: [{ id: 'one' }, { id: 'two' }],
      meta: {
        limit: 2,
        nextCursor: 'two',
      },
    });
  });
});
