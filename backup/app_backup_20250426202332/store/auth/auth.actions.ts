import { createAction, props } from '@ngrx/store';
import { User } from '@angular/fire/auth';

export const loginWithGoogle = createAction('[Auth] Login with Google');

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: any }>()
);

export const checkAuthState = createAction('[Auth] Check Auth State');
