import { TestBed } from '@angular/core/testing';
import { provideMockDataAccess } from '../../data-access/mock/provide-mock-data-access';
import { CarsPage } from './cars-page';

describe('CarsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsPage],
      providers: [...provideMockDataAccess()],
    }).compileComponents();
  });

  it('renders the title and seeded cars', async () => {
    const fixture = TestBed.createComponent(CarsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('خودروهای من');
    expect(el.textContent).toContain('پراید');
  });

  it('opens the create modal', async () => {
    const fixture = TestBed.createComponent(CarsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const create = Array.from(el.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('خودروی جدید'),
    );
    create?.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeTruthy();
    expect(el.textContent).toContain('نوع خودرو');
  });

  it('confirms deletion in a modal', async () => {
    const fixture = TestBed.createComponent(CarsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const menuButton = Array.from(el.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-label') === 'عملیات خودرو',
    );
    menuButton?.click();
    fixture.detectChanges();
    const deleteButton = Array.from(el.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'حذف',
    );
    deleteButton?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('آیا از حذف خودروی موردنظر مطمئن هستید؟');
    const confirm = Array.from(el.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'بله',
    );
    confirm?.click();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('پراید');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('کوییک');
  }, 10000);

  it('prefills the edit modal with the car data', async () => {
    const fixture = TestBed.createComponent(CarsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const menuButton = Array.from(el.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-label') === 'عملیات خودرو',
    );
    menuButton?.click();
    fixture.detectChanges();
    const editButton = Array.from(el.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'ویرایش',
    );
    editButton?.click();
    fixture.detectChanges();
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog?.textContent).toContain('ویرایش خودرو');
    const inputs = dialog?.querySelectorAll('input');
    expect((inputs?.[0] as HTMLInputElement)?.value).toBe('پراید');
    expect((inputs?.[1] as HTMLInputElement)?.value).toBe('11');
    expect((inputs?.[2] as HTMLInputElement)?.value).toBe('365');
    expect((inputs?.[3] as HTMLInputElement)?.value).toBe('45');
  }, 10000);
});
