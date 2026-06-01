import { cn } from './utils';

describe('cn (className utility)', () => {
  /**
   * @TestID: TC_FE_UTILS_01
   * @Priority: P2
   * @Category: Positive
   * @Description: cn merges multiple string classes with whitespace
   * @Steps:
   * 1. Arrange: Pass two class name strings
   * 2. Act: Call cn('bg-red-500', 'text-white')
   * 3. Assert: Returns a string containing both classes
   * @TestData: 'bg-red-500', 'text-white'
   * @ExpectedResult: string containing both class names
   */
  it('should merge multiple string class names', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toContain('bg-red-500');
    expect(result).toContain('text-white');
  });

  /**
   * @TestID: TC_FE_UTILS_02
   * @Priority: P2
   * @Category: Positive
   * @Description: cn resolves tailwind conflicts (later class wins)
   * @Steps:
   * 1. Arrange: Pass conflicting margin classes
   * 2. Act: Call cn('m-2', 'm-4')
   * 3. Assert: The later class ('m-4') takes precedence
   * @TestData: 'm-2', 'm-4'
   * @ExpectedResult: string containing 'm-4' but not 'm-2'
   */
  it('should resolve Tailwind class conflicts with twMerge (later wins)', () => {
    const result = cn('m-2', 'm-4');
    expect(result).toContain('m-4');
    expect(result).not.toContain('m-2');
  });

  /**
   * @TestID: TC_FE_UTILS_03
   * @Priority: P2
   * @Category: Positive
   * @Description: cn handles conditional/falsy class inputs
   * @Steps:
   * 1. Arrange: Pass false, undefined, and a valid class
   * 2. Act: Call cn(false, undefined, 'visible')
   * 3. Assert: Falsy values are ignored, only 'visible' appears
   * @TestData: false, undefined, 'visible'
   * @ExpectedResult: 'visible'
   */
  it('should ignore falsy values (false, undefined, null)', () => {
    const result = cn(false, undefined, null, 'visible');
    expect(result).toBe('visible');
  });

  /**
   * @TestID: TC_FE_UTILS_04
   * @Priority: P3
   * @Category: Positive
   * @Description: cn returns empty string when called with no arguments
   * @Steps:
   * 1. Arrange: Call cn with no arguments
   * 2. Act: cn()
   * 3. Assert: Returns empty string
   * @TestData: none
   * @ExpectedResult: ''
   */
  it('should return empty string when called with no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  /**
   * @TestID: TC_FE_UTILS_05
   * @Priority: P2
   * @Category: White-box
   * @Description: cn properly chains clsx and twMerge for complex inputs
   * @Steps:
   * 1. Arrange: Mix string classes, conditional objects, and arrays
   * 2. Act: Call cn('base', { active: true, inactive: false }, ['nested'])
   * 3. Assert: All truthy classes are merged into single string
   * @TestData: 'base', {active:true, inactive:false}, ['nested']
   * @ExpectedResult: string containing 'base', 'active', 'nested' but not 'inactive'
   */
  it('should process conditional objects and arrays via clsx', () => {
    const result = cn('base', { active: true, inactive: false }, ['nested']);
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).toContain('nested');
    expect(result).not.toContain('inactive');
  });
});
