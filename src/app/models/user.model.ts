import { Vehicle } from "./vehicle.model";

export interface User {
    userid: number;
    owner: {
        name: string;
        surname: string;
        foto: string;
    };
    vehicles: Vehicle[];
}
