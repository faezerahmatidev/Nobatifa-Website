import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `<app-button variant="danger">رزرو</app-button>`,
})
class ButtonHost {}

describe('Button', () => {
  it('applies primary md classes by default', () => {
    const fixture = TestBed.createComponent(Button);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('bg-primary-base');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('applies the danger variant and disabled state', () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('bg-danger-base');
    expect(button.disabled).toBe(true);
  });

  it('projects content', async () => {
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('رزرو');
    expect(button.className).toContain('bg-danger-base');
  });
});
