import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

@Component({
  imports: [Icon],
  template: `<app-icon name="search" [size]="24" />`,
})
class Host {}

describe('Icon', () => {
  it('renders an svg for the given name', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('svg circle')).toBeTruthy();
  });

  it('is hidden from assistive technology by default', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('app-icon').getAttribute('aria-hidden'),
    ).toBe('true');
  });
});
