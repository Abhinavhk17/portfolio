import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataGrid, GridColumn } from '../../../components/data-grid/data-grid';
import { PageLoader } from '../../../components/page-loader/page-loader';
import { ConfirmationDialog } from '../../../components/confirmation-dialog/confirmation-dialog';
import { ModalWindow } from '../../../components/modal/modal';
import { SettingsService } from '../../../api/generated/settings/settings.service';
import { ToastService } from '../../../components/toast/toast.service';
import { Settings } from '../../../api/models';

@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataGrid, PageLoader, ConfirmationDialog, ModalWindow],
  templateUrl: './dashboard-settings.html'
})
export class DashboardSettings implements OnInit {
  settingsForm!: FormGroup;
  settings: Settings[] = [];
  loadingSettings = false;

  isModalOpen = false;
  isEditMode = false;
  modalTitle = 'Add Setting';
  editingSetting: Settings | null = null;

  isLoading = false;
  loadingMessage = 'Loading...';

  confirmDialogOpen = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  confirmDialogType: 'danger' | 'warning' | 'info' = 'danger';
  confirmDialogIcon = 'fa-trash';
  confirmDialogConfirmText = 'Yes, Delete';
  confirmDialogCancelText = 'Cancel';
  pendingDeleteAction: (() => void) | null = null;

  settingColumns: GridColumn[] = [
    { field: 'key', header: 'Key' },
    { field: 'value', header: 'Value' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loadingSettings = true;
    this.settingsService
      .getAllSettings()
      .then((data: any) => {
        this.settings = data;
        this.loadingSettings = false;
      })
      .catch((error: any) => {
        console.error('Error loading settings:', error);
        this.loadingSettings = false;
      });
  }

  async submitSetting() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.toastService.error('Please fill all required fields');
      return;
    }

    const settingData = this.settingsForm.value;

    this.isLoading = true;
    this.loadingMessage = this.isEditMode ? 'Updating setting...' : 'Creating setting...';
    const startTime = Date.now();

    try {
      if (this.isEditMode && this.editingSetting?.id) {
        await this.settingsService.updateSetting(this.editingSetting.id, {
          ...this.editingSetting,
          ...settingData
        });
        this.toastService.success('Setting updated successfully!');
      } else {
        await this.settingsService.createSetting(settingData);
        this.toastService.success('Setting added successfully!');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.loadSettings();
      this.closeSettingModal();
    } catch (error: any) {
      console.error('❌ Error saving setting:', error);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.toastService.error('Failed to save setting: ' + (error.message || 'Unknown error'));
    } finally {
      this.isLoading = false;
    }
  }

  onEditSetting(setting: Settings) {
    this.isEditMode = true;
    this.editingSetting = setting;
    this.modalTitle = 'Edit Setting';
    this.settingsForm.patchValue(setting);
    this.isModalOpen = true;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingSetting = null;
    this.modalTitle = 'Add Setting';
    this.resetSettingsForm();
    this.isModalOpen = true;
  }

  onModalSave() {
    this.submitSetting();
  }

  onModalCancel() {
    this.closeSettingModal();
  }

  closeSettingModal() {
    this.isModalOpen = false;
    this.resetSettingsForm();
  }

  resetSettingsForm() {
    this.settingsForm.reset();
  }

  isSaveDisabled() {
    return this.settingsForm.invalid;
  }

  onDeleteSetting(setting: Settings) {
    this.confirmDialogTitle = 'Delete Setting';
    this.confirmDialogMessage = `Are you sure you want to delete "${setting.key}"? This action cannot be undone.`;
    this.confirmDialogType = 'danger';
    this.confirmDialogIcon = 'fa-trash';
    this.confirmDialogConfirmText = 'Yes, Delete';
    this.confirmDialogCancelText = 'Cancel';
    this.confirmDialogOpen = true;

    this.pendingDeleteAction = () => {
      if (setting.id) {
        this.isLoading = true;
        this.loadingMessage = 'Deleting setting...';
        const startTime = Date.now();

        this.settingsService
          .deleteSetting(setting.id)
          .then(async () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.success('Setting deleted successfully!');
            this.loadSettings();
            this.isLoading = false;
          })
          .catch(async (error: any) => {
            console.error('❌ Error deleting setting:', error);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.error('Failed to delete setting');
            this.isLoading = false;
          });
      }
    };
  }

  onConfirmDelete() {
    if (this.pendingDeleteAction) {
      this.pendingDeleteAction();
      this.pendingDeleteAction = null;
    }
    this.confirmDialogOpen = false;
  }

  onCancelDelete() {
    this.pendingDeleteAction = null;
    this.confirmDialogOpen = false;
  }
}
