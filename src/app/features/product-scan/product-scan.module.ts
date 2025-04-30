import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ProductScanComponent } from './product-scan.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: ProductScanComponent }];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class ProductScanModule {}
