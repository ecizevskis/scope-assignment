import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';
import { AboutUsComponent } from '../about-us.component';
import { UserVehiclesComponent } from './pages/user-vehicles/user-vehicles.component';

export const routes: Routes = [
    { path: '', component: UserListComponent },
    { path: 'about-us', component: AboutUsComponent },
    { path: 'user', component: UserVehiclesComponent },

]