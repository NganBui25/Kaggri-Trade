import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);

  readonly toasts = computed(() => this.toastsSignal());

  show(type: ToastType, message: string, title?: string, duration = 4000): void {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    
    const defaultTitles: Record<ToastType, string> = {
      success: 'Thành công',
      error: 'Đã có lỗi xảy ra',
      warning: 'Cảnh báo',
      info: 'Thông báo'
    };

    const toast: Toast = {
      id,
      type,
      title: title || defaultTitles[type],
      message,
      duration
    };

    this.toastsSignal.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string, title = 'Thành công', duration = 4000): void {
    this.show('success', message, title, duration);
  }

  error(message: string, title = 'Đã có lỗi xảy ra', duration = 4000): void {
    this.show('error', message, title, duration);
  }

  warning(message: string, title = 'Cảnh báo', duration = 4000): void {
    this.show('warning', message, title, duration);
  }

  info(message: string, title = 'Thông báo', duration = 4000): void {
    this.show('info', message, title, duration);
  }

  dismiss(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  remove(id: string): void {
    this.dismiss(id);
  }

  clear(): void {
    this.toastsSignal.set([]);
  }
}
