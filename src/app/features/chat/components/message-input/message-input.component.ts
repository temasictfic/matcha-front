import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: false,
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  @Output() messageSent = new EventEmitter<string>();
  
  messageControl = new FormControl('');
  
  sendMessage(): void {
    const message = this.messageControl.value?.trim();
    if (message) {
      this.messageSent.emit(message);
      this.messageControl.reset('');
    }
  }
  
  onKeyDown(event: KeyboardEvent): void {
    // Send message on Enter key (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}