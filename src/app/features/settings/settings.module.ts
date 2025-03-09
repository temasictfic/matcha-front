import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';

import { SettingsComponent } from './pages/settings/settings.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { PasswordSettingsComponent } from './components/password-settings/password-settings.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';

const routes: Routes = [
  { path: '', component: SettingsComponent }
];

@NgModule({
  declarations: [
    SettingsComponent,
    AccountSettingsComponent,
    PasswordSettingsComponent,
    NotificationSettingsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SettingsModule { }