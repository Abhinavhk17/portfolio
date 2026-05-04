import { Component, OnInit, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, AfterViewInit, OnDestroy {
  items: MenuItem[] = [];
  isNavbarVisible: boolean = true;
  private lastScrollTop: number = 0;
  private scrollThreshold: number = 10;
  private sectionObserver?: IntersectionObserver;
  private activeSectionId: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        id: 'home',
        styleClass: 'nav-item active',
        command: (event) => {
          event.originalEvent?.preventDefault();
          this.setActiveItem(event.item as MenuItem | undefined);
          this.scrollToSection('home');
        }
      },
      {
        label: 'Skills',
        id: 'skills',
        styleClass: 'nav-item',
        command: (event) => {
          event.originalEvent?.preventDefault();
          this.setActiveItem(event.item as MenuItem | undefined);
          this.scrollToSection('skills');
        }
      },
      {
        label: 'Projects',
        id: 'projects',
        styleClass: 'nav-item',
        command: (event) => {
          event.originalEvent?.preventDefault();
          this.setActiveItem(event.item as MenuItem | undefined);
          this.scrollToSection('projects');
        }
      },
      {
        label: 'Education',
        id: 'education',
        styleClass: 'nav-item',
        command: (event) => {
          event.originalEvent?.preventDefault();
          this.setActiveItem(event.item as MenuItem | undefined);
          this.scrollToSection('education');
        }
      },
      {
        label: 'Experience',
        id: 'experience',
        styleClass: 'nav-item',
        command: (event) => {
          event.originalEvent?.preventDefault();
          this.setActiveItem(event.item as MenuItem | undefined);
          this.scrollToSection('experience');
        }
      }
    ];
  }

  ngAfterViewInit() {
    this.initSectionObserver();
  }

  ngOnDestroy() {
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
      this.sectionObserver = undefined;
    }
  }

  scrollToSection(sectionId: string) {
    // If we're on admin or dashboard route, navigate to home first
    if (this.router.url.includes('/admin') || this.router.url.includes('/dashboard')) {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.smoothScrollTo(sectionId);
        }, 100);
      });
    } else {
      this.smoothScrollTo(sectionId);
    }
  }

  handleItemClick(event: Event, item: MenuItem) {
    if (item.routerLink) {
      this.setActiveItem(item);
      if (item.command) {
        item.command({ originalEvent: event, item: item });
      }
      return;
    }

    if (item.command) {
      item.command({ originalEvent: event, item: item });
      return;
    }

    if (item.id) {
      event.preventDefault();
      this.setActiveItem(item);
      this.scrollToSection(item.id);
    }
  }

  private smoothScrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private initSectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'));
    if (!sections.length) {
      return;
    }

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) {
          return;
        }

        const id = (visible[0].target as HTMLElement).id;
        if (!id || id === this.activeSectionId) {
          return;
        }

        this.activeSectionId = id;
        const item = this.items.find((i) => i.id === id);
        this.setActiveItem(item);
      },
      {
        root: null,
        rootMargin: '-120px 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75]
      }
    );

    sections.forEach((section) => this.sectionObserver?.observe(section));
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > this.lastScrollTop && scrollTop > this.scrollThreshold) {
      // Scrolling down
      this.isNavbarVisible = false;
    } else if (scrollTop < this.lastScrollTop) {
      // Scrolling up
      this.isNavbarVisible = true;
    }

    this.lastScrollTop = scrollTop;
  }

  setActiveItem(item?: MenuItem) {
    if (!item) {
      return;
    }
    // Remove active class from all items
    this.items.forEach(i => {
      if (i.styleClass) {
        i.styleClass = i.styleClass.replace(' active', '');
      }
    });
    
    // Add active class to clicked item
    if (item.styleClass) {
      item.styleClass += ' active';
    } else {
      item.styleClass = 'nav-item active';
    }
  }
}