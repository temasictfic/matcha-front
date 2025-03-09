import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '@app/core/services/chat.service';
import { ProfileService } from '@app/core/services/profile.service';
import { Message, ConversationPreview } from '@app/core/models/notification.model';
import { firstValueFrom, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  conversations: ConversationPreview[] = [];
  selectedConversation: ConversationPreview | null = null;
  messages: Message[] = [];
  loading = {
    conversations: true,
    messages: false
  };
  error = '';
  
  private newMessageSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private profileService: ProfileService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Load conversations
      await this.loadConversations();
      
      // Check if userId is provided in query params
      this.route.queryParams.subscribe(params => {
        const userId = params['userId'];
        if (userId) {
          // Find conversation with this user
          const conversation = this.conversations.find(
            c => c.user.id === userId
          );
          
          if (conversation) {
            this.selectConversation(conversation);
          }
        } else if (this.conversations.length > 0) {
          // Auto-select first conversation
          this.selectConversation(this.conversations[0]);
        }
      });
    } catch (err) {
      this.error = 'Failed to load conversations';
      console.error('Error loading conversations:', err);
    } finally {
      this.loading.conversations = false;
    }
  }

  ngOnDestroy(): void {
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
  }

  async loadConversations(): Promise<void> {
    try {
      this.conversations = await firstValueFrom(this.chatService.getConversations());
    } catch (err) {
      console.error('Error loading conversations:', err);
      throw err;
    }
  }

  async selectConversation(conversation: ConversationPreview): Promise<void> {
    // Unsubscribe from previous message subscription
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
    }
    
    this.selectedConversation = conversation;
    this.loading.messages = true;
    
    try {
      // Load messages for this conversation
      this.messages = await firstValueFrom(this.chatService.getMessages(conversation.user.id));
      
      // Subscribe to new messages
      this.newMessageSubscription = this.chatService.listenForNewMessages(conversation.user.id)
        .subscribe(message => {
          this.messages.push(message);
          
          // Update unread count in conversation
          conversation.unread_count = 0;
        });
      
      // Refresh conversations to update unread counts
      await this.loadConversations();
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      this.loading.messages = false;
    }
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.selectedConversation || !content.trim()) {
      return;
    }
    
    try {
      const message = await firstValueFrom(
        this.chatService.sendMessage(this.selectedConversation.user.id, content)
      );
      
      // Add message to list
      this.messages.push(message);
      
      // Update conversation
      this.selectedConversation.recent_message = message;
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  getPrimaryPictureUrl(userId: string): string {
    // Ideally, this would use a more direct method to get a user's picture
    // For now, we'll return a placeholder
    return 'images/sc.jpeg';
  }


}