import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app/app-routing.module';
import { environment } from './environments/environment.prod';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { ProductEffects } from './app/store/product/product.effects';
import { AuthEffects } from './app/store/auth/auth.effects';
import { productReducer } from './app/store/product/product.reducer';
import { authReducer } from './app/store/auth/auth.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideEffects([ProductEffects, AuthEffects]),
    provideStore({
      products: productReducer,
      auth: authReducer
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    importProvidersFrom(AngularFireModule.initializeApp(environment.firebase)),
    importProvidersFrom(AngularFirestoreModule),
    importProvidersFrom(AngularFireAuthModule)
  ],
}).catch((err) => console.error(err));