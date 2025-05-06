import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { checkAuthState } from 'src/app/store/auth/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private router = inject(Router);
  private store = inject(Store<{ auth: { user: any; loading: boolean } }>);

  canActivate: CanActivateFn = () => {
    this.store.dispatch(checkAuthState());
    
    return this.store.select(state => state.auth.user).pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        }
        
        this.router.navigate(['/auth/login']);
        return false;
      })
    );
  };
}