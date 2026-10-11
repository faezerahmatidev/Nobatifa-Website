import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { Shell } from './shell';

describe('Shell', () => {
  it('renders header, outlet and footer', async () => {
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([]), ...provideMockDataAccess()],
    });
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('router-outlet')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
  });
});
