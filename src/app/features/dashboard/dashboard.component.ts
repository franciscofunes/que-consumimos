import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { logout } from '../../store/auth/auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent
  ]
})
export class DashboardComponent {
  private store = inject(Store);
  authService = inject(AuthService);
  
  signOut(): void {
    this.store.dispatch(logout());
  }

  // create property totalProducts that will return the total of products in the store
  get totalProducts(): number {
    return 0;
  }

  // add property productAddedToday
  get productsAddedToday(): number {
    return 0;
  }

  // add property totalCategories
  get totalCategories(): number {
    return 0;
  }

  // add property recentConsumptions
  get recentConsumption(): number {
    return 0;
  }


}