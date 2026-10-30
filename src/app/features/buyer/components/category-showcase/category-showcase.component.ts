import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CategoryCardItem {
  id: string;
  name: string;
  imageUrl: string;
  imagePosition: string;
  categoryFilterKey: string;
}

@Component({
  selector: 'app-buyer-category-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-showcase.component.html',
  styleUrl: './category-showcase.component.scss'
})
export class BuyerCategoryShowcaseComponent {
  selectCategory = output<string>();

  readonly categories: CategoryCardItem[] = [
    {
      id: 'cat-veg',
      name: 'Rau củ tươi',
      imageUrl: '/img/home-hero.png',
      imagePosition: '70% center',
      categoryFilterKey: 'Củ quả'
    },
    {
      id: 'cat-pantry',
      name: 'Ngũ cốc & hạt',
      imageUrl: '/img/home-pantry.png',
      imagePosition: 'center',
      categoryFilterKey: 'all'
    },
    {
      id: 'cat-leaf',
      name: 'Rau lá',
      imageUrl: '/img/home-hero-v2.png',
      imagePosition: '76% center',
      categoryFilterKey: 'Rau ăn lá'
    },
    {
      id: 'cat-root',
      name: 'Củ theo mùa',
      imageUrl: '/img/home-hero.png',
      imagePosition: '37% center',
      categoryFilterKey: 'Củ quả'
    },
    {
      id: 'cat-eco',
      name: 'Sống xanh',
      imageUrl: '/img/home-eco.png',
      imagePosition: 'center',
      categoryFilterKey: 'all'
    }
  ];

  onCardClick(cat: CategoryCardItem): void {
    this.selectCategory.emit(cat.categoryFilterKey);
  }

  onViewAll(): void {
    this.selectCategory.emit('all');
  }
}

