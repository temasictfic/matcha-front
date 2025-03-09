import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatchService } from '@app/core/services/match.service';
import { ProfileService } from '@app/core/services/profile.service';
import { PublicProfile } from '@app/core/models/profile.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-matches',
  standalone: false,
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit {
  matches: PublicProfile[] = [];
  userProfile: any = null;
  loading = true;
  error = '';

  constructor(
    private matchService: MatchService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Load user profile for location calculation
      this.userProfile = await firstValueFrom(this.profileService.userProfile$);
      
      // Load matches
      this.matches = await firstValueFrom(this.matchService.getMatches());
    } catch (err) {
      this.error = 'Failed to load matches';
      console.error('Error loading matches:', err);
    } finally {
      this.loading = false;
    }
  }

  startChat(userId: string): void {
    this.router.navigate(['/messages'], { queryParams: { userId } });
  }

  viewProfile(profileId: string): void {
    this.router.navigate(['/browse/profile', profileId]);
  }

  async unmatch(profileId: string): Promise<void> {
    if (confirm('Are you sure you want to unmatch with this person? This action cannot be undone.')) {
      try {
        await firstValueFrom(this.matchService.unlikeProfile(profileId));
        
        // Remove from local list
        this.matches = this.matches.filter(match => match.id !== profileId);
      } catch (err) {
        console.error('Error unmatching profile:', err);
      }
    }
  }
}