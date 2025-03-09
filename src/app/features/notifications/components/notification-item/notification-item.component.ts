import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Notification, NotificationType } from '@app/core/models/notification.model';

@Component({
  selector: 'app-notification-item',
  standalone: false,
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {
  @Input() notification!: Notification;
  
  @Output() read = new EventEmitter<void>();
  @Output() profileClicked = new EventEmitter<string | null>();
  @Output() messageClicked = new EventEmitter<string | null>();
  
  notificationType = NotificationType;
  notificationIcon = '';
  notificationClass = '';
  
  ngOnInit(): void {
    this.setNotificationStyles();
    
    // Mark as read if not already read
    if (!this.notification.is_read) {
      this.read.emit();
    }
  }
  
  setNotificationStyles(): void {
    switch (this.notification.type) {
      case NotificationType.LIKE:
        this.notificationIcon = 'fa-heart';
        this.notificationClass = 'like-notification';
        break;
      case NotificationType.MATCH:
        this.notificationIcon = 'fa-users';
        this.notificationClass = 'match-notification';
        break;
      case NotificationType.VISIT:
        this.notificationIcon = 'fa-eye';
        this.notificationClass = 'visit-notification';
        break;
      case NotificationType.MESSAGE:
        this.notificationIcon = 'fa-comment';
        this.notificationClass = 'message-notification';
        break;
      case NotificationType.UNMATCH:
        this.notificationIcon = 'fa-user-slash';
        this.notificationClass = 'unmatch-notification';
        break;
      default:
        this.notificationIcon = 'fa-bell';
        this.notificationClass = '';
    }
  }
  
  onProfileClick(): void {
    this.profileClicked.emit(this.notification.sender_id);
  }
  
  onMessageClick(): void {
    this.messageClicked.emit(this.notification.sender_id);
  }
  
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return diffSecs <= 5 ? 'Just now' : `${diffSecs} seconds ago`;
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}