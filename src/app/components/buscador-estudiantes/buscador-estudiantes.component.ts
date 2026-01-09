import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BmbInputComponent, BmbButtonDirective } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';
import { CriteriosBusqueda } from '../../models/estudiante.model';

@Component({
  selector: 'app-buscador-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BmbInputComponent,
    BmbButtonDirective
  ],
  templateUrl: './buscador-estudiantes.component.html',
  styleUrl: './buscador-estudiantes.component.scss'
})
export class BuscadorEstudiantesComponent {

  // Recibo los criterios actuales para persistencia
  @Input() set criterios(value: CriteriosBusqueda) {
    if (value) {
      this.busquedaForm.patchValue({
        matricula: value.matricula,
        nombres: value.nombres,
        apellidoPaterno: value.apellidoPaterno,
        apellidoMaterno: value.apellidoMaterno
      });
    }
  }

  // Emito cuando el usuario quiere buscar
  @Output() buscar = new EventEmitter<CriteriosBusqueda>();

  // Emito cuando el usuario quiere limpiar
  @Output() limpiar = new EventEmitter<void>();

  // Formulario reactivo para los campos de búsqueda
  busquedaForm = new FormGroup({
    matricula: new FormControl(''),
    nombres: new FormControl(''),
    apellidoPaterno: new FormControl(''),
    apellidoMaterno: new FormControl('')
  });

  /**
   * Obtener FormControl por nombre
   */
  getFormControl(name: string): FormControl {
    return this.busquedaForm.get(name) as FormControl;
  }

  /**
   * Ejecuto la búsqueda emitiendo los criterios al padre
   */
  ejecutarBusqueda(): void {
    const criterios: CriteriosBusqueda = {
      matricula: this.busquedaForm.value.matricula ?? '',
      nombres: this.busquedaForm.value.nombres ?? '',
      apellidoPaterno: this.busquedaForm.value.apellidoPaterno ?? '',
      apellidoMaterno: this.busquedaForm.value.apellidoMaterno ?? ''
    };
    this.buscar.emit(criterios);
  }

  /**
   * Limpio el formulario y notifico al padre
   */
  limpiarFormulario(): void {
    this.busquedaForm.reset({
      matricula: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: ''
    });
    this.limpiar.emit();
  }

  /**
   * Handler para cambios en los inputs
   */
  handleInputChange(event: HTMLInputElement): void {
    // Los cambios se manejan automáticamente por el FormControl
  }
}