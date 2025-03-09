import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PublicProfile } from '@app/core/models/profile.model';
import { ProfileService } from '@app/core/services/profile.service';
import { MatchService } from '@app/core/services/match.service';
import { LocationService } from '@app/core/services/location.service';
import { faHeart, faHeartBroken, faShield, faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile-card',
  standalone: false,
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  @Input() profile!: PublicProfile;
  @Input() userLatitude?: number | null;
  @Input() userLongitude?: number | null;
  @Input() showActions = true;
  @Input() showDistance = true;
  @Input() hasLiked = false;
  
  @Output() likeChanged = new EventEmitter<boolean>();
  @Output() profileBlocked = new EventEmitter<void>();
  
  // FontAwesome icons
  faHeart = faHeart;
  faHeartBroken = faHeartBroken;
  faShield = faShield;
  faTimesCircle = faTimesCircle;
  faInfoCircle = faInfoCircle;
  
  distance: number | null = null;
  
  constructor(
    private router: Router,
    private matchService: MatchService,
    private locationService: LocationService
  ) {}
  
  ngOnInit(): void {
    this.calculateDistance();
  }
  
  ngOnChanges(): void {
    this.calculateDistance();
  }
  
  viewProfile(): void {
    this.router.navigate(['/browse/profile', this.profile.id]);
  }
  
  toggleLike(event: Event): void {
    event.stopPropagation();
    
    if (this.hasLiked) {
      this.matchService.unlikeProfile(this.profile.id).subscribe({
        next: () => {
          this.hasLiked = false;
          this.likeChanged.emit(false);
        },
        error: (error) => {
          console.error('Error unliking profile:', error);
        }
      });
    } else {
      this.matchService.likeProfile(this.profile.id).subscribe({
        next: (response) => {
          this.hasLiked = true;
          this.likeChanged.emit(true);
          
          // Check if it's a match
          if (response.is_match) {
            // TODO: Show match notification/modal
            console.log('It\'s a match!', this.profile.username);
          }
        },
        error: (error) => {
          console.error('Error liking profile:', error);
        }
      });
    }
  }
  
  blockProfile(event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to block ${this.profile.username}?`)) {
      this.matchService.blockProfile(this.profile.id).subscribe({
        next: () => {
          this.profileBlocked.emit();
        },
        error: (error) => {
          console.error('Error blocking profile:', error);
        }
      });
    }
  }
  
  reportProfile(event: Event): void {
    event.stopPropagation();
    
    const reason = prompt(`Why are you reporting ${this.profile.username}?`);
    if (reason) {
      this.matchService.reportProfile(this.profile.id, reason).subscribe({
        next: () => {
          alert('Profile reported successfully');
        },
        error: (error) => {
          console.error('Error reporting profile:', error);
        }
      });
    }
  }
  
  private calculateDistance(): void {
    if (
      this.userLatitude && 
      this.userLongitude && 
      this.profile?.latitude && 
      this.profile?.longitude
    ) {
      this.distance = this.locationService.calculateDistance(
        this.userLatitude,
        this.userLongitude,
        this.profile.latitude,
        this.profile.longitude
      );
    } else {
      this.distance = null;
    }
  }
  
  formatDistance(): string {
    if (this.distance === null) {
      return 'Unknown distance';
    }
    return this.locationService.formatDistance(this.distance);
  }
  
  getPrimaryPicture(): string {
    if (this.profile.pictures && this.profile.pictures.length > 0) {
      const primaryPicture = this.profile.pictures.find(pic => pic.is_primary);
      if (primaryPicture) {
        return primaryPicture.file_path;
      }
      // Return first picture if no primary is set
      return this.profile.pictures[0].file_path;
    }
    
    // Return default profile picture if no pictures
    return 'images/sc.jpeg';
  }
}