import { Component, computed, OnInit, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    standalone: true,
    imports: [FormsModule]
})
export class UserListComponent implements OnInit {
    users = signal<User[]>([]);
    isLoading = signal(true);
    searchTerm = signal<string>('');

    filteredUsers = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        return this.users().filter(user =>
            `${user.owner.name} ${user.owner.surname}`.toLowerCase().includes(term)
        );
    });

    constructor(private dataService: DataService) { }

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

    onSearchInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
    }
}

