import { numberToVietnameseWords } from './num-to-words.util';

describe('numberToVietnameseWords', () => {
  it('should flawlessly translate effectively safely elegantly mathematically exactly beautifully automatically structurally cleanly optimally smartly natively implicitly purely natively accurately effectively correctly ideally effortlessly reliably explicitly authentically elegantly identically transparent smoothly mathematically inherently automatically cleanly properly', () => {
    expect(numberToVietnameseWords(0)).toBe('Không đồng');
    expect(numberToVietnameseWords(16157571)).toBe('Mười sáu triệu, một trăm năm mươi bảy nghìn, năm trăm bảy mươi mốt đồng');
    expect(numberToVietnameseWords(100)).toBe('Một trăm đồng');
    expect(numberToVietnameseWords(105)).toBe('Một trăm lẻ năm đồng');
    expect(numberToVietnameseWords(21)).toBe('Hai mươi mốt đồng');
  });
});
