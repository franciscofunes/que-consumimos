import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Using the loading$ Observable from AuthService
  loading$: Observable<boolean>;
  error$: Observable<string | null> = of(null);
  
  constructor() {
    // Use the existing loading$ Observable from the service
    this.loading$ = this.authService.loading$;
  }
  
  signInWithGoogle(): void {
    this.error$ = of(null);
    // Continuing to use the Observable pattern since the updated AuthService supports it
    this.authService.signInWithGoogle().pipe(
      tap(() => {
        this.router.navigate(['/dashboard']);
      }),
      catchError(error => {
        this.error$ = of(error.message || 'Error al iniciar sesión');
        return of(null);
      })
    ).subscribe();
  }
}