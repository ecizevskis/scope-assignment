import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import * as L from 'leaflet';


import { Vehicle } from '../../models/vehicle.model';
import { User } from '../../models';
import { UserCardComponent, VehicleCardComponent } from '../../components';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { VehicleLocation } from '../../models/vehicle-location.model';

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
    vehicleLocations = signal<VehicleLocation[]>([]);
    vehicleLocationMap = computed(() => {
        const map = new Map<number, VehicleLocation>();
        for (const loc of this.vehicleLocations()) {
            map.set(loc.vehicleid, loc);
        }
        return map;
    });
    user?: User;

    private markers: L.Marker[] = [];
    private map!: L.Map;

    constructor(private location: Location, private dataService: DataService) { }


    private initMap() {
        this.map = L.map('map').setView([56.9496, 24.1052], 13); // Example: Riga, Latvia
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 10,
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    private fetchVehicleLocations() {
        this.dataService.getUserVehicleLocations(this.user?.userid || 0).subscribe({
            next: (locations) => {
                this.vehicleLocations.set(locations || []);
                if (this.map && Array.isArray(locations)) {
                    // Clear old markers
                    this.markers.forEach(marker => marker.remove());
                    this.markers = [];
                    // Add new markers
                    locations.forEach(loc => {
                        if (loc.lat && loc.lon) {
                            const marker = L.marker([loc.lat, loc.lon])
                                .addTo(this.map)
                                .bindPopup(`Vehicle ID: ${loc.vehicleid}`);
                            this.markers.push(marker);
                        }
                    });
                }
            },
            error: (err) => {
                console.error('Failed to load vehicle locations:', err);
            }
        });
    }

    ngOnInit(): void {
        const stateData = this.location.getState() as { user: User };
        this.user = stateData?.user;
        this.isLoading.set(false);
    }


    ngAfterViewInit() {
        this.initMap();

        // Poll every 30 seconds
        this.fetchVehicleLocations(); ``
        setInterval(() => {
            this.fetchVehicleLocations();
        }, 30000);
    }

    onProfileImageError(event: Event) {
        (event.target as HTMLImageElement).src = "assets/images/user_placeholder.png";
    }

    onVehicleImageError(event: Event) {
        (event.target as HTMLImageElement).src = "assets/images/vehicle_placeholder.png";
    }

    selectVehicle(vehicle: Vehicle) {
        // Handle vehicle selection (e.g., navigate to details page)
        const location = this.vehicleLocationMap().get(vehicle.vehicleid);
        // You can now use `location` as needed, e.g., navigate or show details

        if (location && location.lat && location.lon && this.map) {
            this.map.setView([location.lat, location.lon], 16, { animate: true });
        }

    }
}