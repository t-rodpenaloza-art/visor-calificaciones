import { Component, Input } from '@angular/core';
import { BmbCardComponent, BmbCardContentComponent } from "@ti-tecnologico-de-monterrey-oficial/ds-ng";
import { GrupoMentoria } from '../../models/estudiante.model';
import { CommonModule } from '@angular/common';
import { SearchGrades } from '../../models/searchGrades';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-groups',
  imports: [BmbCardComponent, BmbCardContentComponent, CommonModule],
  templateUrl: './list-groups.component.html',
  styleUrl: './list-groups.component.scss'
})
export class ListGroupsComponent {

  @Input() gruposMentoria: any[] = [];
  @Input() title: string = '';

  constructor(private _router: Router) { }

  /**
  * Manejo la selección de un grupo de mentoría
  */
  abrirGrupo(grupo: any): void {
    // Aquí navegarías al tablero del grupo

    let searchGrades: SearchGrades = new SearchGrades;

    searchGrades.course.id = grupo.id;
    searchGrades.course.course_code = grupo.course_code;
    searchGrades.course.name = grupo.name;
    searchGrades.courses = this.gruposMentoria;

    this._router.navigate(['/seccion-buscador'], { state: { data: searchGrades } });

  }

}
