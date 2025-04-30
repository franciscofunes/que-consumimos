import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { loginWithGoogle } from '../../../../store/auth/auth.actions';
import { AuthState } from '../../../../store/auth/auth.reducer';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private store = inject(Store<{ auth: AuthState }>);
  
  loading$: Observable<boolean>;
  error$: Observable<any>;
  
  constructor() {
    this.loading$ = this.store.select(state => state.auth.loading);
    this.error$ = this.store.select(state => state.auth.error);
  }
  
  signInWithGoogle(): void {
    this.store.dispatch(loginWithGoogle());
  }
}
