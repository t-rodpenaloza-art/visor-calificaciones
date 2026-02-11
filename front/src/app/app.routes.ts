import { Routes } from '@angular/router';
import { SeguimientoComponent } from './sections/seguimiento/seguimiento.component';
import { TarjetaSeguimientoComponent } from './components/tarjeta-seguimiento/tarjeta-seguimiento.component';

export const routes: Routes = [
    { path: 'seguimiento', component: TarjetaSeguimientoComponent },
    { path:'seguimiento-busqueda', component: SeguimientoComponent }
];
