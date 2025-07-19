import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() cardClick = new EventEmitter<User>();

  onProfileImageError(event: Event) {
    (event.target as HTMLImageElement).src = "assets/images/user_placeholder.png";
  }

  handleClick() {
    this.cardClick.emit(this.user);
  }
}
