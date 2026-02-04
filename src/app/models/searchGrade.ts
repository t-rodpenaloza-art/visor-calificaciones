import { Cursos } from "./canvas.model";
import { CoursesByStudent } from "./coursesByStudent";
import { InfoStudent } from "./infoStudent";

export class SearchGrade {
    type:string = "";
    course: CoursesByStudent = new CoursesByStudent;
    student: InfoStudent = new InfoStudent;
    courses: Cursos[] = [];
}