import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCacheService } from './apiCache.service';
import { NominatimReverseResponse, User } from '../models';
import { VehicleLocation } from '../models/vehicle-location.model';


@Injectable({ providedIn: 'root' })
export class DataService {

    constructor(
        private apiCache: ApiCacheService
    ) { }

    getData(): Observable<User[]> {
        //return this.apiCache.get<User[]>("https://mobi.connectedcar360.net/api/?op=list", 5 * 60 * 1000); // Cache for 5 minutes
        return this.apiCache.get<User[]>("http://localhost:5000/api/users", 5 * 60 * 1000, (response) => response.data); // Cache for 5 minutes
    }

    getUserVehicleLocations(userId: number): Observable<VehicleLocation[]> {
        return this.apiCache.get<VehicleLocation[]>(`https://mobi.connectedcar360.net/api/?op=getlocations&userid=${userId}`, 30 * 1000, (response) => response.data);
    }

    // Fetch reverse geolocation from OpenStreetMap Nominatim
    getReverseGeolocation(lat: number, lon: number) {
        return this.apiCache.get<NominatimReverseResponse>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, 5 * 60 * 1000);
    }
}




