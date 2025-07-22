import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserVehiclesComponent } from './pages/user-vehicles/user-vehicles.component';

export const routes: Routes = [
    { path: '', component: UserListComponent },
    { path: 'user', component: UserVehiclesComponent },

]