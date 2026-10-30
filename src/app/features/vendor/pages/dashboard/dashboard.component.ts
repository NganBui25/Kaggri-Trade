import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendorDataService } from '../../services/vendor-data.service';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class VendorDashboardComponent {
  readonly vendorData = inject(VendorDataService);
}

