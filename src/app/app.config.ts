import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SUPABASE_CLIENT_PROVIDER } from './core/backend/supabase-client';
import { provideSupabaseDataAccess } from './data-access/supabase/provide-supabase-data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    SUPABASE_CLIENT_PROVIDER,
    ...provideSupabaseDataAccess(),
  ]
};
