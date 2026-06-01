import { numberToVietnameseWords } from './num-to-words.util';

describe('numberToVietnameseWords', () => {
  /**
   * @TestID: TC_BE_PAY_UTIL_01
   * @Priority: P1
   * @Category: Positive
   * @Description: Zero should return "Không đồng"
   * @Steps:
   * 1. Arrange: Input is 0
   * 2. Act: Call numberToVietnameseWords(0)
   * 3. Assert: Returns "Không đồng"
   * @TestData: amount=0
   * @ExpectedResult: "Không đồng"
   */
  it('should return "Không đồng" for zero', () => {
    expect(numberToVietnameseWords(0)).toBe('Không đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_02
   * @Priority: P1
   * @Category: Positive
   * @Description: Negative numbers should be converted using absolute value
   * @Steps:
   * 1. Arrange: Input is -50000
   * 2. Act: Call numberToVietnameseWords(-50000)
   * 3. Assert: Returns same as positive 50000
   * @TestData: amount=-50000
   * @ExpectedResult: "Năm mươi nghìn đồng"
   */
  it('should handle negative numbers by using absolute value', () => {
    expect(numberToVietnameseWords(-50000)).toBe('Năm mươi nghìn đồng');
  });

  // ==================== SINGLE DIGITS ====================

  /**
   * @TestID: TC_BE_PAY_UTIL_03
   * @Priority: P2
   * @Category: Positive
   * @Description: Single digit numbers (1-9) should be converted correctly
   * @Steps:
   * 1. Arrange: Inputs 1, 5, 9
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct Vietnamese words
   * @TestData: amounts=1, 5, 9
   * @ExpectedResult: "Một đồng", "Năm đồng", "Chín đồng"
   */
  it('should convert single digits (1-9) correctly', () => {
    expect(numberToVietnameseWords(1)).toBe('Một đồng');
    expect(numberToVietnameseWords(5)).toBe('Năm đồng');
    expect(numberToVietnameseWords(9)).toBe('Chín đồng');
  });

  // ==================== TEENS ====================

  /**
   * @TestID: TC_BE_PAY_UTIL_04
   * @Priority: P2
   * @Category: Positive
   * @Description: Teen numbers (10-19) should use TEENS array
   * @Steps:
   * 1. Arrange: Inputs 10, 15, 19
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct Vietnamese teen words
   * @TestData: amounts=10, 15, 19
   * @ExpectedResult: "Mười đồng", "Mười lăm đồng", "Mười chín đồng"
   */
  it('should convert teen numbers (10-19) correctly', () => {
    expect(numberToVietnameseWords(10)).toBe('Mười đồng');
    expect(numberToVietnameseWords(15)).toBe('Mười lăm đồng');
    expect(numberToVietnameseWords(19)).toBe('Mười chín đồng');
  });

  // ==================== TENS ====================

  /**
   * @TestID: TC_BE_PAY_UTIL_05
   * @Priority: P2
   * @Category: Positive
   * @Description: Round tens (20, 30, 90) should use TENS array correctly
   * @Steps:
   * 1. Arrange: Inputs 20, 50, 90
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct Vietnamese tens words
   * @TestData: amounts=20, 50, 90
   * @ExpectedResult: "Hai mươi đồng", "Năm mươi đồng", "Chín mươi đồng"
   */
  it('should convert round tens (20, 50, 90) correctly', () => {
    expect(numberToVietnameseWords(20)).toBe('Hai mươi đồng');
    expect(numberToVietnameseWords(50)).toBe('Năm mươi đồng');
    expect(numberToVietnameseWords(90)).toBe('Chín mươi đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_06
   * @Priority: P2
   * @Category: Positive
   * @Description: Compound tens with special unit rules (21=mốt, 55=lăm)
   * @Steps:
   * 1. Arrange: Inputs 21, 55
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Special unit forms (mốt for 1, lăm for 5)
   * @TestData: amounts=21, 55
   * @ExpectedResult: "Hai mươi mốt đồng", "Năm mươi lăm đồng"
   */
  it('should use special forms for unit digits after tens (1->mốt, 5->lăm)', () => {
    expect(numberToVietnameseWords(21)).toBe('Hai mươi mốt đồng');
    expect(numberToVietnameseWords(55)).toBe('Năm mươi lăm đồng');
  });

  // ==================== HUNDREDS ====================

  /**
   * @TestID: TC_BE_PAY_UTIL_07
   * @Priority: P1
   * @Category: Positive
   * @Description: Round hundreds should be converted with "trăm"
   * @Steps:
   * 1. Arrange: Inputs 100, 200
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct trăm form
   * @TestData: amounts=100, 200
   * @ExpectedResult: "Một trăm đồng", "Hai trăm đồng"
   */
  it('should convert round hundreds (100, 200) correctly', () => {
    expect(numberToVietnameseWords(100)).toBe('Một trăm đồng');
    expect(numberToVietnameseWords(200)).toBe('Hai trăm đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_08
   * @Priority: P2
   * @Category: Positive
   * @Description: Hundreds with single digit remainder should use "lẻ"
   * @Steps:
   * 1. Arrange: Inputs 101, 105
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct lẻ form
   * @TestData: amounts=101, 105
   * @ExpectedResult: "Một trăm lẻ một đồng", "Một trăm lẻ năm đồng"
   */
  it('should use "lẻ" for hundreds with single digit remainder', () => {
    expect(numberToVietnameseWords(101)).toBe('Một trăm lẻ một đồng');
    expect(numberToVietnameseWords(105)).toBe('Một trăm lẻ năm đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_09
   * @Priority: P2
   * @Category: Positive
   * @Description: Hundreds with full tens/units (e.g. 150, 999)
   * @Steps:
   * 1. Arrange: Inputs 150, 999
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct compound form
   * @TestData: amounts=150, 999
   * @ExpectedResult: "Một trăm năm mươi đồng", "Chín trăm chín mươi chín đồng"
   */
  it('should convert full hundreds (150, 999) correctly', () => {
    expect(numberToVietnameseWords(150)).toBe('Một trăm năm mươi đồng');
    expect(numberToVietnameseWords(999)).toBe('Chín trăm chín mươi chín đồng');
  });

  // ==================== THOUSANDS ====================

  /**
   * @TestID: TC_BE_PAY_UTIL_10
   * @Priority: P1
   * @Category: Positive
   * @Description: Simple thousands should include "nghìn"
   * @Steps:
   * 1. Arrange: Inputs 1000, 5000
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct nghìn form
   * @TestData: amounts=1000, 5000
   * @ExpectedResult: "Một nghìn đồng", "Năm nghìn đồng"
   */
  it('should convert simple thousands (1000, 5000) correctly', () => {
    expect(numberToVietnameseWords(1000)).toBe('Một nghìn đồng');
    expect(numberToVietnameseWords(5000)).toBe('Năm nghìn đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_11
   * @Priority: P2
   * @Category: Positive
   * @Description: Thousands with hundreds (e.g. 1250, 999999)
   * @Steps:
   * 1. Arrange: Inputs 1250, 999999
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct compound forms
   * @TestData: amounts=1250, 999999
   * @ExpectedResult: "Một nghìn, hai trăm năm mươi đồng", "Chín trăm chín mươi chín nghìn, chín trăm chín mươi chín đồng"
   */
  it('should convert thousands with hundreds (1250, 999999) correctly', () => {
    expect(numberToVietnameseWords(1250)).toBe('Một nghìn, hai trăm năm mươi đồng');
    expect(numberToVietnameseWords(999999)).toBe('Chín trăm chín mươi chín nghìn, chín trăm chín mươi chín đồng');
  });

  // ==================== MILLIONS ====================

  /**
   * @TestID: TC_BE_PAY_UTIL_12
   * @Priority: P1
   * @Category: Positive
   * @Description: Simple millions should include "triệu"
   * @Steps:
   * 1. Arrange: Inputs 1000000, 5000000
   * 2. Act: Call numberToVietnameseWords for each
   * 3. Assert: Correct triệu form
   * @TestData: amounts=1000000, 5000000
   * @ExpectedResult: "Một triệu đồng", "Năm triệu đồng"
   */
  it('should convert simple millions (1M, 5M) correctly', () => {
    expect(numberToVietnameseWords(1000000)).toBe('Một triệu đồng');
    expect(numberToVietnameseWords(5000000)).toBe('Năm triệu đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_13
   * @Priority: P1
   * @Category: Positive
   * @Description: Complex million values (full test input from seed data)
   * @Steps:
   * 1. Arrange: Input 16157571
   * 2. Act: Call numberToVietnameseWords(16157571)
   * 3. Assert: Full correct Vietnamese string
   * @TestData: amount=16157571
   * @ExpectedResult: "Mười sáu triệu, một trăm năm mươi bảy nghìn, năm trăm bảy mươi mốt đồng"
   */
  it('should convert complex millions (16157571) correctly', () => {
    expect(numberToVietnameseWords(16157571)).toBe(
      'Mười sáu triệu, một trăm năm mươi bảy nghìn, năm trăm bảy mươi mốt đồng'
    );
  });

  // ==================== EDGE CASES ====================

  /**
   * @TestID: TC_BE_PAY_UTIL_14
   * @Priority: P2
   * @Category: Positive
   * @Description: Numbers with billions should include "tỷ"
   * @Steps:
   * 1. Arrange: Input 1000000000
   * 2. Act: Call numberToVietnameseWords(1000000000)
   * 3. Assert: Correct tỷ form
   * @TestData: amount=1000000000
   * @ExpectedResult: "Một tỷ đồng"
   */
  it('should convert billions (1B) correctly', () => {
    expect(numberToVietnameseWords(1000000000)).toBe('Một tỷ đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_15
   * @Priority: P3
   * @Category: Positive
   * @Description: Decimal numbers should be rounded to integer first
   * @Steps:
   * 1. Arrange: Input 123.7
   * 2. Act: Call numberToVietnameseWords(123.7)
   * 3. Assert: Rounded to 124
   * @TestData: amount=123.7
   * @ExpectedResult: "Một trăm hai mươi bốn đồng" (rounded from 123.7)
   */
  it('should round decimal numbers before conversion', () => {
    const result = numberToVietnameseWords(123.7);
    // 123.7 rounds to 124
    expect(result).toBe('Một trăm hai mươi bốn đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_16
   * @Priority: P2
   * @Category: Positive
   * @Description: Middle-range salary values should convert correctly
   * @Steps:
   * 1. Arrange: Input 12000000 (12M VND - Intern salary)
   * 2. Act: Call numberToVietnameseWords(12000000)
   * 3. Assert: Correct form
   * @TestData: amount=12000000
   * @ExpectedResult: "Mười hai triệu đồng"
   */
  it('should convert 12-million salary (intern range) correctly', () => {
    expect(numberToVietnameseWords(12000000)).toBe('Mười hai triệu đồng');
  });

  /**
   * @TestID: TC_BE_PAY_UTIL_17
   * @Priority: P2
   * @Category: Positive
   * @Description: Director-level salary (100M) should convert correctly
   * @Steps:
   * 1. Arrange: Input 100000000
   * 2. Act: Call numberToVietnameseWords(100000000)
   * 3. Assert: Correct form
   * @TestData: amount=100000000
   * @ExpectedResult: "Một trăm triệu đồng"
   */
  it('should convert 100-million salary (director range) correctly', () => {
    expect(numberToVietnameseWords(100000000)).toBe('Một trăm triệu đồng');
  });
});
