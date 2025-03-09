import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { faUser, faHeart, faComments, faBell, faSignOutAlt, faCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // FontAwesome icons
  faUser = faUser;
  faHeart = faHeart;
  faComments = faComments;
  faBell = faBell;
  faSignOutAlt = faSignOutAlt;
  faCog = faCog;

  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  unreadNotifications: number = 0;
  unreadMessages: number = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Subscribe to notification count changes
    this.notificationService.unreadNotificationCount$.subscribe(count => {
      this.unreadNotifications = count;
    });

    // Subscribe to unread message count changes
    this.notificationService.unreadMessageCount$.subscribe(count => {
      this.unreadMessages = count;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}