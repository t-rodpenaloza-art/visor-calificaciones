import { Calificacion } from "./calificacion";

export interface BodySubcuentas {
    path: string,
    method: string,
    audiencia?: string,
    token?: string
}

export interface Cursos {
    id:                                   number;
    root_account_id:                      number;
    account_id:                           number;
    name:                                 string;
    grading_standard_id:                  null;
    enrollment_term_id:                   number;
    uuid:                                 string;
    start_at:                             Date;
    is_public:                            boolean;
    created_at:                           Date;
    course_code:                          any;
    default_view:                         string;
    license:                              string;
    grade_passback_setting:               null;
    end_at:                               null;
    public_syllabus:                      boolean;
    public_syllabus_to_auth:              boolean;
    storage_quota_mb:                     number;
    is_public_to_auth_users:              boolean;
    homeroom_course:                      boolean;
    course_color:                         null;
    friendly_name:                        null;
    term:                                 Term;
    apply_assignment_group_weights:       boolean;
    total_students:                       number;
    teachers:                             Teacher[];
    locale:                               string;
    calendar:                             Calendar;
    time_zone:                            string;
    concluded:                            boolean;
    blueprint:                            boolean;
    template:                             boolean;
    sis_course_id:                        any;
    integration_id:                       string;
    enrollments:                          Enrollment[];
    hide_final_grades:                    boolean;
    workflow_state:                       string;
    restrict_enrollments_to_course_dates: boolean;
    overridden_course_visibility:         string;
    assingmentTotal:                      number;
    usuarios:                             Usuarios[];
}

export interface Calendar {
    ics: string;
}

export interface Enrollment {
    type:                               string;
    role:                               string;
    role_id:                            number;
    user_id:                            number;
    enrollment_state:                   string;
    limit_privileges_to_course_section: boolean;
}

export interface Teacher {
    id:               number;
    display_name:     string;
    avatar_image_url: string;
    html_url:         string;
    pronouns:         null;
}

export interface Term {
    id:                      number;
    name:                    string;
    start_at:                null;
    end_at:                  null;
    created_at:              Date;
    workflow_state:          string;
    grading_period_group_id: null;
}

export interface Usuarios {
    id:             number;
    name:           string;
    created_at:     Date;
    sortable_name:  string;
    short_name:     string;
    sis_user_id:    string;
    integration_id: string;
    sis_import_id:  number;
    login_id:       string;
    calificacion: Calificacion;
    falta: Falta;
}

export interface Falta {

    numeroReferenciaCurso: string;
    limiteFaltas: number | string;
    faltasAlumno: number | string;
    faltasPrimerParcial: number | string;
    faltasSegundoParcial: number | string;
    faltasTercerParcial: number | string;
    faltasFinal: number | string;
    faltasCursosFIT: number | string;
    error: boolean;

}