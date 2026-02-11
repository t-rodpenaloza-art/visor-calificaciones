export class CoursesByStudent {
    id: string = "";
    name: string = "";
    course_code: string = "";
    term: Term = new Term();
    sis_course_id: string = "";
}

class Term {
    id: number = 0;
    name: string = "";
    sis_term_id: string = "";
}