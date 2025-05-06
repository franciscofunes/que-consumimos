import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { SerializableUser } from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  private serializeUser(user: any): SerializableUser {
    if (!user) {
      return {
        uid: null,
        email: null,
        displayName: null,
        photoURL: null,
        householdId: null
      };
    }
    
    return {
      uid: user.uid || null,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      // Include any other serializable properties you need
      householdId: user.householdId || null
    };
  }

  loginWithGoogle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginWithGoogle),
      switchMap(() =>
        this.authService.signInWithGoogle().pipe(
          map(userCredential => {
            const serializedUser = this.serializeUser(userCredential.user);
            return AuthActions.loginSuccess({ user: serializedUser });
          }),
          catchError(error => {
            const errorMessage = error?.message || 'Failed to login';
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          // Only redirect if not already in the app
          const currentPath = this.router.url;
          if (currentPath === '/auth/login' || currentPath === '/auth/register') {
            console.log('Login success effect - redirecting to dashboard from auth page');
            this.router.navigate(['/dashboard']);
          } else {
            console.log('Login success effect - already in app, not redirecting');
          }
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        from(this.authService.signOut()).pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(error => {
            const errorMessage = error?.message || 'Failed to logout';
            return of(AuthActions.logoutFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => this.router.navigate(['/auth/login']))
      ),
    { dispatch: false }
  );

  checkAuthState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthState),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map(user => {
            if (user) {
              const serializedUser = this.serializeUser(user);
              return AuthActions.loginSuccess({ user: serializedUser });
            } else {
              return AuthActions.logoutSuccess();
            }
          }),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    )
  );
}