import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '@app/core/services/profile.service';
import { Profile } from '@app/core/models/profile.model';
import { User } from '@app/core/models/user.model';
import { AuthService } from '@app/core/services/auth.service';
import { forkJoin, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-profile-view',
  standalone: false,
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit, AfterViewInit, OnDestroy {
  profile: Profile | null = null;
  user: User | null = null;
  loading = true;
  error = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
   /*  this.loadProfileData(); */
  }

/*   loadProfileData(): void {
    this.loading = true;
    
    // Load both user and profile data
    forkJoin({
      profile: this.profileService.userProfile$.pipe(take(1)),
      user: this.authService.currentUser$.pipe(take(1)),
    }).subscribe({
      next: ({ user, profile }) => {
        this.user = user;
        this.profile = profile;
        this.loading = false;
        console.log('Profile data loaded:', this.profile);
        console.log('User data loaded:', this.user);
      },
      error: err => {
        this.error = 'Failed to load profile data';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  } */

  ngAfterViewInit(): void {
    // Subscribe to profile and user data separately
    this.subscribeToProfileAndUserData();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private subscribeToProfileAndUserData(): void {
    const profileSub = this.profileService.userProfile$.subscribe({
      next: (profile) => {
        this.profile = profile;
        this.checkIfDataLoaded();
        console.log('Profile data loaded:', this.profile);
      },
      error: (err) => {
        this.error = 'Failed to load profile data';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });

    const userSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.user = user;
        this.checkIfDataLoaded();
        console.log('User data loaded:', this.user);
      },
      error: (err) => {
        this.error = 'Failed to load user data';
        this.loading = false;
        console.error('Error loading user:', err);
      }
    });

    this.subscriptions.push(profileSub, userSub);
  }

  private checkIfDataLoaded(): void {
    // Turn off loading when both user and profile data are available
    if (this.profile && this.user) {
      this.loading = false;
    }
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }
  
  editPictures(): void {
    this.router.navigate(['/profile/pictures']);
  }
  
  getPrimaryPictureUrl(): string {
    if (this.profile && this.profile.pictures && this.profile.pictures.length > 0) {
      const primaryPicture = this.profile.pictures.find(pic => pic.is_primary);
      if (primaryPicture) {
        return this.profileService.getPrimaryPictureUrl();
      }
    }
    return 'images/sc.jpeg';
  }
  
  getProfileCompletionPercentage(): number {
    if (!this.profile) return 0;
    
    let completed = 0;
    let total = 5; // Total number of required fields
    
    if (this.profile.gender) completed++;
    if (this.profile.sexual_preference) completed++;
    if (this.profile.biography) completed++;
    if (this.profile.latitude && this.profile.longitude) completed++;
    if (this.profile.pictures && this.profile.pictures.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  }
  
  getProfileCompletionStatus(): string {
    const percentage = this.getProfileCompletionPercentage();
    
    if (percentage === 100) return 'Complete';
    if (percentage >= 80) return 'Almost Complete';
    if (percentage >= 50) return 'Halfway There';
    if (percentage >= 20) return 'Just Started';
    return 'Not Started';
  }
}