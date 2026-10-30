import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, duration = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message };

    this.toasts.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, title = 'Thành công'): void {
    this.show('success', message, title);
  }

  error(message: string, title = 'Đã có lỗi xảy ra'): void {
    this.show('error', message, title);
  }

  warning(message: string, title = 'Cảnh báo'): void {
    this.show('warning', message, title);
  }

  info(message: string, title = 'Thông báo'): void {
    this.show('info', message, title);
  }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}

