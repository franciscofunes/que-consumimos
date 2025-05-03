import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-desktop-footer',
  templateUrl: './desktop-footer.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class DesktopFooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  constructor() {}

  ngOnInit(): void {}
}
