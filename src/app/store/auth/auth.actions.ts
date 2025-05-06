import { createAction, props } from '@ngrx/store';

// Define a serializable user interface
export interface SerializableUser {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  householdId?: string | null;
}

export const loginWithGoogle = createAction('[Auth] Login with Google');

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: SerializableUser }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

export const checkAuthState = createAction('[Auth] Check Auth State');