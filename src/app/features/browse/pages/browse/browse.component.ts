import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ProfileService } from '@app/core/services/profile.service';
import { MatchService } from '@app/core/services/match.service';
import { ProfileBase, PublicProfile } from '@app/core/models/profile.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-browse',
  standalone: false,
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit{
  profiles: PublicProfile[] = [];
  userProfile: ProfileBase | null = null;
  loading = true;
  error = '';
  sortBy = 'distance'; // Default sort
  
  // Filters
  filters = {
    minAge: 18,
    maxAge: 99,
    minFame: 0,
    maxFame: 10,
    maxDistance: null as number | null,
    tags: [] as string[]
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;

  constructor(
    private profileService: ProfileService,
    private matchService: MatchService
  ) {}


  async ngOnInit(): Promise<void> {
    try {
      // Load current user's profile for location data
      this.userProfile = await firstValueFrom(this.profileService.userProfile$);
      
      // Load suggested profiles
      await this.loadProfiles();
    } catch (err) {
      this.error = 'Failed to load profiles';
      console.error('Error loading profiles:', err);
      this.loading = false;
    }
  }

  async loadProfiles(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      // Calculate offset based on pagination
      const offset = (this.currentPage - 1) * this.itemsPerPage;
      
      // Prepare params for API call
      const params: any = {
        limit: this.itemsPerPage,
        offset
      };
      
      // Add filters if set
      if (this.filters.minAge) params.min_age = this.filters.minAge;
      if (this.filters.maxAge) params.max_age = this.filters.maxAge;
      if (this.filters.minFame) params.min_fame = this.filters.minFame;
      if (this.filters.maxFame) params.max_fame = this.filters.maxFame;
      if (this.filters.maxDistance) params.max_distance = this.filters.maxDistance;
      if (this.filters.tags.length > 0) params.tags = this.filters.tags;
      
      // Load profiles
      const profiles = await firstValueFrom(this.profileService.getSuggestedProfiles(params));
      
      this.profiles = profiles;
      this.totalItems = profiles.length; // For pagination
      
      // Apply sorting
      this.sortProfiles();
    } catch (err) {
      this.error = 'Failed to load profiles';
      console.error('Error loading profiles:', err);
    } finally {
      this.loading = false;
    }
  }

  onFiltersChanged(filters: any): void {
    this.filters = filters;
    this.currentPage = 1; // Reset to first page when filters change
    this.loadProfiles();
  }

  onSortChanged(sortBy: string): void {
    this.sortBy = sortBy;
    this.sortProfiles();
  }

  sortProfiles(): void {
    switch (this.sortBy) {
      case 'distance':
        // Sort by distance (profiles closer to user come first)
        this.profiles.sort((a, b) => {
          const distA = this.calculateDistance(a);
          const distB = this.calculateDistance(b);
          return distA - distB;
        });
        break;
      case 'fame':
        // Sort by fame rating (highest first)
        this.profiles.sort((a, b) => b.fame_rating - a.fame_rating);
        break;
      case 'tags':
        // Sort by number of common tags (most common first)
        // This would require implementation of calculating common tags
        break;
      case 'age':
        // Sort by age (younger first)
        // This would require age field in the profile data
        break;
    }
  }

  calculateDistance(profile: PublicProfile): number {
    if (!this.userProfile || !this.userProfile.latitude || !this.userProfile.longitude ||
        !profile.latitude || !profile.longitude) {
      return Number.MAX_VALUE; // Put profiles without location at the end
    }
    
    // Simple Euclidean distance calculation (not accurate for geographic distances)
    // In a real app, use Haversine formula for proper Earth distance calculation
    const latDiff = this.userProfile.latitude - profile.latitude;
    const lonDiff = this.userProfile.longitude - profile.longitude;
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  }

  async onLikeChanged(liked: boolean, profileId: string): Promise<void> {
    try {
      if (liked) {
        await firstValueFrom(this.matchService.likeProfile(profileId));
      } else {
        await firstValueFrom(this.matchService.unlikeProfile(profileId));
      }
    } catch (err) {
      console.error('Error updating like status:', err);
    }
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadProfiles();
  }

  onProfileBlocked(profileId: string): void {
    // Remove the profile from the current list
    this.profiles = this.profiles.filter(p => p.id !== profileId);
  }

  round() : number {
    return Math.ceil(this.totalItems / this.itemsPerPage)
  }
}