import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ConversationPreview } from '@app/core/models/notification.model';
import { ChatService } from '@app/core/services/chat.service';

@Component({
  selector: 'app-conversation-list',
  standalone: false,
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent {
  @Input() conversations: ConversationPreview[] = [];
  @Input() selectedConversation: ConversationPreview | null = null;
  
  @Output() conversationSelected = new EventEmitter<ConversationPreview>();
  
  constructor(private chatService: ChatService) {}
  
  isSelected(conversation: ConversationPreview): boolean {
    if (!this.selectedConversation) return false;
    return this.selectedConversation.user.id === conversation.user.id;
  }
  
  selectConversation(conversation: ConversationPreview): void {
    this.conversationSelected.emit(conversation);
  }
  
  getPreviewText(conversation: ConversationPreview): string {
    if (!conversation.recent_message) {
      return 'Start a conversation...';
    }
    
    return conversation.recent_message.content.length > 30
      ? conversation.recent_message.content.substring(0, 30) + '...'
      : conversation.recent_message.content;
  }
  
  formatMessageTime(timestamp: string | undefined): string {
    if (!timestamp) return '';
    return this.chatService.formatMessageTime(timestamp);
  }
}