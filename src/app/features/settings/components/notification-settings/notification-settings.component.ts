import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-notification-settings',
  standalone: false,
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  notificationForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  
  constructor(private formBuilder: FormBuilder) {
    this.notificationForm = this.formBuilder.group({
      email_likes: [true],
      email_matches: [true],
      email_messages: [true],
      push_likes: [true],
      push_matches: [true],
      push_messages: [true],
      push_visits: [true]
    });
  }
  
  ngOnInit(): void {
    // In a real app, you would load the user's notification preferences from the backend
  }
  
  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    
    // Simulate saving notification settings
    setTimeout(() => {
      this.success = 'Notification settings saved successfully.';
      this.loading = false;
    }, 1000);
    
    // In a real app, you would send the settings to the backend API
  }
}