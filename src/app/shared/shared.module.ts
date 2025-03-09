import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Components
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { AlertComponent } from './components/alert/alert.component';
import { MapComponent } from './components/map/map.component';
import { TagListComponent } from './components/tag-list/tag-list.component';
import { ProfilePictureComponent } from './components/profile-picture/profile-picture.component';

// Pipes
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { OnlineStatusPipe } from './pipes/online-status.pipe';

// Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [
    ProfileCardComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    MapComponent,
    TagListComponent,
    ProfilePictureComponent,
  ],
  imports: [
    ClickOutsideDirective,
    TimeAgoPipe,
    OnlineStatusPipe,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    ProfileCardComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    MapComponent,
    TagListComponent,
    ProfilePictureComponent,
    TimeAgoPipe,
    OnlineStatusPipe,
    ClickOutsideDirective
  ]
})
export class SharedModule { }