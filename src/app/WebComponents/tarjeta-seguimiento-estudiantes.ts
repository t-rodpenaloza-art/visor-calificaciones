import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { NgZone } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { AppComponent } from '../app.component';
import { TarjetaSeguimientoComponent } from '../components/tarjeta-seguimiento/tarjeta-seguimiento.component';
import { SeguimientoComponent } from '../sections/seguimiento/seguimiento.component';

// Crear la aplicación Angular específica para el FormularioComponent
(async () => {
    const appRef = await createApplication({
        providers: [
            provideRouter(routes),
            /* your global providers here */
            (globalThis as any)?.ngZone ? { provide: NgZone, useValue: (globalThis as any).ngZone } : [],
        ],
    });

    // Crear el custom element del FormularioComponent
    const cardBuscador = createCustomElement(TarjetaSeguimientoComponent, {
        injector: appRef.injector
    });


    const seccionBuscador = createCustomElement(SeguimientoComponent, {
        injector: appRef.injector
    });

    // Registrar el custom element con un nombre único
    customElements.define('tarjeta-buscador', cardBuscador);
    customElements.define('seccion-buscador', seccionBuscador);

})();

// Exportar el componente para uso en Native Federation
export { AppComponent };
