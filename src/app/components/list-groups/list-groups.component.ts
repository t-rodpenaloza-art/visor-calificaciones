import { Component, Input } from '@angular/core';
import { BmbCardComponent, BmbCardContentComponent } from "@ti-tecnologico-de-monterrey-oficial/ds-ng";
import { GrupoMentoria } from '../../models/estudiante.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-groups',
  imports: [BmbCardComponent, BmbCardContentComponent, CommonModule],
  templateUrl: './list-groups.component.html',
  styleUrl: './list-groups.component.scss'
})
export class ListGroupsComponent {

  @Input() gruposMentoria: GrupoMentoria[] = [];
  @Input() title: string = '';

  /**
  * Manejo la selección de un grupo de mentoría
  */
  abrirGrupo(grupo: GrupoMentoria): void {
    console.log('Grupo seleccionado:', grupo);
    // Aquí navegarías al tablero del grupo
  }

}
