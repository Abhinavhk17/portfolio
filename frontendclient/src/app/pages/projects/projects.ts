import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../../api/generated/projects/projects.service';
import { FileManagementService } from '../../api/generated/file-management/file-management.service';
import { SettingsService } from '../../api/generated/settings/settings.service';
import { AnalyticsEventRequestType, Project } from '../../api/models';
import { AnalyticsService } from '../../api/generated/analytics/analytics.service';
import { AppConstants } from '../../constants';

interface ProjectWithImage extends Project {
  imageUrl?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class ProjectsComponent implements OnInit {
  projects: ProjectWithImage[] = [];
  loading: boolean = true;
  error: string | null = null;
  githubUrl: string = '';

  constructor(
    private projectsService: ProjectsService,
    private fileManagementService: FileManagementService,
    private settingsService: SettingsService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.loadProjects();
    this.loadSettings();
  }

  async loadProjects() {
    this.loading = true;
    this.error = null;

    try {
      // Fetch projects
      const projectsData = await this.projectsService.getAllProjects();
      const visibleProjects = (projectsData || []).filter(project => project.isVisible === true);

      // Fetch images from Cloudinary
      let files: string[] = [];
      try {
        files = await this.fileManagementService.getFiles() || [];
      } catch (fileError) {
        console.warn('Could not fetch files from Cloudinary:', fileError);
      }

      // Map projects with matching images
      this.projects = visibleProjects.map((project: Project): ProjectWithImage => {
        const matchingImage = this.findMatchingImage(project.name || '', files);
        return {
          ...project,
          imageUrl: matchingImage
        };
      });

      this.loading = false;
    } catch (err) {
      this.error = 'Failed to load projects. Please try again later.';
      this.loading = false;
      console.error('Error loading projects:', err);
    }
  }

  private loadSettings() {
    this.settingsService
      .getAllSettings()
      .then((settings) => {
        const map = new Map(
          settings?.map((setting) => [
            (setting.key || '').toLowerCase(),
            setting.value || ''
          ])
        );
        this.githubUrl = map.get(AppConstants.GITHUB_URL.toLowerCase()) || '';
      })
      .catch((error: any) => {
        console.error('Error loading settings:', error);
      });
  }

  private findMatchingImage(projectName: string, files: string[]): string | undefined {
    if (!projectName || !files || files.length === 0) {
      return undefined;
    }

    // Normalize project name: lowercase, remove special characters
    const normalizedProject = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return files.find(fileUrl => {
      // Extract filename from URL (after last /)
      const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      // Remove extension and hash/version info
      const normalizedFileName = fileName
        .toLowerCase()
        .replace(/\.[^.]+$/, '') // Remove extension
        .replace(/[^a-z0-9]/g, ''); // Remove special chars
      
      // Check if filename matches or starts with project name
      return normalizedFileName === normalizedProject || 
             normalizedFileName.startsWith(normalizedProject + '_') ||
             normalizedFileName.includes(normalizedProject);
    });
  }

  openProject(project?: ProjectWithImage | { url?: string }) {
    if (!project?.url) {
      return;
    }

    if ('id' in project && project.id) {
      this.recordEvent(AnalyticsEventRequestType.project_view, project.id);
    }

    window.open(project.url, '_blank');
  }

  private recordEvent(type: AnalyticsEventRequestType, projectId?: string) {
    this.analyticsService
      .recordEvent({ type, source: this.getSourceFromReferrer(), projectId })
      .catch(() => undefined);
  }

  private getSourceFromReferrer(): string {
    const referrer = document.referrer;
    if (!referrer) {
      return 'direct';
    }

    try {
      const hostname = new URL(referrer).hostname.toLowerCase();
      if (hostname.includes('linkedin')) {
        return 'LinkedIn';
      }
      if (hostname.includes('github')) {
        return 'GitHub';
      }
      if (hostname.includes('google')) {
        return 'Google';
      }
      return hostname || 'direct';
    } catch {
      return 'direct';
    }
  }
}
