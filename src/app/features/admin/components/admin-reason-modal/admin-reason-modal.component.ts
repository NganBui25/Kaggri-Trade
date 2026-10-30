import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reason-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reason-modal.component.html',
  styleUrl: './admin-reason-modal.component.scss'
})
export class AdminReasonModalComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() confirmText: string = 'Xác nhận thao tác';
  @Input() confirmButtonClass: string = 'bg-[#0d623b] hover:bg-[#08492d] text-white';
  @Input() placeholder: string = 'Nhập lý do chi tiết (tối thiểu 10 ký tự)...';
  @Input() warningText?: string;
  @Input() minLength: number = 10;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  reasonText = signal<string>('');
  submitted = signal<boolean>(false);

  isValid(): boolean {
    return this.reasonText().trim().length >= this.minLength;
  }

  onConfirm(): void {
    this.submitted.set(true);
    if (!this.isValid()) return;
    this.confirm.emit(this.reasonText().trim());
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}

