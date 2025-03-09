import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'onlineStatus'
})
export class OnlineStatusPipe implements PipeTransform {
  transform(isOnline: boolean, lastOnline: string | null | undefined): string {
    if (isOnline) {
      return 'Online';
    } else if (lastOnline) {
      return `Last seen ${this.timeAgo(lastOnline)}`;
    } else {
      return 'Offline';
    }
  }
  
  private timeAgo(value: string): string {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }
}