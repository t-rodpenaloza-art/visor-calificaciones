import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BmbThemeComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { TarjetaSeguimientoComponent } from './components/tarjeta-seguimiento/tarjeta-seguimiento.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BmbThemeComponent,
    TarjetaSeguimientoComponent,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'seguimiento-estudiantes';
}