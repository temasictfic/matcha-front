import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';

import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';

const routes: Routes = [
  { path: '', component: NotificationsComponent }
];

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class NotificationsModule { }