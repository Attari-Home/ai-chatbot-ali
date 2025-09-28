import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ali-robotics-theme';
  private currentThemeSubject = new BehaviorSubject<Theme>('light');
  public currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    this.setTheme(initialTheme, false);
  }

  public get currentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  public setTheme(theme: Theme, saveToStorage = true): void {
    this.currentThemeSubject.next(theme);

    if (isPlatformBrowser(this.platformId)) {
      // Apply theme class to document element
      const documentElement = document.documentElement;
      if (theme === 'dark') {
        documentElement.classList.add('dark');
      } else {
        documentElement.classList.remove('dark');
      }

      // Save to localStorage
      if (saveToStorage) {
        localStorage.setItem(this.THEME_KEY, theme);
      }
    }
  }

  public toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }
}