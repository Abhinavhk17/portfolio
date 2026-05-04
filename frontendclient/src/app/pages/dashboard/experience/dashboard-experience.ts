import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataGrid, GridColumn } from '../../../components/data-grid/data-grid';
import { PageLoader } from '../../../components/page-loader/page-loader';
import { ConfirmationDialog } from '../../../components/confirmation-dialog/confirmation-dialog';
import { ModalWindow } from '../../../components/modal/modal';
import { ExperiencesService } from '../../../api/generated/experiences/experiences.service';
import { ToastService } from '../../../components/toast/toast.service';
import { Experience } from '../../../api/models';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-dashboard-experience',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataGrid, PageLoader, ConfirmationDialog, DatePickerModule, ModalWindow],
  templateUrl: './dashboard-experience.html'
})
export class DashboardExperience implements OnInit {
  experienceForm!: FormGroup;
  experiences: Experience[] = [];
  loadingExperiences = false;

  isModalOpen = false;
  isEditMode = false;
  modalTitle = 'Add Experience';
  editingExperience: Experience | null = null;

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

  experienceColumns: GridColumn[] = [
    { field: 'company', header: 'Company' },
    { field: 'title', header: 'Title' },
    { field: 'startDate', header: 'Start Date' },
    { field: 'endDate', header: 'End Date' },
    { field: 'isVisible', header: 'Visible', type: 'boolean' }
  ];

  constructor(
    private fb: FormBuilder,
    private experiencesService: ExperiencesService,
    private toastService: ToastService
  ) {
    this.experienceForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      description: [''],
      isVisible: [true]
    });
  }

  ngOnInit() {
    this.loadExperiences();
    this.setupFormListeners();
  }

  setupFormListeners() {
    this.experienceForm.get('current')?.valueChanges.subscribe(isChecked => {
      if (isChecked) {
        this.experienceForm.patchValue({ endDate: null }, { emitEvent: false });
      }
    });
  }

  loadExperiences() {
    this.loadingExperiences = true;
    this.experiencesService
      .getAllExperiences()
      .then((data: any) => {
        this.experiences = data;
        this.loadingExperiences = false;
      })
      .catch((error: any) => {
        console.error('Error loading experiences:', error);
        this.loadingExperiences = false;
      });
  }

  async submitExperience() {
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      this.toastService.error('Please fill all required fields');
      return;
    }

    const experienceData = this.experienceForm.value;

    this.isLoading = true;
    this.loadingMessage = this.isEditMode ? 'Updating experience...' : 'Creating experience...';
    const startTime = Date.now();

    try {
      if (this.isEditMode && this.editingExperience?.id) {
        await this.experiencesService.updateExperience(this.editingExperience.id, {
          ...this.editingExperience,
          ...experienceData
        });
        this.toastService.success('Experience updated successfully!');
      } else {
        await this.experiencesService.createExperience(experienceData);
        this.toastService.success('Experience added successfully!');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.loadExperiences();
      this.closeExperienceModal();
    } catch (error: any) {
      console.error('❌ Error saving experience:', error);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.toastService.error('Failed to save experience: ' + (error.message || 'Unknown error'));
    } finally {
      this.isLoading = false;
    }
  }

  onEditExperience(experience: Experience) {
    this.isEditMode = true;
    this.editingExperience = experience;
    this.modalTitle = 'Edit Experience';
    this.experienceForm.patchValue({
      ...experience,
      isVisible: typeof experience.isVisible === 'boolean' ? experience.isVisible : true
    });
    this.isModalOpen = true;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingExperience = null;
    this.modalTitle = 'Add Experience';
    this.resetExperienceForm();
    this.isModalOpen = true;
  }

  onModalSave() {
    this.submitExperience();
  }

  onModalCancel() {
    this.closeExperienceModal();
  }

  closeExperienceModal() {
    this.isModalOpen = false;
    this.resetExperienceForm();
  }

  resetExperienceForm() {
    this.experienceForm.reset({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      isVisible: true
    });
  }

  isSaveDisabled() {
    return this.experienceForm.invalid;
  }

  onDeleteExperience(experience: Experience) {
    this.confirmDialogTitle = 'Delete Experience';
    this.confirmDialogMessage = `Are you sure you want to delete the experience at "${experience.company}"? This action cannot be undone.`;
    this.confirmDialogType = 'danger';
    this.confirmDialogIcon = 'fa-trash';
    this.confirmDialogConfirmText = 'Yes, Delete';
    this.confirmDialogCancelText = 'Cancel';
    this.confirmDialogOpen = true;

    this.pendingDeleteAction = () => {
      if (experience.id) {
        this.isLoading = true;
        this.loadingMessage = 'Deleting experience...';
        const startTime = Date.now();

        this.experiencesService
          .deleteExperience(experience.id)
          .then(async () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.success('Experience deleted successfully!');
            this.loadExperiences();
            this.isLoading = false;
          })
          .catch(async (error: any) => {
            console.error('❌ Error deleting experience:', error);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.error('Failed to delete experience');
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
