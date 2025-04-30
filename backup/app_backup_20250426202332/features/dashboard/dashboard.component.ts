import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { logout } from '../../store/auth/auth.actions';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private store = inject(Store);
  authService = inject(AuthService);
  
  signOut(): void {
    this.store.dispatch(logout());
  }
}
