using System;
using System.Windows;
using System.Diagnostics;
using System.IO;

namespace VaultLite
{
    public partial class App : Application
    {
        public App()
        {
            // Set up unhandled exception handler
            this.DispatcherUnhandledException += OnDispatcherUnhandledException;
            
            var logPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.log");
            
            Console.WriteLine("VaultLite app initialized...");
            Console.WriteLine($"Base Directory: {AppDomain.CurrentDomain.BaseDirectory}");
            
            // Create a simple log file to capture output if console isn't visible
            try 
            {
                File.WriteAllText(logPath, $"App started at {DateTime.Now}\n");
            }
            catch { /* Ignore logging errors */ }
        }

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            
            // Prevent any network activity at runtime
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
            
            Console.WriteLine("App startup complete, loading MainWindow...");
            
            try 
            {
                var mainWindow = new MainWindow();
                
                if (mainWindow.IsInitialized)
                {
                    Console.WriteLine("MainWindow initialized successfully!");
                    mainWindow.Show();
                }
                else 
                {
                    Console.WriteLine("MainWindow failed to initialize");
                }
            }
            catch (Exception ex) 
            {
                Console.WriteLine($"Failed to create MainWindow: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }

        void OnDispatcherUnhandledException(object sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
        {
            var logPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.log");
            
            try 
            {
                File.AppendAllText(logPath, $"\nCRITICAL ERROR: {e.Exception.Message}\n");
                if (e.Exception.InnerException != null)
                    File.AppendAllText(logPath, $"Inner: {e.Exception.InnerException.Message}\n");
            }
            catch { /* Ignore logging errors */ }
            
            Console.WriteLine($"CRITICAL ERROR: {e.Exception.Message}");
            e.Handled = true; // Prevent default crash behavior
        }
        
        protected override void OnExit(ExitEventArgs e)
        {
            base.OnExit(e);
            var logPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.log");
            try 
            {
                File.AppendAllText(logPath, $"\nApp exiting at {DateTime.Now}\n");
            }
            catch { /* Ignore logging errors */ }
            
            Console.WriteLine("App exiting...");
        }
    }
}
