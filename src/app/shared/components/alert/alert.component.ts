import { Component, Input, Output, EventEmitter } from '@angular/core';

export type AlertType = 'success' | 'info' | 'warning' | 'danger';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Input() timeout: number = 0; // 0 means no auto-dismiss
  
  @Output() dismissed = new EventEmitter<void>();
  
  visible: boolean = true;
  private timeoutId: any = null;
  
  ngOnInit(): void {
    if (this.timeout > 0) {
      this.timeoutId = setTimeout(() => {
        this.dismiss();
      }, this.timeout);
    }
  }
  
  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
  
  dismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }
}