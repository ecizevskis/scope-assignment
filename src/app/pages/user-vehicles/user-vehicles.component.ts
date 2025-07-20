import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import * as L from 'leaflet';

import { User, Vehicle, VehicleLocation } from '../../models';
import { ProgressBarComponent, UserCardComponent, VehicleCardComponent } from '../../components';
import { DataService } from '../../services/data.service';

@Component({
    selector: 'app-user-vehicles',
    templateUrl: './user-vehicles.component.html',
    styleUrls: ['./user-vehicles.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, UserCardComponent, VehicleCardComponent, ProgressBarComponent]
})
export class UserVehiclesComponent implements OnInit {
    vehicles = signal<Vehicle[]>([]);
    vehicleMap = computed(() => {
        const map = new Map<number, Vehicle>();
        for (const v of this.vehicles()) {
            map.set(v.vehicleid, v);
        }
        return map;
    });
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
    progress = signal(0); // 0 to 100
    connectionWarning = signal(false);

    private markers: L.Marker[] = [];
    private map!: L.Map;

    private progressIntervalId: any;
    private vehicleLocationReadInterval = 30000; // 30 seconds

    constructor(private location: Location, private dataService: DataService) { }


    private initMap() {
        this.map = L.map('map').setView([56.9496, 24.1052], 13); // Example: Riga, Latvia
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 10,
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    private generateCarMarker(color: string): L.DivIcon {
        // Transparent car on map is not looking good, but filling it with color might be too undistinguishable with some pin colors
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 140">
            <path fill="none" stroke="#000" stroke-width="8" d="M83 0a51.13 51.13 0 0 1 51 51.14c0 17-15.73 43.89-22.5 54.69a246.25 246.25 0 0 1-16.72 23.7C86.66 139.53 84.2 140 83.14 140h-.45c-1.2-.07-3.88-.93-11.64-10.45a240.4 240.4 0 0 1-16.71-23.72C47.63 95.05 32 68.17 32 51.14A51.13 51.13 0 0 1 83 0z"/>
            <path fill="${color}" d="M83 0a51.13 51.13 0 0 1 51 51.14c0 17-15.73 43.89-22.5 54.69a246.25 246.25 0 0 1-16.72 23.7C86.66 139.53 84.2 140 83.14 140h-.45c-1.2-.07-3.88-.93-11.64-10.45a240.4 240.4 0 0 1-16.71-23.72C47.63 95.05 32 68.17 32 51.14A51.13 51.13 0 0 1 83 0zm16.4 22H65.55a7.91 7.91 0 0 0-6.75 4.5l-3.61 8.75-3.43-1a3.69 3.69 0 0 0-.92-.12 2.81 2.81 0 0 0-2.84 3v2a3.66 3.66 0 0 0 3.67 3.65h.39l-.58 1.41A27 27 0 0 0 49.75 53v17.36A3.67 3.67 0 0 0 53.42 74h4.79a3.66 3.66 0 0 0 3.66-3.64V66h41.21v4.35a3.66 3.66 0 0 0 3.67 3.65h4.78a3.66 3.66 0 0 0 3.67-3.64V53a27.31 27.31 0 0 0-1.73-8.7l-.58-1.41h.44a3.66 3.66 0 0 0 3.67-3.7v-2a2.81 2.81 0 0 0-2.84-3 3.69 3.69 0 0 0-.92.12l-3.48 1-3.62-8.76A7.88 7.88 0 0 0 99.4 22zm7.27 29.2a1.46 1.46 0 0 1 1.47 1.46v5a1.47 1.47 0 0 1-1.47 1.46H96.28a1.47 1.47 0 0 1-1.46-1.46v-5a1.46 1.46 0 0 1 1.46-1.46zm-38.1 0A1.47 1.47 0 0 1 70 52.66v5a1.48 1.48 0 0 1-1.47 1.46H58.18a1.47 1.47 0 0 1-1.47-1.46v-5a1.46 1.46 0 0 1 1.47-1.46zm29-26.29a4.75 4.75 0 0 1 4 2.7l5.47 13.25a1.82 1.82 0 0 1-1.82 2.7H59.65a1.83 1.83 0 0 1-1.83-2.7l5.47-13.25a4.74 4.74 0 0 1 4.05-2.7z"/>
            </svg>
        `;
        return L.divIcon({
            html: svg,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            className: '' // Needed to remove pin white square background
        });
    }

    private generateMapPopup(vehicleLocation: VehicleLocation, vehicle?: Vehicle): string {
        return `
            <div class="vehicle-popup">
                <img src="${vehicle?.foto || 'assets/images/vehicle_placeholder.png'}" alt="Vehicle photo" />
                <div class="vehicle-info">
                    <div class="vehicle-name">${vehicle?.make || ''} ${vehicle?.model || ''}</div>
                    <div class="vehicle-location">${vehicleLocation.lat}, ${vehicleLocation.lon}</div>
                </div>
            </div>
        `;
    }

    private fetchVehicleLocations() {
        this.startProgressBar();
        this.dataService.getUserVehicleLocations(this.user?.userid || 0).subscribe({
            next: (locations) => {
                this.vehicleLocations.set(locations || []);
                if (this.map && Array.isArray(locations)) {
                    // Clear old markers
                    this.markers.forEach(marker => marker.remove());
                    this.markers = [];

                    locations.forEach(loc => {
                        if (loc.lat && loc.lon) {
                            const vehicle = this.vehicleMap().get(loc.vehicleid);
                            const popupHtml = this.generateMapPopup(loc, vehicle);

                            const marker = L.marker([loc.lat, loc.lon], { icon: this.generateCarMarker(vehicle?.color || '') })
                                .addTo(this.map)
                                .bindPopup(popupHtml)   // Tried to use Angular component as a popup via @angular/elements, but that results in random issues
                                .on('popupopen', () => {
                                    const img = document.querySelector<HTMLImageElement>('.vehicle-popup img');
                                    if (img) {
                                        img.onerror = () => {
                                            img.src = 'assets/images/vehicle_placeholder.png';
                                        };
                                    }
                                });


                            this.markers.push(marker);
                        }
                    });

                    this.connectionWarning.set(false);
                }
            },
            error: (err) => {
                console.error('Failed to load vehicle locations:', err);
                this.connectionWarning.set(true);
            }
        });
    }

    // Start progress bar animation for specified interval
    // Used to show time until next vehicle location read
    private startProgressBar() {
        let elapsed = 0;
        this.progress.set(0);
        if (this.progressIntervalId) clearInterval(this.progressIntervalId);
        this.progressIntervalId = setInterval(() => {
            elapsed += 100;
            this.progress.set(Math.min(100, (elapsed / this.vehicleLocationReadInterval) * 100));
            if (elapsed >= this.vehicleLocationReadInterval) {
                clearInterval(this.progressIntervalId);
            }
        }, 100);
    }

    selectVehicle(vehicle: Vehicle) {
        const location = this.vehicleLocationMap().get(vehicle.vehicleid);

        // Center to vehicle on map
        if (location && location.lat && location.lon && this.map) {
            this.map.setView([location.lat, location.lon], 16, { animate: true });
        }
    }

    ngOnInit(): void {
        const stateData = this.location.getState() as { user: User };
        this.user = stateData?.user;
        this.vehicles.set(this.user?.vehicles || []);
        this.isLoading.set(false);
    }


    ngAfterViewInit() {
        this.initMap();

        // Poll every 30 seconds
        this.fetchVehicleLocations();
        setInterval(() => {
            this.fetchVehicleLocations();
        }, this.vehicleLocationReadInterval);

    }

    ngOnDestroy() {
        if (this.progressIntervalId) clearInterval(this.progressIntervalId);
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
        if (this.map) {
            this.map.remove();
            this.map = undefined as any;
        }
    }

}