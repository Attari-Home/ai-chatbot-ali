import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./features/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'parental-consent',
    loadComponent: () => import('./features/parental-consent/parental-consent.component').then(m => m.ParentalConsentComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
