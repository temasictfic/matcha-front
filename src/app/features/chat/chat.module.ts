import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';

import { ChatComponent } from './pages/chat/chat.component';
import { ConversationListComponent } from './components/conversation-list/conversation-list.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { MessageInputComponent } from './components/message-input/message-input.component';

const routes: Routes = [
  { path: '', component: ChatComponent }
];

@NgModule({
  declarations: [
    ChatComponent,
    ConversationListComponent,
    MessageListComponent,
    MessageInputComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ChatModule { }