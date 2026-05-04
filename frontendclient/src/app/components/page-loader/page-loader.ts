import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-loader.html',
  styleUrl: './page-loader.css'
})
export class PageLoader {
  @Input() show: boolean = false;
  @Input() message: string = 'Loading...';
}
