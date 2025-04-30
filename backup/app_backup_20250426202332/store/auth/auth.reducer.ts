import { createReducer, on } from '@ngrx/store';
import { User } from '@angular/fire/auth';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: any;
}

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  
  // Login with Google
  on(AuthActions.loginWithGoogle, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  // Login Success
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null
  })),
  
  // Login Failure
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Logout
  on(AuthActions.logout, state => ({
    ...state,
    loading: true
  })),
  
  // Logout Success
  on(AuthActions.logoutSuccess, state => ({
    ...state,
    user: null,
    loading: false
  })),
  
  // Logout Failure
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
