import { Injectable, signal, computed } from '@angular/core';
import { 
  Auth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  authState, 
  UserCredential,
  User 
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState$ = authState(this.auth);
  
  // Signals
  currentUser = toSignal(this.authState$, { initialValue: null });
  isAuthenticated = computed(() => !!this.currentUser());
  userLoading = signal(false);
  
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  // Observable for compatibility with NgRx effects
  getCurrentUser(): Observable<User | null> {
    return this.authState$;
  }

  // Sign in with Google
  signInWithGoogle(): Observable<UserCredential> {
    this.userLoading.set(true);
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      tap({
        next: credential => {
          this.updateUserData(credential.user);
          this.userLoading.set(false);
        },
        error: () => this.userLoading.set(false)
      })
    );
  }

  // Sign out
  signOut(): Observable<void> {
    this.userLoading.set(true);
    return from(signOut(this.auth)).pipe(
      tap({
        finalize: () => this.userLoading.set(false)
      })
    );
  }

  // Store user data in Firestore
  private updateUserData(user: User): Promise<void> {
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
    const userDoc = await getDoc(doc(this.firestore, `users/${userId}`));
    const userData = userDoc.data();
    return userData?.householdId || null;
  }
}
