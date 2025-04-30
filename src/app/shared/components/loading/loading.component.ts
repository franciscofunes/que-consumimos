import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show) {
      <div class="flex justify-center items-center p-4">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        @if (message) {
          <span class="ml-2 text-gray-600">{{ message }}</span>
        }
      </div>
    }
  `
})
export class LoadingComponent {
  @Input() show = false;
  @Input() message = '';
}