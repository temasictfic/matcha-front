import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tag } from '@app/core/models/profile.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-tag-list',
  standalone: false,
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent {
  @Input() tags: Tag[] = [];
  @Input() editable: boolean = false;
  @Input() maxTags: number = 10;
  @Input() tagClass: string = 'tag';
  
  @Output() addTag = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<number>();
  
  newTagControl = new FormControl('');
  
  addNewTag(): void {
    const tagName = this.newTagControl.value?.trim();
    
    if (tagName && this.tags.length < this.maxTags) {
      // Check if tag already exists
      const exists = this.tags.some(tag => 
        tag.name.toLowerCase() === tagName.toLowerCase()
      );
      
      if (!exists) {
        this.addTag.emit(tagName);
        this.newTagControl.setValue('');
      }
    }
  }
  
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addNewTag();
    }
  }
  
  onRemoveTag(tagId: number): void {
    this.removeTag.emit(tagId);
  }
}