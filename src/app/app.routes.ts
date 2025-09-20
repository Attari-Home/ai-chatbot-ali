import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./features/chatbot/chatbot.component').then(m => m.ChatbotComponent)
  },
  {
    path: 'tourist-spots',
    loadComponent: () => import('./features/tourist-spots/tourist-spots.component').then(m => m.TouristSpotsComponent)
  },
  {
    path: 'transport',
    loadComponent: () => import('./features/transport/transport.component').then(m => m.TransportComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/events.component').then(m => m.EventsComponent)
  },
  {
    path: 'emergency',
    loadComponent: () => import('./features/emergency/emergency.component').then(m => m.EmergencyComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'team',
    loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
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
