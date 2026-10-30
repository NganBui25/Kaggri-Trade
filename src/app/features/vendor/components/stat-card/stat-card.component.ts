import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendor-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class VendorStatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  subtitle = input<string>('');
  icon = input<string>('');
  trend = input<string>('');
  trendType = input<'positive' | 'negative' | 'neutral'>('neutral');
  badge = input<string>('');
}

