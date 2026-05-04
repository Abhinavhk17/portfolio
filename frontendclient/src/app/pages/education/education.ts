import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EducationService } from '../../api/generated/education/education.service';
import { Education as EducationModel } from '../../api/models';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.html',
  styleUrl: './education.css'
})
export class Education implements OnInit {
  educations: EducationModel[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private educationService: EducationService) {}

  ngOnInit() {
    this.loadEducations();
  }

  async loadEducations() {
    this.loading = true;
    this.error = null;

    try {
      const data = await this.educationService.getAllEducation();
      const visibleEducation = (data || []).filter(edu => edu.isVisible === true);
      // Sort by from year (most recent first)
      this.educations = visibleEducation.sort((a: EducationModel, b: EducationModel) => {
        const yearA = a.fromYear ? parseInt(a.fromYear) : 0;
        const yearB = b.fromYear ? parseInt(b.fromYear) : 0;
        return yearB - yearA;
      });
      this.loading = false;
    } catch (err) {
      this.error = 'Failed to load education. Please try again later.';
      this.loading = false;
      console.error('Error loading education:', err);
    }
  }

  // Check if currently studying
  isCurrent(toYear: string | undefined): boolean {
    return !toYear || toYear.toLowerCase() === 'present';
  }
}
