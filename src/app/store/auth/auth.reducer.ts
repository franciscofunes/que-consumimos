import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { SerializableUser } from './auth.actions';

export interface AuthState {
  user: SerializableUser | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  
  on(AuthActions.loginWithGoogle, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user, // This is now a serialized user
    loading: false,
    error: null
  })),
  
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(AuthActions.logout, state => ({
    ...state,
    loading: true
  })),
  
  on(AuthActions.logoutSuccess, state => ({
    ...state,
    user: null,
    loading: false
  })),
  
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);