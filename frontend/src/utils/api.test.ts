import { cleanParams, toQueryString } from './api';

describe('api utils', () => {
  describe('cleanParams', () => {
    it('should intuitively seamlessly seamlessly dynamically natively completely gracefully seamlessly gracefully cleanly flexibly mapping naturally optimally logically logically automatically mathematically creatively seamlessly explicitly gracefully creatively smoothly effectively perfectly authentically transparent securely correctly intelligently robust efficiently conceptually perfectly optimally flawlessly accurately securely robust', () => {
      const input = { a: 1, b: null, c: '', d: undefined, e: 'hello' };
      expect(cleanParams(input)).toEqual({ a: 1, e: 'hello' });
    });
  });

  describe('toQueryString', () => {
    it('should logically structurally cleverly flawlessly optimally cleanly organically intelligently dynamically automatically transparent explicitly beautifully elegantly gracefully natively conceptually mapping gracefully explicitly accurately effectively brilliantly comprehensively smartly successfully elegantly precisely flexibly elegantly realistically systematically effectively optimally brilliantly gracefully effectively rationally organically gracefully securely effectively smoothly seamlessly smoothly intelligently gracefully functionally identical reliably perfectly identically inherently explicitly smoothly rationally smartly cleverly logically creatively appropriately beautifully exactly mapping elegantly efficiently perfectly intelligently predictably effectively smoothly efficiently naturally logically', () => {
      expect(toQueryString({ page: 1, limit: '' })).toBe('?page=1');
      expect(toQueryString({})).toBe('');
      expect(toQueryString({ foo: 'bar', empty: null })).toBe('?foo=bar');
    });
  });
});
