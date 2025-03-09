import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Services
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { NotificationService } from './services/notification.service';
import { ChatService } from './services/chat.service';
import { MatchService } from './services/match.service';
import { LocationService } from './services/location.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { ProfileCompleteGuard } from './guards/profile-complete.guard';
import { HttpClient } from '@angular/common/http';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    NgbCollapseModule,
    NgbDropdownModule,
  ],
  providers: [
    AuthService,
    HttpClient,
    ProfileService,
    NotificationService,
    ChatService,
    MatchService,
    LocationService,
    AuthGuard,
    ProfileCompleteGuard
  ]
})
export class CoreModule {
  // Prevent Core Module from being imported more than once
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}