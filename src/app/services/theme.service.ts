import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private readonly _themes = ['light-theme', 'dark-theme', 'blue-theme', 'contrast-theme','f1-theme'];
  public themes = this._themes;

  protected theme = signal<string>(localStorage.getItem('theme') || 'light-theme');
  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      sessionStorage.setItem('theme', currentTheme);
      document.body.classList.remove(...this.themes);
      document.body.classList.add(currentTheme);

      const bsMode = currentTheme.includes('dark') || currentTheme.includes('contrast') || currentTheme.includes('f1') ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', bsMode);
    });
  }

  setTheme(newTheme: string) {
    this.theme.set(newTheme);
  }
  setDefaultTheme() {
    this.theme.set('light-theme');
  }
}
