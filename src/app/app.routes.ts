import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';
import { AboutUsComponent } from '../about-us.component';

export const routes: Routes = [
    { path: '', component: UserListComponent },
    { path: 'about-us', component: AboutUsComponent },

]