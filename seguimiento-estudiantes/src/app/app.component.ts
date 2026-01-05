import { Component } from '@angular/core';
import { TarjetaSeguimientoComponent } from './components/tarjeta-seguimiento/tarjeta-seguimiento.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TarjetaSeguimientoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'seguimiento-estudiantes';
}