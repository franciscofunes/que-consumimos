import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, User, authState, signInWithPopup, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);
  
  // Create signals for auth state
  readonly loading = signal<boolean>(false);
  
  // Keep a compatibility loading$ for older components
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  // Create user signal
  readonly user = toSignal(authState(this.auth), { initialValue: null });
  
  // Computed value for authentication status - returns a boolean value, not a function
  get isAuthenticated(): boolean {
    return !!this.user();
  }
  
  constructor() {
    // Keep loading signal and subject in sync
    this.loading.set(false);
    this.loadingSubject.next(false);
  }
  
  // Get current user methods
  getUserId(): string | null {
    return this.user()?.uid || null;
  }
  
  getUserName(): string | null {
    return this.user()?.displayName || null;
  }
  
  getUserEmail(): string | null {
    return this.user()?.email || null;
  }
  
  getUserPhoto(): string | null {
    return this.user()?.photoURL || null;
  }

  // Auth methods - keep Observable pattern for backward compatibility
  signInWithGoogle(): Observable<any> {
    this.loading.set(true);
    this.loadingSubject.next(true);
    
    const provider = new GoogleAuthProvider();
    
    return from(signInWithPopup(this.auth, provider)).pipe(
      tap({
        next: credential => {
          if (credential.user) {
            this.updateUserData(credential.user);
          }
          this.loading.set(false);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadingSubject.next(false);
        }
      })
    );
  }

  signOut(): Promise<void> {
    this.loading.set(true);
    this.loadingSubject.next(true);
    
    return signOut(this.auth).finally(() => {
      this.loading.set(false);
      this.loadingSubject.next(false);
    });
  }

  private async updateUserData(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: new Date()
    };
    
    return setDoc(userRef, data, { merge: true });
  }

  // Get user's household ID
  async getUserHousehold(userId: string): Promise<string | null> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data() as { householdId?: string };
      return userData?.householdId || null;
    } catch (error) {
      console.error('Error getting user household:', error);
      return null;
    }
  }
}