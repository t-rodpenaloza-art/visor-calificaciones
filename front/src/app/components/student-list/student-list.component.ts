import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BmbDropdownComponent, BmbListGroupComponent, BmbListGroupItemComponent } from '@ti-tecnologico-de-monterrey-oficial/ds-ng';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    BmbDropdownComponent,
    ReactiveFormsModule,
    BmbListGroupComponent,
    BmbListGroupItemComponent
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent implements OnInit {

  @Input() course: string = "";
  @Input() courseID: string = "";
  @Input() alumnos: any[] = [];
  @Output() alumnoSeleccionado = new EventEmitter<any>();

  alumnosTransformed: any[] = [];

  ngOnInit() {
    this.alumnosTransformed = this.alumnos.map(alumno => ({ ...alumno, name: `${alumno.matricula} - ${alumno.nombre}`, value: alumno.matricula }));
  }

  userForm: FormGroup = new FormGroup({
    dropdown: new FormControl(),
  });

  onValueChange(event: unknown) {
    //Add your code
    console.log(event);
  }

  updateErrorState() {
    Object.keys(this.userForm.controls).forEach((field) => {
      const control = this.getFormControl(field);
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  getFormControl(name: string): FormControl {
    return this.userForm.get(name) as FormControl;
  }


  selectAlumno(alumno: any) {
    console.log(alumno);
    this.alumnoSeleccionado.emit(alumno);
  }

}
