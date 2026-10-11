import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SubmitOnEnter } from './submit-on-enter';

@Component({
  imports: [SubmitOnEnter],
  template: `
    <form appSubmitOnEnter (submit)="$event.preventDefault(); submitted = true">
      <input aria-label="code" />
      <textarea aria-label="notes"></textarea>
      <button type="submit">send</button>
    </form>
  `,
})
class Host {
  submitted = false;
}

function pressEnter(target: Element): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

describe('SubmitOnEnter', () => {
  it('submits the form when Enter is pressed in an input', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    pressEnter(input);
    expect(host.submitted).toBe(true);
  });

  it('ignores Enter inside a textarea', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const area = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    pressEnter(area);
    expect(host.submitted).toBe(false);
  });

  it('lets a focused submit button use its native activation', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const before = host.submitted;
    pressEnter(button);
    expect(host.submitted).toBe(before);
  });
});
