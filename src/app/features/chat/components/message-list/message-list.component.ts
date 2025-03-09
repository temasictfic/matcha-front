import { Component, Input, OnChanges, AfterViewChecked, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { Message } from '@app/core/models/notification.model';
import { ChatService } from '@app/core/services/chat.service';

@Component({
  selector: 'app-message-list',
  standalone: false,
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnChanges, AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() loading = false;
  @Input() currentUserId: string | null = null;
  
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  
  constructor(private chatService: ChatService) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    // Scroll to bottom when messages change
    if (changes['messages']) {
      this.scrollToBottom();
    }
  }
  
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  
  scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
  
  isCurrentUser(senderId: string): boolean {
    return senderId === this.currentUserId;
  }
  
  formatMessageTime(timestamp: string): string {
    return this.chatService.formatMessageTime(timestamp);
  }
  
  // Group messages by date for display
  groupMessagesByDate(): any[] {
    if (!this.messages || this.messages.length === 0) {
      return [];
    }
    
    const groups: any[] = [];
    let currentDate = '';
    let currentMessages: Message[] = [];
    
    this.messages.forEach(message => {
      const messageDate = new Date(message.created_at).toLocaleDateString();
      
      if (messageDate !== currentDate) {
        // Start a new group
        if (currentMessages.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentMessages
          });
        }
        
        currentDate = messageDate;
        currentMessages = [message];
      } else {
        // Add to current group
        currentMessages.push(message);
      }
    });
    
    // Add the last group
    if (currentMessages.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentMessages
      });
    }
    
    return groups;
  }
  
  formatDateHeader(dateString: string): string {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
}