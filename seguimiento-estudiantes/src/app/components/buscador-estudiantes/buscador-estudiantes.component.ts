import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CriteriosBusqueda } from '../../models/estudiante.model';

@Component({
  selector: 'app-buscador-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador-estudiantes.component.html',
  styleUrl: './buscador-estudiantes.component.scss'
})
export class BuscadorEstudiantesComponent {

  // Recibo los criterios para mantener persistencia (RN-06)
  @Input() criterios: CriteriosBusqueda = {
    matricula: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  };

  // Notifico al padre cuando se ejecuta una búsqueda
  @Output() buscar = new EventEmitter<CriteriosBusqueda>();
  
  // Notifico cuando se presiona el botón limpiar
  @Output() limpiar = new EventEmitter<void>();

  /**
   * Ejecuto la búsqueda con los criterios actuales
   * Solo busco si hay al menos un criterio ingresado
   */
  ejecutarBusqueda(): void {
    // const hayCriterios = this.criterios.matricula.trim() !== '' ||
    //                      this.criterios.nombres.trim() !== '' ||
    //                      this.criterios.apellidoPaterno.trim() !== '' ||
    //                      this.criterios.apellidoMaterno.trim() !== '';
    
    // if (hayCriterios) {
       this.buscar.emit({ ...this.criterios });
    // }
  }

  /**
   * Limpio todos los campos del formulario
   * RN-10: El botón limpiar reinicia campos y borra coincidencias
   */
  limpiarFormulario(): void {
    this.criterios = {
      matricula: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: ''
    };
    this.limpiar.emit();
  }

  /**
   * Permito buscar al presionar Enter en cualquier campo
   */
  buscarConEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.ejecutarBusqueda();
    }
  }
}