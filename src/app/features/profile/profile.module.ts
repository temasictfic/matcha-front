import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';

import { ProfileViewComponent } from './pages/profile-view/profile-view.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { ProfilePicturesComponent } from './pages/profile-pictures/profile-pictures.component';

const routes: Routes = [
  { path: '', component: ProfileViewComponent },
  { path: 'edit', component: ProfileEditComponent },
  { path: 'pictures', component: ProfilePicturesComponent }
];

@NgModule({
  declarations: [
    ProfileViewComponent,
    ProfileEditComponent,
    ProfilePicturesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProfileModule { }