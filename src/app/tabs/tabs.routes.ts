import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tecniche',
        loadComponent: () =>
          import('../features/tecniche/tecniche-list.page').then((m) => m.TecnicheListPage),
      },
      {
        path: 'tecniche/:id',
        loadComponent: () =>
          import('../features/tecniche/tecnica-detail.page').then((m) => m.TecnicaDetailPage),
      },
      {
        path: 'kata',
        loadComponent: () =>
          import('../features/kata/kata-list.page').then((m) => m.KataListPage),
      },
      {
        path: 'kata/:id',
        loadComponent: () =>
          import('../features/kata/kata-detail.page').then((m) => m.KataDetailPage),
      },
      {
        path: 'preferiti',
        loadComponent: () =>
          import('../features/preferiti/preferiti.page').then((m) => m.PreferitiPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tecniche',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tecniche',
    pathMatch: 'full',
  },
];
