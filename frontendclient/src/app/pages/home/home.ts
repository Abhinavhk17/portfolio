import { Component, inject } from '@angular/core';
import { RotatingText } from '../../components/rotating-text/rotating-text';
import { SettingsService } from '../../api/generated/settings/settings.service';
import { AppConstants } from '../../constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RotatingText],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  resumeUrl = '';

  private readonly settingsService = inject(SettingsService);

  constructor() {
    this.loadSettings();
  }

  onResumeClick(event: Event) {
    this.openExternal(this.resumeUrl, event);
  }

  onConnectClick(event: Event) {
    event.preventDefault();
    this.scrollToSection('contact');
  }

  private loadSettings() {
    this.settingsService
      .getAllSettings()
      .then((settings) => {
        const map = new Map(
          settings?.map((setting) => [
            (setting.key || '').toLowerCase(),
            setting.value || '',
          ])
        );

        this.resumeUrl = map.get(AppConstants.RESUME_URL.toLowerCase()) || '';
      })
      .catch((error: any) => {
        console.error('Error loading settings:', error);
      });
  }

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private openExternal(url: string, event: Event) {
    event.preventDefault();
    const normalized = this.normalizeUrl(url);
    if (!normalized) {
      return;
    }
    window.open(normalized, '_blank', 'noopener');
  }

  private normalizeUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return null;
    }

    if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }
}
