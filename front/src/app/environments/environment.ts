// environment.ts (local)
export const environment = {
  production: false,
  backendUrl: 'http://localhost:7071/api',
  cursos: {
    canvas: 'https://tecdemonterrey.test.instructure.com',
    canvas_azure: 'https://canvastec-pprd.azurewebsites.net'  // backend viejo
  },
  apiManager: {
    baseurl: 'https://apigateway-qa.tec.mx'
  }
};

//// environment.prod.ts (producción)
//export const environment = {
//  production: true,
//  backendUrl: 'https://visor.azurewebsites.net/api',
//  cursos: {
//    canvas: 'https://tecdemonterrey.test.instructure.com',
//    canvas_azure: 'https://canvastec-pprd.azurewebsites.net'
//  },
//  apiManager: {
//    baseurl: 'https://apigateway-qa.tec.mx'
//  }
//};
