import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { loginWithGoogle } from '../../../../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class LoginComponent implements OnInit {
  private store = inject(Store<{ auth: { user: any; loading: boolean; error: any } }>);
  private router = inject(Router);
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  constructor() {
    this.loading$ = this.store.select(state => state.auth.loading);
    
    this.error$ = this.store.select(state => {
      if (state.auth.error) {
        return typeof state.auth.error === 'string' 
          ? state.auth.error 
          : (state.auth.error.message || 'Error al iniciar sesión');
      }
      return null;
    });
  }
  
  ngOnInit(): void {
    this.store.select(state => state.auth.user)
      .subscribe(user => {
        if (user) {
          // this.router.navigate(['/dashboard']);
        }
      });
  }
  
  signInWithGoogle(): void {
    this.store.dispatch(loginWithGoogle());
  }
}