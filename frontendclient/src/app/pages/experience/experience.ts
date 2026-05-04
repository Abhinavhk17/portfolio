import { Component, OnInit, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperiencesService } from '../../api/generated/experiences/experiences.service';
import { FileManagementService } from '../../api/generated/file-management/file-management.service';
import { Experience } from '../../api/models';

interface ExperienceWithImage extends Experience {
  companyLogoUrl?: string;
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrls: ['./experience.css']
})
export class ExperienceComponent implements OnInit, AfterViewInit {
  experiences: ExperienceWithImage[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private experiencesService: ExperiencesService,
    private fileManagementService: FileManagementService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadExperiences();
  }

  ngAfterViewInit() {
    // Initial check for visible items
    setTimeout(() => {
      this.checkVisibleItems();
    }, 100);
  }

  async loadExperiences() {
    this.loading = true;
    this.error = null;

    try {
      // Fetch experiences first
      const data = await this.experiencesService.getAllExperiences();
      const visibleExperiences = (data || []).filter(exp => exp.isVisible === true);
      
      // Try to fetch files from Cloudinary
      let files: string[] = [];
      try {
        files = await this.fileManagementService.getFiles() || [];
      } catch (fileError) {
        console.warn('Could not fetch files from Cloudinary:', fileError);
      }

      // Map experiences to include matching company logo URLs
      this.experiences = visibleExperiences.map((exp: Experience): ExperienceWithImage => {
        const matchingLogo = this.findMatchingImage(exp.company || '', files);
        return {
          ...exp,
          companyLogoUrl: matchingLogo
        };
      });

      // Sort by start date (most recent first)
      this.experiences = this.experiences.sort((a: ExperienceWithImage, b: ExperienceWithImage) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateB - dateA;
      });
      
      this.loading = false;
    } catch (err) {
      this.error = 'Failed to load experiences. Please try again later.';
      this.loading = false;
      console.error('Error loading experiences:', err);
    }
  }

  /**
   * Find the Cloudinary image URL that matches the company name
   * Image format: companyname_somehashcode or just companyname
   */
  private findMatchingImage(companyName: string, files: string[]): string | undefined {
    if (!companyName || !files || files.length === 0) {
      return undefined;
    }

    // Normalize company name: lowercase, remove spaces and special chars
    const normalizedCompany = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    // Find file that matches the company name pattern
    const matchingFile = files.find(fileUrl => {
      // Extract filename from URL (after last '/')
      const fileName = fileUrl.split('/').pop() || '';
      
      // Remove extension and normalize
      const normalizedFileName = fileName
        .replace(/\.(png|jpg|jpeg|svg|webp)$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      // Check if filename starts with company name or matches exactly
      return normalizedFileName === normalizedCompany ||
             normalizedFileName.startsWith(normalizedCompany + '_') ||
             normalizedFileName.startsWith(normalizedCompany);
    });

    return matchingFile;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkVisibleItems();
  }

  checkVisibleItems() {
    const timelineItems = this.elementRef.nativeElement.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item: HTMLElement) => {
      const rect = item.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if item is in viewport
      if (rect.top < windowHeight * 0.8) {
        item.classList.add('visible');
      }
    });
  }

  // Check if index is even (for alternating left/right)
  isEven(index: number): boolean {
    return index % 2 === 0;
  }

  // Format date for display
  formatDate(date: string | undefined): string {
    if (!date) return 'Present';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  }

  // Calculate duration
  calculateDuration(startDate: string | undefined, endDate: string | undefined): string {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years}y ${remainingMonths}m`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  }
}
