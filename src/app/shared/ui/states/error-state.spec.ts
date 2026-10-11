import { TestBed } from '@angular/core/testing';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('emits retry when the button is clicked', () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.retry.subscribe(() => (emitted = true));
    ((fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement).click();
    expect(emitted).toBe(true);
  });
});
