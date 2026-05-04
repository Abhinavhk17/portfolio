import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataGrid, GridColumn } from '../../../components/data-grid/data-grid';
import { PageLoader } from '../../../components/page-loader/page-loader';
import { ConfirmationDialog } from '../../../components/confirmation-dialog/confirmation-dialog';
import { ModalWindow } from '../../../components/modal/modal';
import { SkillsService } from '../../../api/generated/skills/skills.service';
import { ToastService } from '../../../components/toast/toast.service';
import { Skill } from '../../../api/models';

@Component({
  selector: 'app-dashboard-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataGrid, PageLoader, ConfirmationDialog, ModalWindow],
  templateUrl: './dashboard-skills.html'
})
export class DashboardSkills implements OnInit {
  skillForm!: FormGroup;
  skills: Skill[] = [];
  loadingSkills = false;

  isModalOpen = false;
  isEditMode = false;
  modalTitle = 'Add Skill';
  editingSkill: Skill | null = null;

  isLoading = false;
  loadingMessage = 'Loading...';

  selectedSkillImageFile: File | null = null;
  selectedSkillImagePreviewUrl: string | null = null;

  confirmDialogOpen = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  confirmDialogType: 'danger' | 'warning' | 'info' = 'danger';
  confirmDialogIcon = 'fa-trash';
  confirmDialogConfirmText = 'Yes, Delete';
  confirmDialogCancelText = 'Cancel';
  pendingDeleteAction: (() => void) | null = null;

  skillColumns: GridColumn[] = [
    { field: 'name', header: 'Skill Name' },
    { field: 'isVisible', header: 'Visible', type: 'boolean' }
  ];

  constructor(
    private fb: FormBuilder,
    private skillsService: SkillsService,
    private toastService: ToastService
  ) {
    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      isVisible: [true]
    });
  }

  ngOnInit() {
    this.loadSkills();
  }

  loadSkills() {
    this.loadingSkills = true;
    this.skillsService
      .getAllSkills()
      .then((data: any) => {
        this.skills = data;
        this.loadingSkills = false;
      })
      .catch((error: any) => {
        console.error('Error loading skills:', error);
        this.loadingSkills = false;
      });
  }

  async submitSkill() {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      this.toastService.error('Please fill all required fields');
      return;
    }

    if (!this.isEditMode && !this.selectedSkillImageFile) {
      this.toastService.error('Please select a skill logo image');
      return;
    }

    const skillData = this.skillForm.value;

    this.isLoading = true;
    this.loadingMessage = this.isEditMode ? 'Updating skill...' : 'Saving skill...';

    try {
      if (this.isEditMode && this.editingSkill?.id) {
        await this.skillsService.updateSkill(this.editingSkill.id, {
          ...this.editingSkill,
          name: skillData.name,
          isVisible: skillData.isVisible
        });
        this.toastService.success('Skill updated successfully!');
      } else {
        const createdSkill = await this.skillsService.createSkill(
          {
            image: this.selectedSkillImageFile as File
          },
          {
            name: skillData.name
          }
        );
        if (
          createdSkill?.id &&
          typeof skillData.isVisible === 'boolean' &&
          createdSkill.isVisible !== skillData.isVisible
        ) {
          await this.skillsService.updateSkill(createdSkill.id, {
            ...createdSkill,
            isVisible: skillData.isVisible
          });
        }
        this.toastService.success('Skill added successfully!');
      }

      this.loadSkills();
      this.closeSkillModal();
    } catch (error) {
      console.error(error);
      this.toastService.error('Failed to save skill');
    }

    this.isLoading = false;
  }

  onSkillImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.clearSkillImage();

    if (!file) {
      return;
    }

    this.selectedSkillImageFile = file;
    this.selectedSkillImagePreviewUrl = URL.createObjectURL(file);
  }

  clearSkillImage() {
    if (this.selectedSkillImagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedSkillImagePreviewUrl);
    }

    this.selectedSkillImagePreviewUrl = null;
    this.selectedSkillImageFile = null;
  }

  onEditSkill(skill: Skill) {
    this.isEditMode = true;
    this.editingSkill = skill;
    this.modalTitle = 'Edit Skill';
    this.skillForm.patchValue({
      name: skill.name || '',
      isVisible: typeof skill.isVisible === 'boolean' ? skill.isVisible : true
    });

    if (skill.logoUrl) {
      this.selectedSkillImagePreviewUrl = skill.logoUrl;
    } else {
      this.selectedSkillImagePreviewUrl = null;
    }

    this.selectedSkillImageFile = null;
    this.isModalOpen = true;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingSkill = null;
    this.modalTitle = 'Add Skill';
    this.resetSkillForm();
    this.isModalOpen = true;
  }

  onModalSave() {
    this.submitSkill();
  }

  onModalCancel() {
    this.closeSkillModal();
  }

  closeSkillModal() {
    this.isModalOpen = false;
    this.resetSkillForm();
  }

  resetSkillForm() {
    this.skillForm.reset({ name: '', isVisible: true });
    this.clearSkillImage();
  }

  isSaveDisabled() {
    if (this.skillForm.invalid) {
      return true;
    }

    if (!this.isEditMode) {
      return !this.selectedSkillImageFile;
    }

    return false;
  }

  onDeleteSkill(skill: Skill) {
    this.confirmDialogTitle = 'Delete Skill';
    this.confirmDialogMessage = `Are you sure you want to delete "${skill.name}"? This action cannot be undone.`;
    this.confirmDialogType = 'danger';
    this.confirmDialogIcon = 'fa-trash';
    this.confirmDialogConfirmText = 'Yes, Delete';
    this.confirmDialogCancelText = 'Cancel';
    this.confirmDialogOpen = true;

    this.pendingDeleteAction = () => {
      if (skill.id) {
        this.isLoading = true;
        this.loadingMessage = 'Deleting skill...';
        const startTime = Date.now();

        this.skillsService
          .deleteSkill(skill.id)
          .then(async () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.success('Skill deleted successfully!');
            this.loadSkills();
            this.isLoading = false;
          })
          .catch(async (error: any) => {
            console.error('❌ Error deleting skill:', error);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 800 - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            this.toastService.error('Failed to delete skill');
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
