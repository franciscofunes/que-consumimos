import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

// Import the necessary modules
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment.prod';
import { ProductEffects } from './store/product/product.effects';
import { AuthEffects } from './store/auth/auth.effects';
import { productReducer } from './store/product/product.reducer';
import { authReducer } from './store/auth/auth.reducer';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    StoreModule.forFeature('products', productReducer),
    EffectsModule.forRoot([ProductEffects, AuthEffects]),
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
  ],
  bootstrap: [],
})
export class AppModule {}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptorsFromDi())],
});
