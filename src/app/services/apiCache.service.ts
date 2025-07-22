import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';

interface CacheEntry<T> {
    expiry: number;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiCacheService {
    constructor(private http: HttpClient) { }

    get<T>(url: string, ttl: number, mapResponse: (response: any) => T = (response) => response as T): Observable<T> {
        const now = Date.now();
        const cachedRaw = localStorage.getItem(url);

        if (cachedRaw) {
            try {
                const cached: CacheEntry<T> = JSON.parse(cachedRaw);
                if (cached.expiry > now) {
                    return of(cached.data);
                } else {
                    // Expired, remove from storage
                    localStorage.removeItem(url);
                }
            } catch (err) {
                console.warn('⚠️ Failed to parse cached data', err);
                localStorage.removeItem(url); // Safety cleanup
            }
        }

        // Fetch from network and cache
        return this.http.get(url).pipe(
            map(mapResponse),   // Transform response using provided mapping function
            tap(data => {
                const entry: CacheEntry<T> = {
                    data,
                    expiry: now + ttl
                };
                try {
                    localStorage.setItem(url, JSON.stringify(entry));
                } catch (err) {
                    console.warn('⚠️ Failed to save to localStorage', err);
                }
            })
        );
    }

    clear(url?: string): void {
        if (url) {
            localStorage.removeItem(url);
        } else {
            localStorage.clear(); // 🧹 careful—this clears ALL localStorage for the origin
        }
    }
}