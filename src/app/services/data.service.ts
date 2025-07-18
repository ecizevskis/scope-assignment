import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCacheService } from './apiCache.service';
import { User } from '../models';


@Injectable({ providedIn: 'root' })
export class DataService {

    constructor(
        private apiCache: ApiCacheService
    ) { }

    getData(): Observable<User[]> {
        //return this.apiCache.get<User[]>("https://mobi.connectedcar360.net/api/?op=list", 5 * 60 * 1000); // Cache for 5 minutes
        return this.apiCache.get<User[]>("http://localhost:5000/api/users", 5 * 60 * 1000); // Cache for 5 minutes
    }
}


