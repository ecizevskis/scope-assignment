import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-theme-switcher',
    templateUrl: './theme-switcher.component.html',
    styleUrls: ['./theme-switcher.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class ThemeSwitcherComponent {
    isDarkTheme = signal<boolean>(false);

    toggleTheme() {
        this.isDarkTheme.set(!this.isDarkTheme());
        document.body.classList.toggle('dark', this.isDarkTheme());
        document.body.classList.toggle('light', !this.isDarkTheme());
    }
}
