import { Component, signal, HostListener, DestroyRef, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Home } from './pages/home/home';
import { Skill } from './pages/skill/skill';
import { ProjectsComponent } from './pages/projects/projects';
import { Education } from './pages/education/education';
import { ExperienceComponent } from './pages/experience/experience';
import { Contact } from './pages/contact/contact';
import { ToastComponent } from './components/toast/toast';
import { Aurora } from './components/aurora/aurora';
import { filter } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Home, Skill, ProjectsComponent, Education, ExperienceComponent, Contact, ToastComponent, Aurora],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'scale(0.8)' })),
      transition(':enter', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class App {
  protected readonly title = signal('frontendclient');
  showMainContent = true;
  showScrollTop = false;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Check initial route
    this.updateMainContentVisibility(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.updateMainContentVisibility(event.url);
      });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Show scroll-to-top button when scrolled down more than 300px
    this.showScrollTop = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateMainContentVisibility(url: string) {
    // Show main content only when not on /admin or /dashboard route
    this.showMainContent = !url.includes('/admin') && !url.includes('/dashboard');
  }
}