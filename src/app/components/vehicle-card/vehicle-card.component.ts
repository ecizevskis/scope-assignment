import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../models/vehicle.model';

@Component({
    selector: 'app-vehicle-card',
    templateUrl: './vehicle-card.component.html',
    styleUrls: ['./vehicle-card.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class VehicleCardComponent {
    @Input() vehicle!: Vehicle;

    onVehicleImageError(event: Event) {
        (event.target as HTMLImageElement).src = "assets/images/vehicle_placeholder.png";
    }
}
