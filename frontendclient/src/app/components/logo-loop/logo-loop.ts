import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  AfterViewInit,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LogoItem {
  imageUrl?: string;
  name: string;
  alt?: string;
  href?: string;
  title?: string;
}

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2
} as const;

@Component({
  selector: 'app-logo-loop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-loop.html',
  styleUrl: './logo-loop.css'
})
export class LogoLoop implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: false }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('track', { static: false }) trackRef!: ElementRef<HTMLDivElement>;
  
  @Input() logos: LogoItem[] = [];
  @Input() speed: number = 120; // pixels per second
  @Input() direction: 'left' | 'right' | 'up' | 'down' = 'left';
  @Input() logoHeight: number = 80;
  @Input() gap: number = 40;
  @Input() pauseOnHover: boolean = true;
  @Input() hoverSpeed?: number;
  @Input() scaleOnHover: boolean = true;
  @Input() fadeOut: boolean = true;
  @Input() fadeOutColor: string = 'transparent';
  @Input() ariaLabel: string = 'Logo carousel';

  // State
  copyCount: number = ANIMATION_CONFIG.MIN_COPIES;
  isHovered: boolean = false;
  
  // Animation state
  private seqWidth: number = 0;
  private seqHeight: number = 0;
  private offsetRef: number = 0;
  private velocityRef: number = 0;
  private animationId: number | null = null;
  private lastTimestamp: number | null = null;
  private resizeObserver?: ResizeObserver;
  private imagesLoaded: boolean = false;
  private frameCount: number = 0;

  get isVertical(): boolean {
    return this.direction === 'up' || this.direction === 'down';
  }

  get targetVelocity(): number {
    const magnitude = Math.abs(this.speed);
    let directionMultiplier: number;
    
    if (this.isVertical) {
      directionMultiplier = this.direction === 'up' ? 1 : -1;
    } else {
      directionMultiplier = this.direction === 'left' ? 1 : -1;
    }
    
    const speedMultiplier = this.speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }

  get effectiveHoverSpeed(): number | undefined {
    if (this.hoverSpeed !== undefined) return this.hoverSpeed;
    if (this.pauseOnHover === true) return 0;
    if (this.pauseOnHover === false) return undefined;
    return 0;
  }

  get copies(): number[] {
    return Array.from({ length: this.copyCount }, (_, i) => i);
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Initial copy count
    this.copyCount = ANIMATION_CONFIG.MIN_COPIES;
  }

  ngAfterViewInit() {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      this.updateDimensions();
      this.startAnimation();
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateDimensions();
  }

  private setupResizeObserver() {
    if (!window.ResizeObserver) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateDimensions();
    });

    if (this.containerRef?.nativeElement) {
      this.resizeObserver.observe(this.containerRef.nativeElement);
    }
    if (this.trackRef?.nativeElement) {
      this.resizeObserver.observe(this.trackRef.nativeElement);
    }
  }

  private loadImages() {
    const images = this.trackRef?.nativeElement?.querySelectorAll('img') ?? [];
    
    if (images.length === 0) {
      this.imagesLoaded = true;
      return;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) {
        this.imagesLoaded = true;
        this.updateDimensions();
      }
    };

    images.forEach((img: Element) => {
      const htmlImg = img as HTMLImageElement;
      if (htmlImg.complete) {
        handleImageLoad();
      } else {
        htmlImg.addEventListener('load', handleImageLoad, { once: true });
        htmlImg.addEventListener('error', handleImageLoad, { once: true });
      }
    });
  }

  private updateDimensions() {
    if (!this.trackRef?.nativeElement) return;
    
    const track = this.trackRef.nativeElement;
    const firstList = track.querySelector('.first-sequence') as HTMLElement;
    
    if (!firstList) return;
    
    const sequenceWidth = firstList.scrollWidth;
    const sequenceHeight = firstList.scrollHeight;
    const containerWidth = this.containerRef?.nativeElement?.clientWidth ?? 0;

    if (this.isVertical) {
      const parentHeight = this.containerRef?.nativeElement?.parentElement?.clientHeight ?? 0;
      
      if (this.containerRef?.nativeElement && parentHeight > 0) {
        this.containerRef.nativeElement.style.height = `${parentHeight}px`;
      }

      if (sequenceHeight > 0) {
        this.seqHeight = sequenceHeight;
        const viewport = this.containerRef?.nativeElement?.clientHeight ?? parentHeight ?? sequenceHeight;
        const copiesNeeded = Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM;
        this.copyCount = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);
      }
    } else {
      if (sequenceWidth > 0) {
        this.seqWidth = sequenceWidth;
        const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
        this.copyCount = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);
      }
    }
  }

  private startAnimation() {
    const track = this.trackRef?.nativeElement;
    if (!track) {
      console.error('LogoLoop: track not found');
      return;
    }

    const animate = (timestamp: number) => {
      if (this.lastTimestamp === null) {
        this.lastTimestamp = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      const seqSize = this.isVertical ? this.seqHeight : this.seqWidth;

      // Ensure offset is within bounds
      if (seqSize > 0) {
        this.offsetRef = ((this.offsetRef % seqSize) + seqSize) % seqSize;
      }

      // Smooth velocity transition
      const target = this.isHovered && this.pauseOnHover
        ? 0  // Explicitly set to 0 when paused
        : this.targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      this.velocityRef += (target - this.velocityRef) * easingFactor;

      // Update offset
      if (seqSize > 0) {
        let nextOffset = this.offsetRef + this.velocityRef * deltaTime;
        nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
        this.offsetRef = nextOffset;

        const transformValue = this.isVertical
          ? `translate3d(0, ${-this.offsetRef}px, 0)`
          : `translate3d(${-this.offsetRef}px, 0, 0)`;
        track.style.transform = transformValue;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  onMouseEnter() {
    if (this.pauseOnHover) {
      this.isHovered = true;
    }
  }

  onMouseLeave() {
    if (this.pauseOnHover) {
      this.isHovered = false;
    }
  }

  get containerClasses() {
    return {
      'logoloop': true,
      'logoloop--vertical': this.isVertical,
      'logoloop--scale-hover': this.scaleOnHover,
      'logoloop--fade': this.fadeOut
    };
  }

  get cssVariables() {
    return {
      '--logoloop-gap': `${this.gap}px`,
      '--logoloop-logoHeight': `${this.logoHeight}px`,
      '--logoloop-fadeColor': this.fadeOutColor
    };
  }
}
