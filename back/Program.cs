using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using BackDotnet.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        // HttpClient para comunicación con Canvas API
        services.AddHttpClient("Canvas", client =>
        {
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        // Servicios de la aplicación
        services.AddSingleton<ITokenStorageService, TokenStorageService>();
        services.AddSingleton<ICanvasOAuthService, CanvasOAuthService>();
    })
    .Build();

host.Run();