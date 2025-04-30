import { Injectable, inject } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

// Firebase v9+ imports
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  user$ = this.userSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  
  // Inject Firebase services using the new inject function
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  
  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
  
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  constructor() {
    // Subscribe to auth state changes using the new authState method
    authState(this.auth).subscribe(user => {
      this.userSubject.next(user);
    });
  }

  // Observable for compatibility with NgRx effects
  getCurrentUser(): Observable<User | null> {
    return authState(this.auth);
  }

  // Sign in with Google
  signInWithGoogle(): Observable<UserCredential> {
    this.loadingSubject.next(true);
    const provider = new GoogleAuthProvider();
    
    return from(signInWithPopup(this.auth, provider)).pipe(
      tap({
        next: credential => {
          if (credential.user) {
            this.updateUserData(credential.user);
          }
          this.loadingSubject.next(false);
        },
        error: () => this.loadingSubject.next(false)
      })
    );
  }

  // Sign out
  signOut(): Observable<void> {
    this.loadingSubject.next(true);
    return from(signOut(this.auth)).pipe(
      tap(() => this.loadingSubject.next(false))
    );
  }

  // Store user data in Firestore
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
    const userRef = doc(this.firestore, `users/${userId}`);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as any;
    return userData?.householdId || null;
  }
}