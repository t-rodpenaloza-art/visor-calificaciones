import { Component, Input } from '@angular/core';
import { BmbTablesComponent, BmbBadgeComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';

@Component({
  selector: 'app-table-courses',
  imports: [BmbTablesComponent, BmbBadgeComponent],
  templateUrl: './table-courses.component.html',
  styleUrl: './table-courses.component.scss',
})
export class TableCoursesComponent {

  @Input() alumno: any;
  @Input() courses: any[] = [];

  select(event: any) {
    console.log('Curso seleccionado:', event);
  }

  clickedRow(event: any) {
    console.log('Fila clickeada:', event);
  }

  searchChange(event: any) {
    console.log('Cambio en búsqueda:', event);
  }

  filtersChange(event: any) {
    console.log('Cambio en filtros:', event);
  }

  searchModeChange(event: any) {
    console.log('Cambio en modo de búsqueda:', event);
  }

  pageChange(event: any) {
    console.log('Cambio de página:', event);
  }

}
