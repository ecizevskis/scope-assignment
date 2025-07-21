import { Vehicle, VehicleLocation } from "../../../models";

export interface VehicleMapData {
    vehicle: Vehicle;
    location?: VehicleLocation;
    marker?: L.Marker;
}
