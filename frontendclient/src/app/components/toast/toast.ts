import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { Subscription } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent implements OnInit, OnDestroy {
  messages: ToastMessage[] = [];
  private nextId = 0;
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(notification => {
      this.show(notification.message, notification.type, notification.duration || 3000);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000) {
    const toast: ToastMessage = {
      message,
      type,
      id: this.nextId++
    };

    this.messages.push(toast);

    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  remove(id: number) {
    this.messages = this.messages.filter(m => m.id !== id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  }
}
