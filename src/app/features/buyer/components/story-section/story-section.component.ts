import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buyer-story-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-section.component.html',
  styleUrl: './story-section.component.scss'
})
export class BuyerStorySectionComponent {
  storyClick = output<void>();

  onStory(): void {
    this.storyClick.emit();
  }
}

