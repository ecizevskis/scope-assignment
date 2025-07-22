import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class ProgressBarComponent {
    @Input() value: number = 0;
    @Input() text: string = '';
}
