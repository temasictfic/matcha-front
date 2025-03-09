import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { User } from '@app/core/models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';
  
  activeTab = 'account'; // Default tab
  
  constructor(private authService: AuthService) {}
  
  async ngOnInit(): Promise<void> {
    try {
      this.user = await firstValueFrom(this.authService.currentUser$);
    } catch (err) {
      this.error = 'Failed to load user data';
      console.error('Error loading user data:', err);
    } finally {
      this.loading = false;
    }
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}