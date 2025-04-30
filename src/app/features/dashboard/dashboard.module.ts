import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({
  // No need to declare the standalone component
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DashboardComponent // Import the standalone component instead
  ]
})
export class DashboardModule {}