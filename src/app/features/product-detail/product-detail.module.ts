import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailComponent } from './product-detail.component';

const routes: Routes = [
  {
    path: ':id',
    component: ProductDetailComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ProductDetailComponent,
  ],
})
export class ProductDetailModule {}
