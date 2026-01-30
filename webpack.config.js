const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'seguimiento-estudiantes',

  exposes: {
    './Component': './src/app/app.component.ts',
    './TarjetaSeguimiento': './src/app/WebComponents/tarjeta-seguimiento-estudiantes.ts',
    './TarjetaSeguimientoBusqueda': './src/app/WebComponents/tarjeta-seguimiento-estudiantes-busqueda.ts',
  },

  shared: {
    ...shareAll({ singleton: false, strictVersion: false, requiredVersion: 'auto' }),
  },

  skip: [
    "rxjs/ajax",
    "rxjs/fetch",
    "rxjs/testing",
    "rxjs/webSocket",
    /^@module-federation/,
    "@ti-tecnologico-de-monterrey-oficial/ds-ng",
    // Add further packages you don't need at runtime
  ],

});
