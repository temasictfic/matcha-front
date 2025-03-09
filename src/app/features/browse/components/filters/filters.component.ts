import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Tag } from '@app/core/models/profile.model';
import { ProfileService } from '@app/core/services/profile.service';
import { firstValueFrom } from 'rxjs';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-filters',
  standalone: false,
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Input() currentFilters: any = {
    minAge: 18,
    maxAge: 99,
    minFame: 0,
    maxFame: 10,
    maxDistance: null,
    tags: []
  };
  
  @Output() filtersChanged = new EventEmitter<any>();
  
  filterForm: FormGroup;
  userTags: Tag[] = [];
  selectedTags: string[] = [];
  loading = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService
  ) {
    this.filterForm = this.formBuilder.group({
      minAge: [18],
      maxAge: [99],
      minFame: [0],
      maxFame: [10],
      maxDistance: [null]
    });
  }
  
  async ngOnInit(): Promise<void> {
    // Initialize form with current filters
    this.filterForm.patchValue({
      minAge: this.currentFilters.minAge,
      maxAge: this.currentFilters.maxAge,
      minFame: this.currentFilters.minFame,
      maxFame: this.currentFilters.maxFame,
      maxDistance: this.currentFilters.maxDistance
    });
    
    this.selectedTags = [...this.currentFilters.tags];
    
    // Load user's tags for filtering
    this.loading = true;
    try {
      const profile = await firstValueFrom(this.profileService.userProfile$);
      if (profile && profile.tags) {
        this.userTags = profile.tags;
      }
    } catch (err) {
      console.error('Error loading user tags:', err);
    } finally {
      this.loading = false;
    }
  }
  
  applyFilters(): void {
    // Combine form values with selected tags
    const filters = {
      ...this.filterForm.value,
      tags: this.selectedTags
    };
    
    this.filtersChanged.emit(filters);
    
    // Close the offcanvas panel using Bootstrap's JS API
    const offcanvasElement = document.getElementById('filtersOffcanvas');
    if (offcanvasElement) {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    }
  }
  
  resetFilters(): void {
    // Reset to default values
    this.filterForm.reset({
      minAge: 18,
      maxAge: 99,
      minFame: 0,
      maxFame: 10,
      maxDistance: null
    });
    
    this.selectedTags = [];
    
    // Emit reset filters
    this.applyFilters();
  }
  
  toggleTag(tagName: string): void {
    if (this.selectedTags.includes(tagName)) {
      // Remove tag if already selected
      this.selectedTags = this.selectedTags.filter(t => t !== tagName);
    } else {
      // Add tag if not already selected
      this.selectedTags.push(tagName);
    }
  }
  
  isTagSelected(tagName: string): boolean {
    return this.selectedTags.includes(tagName);
  }
}