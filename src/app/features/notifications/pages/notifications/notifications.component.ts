import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@app/core/services/notification.service';
import { Notification, NotificationType } from '@app/core/models/notification.model';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = true;
  error = '';
  
  private newNotificationSubscription: Subscription | null = null;
  
  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}
  
  async ngOnInit(): Promise<void> {
    try {
      // Load notifications
      await this.loadNotifications();
      
      // Mark all as read after a short delay
      setTimeout(() => {
        this.markAllAsRead();
      }, 2000);
      
      // Subscribe to new notifications
      this.newNotificationSubscription = this.notificationService.newNotification$
        .subscribe(notification => {
          this.notifications.unshift(notification);
        });
    } catch (err) {
      this.error = 'Failed to load notifications';
      console.error('Error loading notifications:', err);
    } finally {
      this.loading = false;
    }
  }
  
  ngOnDestroy(): void {
    if (this.newNotificationSubscription) {
      this.newNotificationSubscription.unsubscribe();
    }
  }
  
  async loadNotifications(): Promise<void> {
    try {
      const notifications = await firstValueFrom(
        this.notificationService.getNotifications()
      );
      
      this.notifications = notifications;
    } catch (err) {
      console.error('Error loading notifications:', err);
      throw err;
    }
  }
  
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.notificationService.markNotificationAsRead(notificationId)
      );
      
      // Update local notification
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }
  
  async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(
        this.notificationService.markAllNotificationsAsRead()
      );
      
      // Update all local notifications
      this.notifications.forEach(notification => {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }
  
  navigateToProfile(senderId: string | null): void {
    if (senderId) {
      this.router.navigate(['/browse/profile', senderId]);
    }
  }
  
  navigateToMessages(senderId: string | null): void {
    if (senderId) {
      this.router.navigate(['/messages'], { queryParams: { userId: senderId } });
    }
  }
}