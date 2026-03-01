using System.Windows;

namespace VaultLite
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            
            // Prevent any network activity at runtime
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
        }
        
        protected override void OnExit(ExitEventArgs e)
        {
            base.OnExit(e);
        }
    }
}
