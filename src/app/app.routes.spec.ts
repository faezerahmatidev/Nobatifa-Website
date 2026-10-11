import { authGuard } from './core/guards/auth-guard';
import { routes } from './app.routes';

describe('routes', () => {
  it('defines the expected paths', () => {
    const paths = routes.map((route) => route.path);
    expect(paths).toContain('');
    expect(paths).toContain('about');
    expect(paths).toContain('profile/appointments');
    expect(paths).toContain('profile/cars');
    expect(paths).toContain('profile/invoice/:id');
  });

  it('redirects unknown paths to home', () => {
    expect(routes.find((route) => route.path === '**')).toMatchObject({ redirectTo: '' });
  });

  it('guards the profile routes', () => {
    for (const path of ['profile/appointments', 'profile/cars', 'profile/invoice/:id']) {
      expect(routes.find((route) => route.path === path)).toMatchObject({
        canMatch: [authGuard],
      });
    }
  });
});
