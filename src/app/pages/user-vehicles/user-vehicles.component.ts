import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import * as L from 'leaflet';

import { User, Vehicle, VehicleLocation } from '../../models';
import { ProgressBarComponent, UserCardComponent, VehicleCardComponent } from '../../components';
import { DataService } from '../../services/data.service';

interface VehicleMapData {
    vehicle: Vehicle;
    location?: VehicleLocation;
    marker?: L.Marker;
}

@Component({
    selector: 'app-user-vehicles',
    templateUrl: './user-vehicles.component.html',
    styleUrls: ['./user-vehicles.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, UserCardComponent, VehicleCardComponent, ProgressBarComponent]
})
export class UserVehiclesComponent implements OnInit {

    // TODO: Remove when no need for test data --------------------------------------------------------------------
    // This is just to have bigger amount of vehicles to test UI scrolling and scroll in view by pin selection
    private useTestGeneratedVehicles = true;
    private moreTestVehicles: Vehicle[] = this.dataService.getMoreTestVehicles();
    // Generate random locations in Riga for all moreTestVehicles by vehicleId
    private moreTestVehicleLocations: VehicleLocation[] = this.moreTestVehicles.map<VehicleLocation>(v => ({
        vehicleid: v.vehicleid,
        lat: 56.95 + (Math.random() - 0.5) * 0.05, // Riga latitude ± small random offset
        lon: 24.10 + (Math.random() - 0.5) * 0.08, // Riga longitude ± small random offset
    }));
    // -------------------------------------------------------------------------------------------------------------

    isLoading = signal(true);
    user?: User;
    progress = signal(0); // 0 to 100
    connectionWarning = signal(false);
    selectedVehicleId = signal<number | null>(null);

    vehicles = signal<Vehicle[]>([]);
    vehicleDataLookup = computed(() => {
        const map = new Map<number, VehicleMapData>();
        for (const v of this.vehicles()) {
            map.set(v.vehicleid, { vehicle: v, location: undefined, marker: undefined });
        }
        return map;
    });

    // vehicleLocations = signal<VehicleLocation[]>([]);
    // vehicleLocationMap = computed(() => {
    //     const map = new Map<number, VehicleLocation>();
    //     for (const loc of this.vehicleLocations()) {
    //         map.set(loc.vehicleid, loc);
    //     }
    //     return map;
    // });



    // private markers = signal<L.Marker[]>([]);
    // private markerMap = computed(() => {
    //     const map = new Map<number, L.Marker>();
    //     for (const marker of this.markers()) {
    //         const vehicleId = (marker.getLatLng() as any).vehicleid ?? marker.options['vehicleid'];
    //         if (vehicleId) {
    //             map.set(vehicleId, marker);
    //         }
    //     }
    //     return map;
    // });

    private map!: L.Map;
    private progressIntervalId: any;
    private vehicleLocationReadInterval = 60000; // 60 seconds

    constructor(private location: Location, private dataService: DataService, private scroller: ViewportScroller) { }

    private initMap() {
        this.map = L.map('map')
            .setView([56.9496, 24.1052], 13); // Example: Riga, Latvia

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 10,
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    private generateCarMarker(color: string): L.DivIcon {
        // Transparent car on map is not looking good, but filling it with color might be too undistinguishable with some pin colors
        const svg = `<div class="car-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 140">
                <path fill="none" stroke="#000" stroke-width="8" d="M83 0a51.13 51.13 0 0 1 51 51.14c0 17-15.73 43.89-22.5 54.69a246.25 246.25 0 0 1-16.72 23.7C86.66 139.53 84.2 140 83.14 140h-.45c-1.2-.07-3.88-.93-11.64-10.45a240.4 240.4 0 0 1-16.71-23.72C47.63 95.05 32 68.17 32 51.14A51.13 51.13 0 0 1 83 0z"/>
                <path fill="${color}" d="M83 0a51.13 51.13 0 0 1 51 51.14c0 17-15.73 43.89-22.5 54.69a246.25 246.25 0 0 1-16.72 23.7C86.66 139.53 84.2 140 83.14 140h-.45c-1.2-.07-3.88-.93-11.64-10.45a240.4 240.4 0 0 1-16.71-23.72C47.63 95.05 32 68.17 32 51.14A51.13 51.13 0 0 1 83 0zm16.4 22H65.55a7.91 7.91 0 0 0-6.75 4.5l-3.61 8.75-3.43-1a3.69 3.69 0 0 0-.92-.12 2.81 2.81 0 0 0-2.84 3v2a3.66 3.66 0 0 0 3.67 3.65h.39l-.58 1.41A27 27 0 0 0 49.75 53v17.36A3.67 3.67 0 0 0 53.42 74h4.79a3.66 3.66 0 0 0 3.66-3.64V66h41.21v4.35a3.66 3.66 0 0 0 3.67 3.65h4.78a3.66 3.66 0 0 0 3.67-3.64V53a27.31 27.31 0 0 0-1.73-8.7l-.58-1.41h.44a3.66 3.66 0 0 0 3.67-3.7v-2a2.81 2.81 0 0 0-2.84-3 3.69 3.69 0 0 0-.92.12l-3.48 1-3.62-8.76A7.88 7.88 0 0 0 99.4 22zm7.27 29.2a1.46 1.46 0 0 1 1.47 1.46v5a1.47 1.47 0 0 1-1.47 1.46H96.28a1.47 1.47 0 0 1-1.46-1.46v-5a1.46 1.46 0 0 1 1.46-1.46zm-38.1 0A1.47 1.47 0 0 1 70 52.66v5a1.48 1.48 0 0 1-1.47 1.46H58.18a1.47 1.47 0 0 1-1.47-1.46v-5a1.46 1.46 0 0 1 1.47-1.46zm29-26.29a4.75 4.75 0 0 1 4 2.7l5.47 13.25a1.82 1.82 0 0 1-1.82 2.7H59.65a1.83 1.83 0 0 1-1.83-2.7l5.47-13.25a4.74 4.74 0 0 1 4.05-2.7z"/>
            </svg>
        </div>`;
        return L.divIcon({
            html: svg,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
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

    // Loads image placeholder if image fails to load and fetches reverse geolocation for lat/lon
    private updateMapPopup(vehicleLocation: VehicleLocation) {
        // Set image error handler to replace with placeholder if image fails to load
        const img = document.querySelector<HTMLImageElement>('.vehicle-popup img');
        if (img) {
            img.onerror = () => {
                img.src = 'assets/images/vehicle_placeholder.png';
            };

            if (img.complete && img.naturalWidth === 0) {
                img.src = 'assets/images/vehicle_placeholder.png'; // Handle case where image is already loaded but broken
            }
        }

        // Fetch reverse geolocation for lat/lon
        if (vehicleLocation.lat && vehicleLocation.lon) {
            this.dataService.getReverseGeolocation(vehicleLocation.lat, vehicleLocation.lon)
                .subscribe({
                    next: (data: any) => {
                        if (!data) {
                            return;
                        }

                        const popup = document.querySelector('.vehicle-popup .vehicle-location');
                        if (popup) {
                            popup.textContent = data.display_name;
                        }

                    }, error: (err) => {
                        console.error('Failed to fetch reverse geolocation:', err);
                    }
                });
        }
    }

    private fetchVehicleLocations() {
        this.startProgressBar();
        this.dataService.getUserVehicleLocations(this.user?.userid || 0).subscribe({
            next: (locations) => {

                const userVehicleLocation = locations || [];
                locations = this.useTestGeneratedVehicles  // TODO: Remove when no need for test data
                    ? [...userVehicleLocation, ...this.moreTestVehicleLocations]
                    : userVehicleLocation;

                // Update vehicle data with locations
                if (Array.isArray(locations)) {
                    locations.forEach(location => {
                        const vehicleData = this.vehicleDataLookup().get(location.vehicleid);
                        if (vehicleData) {
                            vehicleData.location = location;
                        }
                    });
                }

                if (this.map) {
                    this.vehicleDataLookup().forEach((data, vehicleId) => {
                        const location = data.location;
                        if (location && location.lat && location.lon) {
                            if (data.marker) {
                                data.marker.setLatLng([location.lat, location.lon]);
                            }
                            else { // Create new marker
                                data.marker = L.marker([location.lat, location.lon], { icon: this.generateCarMarker(data.vehicle?.color || '') })
                                    .addTo(this.map)
                                    // Tried to use Angular component as a popup via @angular/elements, but that results in random issues
                                    .bindPopup(this.generateMapPopup(location, data.vehicle))
                                    .on('click', (e) => {
                                        this.highlightVehicle(vehicleId);
                                    })
                                    .on('popupopen', () => {
                                        // When switching from one marker to another timeout ensures that image check and geolocation is loaded correctly
                                        setTimeout(() => this.updateMapPopup(location), 200);
                                    });


                            }
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


    highlightVehicle(vehicleId: number) {
        this.selectedVehicleId.set(vehicleId);
        const el = document.getElementById(`vehicle-${vehicleId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    selectVehicle(vehicle: Vehicle) {
        this.selectedVehicleId.set(vehicle.vehicleid);
        const vehicleMapData = this.vehicleDataLookup().get(vehicle.vehicleid);
        if (vehicleMapData && vehicleMapData.marker && this.map) {
            if (!vehicleMapData.marker.isPopupOpen()) {
                vehicleMapData.marker.openPopup(); // Open popup on marker click
            }

            // Add highlight class to marker icon when popup is opened
            const carMarkerElement = vehicleMapData.marker.getElement()?.querySelector('.car-marker');
            if (carMarkerElement) {
                carMarkerElement.classList.add('flash');
                carMarkerElement.addEventListener('animationend', () => {
                    carMarkerElement.classList.remove('flash');
                }, { once: true });
            }

            // Center map on selected vehicle marker
            this.map.setView(vehicleMapData.marker.getLatLng(), 16, { animate: true });
        }
    }

    ngOnInit(): void {
        const stateData = this.location.getState() as { user: User };
        this.user = stateData?.user;

        const userVehicles = this.user?.vehicles || [];
        const vehicles = this.useTestGeneratedVehicles  // TODO: Remove when no need for test data
            ? [...userVehicles, ...this.moreTestVehicles]
            : userVehicles;

        this.vehicles.set(vehicles);
        this.isLoading.set(false);
    }


    ngAfterViewInit() {
        this.initMap();
        this.fetchVehicleLocations();
        setInterval(() => {
            this.fetchVehicleLocations();
        }, this.vehicleLocationReadInterval); // Poll vehicle locations periodically

    }

    ngOnDestroy() {
        if (this.progressIntervalId) clearInterval(this.progressIntervalId);

        this.vehicleDataLookup().forEach(data => {
            if (data.marker) {
                data.marker.remove();
            }
        });

        if (this.map) {
            this.map.remove();
            this.map = undefined as any;
        }
    }

}