import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsService } from '../../api/generated/skills/skills.service';
import { FileManagementService } from '../../api/generated/file-management/file-management.service';
import { Skill as SkillModel } from '../../api/models';
import { LogoLoop, LogoItem } from '../../components/logo-loop/logo-loop';

interface SkillWithImage extends SkillModel {
  imageUrl?: string;
}

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [CommonModule, LogoLoop],
  templateUrl: './skill.html',
  styleUrl: './skill.css'
})
export class Skill implements OnInit {
  skills: SkillWithImage[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private skillsService: SkillsService,
    private fileManagementService: FileManagementService
  ) {}

  async ngOnInit() {
    await this.loadSkillsWithImages();
  }

  async loadSkillsWithImages() {
    try {
      this.loading = true;
      this.error = null;

      // Fetch skills first
      const skills = await this.skillsService.getAllSkills();
      const visibleSkills = (skills || []).filter(skill => skill.isVisible === true);

      // Try to fetch files, but don't fail if it doesn't work
      let files: string[] = [];
      try {
        files = await this.fileManagementService.getFiles() || [];
      } catch (fileError) {
        console.warn('Could not fetch files from Cloudinary:', fileError);
      }

      // Map skills to include matching image URLs
      this.skills = visibleSkills.map((skill: SkillModel): SkillWithImage => {
        const preferredLogoUrl = skill.logoUrl || undefined;
        const matchingFile = preferredLogoUrl
          ? preferredLogoUrl
          : this.findMatchingImage(skill.name || '', files);

        return {
          ...skill,
          imageUrl: matchingFile
        };
      });

      this.loading = false;
    } catch (err) {
      console.error('Error loading skills:', err);
      this.error = 'Failed to load skills';
      this.loading = false;
    }
  }


  /**
   * Find the Cloudinary image URL that matches the skill name
   * Image format: skillname_somehashcode or just skillname
   */
  private findMatchingImage(skillName: string, files: string[]): string | undefined {
    if (!skillName || !files || files.length === 0) {
      return undefined;
    }

    // Normalize skill name for comparison (lowercase, no spaces, no special chars)
    const normalizedSkillName = skillName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    // Find file that starts with the skill name
    const matchedFile = files.find(fileUrl => {
      // Extract filename from URL
      const fileName = this.extractFileName(fileUrl);
      const fileNameLower = fileName.toLowerCase();
      const normalizedFileName = fileNameLower.replace(/[^a-z0-9_]/g, '');

      // Check multiple matching patterns:
      // 1. Exact match: skillname_hash
      // 2. Starts with: skillname_
      // 3. Contains: skillname
      const patterns = [
        normalizedFileName.startsWith(normalizedSkillName + '_'),
        normalizedFileName.startsWith(fileNameLower.replace(/\s+/g, '') + '_'),
        normalizedFileName.includes(normalizedSkillName),
        fileNameLower.startsWith(skillName.toLowerCase() + '_'),
        fileNameLower.includes(skillName.toLowerCase())
      ];

      return patterns.some(p => p);
    });

    return matchedFile;
  }

  /**
   * Extract filename from Cloudinary URL
   */
  private extractFileName(url: string): string {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    // Remove file extension
    return lastPart.split('.')[0];
  }

  /**
   * Get all logos for single row display
   */
  getAllLogos(): LogoItem[] {
    return this.skills.map(skill => ({
      imageUrl: skill.imageUrl,
      name: skill.name || '',
      alt: skill.name || 'Skill logo'
    }));
  }

  /**
   * Handle image load errors
   */
  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    // The fallback icon will be shown automatically via *ngIf
  }
}
