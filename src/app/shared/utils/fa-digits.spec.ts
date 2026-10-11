import { toFaDigits } from './fa-digits';

describe('toFaDigits', () => {
  it('converts latin digits to persian digits', () => {
    expect(toFaDigits('09227521450')).toBe('۰۹۲۲۷۵۲۱۴۵۰');
    expect(toFaDigits('01/11')).toBe('۰۱/۱۱');
    expect(toFaDigits(12000000)).toBe('۱۲۰۰۰۰۰۰');
    expect(toFaDigits('سوپر پایا 10W40')).toBe('سوپر پایا ۱۰W۴۰');
  });
});
