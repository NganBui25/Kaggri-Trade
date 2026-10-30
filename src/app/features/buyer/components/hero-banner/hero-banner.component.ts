import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buyer-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss'
})
export class BuyerHeroBannerComponent {
  exploreClick = output<void>();

  onExplore(): void {
    this.exploreClick.emit();
  }
}

