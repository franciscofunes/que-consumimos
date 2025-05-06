import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MobileFooterMenuComponent } from './shared/components/footer-menu/mobile-footer-menu.component';
import { DesktopFooterComponent } from './shared/components/desktop-footer/desktop-footer.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MobileFooterMenuComponent,
    DesktopFooterComponent
  ]
})
export class AppComponent {
  title = 'qué-consumimos';
  constructor(private router: Router) {}

  isAuthRoute(): boolean {
    return this.router.url.includes('/auth');
  }
}