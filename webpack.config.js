const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'seguimiento-estudiantes',

  exposes: {
    "./Component": "./src/app/app.component.ts",
    "./TarjetaSeguimiento": "./src/app/WebComponents/tarjeta-seguimiento-estudiantes.ts",
  },

  shared: {
    ...shareAll({ singleton: false, strictVersion: false, requiredVersion: 'auto' }),
    "@material-symbols/svg-400": {
      singleton: true,
      strictVersion: false,
      requiredVersion: "auto",
    },
  },


});
