import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { checkAuthState } from './store/auth/auth.actions';
import { FirestoreSeedService } from './core/services/firestore-seed.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private seedService = inject(FirestoreSeedService);

  async ngOnInit() {
    this.store.dispatch(checkAuthState());

    try {
      await this.seedService.initializeIfNeeded();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
}