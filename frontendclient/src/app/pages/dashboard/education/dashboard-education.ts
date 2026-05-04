import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataGrid, GridColumn } from '../../../components/data-grid/data-grid';
import { PageLoader } from '../../../components/page-loader/page-loader';
import { ConfirmationDialog } from '../../../components/confirmation-dialog/confirmation-dialog';
import { ModalWindow } from '../../../components/modal/modal';
import { EducationService } from '../../../api/generated/education/education.service';
import { ToastService } from '../../../components/toast/toast.service';
import { Education } from '../../../api/models';

@Component({
  selector: 'app-dashboard-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataGrid, PageLoader, ConfirmationDialog, ModalWindow],
  templateUrl: './dashboard-education.html'
})
export class DashboardEducation implements OnInit {
  educationForm!: FormGroup;
  educations: Education[] = [];
  loadingEducations = false;

  isModalOpen = false;
  isEditMode = false;
  modalTitle = 'Add Education';
  editingEducation: Education | null = null;

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

  educationColumns: GridColumn[] = [
    { field: 'name', header: 'Degree/Course Name' },
    { field: 'instituitionName', header: 'Institution Name' },
    { field: 'fromYear', header: 'From Year' },
    { field: 'toYear', header: 'To Year' },
    { field: 'location', header: 'Location' },
    { field: 'cgpa', header: 'CGPA/Grade' },
    { field: 'isVisible', header: 'Visible', type: 'boolean' }
  ];

  constructor(
    private fb: FormBuilder,
    private educationService: EducationService,
    private toastService: ToastService
  ) {
    this.educationForm = this.fb.group({
      name: ['', Validators.required],
      instituitionName: ['', Validators.required],
      fromYear: ['', Validators.required],
      toYear: [''],
      location: [''],
      cgpa: [''],
      isVisible: [true]
    });
  }

  ngOnInit() {
    this.loadEducations();
  }

  loadEducations() {
    this.loadingEducations = true;
    this.educationService
      .getAllEducation()
      .then((data: any) => {
        this.educations = data;
        this.loadingEducations = false;
      })
      .catch((error: any) => {
        console.error('Error loading educations:', error);
        this.loadingEducations = false;
      });
  }

  async submitEducation() {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      this.toastService.error('Please fill all required fields');
      return;
    }

    const educationData = this.educationForm.value;

    this.isLoading = true;
    this.loadingMessage = this.isEditMode ? 'Updating education...' : 'Creating education...';
    const startTime = Date.now();

    try {
      if (this.isEditMode && this.editingEducation?.id) {
        await this.educationService.updateEducation(this.editingEducation.id, {
          ...this.editingEducation,
          ...educationData
        });
        this.toastService.success('Education updated successfully!');
      } else {
        await this.educationService.createEducation(educationData);
        this.toastService.success('Education added successfully!');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.loadEducations();
      this.closeEducationModal();
    } catch (error: any) {
      console.error('❌ Error saving education:', error);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.toastService.error('Failed to save education: ' + (error.message || 'Unknown error'));
    } finally {
      this.isLoading = false;
    }
  }

  onEditEducation(education: Education) {
    this.isEditMode = true;
    this.editingEducation = education;
    this.modalTitle = 'Edit Education';
    this.educationForm.patchValue({
      ...education,
      isVisible: typeof education.isVisible === 'boolean' ? education.isVisible : true
    });
    this.isModalOpen = true;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingEducation = null;
    this.modalTitle = 'Add Education';
    this.resetEducationForm();
    this.isModalOpen = true;
  }

  onModalSave() {
    this.submitEducation();
  }

  onModalCancel() {
    this.closeEducationModal();
  }

  closeEducationModal() {
    this.isModalOpen = false;
    this.resetEducationForm();
  }

  resetEducationForm() {
    this.educationForm.reset({
      name: '',
      instituitionName: '',
      fromYear: '',
      toYear: '',
      location: '',
      cgpa: '',
      isVisible: true
    });
  }

  isSaveDisabled() {
    return this.educationForm.invalid;
  }

  onDeleteEducation(education: Education) {
    this.confirmDialogTitle = 'Delete Education';
    this.confirmDialogMessage = `Are you sure you want to delete "${education.name}" from "${education.instituitionName}"? This action cannot be undone.`;
    this.confirmDialogType = 'danger';
    this.confirmDialogIcon = 'fa-trash';
    this.confirmDialogConfirmText = 'Yes, Delete';
    this.confirmDialogCancelText = 'Cancel';
    this.confirmDialogOpen = true;

    this.pendingDeleteAction = () => {
      if (education.id) {
        this.isLoading = true;
        this.loadingMessage = 'Deleting education...';
        const startTime = Date.now();

        this.educationService
          .deleteEducation(education.id)
          .then(async () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.success('Education deleted successfully!');
            this.loadEducations();
            this.isLoading = false;
          })
          .catch(async (error: any) => {
            console.error('❌ Error deleting education:', error);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.error('Failed to delete education');
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
