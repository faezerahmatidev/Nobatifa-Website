import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Parameterized center pages render on demand (SSR and static fallback);
    // leaving them to the `**` prerender rule breaks the build.
    path: 'center/:code',
    renderMode: RenderMode.Server,
  },
  {
    path: 'profile/invoice/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'profile/**',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
