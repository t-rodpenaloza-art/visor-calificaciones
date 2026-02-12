import { Routes } from '@angular/router';
import { SeguimientoComponent } from './sections/seguimiento/seguimiento.component';
import { TarjetaSeguimientoComponent } from './components/tarjeta-seguimiento/tarjeta-seguimiento.component';
import { IntegralDashboardComponent } from './sections/integral-dashboard/integral-dashboard.component';
import { RatingDetailsComponent } from './sections/rating-details/rating-details.component';

export const routes: Routes = [
  { path: 'seguimiento', component: TarjetaSeguimientoComponent },
  { path: 'seguimiento-busqueda', component: SeguimientoComponent },
  { path: 'seccion-tablero', component: IntegralDashboardComponent },
  { path: 'detalle-calificaciones', component: RatingDetailsComponent },
  { path: '**', redirectTo: 'seguimiento' }
];
