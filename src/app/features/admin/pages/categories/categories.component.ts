import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { CategoryItem, UnitItem } from '../../models/admin.model';
import { AdminForbiddenComponent } from '../../components/forbidden/forbidden.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminForbiddenComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class AdminCategoriesComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly canAccess = computed(() => this.auth.canAccessModule('categories'));
  readonly canEdit = computed(() => this.auth.canPerformAction('categories'));

  activeTab = signal<'categories' | 'units'>('categories');
  searchQuery = signal<string>('');

  // Category Modals
  showAddCatModal = signal<boolean>(false);
  newCatName = signal<string>('');
  newCatParentId = signal<string>('');

  editTargetCat = signal<CategoryItem | null>(null);
  editCatName = signal<string>('');

  deactivateTargetCat = signal<CategoryItem | null>(null);

  // Unit Modals
  showAddUnitModal = signal<boolean>(false);
  newUnitName = signal<string>('');
  newUnitSymbol = signal<string>('');

  // Filtered categories
  filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.data.categories();
    if (!q) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.parentName && c.parentName.toLowerCase().includes(q))
    );
  });

  // Filtered units
  filteredUnits = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.data.units();
    if (!q) return list;
    return list.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.symbol.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  // Parent Category Options
  parentCategories = computed(() => {
    return this.data.categories().filter(c => !c.parent);
  });

  // CATEGORY ACTIONS
  openAddCatModal(): void {
    this.newCatName.set('');
    this.newCatParentId.set('');
    this.showAddCatModal.set(true);
  }

  closeAddCatModal(): void {
    this.showAddCatModal.set(false);
  }

  submitAddCategory(): void {
    if (!this.newCatName().trim()) return;
    const parent = this.newCatParentId() || null;
    this.data.addCategory(this.newCatName(), parent);
    this.closeAddCatModal();
  }

  openEditCatModal(cat: CategoryItem): void {
    this.editTargetCat.set(cat);
    this.editCatName.set(cat.name);
  }

  closeEditCatModal(): void {
    this.editTargetCat.set(null);
  }

  submitEditCategory(): void {
    const cat = this.editTargetCat();
    if (!cat || !this.editCatName().trim()) return;
    this.data.renameCategory(cat.id, this.editCatName());
    this.closeEditCatModal();
  }

  confirmDeactivateCat(cat: CategoryItem): void {
    this.deactivateTargetCat.set(cat);
  }

  closeDeactivateModal(): void {
    this.deactivateTargetCat.set(null);
  }

  executeDeactivateCat(): void {
    const cat = this.deactivateTargetCat();
    if (!cat) return;
    this.data.deactivateCategory(cat.id);
    this.closeDeactivateModal();
  }

  // UNIT ACTIONS
  openAddUnitModal(): void {
    this.newUnitName.set('');
    this.newUnitSymbol.set('');
    this.showAddUnitModal.set(true);
  }

  closeAddUnitModal(): void {
    this.showAddUnitModal.set(false);
  }

  submitAddUnit(): void {
    if (!this.newUnitName().trim() || !this.newUnitSymbol().trim()) return;
    this.data.addUnit(this.newUnitName().trim(), this.newUnitSymbol().trim());
    this.closeAddUnitModal();
  }

  toggleUnitStatus(unit: UnitItem): void {
    this.data.deactivateUnit(unit.id);
  }
}

