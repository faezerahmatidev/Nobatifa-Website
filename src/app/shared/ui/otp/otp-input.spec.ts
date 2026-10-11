import { TestBed } from '@angular/core/testing';
import { OtpInput } from './otp-input';

describe('OtpInput', () => {
  it('autofocuses the first box', () => {
    const fixture = TestBed.createComponent(OtpInput);
    fixture.detectChanges();
    const boxes = (fixture.nativeElement as HTMLElement).querySelectorAll('input');
    expect(boxes[0]?.hasAttribute('autofocus')).toBe(true);
    expect(boxes[1]?.hasAttribute('autofocus')).toBe(false);
  });

  it('renders one box per digit of the code', () => {
    const fixture = TestBed.createComponent(OtpInput);
    fixture.componentRef.setInput('code', '12');
    fixture.detectChanges();
    const boxes = (fixture.nativeElement as HTMLElement).querySelectorAll('input');
    expect(boxes.length).toBe(4);
    expect((boxes[0] as HTMLInputElement).value).toBe('1');
    expect((boxes[1] as HTMLInputElement).value).toBe('2');
  });

  it('updates the code when a box changes', () => {    const fixture = TestBed.createComponent(OtpInput);
    fixture.componentRef.setInput('code', '');
    fixture.detectChanges();
    const box = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    box.value = '۵';
    box.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.code()).toBe('5');
  });
});
