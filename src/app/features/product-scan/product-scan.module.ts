import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductScanComponent } from './product-scan.component';

const routes: Routes = [
  {
    path: '',
    component: ProductScanComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ProductScanComponent // Import the standalone component here
  ]
})
export class ProductScanModule { }