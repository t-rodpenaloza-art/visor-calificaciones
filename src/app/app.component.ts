import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BmbThemeComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { TarjetaSeguimientoComponent } from './components/tarjeta-seguimiento/tarjeta-seguimiento.component';
import { StateService } from './services/state.service';

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
export class AppComponent implements OnInit {
  title = 'seguimiento-estudiantes';

  private readonly stateService = inject(StateService);

  ngOnInit(): void {
    this.stateService.loadSubAccounts();
    this.stateService.loadCourses('L01234567', { access_token: 'your_access_token_here' });
  }
}