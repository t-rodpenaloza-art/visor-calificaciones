export interface ICalificacion {

    numeroReferenciaCurso: string;
    calificacionPrimerParcial: string;
    calificacionSegundoParcial: string;
    promedioAcumulado: string;
    calificacionFinal: string;

}

export class Calificacion {



    constructor(
        public numeroReferenciaCurso: string = '-',
        public calificacionPrimerParcial: string = '-',
        public calificacionSegundoParcial: string = '-',
        public promedioAcumulado: string = '-',
        public calificacionFinal: string = '-',
    ) {

    }

}