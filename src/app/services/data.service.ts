import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCacheService } from './apiCache.service';
import { NominatimReverseResponse, User, Vehicle } from '../models';
import { VehicleLocation } from '../models/vehicle-location.model';


@Injectable({ providedIn: 'root' })
export class DataService {

    constructor(
        private apiCache: ApiCacheService
    ) { }

    getData(): Observable<User[]> {
        return this.apiCache.get<User[]>("https://mobi.connectedcar360.net/api/?op=list", 5 * 60 * 1000, (response) => response.data); // Cache for 5 minutes

        // TODO: Remove when no need for test data
        // Return bigger set of users to test UI scrolling (provided by Node.js server: npm run backend)
        //return this.apiCache.get<User[]>("http://localhost:5000/api/users", 5 * 60 * 1000, (response) => response.data); // Cache for 5 minutes
    }

    getUserVehicleLocations(userId: number): Observable<VehicleLocation[]> {
        return this.apiCache.get<VehicleLocation[]>(`https://mobi.connectedcar360.net/api/?op=getlocations&userid=${userId}`, 30 * 1000, (response) => response.data);
    }

    // Fetch reverse geolocation from OpenStreetMap Nominatim
    getReverseGeolocation(lat: number, lon: number) {
        return this.apiCache.get<NominatimReverseResponse>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, 5 * 60 * 1000);
    }


    // TODO: Remove when no need for test data
    // Meant to add more vehicles to existing user vehicles to test UI scrolling and scroll in view by pin selection
    getMoreTestVehicles(): Vehicle[] {
        return [
            {
                vehicleid: 101,
                make: 'Toyota',
                model: 'Corolla',
                year: 2018,
                color: '#FF5733',
                foto: 'assets/images/vehicle1.png',
                vin: 'JTDBR32E280101001'
            },
            {
                vehicleid: 102,
                make: 'Honda',
                model: 'Civic',
                year: 2019,
                color: '#33C1FF',
                foto: 'assets/images/vehicle2.png',
                vin: '2HGFC2F69KH102002'
            },
            {
                vehicleid: 103,
                make: 'Ford',
                model: 'Focus',
                year: 2020,
                color: '#33FF57',
                foto: 'assets/images/vehicle3.png',
                vin: '1FADP3F21LL103003'
            },
            {
                vehicleid: 104,
                make: 'Volkswagen',
                model: 'Golf',
                year: 2017,
                color: '#FFC300',
                foto: 'assets/images/vehicle4.png',
                vin: '3VW217AU7HM104004'
            },
            {
                vehicleid: 105,
                make: 'BMW',
                model: '320i',
                year: 2021,
                color: '#8E44AD',
                foto: 'assets/images/vehicle5.png',
                vin: 'WBA8E9G51M105005'
            },
            {
                vehicleid: 106,
                make: 'Audi',
                model: 'A4',
                year: 2016,
                color: '#2ECC71',
                foto: 'assets/images/vehicle6.png',
                vin: 'WAUENAF48GN106006'
            },
            {
                vehicleid: 107,
                make: 'Mercedes',
                model: 'C200',
                year: 2015,
                color: '#E74C3C',
                foto: 'assets/images/vehicle7.png',
                vin: 'WDDWF4JB1FR107007'
            },
            {
                vehicleid: 108,
                make: 'Hyundai',
                model: 'Elantra',
                year: 2018,
                color: '#3498DB',
                foto: 'assets/images/vehicle8.png',
                vin: 'KMHD84LF8JU108008'
            },
            {
                vehicleid: 109,
                make: 'Kia',
                model: 'Ceed',
                year: 2019,
                color: '#F39C12',
                foto: 'assets/images/vehicle9.png',
                vin: 'U5YHM51AAL109009'
            },
            {
                vehicleid: 110,
                make: 'Mazda',
                model: '3',
                year: 2020,
                color: '#1ABC9C',
                foto: 'assets/images/vehicle10.png',
                vin: 'JM1BPACL6L110010'
            }
        ];
    }

}




