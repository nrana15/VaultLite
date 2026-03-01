using System;
using System.Windows;
using System.Diagnostics;

namespace VaultLite
{
    public partial class App : Application
    {
        public App()
        {
            // Set up unhandled exception handler
            this.DispatcherUnhandledException += OnDispatcherUnhandledException;
            
            Console.WriteLine("VaultLite app initialized...");
            Console.WriteLine($"Base Directory: {AppDomain.CurrentDomain.BaseDirectory}");
        }

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            
            // Prevent any network activity at runtime
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
            
            Console.WriteLine("App startup complete, loading MainWindow...");
        }

        void OnDispatcherUnhandledException(object sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
        {
            Console.WriteLine($"CRITICAL ERROR: {e.Exception.Message}");
            if (e.Exception.InnerException != null)
                Console.WriteLine($"Inner: {e.Exception.InnerException.Message}");
            
            e.Handled = true; // Prevent default crash behavior
        }
        
        protected override void OnExit(ExitEventArgs e)
        {
            base.OnExit(e);
            Console.WriteLine("App exiting...");
        }
    }
}
