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
  
  loading$: Observable<boolean> = this.authService.loading$;
  error$: Observable<string | null> = of(null);
  
  signInWithGoogle(): void {
    this.error$ = of(null);
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