import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, User, authState, signInWithPopup, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  
  readonly loading = signal<boolean>(false);
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  readonly user = toSignal(authState(this.auth), { initialValue: null });
  
  get isAuthenticated(): boolean {
    return !!this.user();
  }
  
  constructor() {
    this.loading.set(false);
    this.loadingSubject.next(false);
    
    authState(this.auth).subscribe(user => {
      if (user) {
        this.ensureUserHasHousehold(user.uid).catch(err => 
          console.error('Error ensuring household:', err)
        );
      }
    });
  }
  
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

  async getUserHousehold(userId: string): Promise<string | null> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('User document not found, creating basic user data');
        // Create basic user data if document doesn't exist
        await setDoc(userRef, {
          uid: userId,
          displayName: 'Usuario',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        // Now create a household and link it
        return await this.createHouseholdForUser(userId);
      }
      
      const userData = userDoc.data() as { householdId?: string };
      
      // If user already has a household, return it
      if (userData?.householdId) {
        return userData.householdId;
      }
      
      // If we get here, user doesn't have a household
      // Create one automatically and return its ID
      return await this.createHouseholdForUser(userId);
    } catch (error) {
      console.error('Error getting user household:', error);
      return null;
    }
  }

  getCurrentUser(): Observable<any | null> {
    const userId = this.getUserId();
    
    if (!userId) {
      return of(null);
    }
    
    const userRef = doc(this.firestore, `users/${userId}`);
    
    return from(getDoc(userRef)).pipe(
      map(userDoc => {
        if (!userDoc.exists()) {
          console.warn('User document not found');
          return null;
        }
        
        return {
          ...userDoc.data(),
          id: userDoc.id
        };
      }),
      catchError(error => {
        console.error('Error getting current user data:', error);
        return of(null);
      })
    );
  }
  
  private async ensureUserHasHousehold(userId: string): Promise<void> {
    try {
      const householdId = await this.getUserHousehold(userId);
      if (!householdId) {
        await this.createHouseholdForUser(userId);
      }
    } catch (error) {
      console.error('Error ensuring user has household:', error);
    }
  }

  private async createHouseholdForUser(userId: string): Promise<string> {
    try {
      const householdId = `household_${userId}`;
      const householdRef = doc(this.firestore, 'households', householdId);
      
      const householdData = {
        name: 'Mi Hogar',
        createdBy: userId,
        members: [userId],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(householdRef, householdData);
      console.log('Created new household:', householdId);
      
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(userRef, { 
        householdId: householdId,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('Linked household to user:', userId);
      return householdId;
    } catch (error) {
      console.error('Error creating household for user:', error);
      throw error;
    }
  }
}