import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

interface CharItem {
  value: string;
  delay: number;
  key: string;
}

interface WordItem {
  characters: CharItem[];
  needsSpace: boolean;
}

@Component({
  selector: 'app-rotating-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rotating-text.html',
  styleUrl: './rotating-text.css'
})
export class RotatingText implements OnInit, OnDestroy {
  @Input() texts: string[] = [];
  @Input() rotationInterval = 2000;
  @Input() staggerDuration = 0;
  @Input() staggerFrom: 'first' | 'last' | 'center' | 'random' | number = 'first';
  @Input() loop = true;
  @Input() auto = true;
  @Input() splitBy: 'characters' | 'words' | 'lines' | string = 'characters';
  @Input() mainClassName = '';
  @Input() splitLevelClassName = '';
  @Input() elementLevelClassName = '';

  @Output() indexChange = new EventEmitter<number>();

  currentText = '';
  elements: WordItem[] = [];
  private currentIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private animationId = 0;

  ngOnInit(): void {
    this.currentIndex = 0;
    this.updateText();

    if (this.auto) {
      this.intervalId = setInterval(() => this.next(), this.rotationInterval);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  next(): void {
    if (!this.texts.length) {
      return;
    }

    const nextIndex =
      this.currentIndex === this.texts.length - 1
        ? this.loop
          ? 0
          : this.currentIndex
        : this.currentIndex + 1;

    if (nextIndex !== this.currentIndex) {
      this.currentIndex = nextIndex;
      this.updateText();
      this.indexChange.emit(this.currentIndex);
    }
  }

  private updateText(): void {
    this.currentText = this.texts[this.currentIndex] || '';
    this.animationId += 1;
    this.elements = this.buildElements(this.currentText, this.animationId);
  }

  private buildElements(text: string, animationId: number): WordItem[] {
    if (!text) {
      return [];
    }

    if (this.splitBy === 'characters') {
      const words = text.split(' ');
      const characters = words.map((word, i) => ({
        characters: this.splitIntoCharacters(word),
        needsSpace: i !== words.length - 1
      }));
      return this.attachDelays(characters, animationId);
    }

    if (this.splitBy === 'words') {
      const words = text.split(' ');
      const wordItems = words.map((word, i) => ({
        characters: [word],
        needsSpace: i !== words.length - 1
      }));
      return this.attachDelays(wordItems, animationId);
    }

    if (this.splitBy === 'lines') {
      const lines = text.split('\n');
      const lineItems = lines.map((line, i) => ({
        characters: [line],
        needsSpace: i !== lines.length - 1
      }));
      return this.attachDelays(lineItems, animationId);
    }

    const parts = text.split(this.splitBy);
    const partItems = parts.map((part, i) => ({
      characters: [part],
      needsSpace: i !== parts.length - 1
    }));
    return this.attachDelays(partItems, animationId);
  }

  private splitIntoCharacters(text: string): string[] {
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
      const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (segment: any) => segment.segment);
    }
    return Array.from(text);
  }

  private attachDelays(words: { characters: string[]; needsSpace: boolean }[], animationId: number): WordItem[] {
    const totalChars = words.reduce((sum, word) => sum + word.characters.length, 0);
    let globalIndex = 0;

    return words.map((word) => {
      const chars: CharItem[] = word.characters.map((char) => {
        const delay = this.getStaggerDelay(globalIndex, totalChars);
        const item: CharItem = {
          value: char,
          delay,
          key: `${animationId}-${globalIndex}`
        };
        globalIndex += 1;
        return item;
      });

      return {
        characters: chars,
        needsSpace: word.needsSpace
      };
    });
  }

  private getStaggerDelay(index: number, total: number): number {
    if (!this.staggerDuration) {
      return 0;
    }

    if (this.staggerFrom === 'first') {
      return index * this.staggerDuration;
    }

    if (this.staggerFrom === 'last') {
      return (total - 1 - index) * this.staggerDuration;
    }

    if (this.staggerFrom === 'center') {
      const center = Math.floor(total / 2);
      return Math.abs(center - index) * this.staggerDuration;
    }

    if (this.staggerFrom === 'random') {
      const randomIndex = Math.floor(Math.random() * total);
      return Math.abs(randomIndex - index) * this.staggerDuration;
    }

    return Math.abs((this.staggerFrom as number) - index) * this.staggerDuration;
  }

}
