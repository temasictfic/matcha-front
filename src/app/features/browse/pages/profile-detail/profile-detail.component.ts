import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '@app/core/services/profile.service';
import { MatchService } from '@app/core/services/match.service';
import { LocationService } from '@app/core/services/location.service';
import { PublicProfile } from '@app/core/models/profile.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-detail',
  standalone: false,
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent implements OnInit {
  profileId: string = '';
  profile: PublicProfile | null = null;
  userProfile: any = null;
  hasLiked = false;
  isMatch = false;
  distance: number | null = null;
  loading = true;
  error = '';
  reportReason = '';
  showReportModal = false;
  reporting = false;
  activeImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private matchService: MatchService,
    private locationService: LocationService
  ) {}

  async ngOnInit(): Promise<void> {
    // Get profile ID from route
    this.profileId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.profileId) {
      this.error = 'Profile not found';
      this.loading = false;
      return;
    }
    
    try {
      // Load current user's profile for location calculation
      this.userProfile = await firstValueFrom(this.profileService.userProfile$);
      
      // Load profile data
      this.profile = await firstValueFrom(this.profileService.getProfile(this.profileId));
      
      // Calculate distance
      this.calculateDistance();
      
      // Check if user has liked this profile
      // This would require an API endpoint to check like status
      // For now, we'll assume hasLiked = false
      
      // Check if it's a match
      // This would require an API endpoint to check match status
      // For now, we'll assume isMatch = false
    } catch (err) {
      this.error = 'Failed to load profile';
      console.error('Error loading profile:', err);
    } finally {
      this.loading = false;
    }
  }

  calculateDistance(): void {
    if (this.userProfile && this.userProfile.latitude && this.userProfile.longitude &&
        this.profile && this.profile.latitude && this.profile.longitude) {
      this.distance = this.locationService.calculateDistance(
        this.userProfile.latitude,
        this.userProfile.longitude,
        this.profile.latitude,
        this.profile.longitude
      );
    }
  }

  async toggleLike(): Promise<void> {
    if (!this.profile) return;
    
    try {
      if (this.hasLiked) {
        await firstValueFrom(this.matchService.unlikeProfile(this.profile.id));
        this.hasLiked = false;
        this.isMatch = false;
      } else {
        const response = await firstValueFrom(this.matchService.likeProfile(this.profile.id));
        this.hasLiked = true;
        
        // Check if it's a match
        if (response.is_match) {
          this.isMatch = true;
          // Show match notification or redirect to chat
        }
      }
    } catch (err) {
      console.error('Error updating like status:', err);
    }
  }

  async blockProfile(): Promise<void> {
    if (!this.profile) return;
    
    if (confirm(`Are you sure you want to block ${this.profile.username}? They won't be able to see your profile or contact you.`)) {
      try {
        await firstValueFrom(this.matchService.blockProfile(this.profile.id));
        this.router.navigate(['/browse']);
      } catch (err) {
        console.error('Error blocking profile:', err);
      }
    }
  }

  openReportModal(): void {
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportReason = '';
  }

  async submitReport(): Promise<void> {
    if (!this.profile || !this.reportReason.trim()) return;
    
    this.reporting = true;
    
    try {
      await firstValueFrom(this.matchService.reportProfile(this.profile.id, this.reportReason));
      alert('Report submitted successfully');
      this.closeReportModal();
    } catch (err) {
      console.error('Error reporting profile:', err);
    } finally {
      this.reporting = false;
    }
  }

  nextImage(): void {
    if (this.profile && this.profile.pictures && this.profile.pictures.length > 0) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.profile.pictures.length;
    }
  }

  prevImage(): void {
    if (this.profile && this.profile.pictures && this.profile.pictures.length > 0) {
      this.activeImageIndex = (this.activeImageIndex - 1 + this.profile.pictures.length) % this.profile.pictures.length;
    }
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  getCurrentImageUrl(): string {
    if (this.profile && this.profile.pictures && this.profile.pictures.length > 0) {
      return this.profile.pictures[this.activeImageIndex].file_path;
    }
    return 'images/sc.jpeg';
  }

  goBack(): void {
    this.router.navigate(['/browse']);
  }

  startChat(): void {
    if (this.profile) {
      this.router.navigate(['/messages'], { queryParams: { userId: this.profile.id }});
    }
  }

  formatDistance(): string {
    if (!this.distance) return '';
    return this.locationService.formatDistance(this.distance);
  }
}