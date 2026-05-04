import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { ContactsService } from '../../api/generated/contacts/contacts.service';
import { PageLoader } from '../../components/page-loader/page-loader';
import { ToastService } from '../../components/toast/toast.service';
import { SettingsService } from '../../api/generated/settings/settings.service';
import { AppConstants } from '../../constants';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, PageLoader],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class Contact implements OnInit, OnDestroy {
  contactForm!: FormGroup;
  isSubmitting = false;

  githubUrl = '';
  linkedinUrl = '';
  instagramUrl = '';
  emailAddress = '';

  // GIF carousel
  gifs: string[] = ['/contactus.gif', '/contactus2.gif', '/contactus3.gif'];
  currentGifIndex: number = 0;
  currentGif: string = this.gifs[0];
  private carouselInterval: any;

  constructor(
    private fb: FormBuilder,
    private contactsService: ContactsService,
    private toastService: ToastService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      howCanIHelp: [''],
    });

    // Start GIF carousel
    this.startCarousel();

    this.loadContactSettings();
  }

  ngOnDestroy() {
    // Clean up interval when component is destroyed
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  // GIF Carousel methods
  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextGif();
    }, 5000); // Change every 5 seconds
  }

  nextGif() {
    this.currentGifIndex = (this.currentGifIndex + 1) % this.gifs.length;
    this.currentGif = this.gifs[this.currentGifIndex];
  }

  setCurrentGif(index: number) {
    this.currentGifIndex = index;
    this.currentGif = this.gifs[index];

    // Reset interval when user manually changes
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.startCarousel();
    }
  }

  private loadContactSettings() {
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
        this.linkedinUrl = map.get(AppConstants.LINKEDIN_URL.toLowerCase()) || '';
        this.instagramUrl = map.get(AppConstants.INSTAGRAM_URL.toLowerCase()) || '';
        this.emailAddress = map.get(AppConstants.EMAIL.toLowerCase()) || '';
      })
      .catch((error: any) => {
        console.error('Error loading contact settings:', error);
      });
  }

  get emailLink(): string {
    return this.emailAddress ? `mailto:${this.emailAddress}` : '';
  }

  get githubLink(): string | null {
    return this.normalizeUrl(this.githubUrl);
  }

  get linkedinLink(): string | null {
    return this.normalizeUrl(this.linkedinUrl);
  }

  get instagramLink(): string | null {
    return this.normalizeUrl(this.instagramUrl);
  }

  onExternalClick(url: string | null, event: Event) {
    event.preventDefault();

    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener');
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const contactData = this.contactForm.value;

      this.contactsService
        .createContact(contactData)
        .then((response: any) => {
          this.isSubmitting = false;
          this.toastService.success('Message sent successfully!');
          this.contactForm.reset();
        })
        .catch((error: any) => {
          this.isSubmitting = false;
          this.toastService.error('Failed to send message. Please try again.');
          console.error('Error submitting contact:', error);
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
