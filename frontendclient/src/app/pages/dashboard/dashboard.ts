import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageLoader } from '../../components/page-loader/page-loader';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { DashboardHome } from './home/dashboard-home';
import { DashboardSkills } from './skills/dashboard-skills';
import { DashboardProjects } from './projects/dashboard-projects';
import { DashboardExperience } from './experience/dashboard-experience';
import { DashboardEducation } from './education/dashboard-education';
import { DashboardContacts } from './contacts/dashboard-contacts';
import { DashboardSettings } from './settings/dashboard-settings';
import { SettingsService } from '../../api/generated/settings/settings.service';
import { AppConstants } from '../../constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PageLoader,
    ConfirmationDialog,
    DashboardHome,
    DashboardSkills,
    DashboardProjects,
    DashboardExperience,
    DashboardEducation,
    DashboardContacts,
    DashboardSettings,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  encapsulation: ViewEncapsulation.None,
})
export class Dashboard implements OnInit {
  activeTab: string = 'dashboard';
  portfolioName = '';
  portfolioInitials = '';
  // Logout loader
  isLoading: boolean = false;
  loadingMessage: string = 'Loading...';

  // Confirmation Dialog
  confirmDialogOpen = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  confirmDialogType: 'danger' | 'warning' | 'info' = 'danger';
  confirmDialogIcon = 'fa-trash';
  confirmDialogConfirmText = 'Yes, Delete';
  confirmDialogCancelText = 'Cancel';
  pendingDeleteAction: (() => void) | null = null;

  constructor(
    private router: Router,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.loadPortfolioSettings();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  private loadPortfolioSettings() {
    this.settingsService
      .getAllSettings()
      .then((settings) => {
        const nameSetting = settings?.find(
          (setting) =>
            (setting.key || '').toLowerCase() ===
            AppConstants.PORTFOLIO_NAME.toLowerCase()
        );

        if (nameSetting?.value) {
          this.portfolioName = nameSetting.value;
          this.portfolioInitials = this.getInitials(nameSetting.value);
        }
      })
      .catch((error: any) => {
        console.error('Error loading portfolio settings:', error);
      });
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return '';
    }

    const initials = parts
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');

    return initials;
  }

  logout() {
    this.confirmDialogTitle = 'Logout';
    this.confirmDialogMessage =
      'Are you sure you want to logout from the dashboard?';
    this.confirmDialogType = 'warning';
    this.confirmDialogIcon = 'fa-sign-out-alt';
    this.confirmDialogConfirmText = 'Yes, Logout';
    this.confirmDialogCancelText = 'Stay';
    this.confirmDialogOpen = true;

    this.pendingDeleteAction = () => {
      this.isLoading = true;
      this.loadingMessage = 'Logging out...';
      setTimeout(() => {
        localStorage.removeItem('authToken');
        this.router.navigate(['/signin']);
      }, 800);
    };
  }

  onConfirmDelete() {
    if (this.pendingDeleteAction) {
      this.pendingDeleteAction();
      this.pendingDeleteAction = null;
    }
  }

  onCancelDelete() {
    this.pendingDeleteAction = null;
    this.confirmDialogOpen = false;
  }
}
