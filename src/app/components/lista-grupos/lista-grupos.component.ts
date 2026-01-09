import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrupoMentoria } from '../../models/estudiante.model';

@Component({
  selector: 'app-lista-grupos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-grupos.component.html',
  styleUrl: './lista-grupos.component.scss'
})
export class ListaGruposComponent {
  
  // Recibo la lista de grupos desde el componente padre
  @Input() grupos: GrupoMentoria[] = [];
  
  // Emito el grupo seleccionado cuando el usuario hace clic
  @Output() grupoSeleccionado = new EventEmitter<GrupoMentoria>();

  /**
   * Manejo el clic en un grupo de la lista
   * Notifico al componente padre cuál grupo fue seleccionado
   */
  seleccionarGrupo(grupo: GrupoMentoria): void {
    this.grupoSeleccionado.emit(grupo);
  }
}