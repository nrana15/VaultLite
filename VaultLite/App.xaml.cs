using System;
using System.Windows;
using System.Diagnostics;

namespace VaultLite
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            
            // Prevent any network activity at runtime
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
            
            Console.WriteLine("VaultLite starting...");
            Console.WriteLine($"AppDomain: {AppDomain.CurrentDomain.BaseDirectory}");
        }
        
        protected override void OnExit(ExitEventArgs e)
        {
            base.OnExit(e);
            Console.WriteLine("VaultLite exiting...");
        }
        
        protected override void OnUnhandledException(System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
        {
            Console.WriteLine($"UNHANDLED EXCEPTION: {e.Exception.Message}");
            Console.WriteLine($"Stack trace: {e.Exception.StackTrace}");
            base.OnUnhandledException(e);
        }
    }
}
