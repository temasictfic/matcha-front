import { RouterOutlet } from '@angular/router';

import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'matcha';
  
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in (from token in localStorage)
    this.authService.checkAuthStatus();
    
    // Start notification service if user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.notificationService.connect();
      } else {
        this.notificationService.disconnect();
      }
    });

    // Setup heartbeat to maintain online status
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    // Send heartbeat every 5 minutes to update online status
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        setInterval(() => {
          this.authService.heartbeat().subscribe();
        }, 5 * 60 * 1000); // 5 minutes
      }
    });
  }
}