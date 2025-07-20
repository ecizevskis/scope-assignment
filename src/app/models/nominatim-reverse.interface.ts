export interface NominatimReverseResponse {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: {
        house_number?: string;
        road?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        postcode?: string;
        country: string;
        country_code: string;
        [key: string]: string | undefined;
    };
    boundingbox: [string, string, string, string];
}