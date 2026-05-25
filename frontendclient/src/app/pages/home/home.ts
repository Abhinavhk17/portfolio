import { Component, OnInit, inject } from '@angular/core';
import { RotatingText } from '../../components/rotating-text/rotating-text';
import { SettingsService } from '../../api/generated/settings/settings.service';
import { AppConstants } from '../../constants';
import { AnalyticsService } from '../../api/generated/analytics/analytics.service';
import { AnalyticsEventRequestType } from '../../api/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RotatingText],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  resumeUrl = '';

  private readonly settingsService = inject(SettingsService);
  private readonly analyticsService = inject(AnalyticsService);

  constructor() {
    this.loadSettings();
  }

  ngOnInit(): void {
    this.recordEvent(AnalyticsEventRequestType.profile_view);
  }

  onResumeClick(event: Event) {
    this.recordEvent(AnalyticsEventRequestType.cv_download);
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

  private recordEvent(type: AnalyticsEventRequestType) {
    this.analyticsService
      .recordEvent({ type, source: this.getSourceFromReferrer() })
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
