import { Injectable } from '@angular/core';
import jsPDF, { jsPDFOptions } from "jspdf";
import autoTable from 'jspdf-autotable';

export interface AditionalData {
  courseName: string
}

@Injectable({
  providedIn: 'root'
})
export class HtmlcanvasService {

  imagen: any;

  constructor() {
    this.toDataURL('assets/img/wavy-line-longdash.png', (img:any) => {
      this.imagen = img;
    })
  }

  toDataURL(url:any, callback:any) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }


  printProfessorCourse(data:any, courseName:any, currentCourse:any) {

    let doc = new jsPDF('p', 'pt', 'a4')
    autoTable(doc,{
      margin: { top: 20, left: 20, right: 20, bottom: 20 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: '#007bff', halign: 'center' },
      head: [
        [{
          content: `${courseName}`,
          colSpan: 10, styles: { halign: 'left', fontSize: 12 }
        }],
        [{ content: '', colSpan: 2 }, { content: 'Calificaciones', colSpan: 4 }, { content: 'Faltas', colSpan: 4 }],
        ['Matricula', 'Alumnos', 'P1', 'P2', 'Promedio', 'Calificación Final', 'P1', 'P2', 'PF', 'Total']
      ],
      body: data,
      didDrawCell: (data:any) => {
        if (data.section === 'body' && [5, 2, 3].includes(data.column.index)) {
          // var img = td.getElementsByTagName('img')[0]; // need
          //var s = new XMLSerializer().serializeToString();
          if (data.cell.raw === '') {
            // console.log(data.cell)
            doc.addImage(this.imagen,'JPEG', data.cell.x + ((data.cell.width / 2) - (data.cell.contentWidth / 2)), data.cell.y + 5, 10, 10);
          }
        }
      },
      didParseCell: function (data:any) {
        if (data.section === 'body' && (data.column.index === 2 || data.column.index === 3 || data.column.index === 4 || data.column.index === 5)) {
          if (data.cell.raw >= 70) data.cell.styles.textColor = '#42a948'
          if (data.cell.raw < 70) data.cell.styles.textColor = '#d9534f'
          if (data.cell.raw === 'EF') data.cell.styles.textColor = '#d9534f'
        }

        if (data.section === 'body' && data.column.index === 9) {
          let alumno = currentCourse?.students?.filter((studnt:any) => studnt.login_id == data.row.raw[0])[0];
          
          if(alumno?.calificacionFaltas?.faltasAlumno == alumno?.calificacionFaltas?.limiteFaltas) {
            data.cell.styles.textColor = '#ffc700'
            data.cell.styles.fontStyle = 'bold'
          }
          if(alumno?.calificacionFaltas?.faltasAlumno > alumno?.calificacionFaltas?.limiteFaltas) {
            data.cell.styles.textColor = '#d9534f'
            data.cell.styles.fontStyle = 'bold'
          } 
        }
      },
      bodyStyles: { halign: "center" },
      columnStyles: { 0: { textColor: '#ff9900' } }
    });
    doc.setProperties({
      title: courseName
    });
    // console.log(URL.createObjectURL(doc.output("blob", { filename: 'hasdasd' })))
    //window.open(URL.createObjectURL(doc.output("blob", { filename: 'hasdasd' })))
    window.open(URL.createObjectURL(doc.output("blob")))
  }

  printTutoriaCourse(alumnoSeleccionado: any) {

    let data = alumnoSeleccionado.cursos.map((student:any) => {
      return [
        student.course_code,
        student.nombreCurso,
        student.calificaciones.calificacionPrimerParcial == '-' || student.calificaciones.calificacionPrimerParcial == null ? '' : student.calificaciones.calificacionPrimerParcial,
        student.calificaciones.calificacionSegundoParcial == '-' || student.calificaciones?.calificacionSegundoParcial == null ? '' : student.calificaciones?.calificacionSegundoParcial,
        student.calificaciones.promedioAcumulado = student?.calificaciones?.indicadorMateriaTutorias ? "" : student?.calificaciones?.promedioAcumulado,
        student.calificaciones.calificacionFinal == '-' ? '' : this.validateEF(student) == 'EF' ? 'EF' : student.calificaciones.calificacionFinal,
        student.faltas.faltasPrimerParcial,
        student.faltas.faltasSegundoParcial,
        student.faltas.faltasFinal,
        student.faltas.faltasAlumno,
      ]
    })
    let doc = new jsPDF('p', 'pt', 'a4');
    autoTable(doc,{
      theme: 'plain',
      margin: { top: 20, left: 20, right: 20, bottom: 20 },
      head: [
        ['Nombre/Matricula', 'Programa Academico', 'Semestre', 'Campus']
      ],
      body: [
        [
          alumnoSeleccionado.name ? alumnoSeleccionado.name + ' ' + alumnoSeleccionado?.login_id : '-',
          alumnoSeleccionado?.nombrePrograma?.attributes?.descripcionProgramaAcademico ?? '-',
          alumnoSeleccionado.semestre ?? '-',
          alumnoSeleccionado?.campus?.attributes?.descripcionCampus ?? '-',
        ]
      ]
    })

    autoTable(doc,{

      margin: { top: 20, left: 20, right: 20, bottom: 20 },
      startY: 70,
      rowPageBreak: 'auto',
      styles: { fontSize: 10 },
      headStyles: { fillColor: '#007bff', halign: 'center' },
      head: [
        [
          { content: '', colSpan: 2 }, { content: 'Calificaciones', colSpan: 4 }, { content: 'Faltas', colSpan: 4 },
        ],
        ['Matricula', 'Alumnos', 'P1', 'P2', 'Promedio', 'Calificación Final', 'P1', 'P2', 'PF', 'Total']
      ],
      body: data,
      didDrawCell: (data:any) => {
        if (data.section === 'body' && [5, 2, 3].includes(data.column.index)) {
          // var img = td.getElementsByTagName('img')[0]; // need
          //var s = new XMLSerializer().serializeToString();
          if (data.cell.raw === '') {
            doc.addImage(this.imagen,'JPEG', data.cell.x + ((data.cell.width / 2) - (data.cell.contentWidth / 2)), data.cell.y + 5, 10, 10);
          }
        }
      },
      didParseCell: function (data:any) {
        if (data.section === 'body' && (data.column.index === 2 || data.column.index === 3 || data.column.index === 4 || data.column.index === 5)) {
          if (data.cell.raw >= 70) data.cell.styles.textColor = '#42a948'
          if (data.cell.raw < 70) data.cell.styles.textColor = '#d9534f'
          if (data.cell.raw === 'EF') data.cell.styles.textColor = '#d9534f'
        }

        if (data.section === 'body' && data.column.index === 9) {
          let limit = alumnoSeleccionado?.cursos?.filter((curso:any) => curso.course_code == data.row.raw[0])[0];
          
          if(limit?.faltas?.faltasAlumno == limit?.limiteFaltasMock) {
            data.cell.styles.textColor = '#ffc700'
            data.cell.styles.fontStyle = 'bold'
          }
          if(limit?.faltas?.faltasAlumno > limit?.limiteFaltasMock) {
            data.cell.styles.textColor = '#d9534f'
            data.cell.styles.fontStyle = 'bold'
          } 
        }
      },
      bodyStyles: { halign: "center" },
      columnStyles: { 0: { textColor: '#ff9900' }, 1: { halign: 'left' } },
    });

    window.open(URL.createObjectURL(doc.output("blob")))
  }

  validateEF(curso:any) {

    if (!curso.faltas.faltasAlumno) return '-';

    if (curso.faltas.faltasAlumno === '-') {
      return '-'
    }

    if (curso.calificaciones.calificacionFinal === '-' && curso.faltas.error) {
      return '-'
    }

    if (curso.limiteFaltasMock > curso.faltas.faltasAlumno && curso.calificaciones?.promedioAcumulado >= 83) {
      return '-'

    } else if (curso.limiteFaltasMock == curso.faltas.faltasAlumno) {
      return '-'
    } else if (curso.limiteFaltasMock < curso.faltas.faltasAlumno && curso.calificaciones?.promedioAcumulado < 83) {
      return 'EF'
    }

    if (curso.limiteFaltasMock < curso.faltas.faltasAlumno) {
      return '-'
    }

    return '-';
  }
}
