import { Component, OnInit, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserCardComponent, UserCardPlaceholderComponent } from '../../components';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    standalone: true,
    imports: [FormsModule, UserCardComponent, UserCardPlaceholderComponent]
})
export class UserListComponent implements OnInit {
    users = signal<User[]>([]);
    isLoading = signal(true);
    searchTerm: string = '';

    constructor(private dataService: DataService, private router: Router) { }

    ngOnInit(): void {
        this.dataService.getData().subscribe({
            next: (users: User[]) => {
                const filteredUsers = users.filter(u => u?.userid); // Filter empty records
                this.users.set(filteredUsers);
                this.isLoading.set(false);
                console.debug("Loaded users: " + users.length);
            },
            error: err => {
                console.error('Failed to load users:', err);
                this.isLoading.set(false);
            }
        });
    }

    onProfileImageError(event: Event) {
        (event.target as HTMLImageElement).src = "assets/images/user_placeholder.png";
    }

    navigateToUser(user: User) {
        this.router.navigate(['/user'], {
            state: { user: user }
        });

    }
}

