import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfileCompleteGuard } from './core/guards/profile-complete.guard';
import { NotFoundComponent } from './core/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'browse',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/browse/browse.module').then(m => m.BrowseModule)
  },
  {
    path: 'messages',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule)
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
