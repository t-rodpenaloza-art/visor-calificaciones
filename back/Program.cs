using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using BackDotnet.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddHttpClient("Canvas", client =>
        {
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        services.AddSingleton<ITokenStorageService, TokenStorageService>();
        services.AddSingleton<ICanvasOAuthService, CanvasOAuthService>();
        services.AddSingleton<ApiManagerService>();
    })
    .Build();

host.Run();