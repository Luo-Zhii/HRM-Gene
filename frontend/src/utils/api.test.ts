import { cleanParams, toQueryString } from './api';

describe('api utils', () => {
  describe('cleanParams', () => {
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    // [TC_FE_UTILS_088]
    it('cleanParams: Loại bỏ null/undefined/empty string khỏi object params',
      const input = { a: 1, b: null, c: '', d: undefined, e: 'hello' };
      expect(cleanParams(input)).toEqual({ a: 1, e: 'hello' });
    });
  });

  describe('toQueryString', () => {
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    // [TC_FE_UTILS_089]
    it('toQueryString: Chuyển object thành query string URL hợp lệ',
      expect(toQueryString({ page: 1, limit: '' })).toBe('?page=1');
      expect(toQueryString({})).toBe('');
      expect(toQueryString({ foo: 'bar', empty: null })).toBe('?foo=bar');
    });
  });
});
