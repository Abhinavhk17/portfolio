import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataGrid, GridColumn } from '../../../components/data-grid/data-grid';
import { PageLoader } from '../../../components/page-loader/page-loader';
import { ConfirmationDialog } from '../../../components/confirmation-dialog/confirmation-dialog';
import { ModalWindow } from '../../../components/modal/modal';
import { ProjectsService } from '../../../api/generated/projects/projects.service';
import { ToastService } from '../../../components/toast/toast.service';
import { Project } from '../../../api/models';

@Component({
  selector: 'app-dashboard-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataGrid, PageLoader, ConfirmationDialog, ModalWindow],
  templateUrl: './dashboard-projects.html'
})
export class DashboardProjects implements OnInit {
  projectForm!: FormGroup;
  projects: Project[] = [];
  loadingProjects = false;

  isModalOpen = false;
  isEditMode = false;
  modalTitle = 'Add Project';
  editingProject: Project | null = null;

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

  projectColumns: GridColumn[] = [
    { field: 'name', header: 'Project Name' },
    { field: 'description', header: 'Description' },
    { field: 'url', header: 'URL' },
    { field: 'isVisible', header: 'Visible', type: 'boolean' }
  ];

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private toastService: ToastService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      url: [''],
      technologies: [''],
      isVisible: [true]
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loadingProjects = true;
    this.projectsService
      .getAllProjects()
      .then((data: any) => {
        this.projects = data;
        this.loadingProjects = false;
      })
      .catch((error: any) => {
        console.error('Error loading projects:', error);
        this.loadingProjects = false;
      });
  }

  async submitProject() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.toastService.error('Please fill all required fields');
      return;
    }

    const formValue = this.projectForm.value;

    const projectData = {
      ...formValue,
      technologies: formValue.technologies
        ? formValue.technologies
            .split(',')
            .map((tech: string) => tech.trim())
            .filter((tech: string) => tech.length > 0)
        : []
    };

    this.isLoading = true;
    this.loadingMessage = this.isEditMode ? 'Updating project...' : 'Creating project...';
    const startTime = Date.now();

    try {
      if (this.isEditMode && this.editingProject?.id) {
        await this.projectsService.updateProject(this.editingProject.id, {
          ...this.editingProject,
          ...projectData
        });
        this.toastService.success('Project updated successfully!');
      } else {
        await this.projectsService.createProject(projectData);
        this.toastService.success('Project added successfully!');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.loadProjects();
      this.closeProjectModal();
    } catch (error: any) {
      console.error('❌ Error saving project:', error);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      this.toastService.error('Failed to save project: ' + (error.message || 'Unknown error'));
    } finally {
      this.isLoading = false;
    }
  }

  onEditProject(project: Project) {
    const formData = {
      ...project,
      technologies: project.technologies ? project.technologies.join(', ') : '',
      isVisible: typeof project.isVisible === 'boolean' ? project.isVisible : true
    };

    this.isEditMode = true;
    this.editingProject = project;
    this.modalTitle = 'Edit Project';
    this.projectForm.patchValue(formData);
    this.isModalOpen = true;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingProject = null;
    this.modalTitle = 'Add Project';
    this.resetProjectForm();
    this.isModalOpen = true;
  }

  onModalSave() {
    this.submitProject();
  }

  onModalCancel() {
    this.closeProjectModal();
  }

  closeProjectModal() {
    this.isModalOpen = false;
    this.resetProjectForm();
  }

  resetProjectForm() {
    this.projectForm.reset({
      name: '',
      description: '',
      url: '',
      technologies: '',
      isVisible: true
    });
  }

  isSaveDisabled() {
    return this.projectForm.invalid;
  }

  onDeleteProject(project: Project) {
    this.confirmDialogTitle = 'Delete Project';
    this.confirmDialogMessage = `Are you sure you want to delete "${project.name}"? This action cannot be undone.`;
    this.confirmDialogType = 'danger';
    this.confirmDialogIcon = 'fa-trash';
    this.confirmDialogConfirmText = 'Yes, Delete';
    this.confirmDialogCancelText = 'Cancel';
    this.confirmDialogOpen = true;

    this.pendingDeleteAction = () => {
      if (project.id) {
        this.isLoading = true;
        this.loadingMessage = 'Deleting project...';
        const startTime = Date.now();

        this.projectsService
          .deleteProject(project.id)
          .then(async () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.success('Project deleted successfully!');
            this.loadProjects();
            this.isLoading = false;
          })
          .catch(async (error: any) => {
            console.error('❌ Error deleting project:', error);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.error('Failed to delete project');
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
