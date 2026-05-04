import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalWindow {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() saveText = 'Save';
  @Input() cancelText = 'Cancel';
  @Input() disableSave = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSave() {
    this.save.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
