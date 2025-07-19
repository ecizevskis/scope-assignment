import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

import { Vehicle } from '../../models/vehicle.model';
import { User } from '../../models';
import { UserCardComponent, VehicleCardComponent } from '../../components';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-user-vehicles',
    templateUrl: './user-vehicles.component.html',
    styleUrls: ['./user-vehicles.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, UserCardComponent, VehicleCardComponent]
})
export class UserVehiclesComponent implements OnInit {
    vehicles = signal<Vehicle[]>([]);
    isLoading = signal(true);

    constructor(private location: Location) { }

    user?: User;

    ngOnInit(): void {
        // Read user from router extras (history state)
        const stateData = this.location.getState() as { user: User };
        this.user = stateData?.user;

        console.debug("User vehicles component initialized for user:", this.user);
        // TODO: Load vehicles for this.user or userId
        this.isLoading.set(false);
    }

    onProfileImageError(event: Event) {
        (event.target as HTMLImageElement).src = "assets/images/user_placeholder.png";
    }

    onVehicleImageError(event: Event) {
        (event.target as HTMLImageElement).src = "assets/images/vehicle_placeholder.png";
    }

    // navigateToVehicle(vehicle: Vehicle) {
    //     this.router.navigate(['/vehicle-details', vehicle.vehicleid], {
    //         state: { vehicle: vehicle }
    //     });
    // }
}