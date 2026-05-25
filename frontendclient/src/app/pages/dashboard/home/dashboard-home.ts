import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../api/generated/analytics/analytics.service';
import type {
  AnalyticsOverviewCards,
  AnalyticsSourceBreakdown,
  AnalyticsTrendPoint,
} from '../../../api/models';

type KpiKey =
  | 'profileViews'
  | 'projectViews'
  | 'contactRequests'
  | 'cvDownloads';
type RangePreset = 'this-month';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {
  isLoading = true;
  loadError = '';
  selectedRange: RangePreset = 'this-month';

  overviewCards: AnalyticsOverviewCards = {};
  profileTrend: AnalyticsTrendPoint[] = [];
  topSources: AnalyticsSourceBreakdown[] = [];

  readonly kpiCards: Array<{
    key: KpiKey;
    label: string;
    icon: string;
    tone: 'violet' | 'blue' | 'green' | 'orange';
  }> = [
    {
      key: 'profileViews',
      label: 'Profile Views',
      icon: 'pi pi-eye',
      tone: 'violet',
    },
    {
      key: 'projectViews',
      label: 'Project Views',
      icon: 'pi pi-folder-open',
      tone: 'blue',
    },
    {
      key: 'contactRequests',
      label: 'Contact Requests',
      icon: 'pi pi-envelope',
      tone: 'green',
    },
    {
      key: 'cvDownloads',
      label: 'Download CV',
      icon: 'pi pi-download',
      tone: 'orange',
    },
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get rangeLabel(): string {
    return 'This Month';
  }

  get profileViewsTotal(): number {
    return this.overviewCards.profileViews?.total ?? 0;
  }

  get trendLinePath(): string {
    return this.buildLinePath(this.profileTrend, 100, 40, 4);
  }

  get trendAreaPath(): string {
    return this.buildAreaPath(this.profileTrend, 100, 40, 4);
  }

  get trendLabels(): Array<{ label: string; offset: number }> {
    if (!this.profileTrend.length) {
      return [];
    }

    const labelCount = Math.min(5, this.profileTrend.length);
    const step = (this.profileTrend.length - 1) / Math.max(labelCount - 1, 1);
    const items: Array<{ label: string; offset: number }> = [];

    for (let i = 0; i < labelCount; i += 1) {
      const index = Math.round(i * step);
      const label = this.formatShortDate(this.profileTrend[index]?.date);
      const offset = labelCount === 1 ? 0 : (i / (labelCount - 1)) * 100;
      items.push({ label, offset });
    }

    return items;
  }

  get donutSegments(): Array<{
    label: string;
    percent: number;
    color: string;
    dashArray: string;
    dashOffset: number;
  }> {
    const normalized = this.normalizeSources(this.topSources);
    let offset = 0;

    return normalized.map((source, index) => {
      const percent = source.percent ?? 0;
      const color = this.getSourceColor(source.source, index);
      const dashArray = `${percent} ${100 - percent}`;
      const dashOffset = -offset;
      offset += percent;
      return {
        label: source.source || 'Other',
        percent,
        color,
        dashArray,
        dashOffset,
      };
    });
  }

  get sourcesList(): Array<{
    label: string;
    percent: number;
    color: string;
  }> {
    return this.normalizeSources(this.topSources).map((source, index) => ({
      label: source.source || 'Other',
      percent: Math.round(source.percent ?? 0),
      color: this.getSourceColor(source.source, index),
    }));
  }

  getMetricTotal(key: KpiKey): number {
    return this.overviewCards[key]?.total ?? 0;
  }

  getMetricChange(key: KpiKey): number {
    return this.overviewCards[key]?.changePercent ?? 0;
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  formatChange(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  isPositive(value: number): boolean {
    return value >= 0;
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.loadError = '';

    const range = this.getRangeParams(this.selectedRange);

    Promise.all([
      this.analyticsService.getOverview(range),
      this.analyticsService.getProfileViewsTrend(range),
      this.analyticsService.getTopSources(range),
    ])
      .then(([overview, trend, sources]) => {
        this.overviewCards = overview?.cards ?? {};
        this.profileTrend = trend ?? [];
        this.topSources = sources ?? [];
      })
      .catch((error: unknown) => {
        console.error('Failed to load analytics:', error);
        this.loadError = 'Unable to load analytics right now.';
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private getRangeParams(preset: RangePreset): { from: string; to: string } {
    if (preset === 'this-month') {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: this.formatDate(from),
        to: this.formatDate(now),
      };
    }

    const now = new Date();
    return {
      from: this.formatDate(now),
      to: this.formatDate(now),
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatShortDate(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${month} ${date.getDate()}`;
  }

  private buildLinePath(
    points: AnalyticsTrendPoint[],
    width: number,
    height: number,
    padding: number,
  ): string {
    if (!points.length) {
      return '';
    }

    const values = points.map((point) => point.count ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step =
      points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

    return values
      .map((value, index) => {
        const x = padding + index * step;
        const y =
          padding + (height - padding * 2) * (1 - (value - min) / range);
        return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
      })
      .join(' ');
  }

  private buildAreaPath(
    points: AnalyticsTrendPoint[],
    width: number,
    height: number,
    padding: number,
  ): string {
    if (!points.length) {
      return '';
    }

    const linePath = this.buildLinePath(points, width, height, padding);
    const step =
      points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
    const endX = padding + step * (points.length - 1);
    const baseY = height - padding;
    return `${linePath} L${endX} ${baseY} L${padding} ${baseY} Z`;
  }

  private normalizeSources(
    sources: AnalyticsSourceBreakdown[],
  ): AnalyticsSourceBreakdown[] {
    if (!sources.length) {
      return [];
    }

    const total = sources.reduce((sum, source) => sum + (source.count ?? 0), 0);
    const totalPercent = sources.reduce(
      (sum, source) => sum + (source.percent ?? 0),
      0,
    );

    return sources.map((source) => {
      if (source.percent != null) {
        const normalizedPercent =
          totalPercent > 0 ? (source.percent / totalPercent) * 100 : 0;
        return { ...source, percent: normalizedPercent };
      }

      const percent = total > 0 ? ((source.count ?? 0) / total) * 100 : 0;
      return { ...source, percent };
    });
  }

  private getSourceColor(label: string | undefined, index: number): string {
    const palette = ['#8B5CF6', '#3B82F6', '#EC4899', '#F97316', '#F59E0B'];
    const key = (label || '').toLowerCase();

    if (key.includes('linkedin')) {
      return '#8B5CF6';
    }
    if (key.includes('github')) {
      return '#3B82F6';
    }
    if (key.includes('google')) {
      return '#EC4899';
    }
    if (key.includes('direct')) {
      return '#F97316';
    }
    if (key.includes('other')) {
      return '#F59E0B';
    }

    return palette[index % palette.length];
  }
}
