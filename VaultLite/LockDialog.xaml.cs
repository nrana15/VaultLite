using System;
using System.Windows;

namespace VaultLite
{
    /// <summary>
    /// Password unlock dialog for encrypted vault.
    /// </summary>
    public partial class LockDialog : Window
    {
        private Func<string?, bool>? _passwordValidator;
        private Action? _onSuccess;
        private Action? _onCancel;

        public string? MasterPassword { get; private set; } = null;

        public LockDialog()
        {
            InitializeComponent();
            
            // Focus password field on load
            Loaded += (s, e) => txtPassword.Focus();
        }

        /// <summary>
        /// Sets validator callback to check password.
        /// </summary>
        public void SetValidation(Func<string?, bool> validator)
        {
            _passwordValidator = validator;
        }

        /// <summary>
        /// Sets success callback when correct password is entered.
        /// </summary>
        public void SetSuccessCallback(Action callback)
        {
            _onSuccess = callback;
        }

        /// <summary>
        /// Sets cancel callback when user closes dialog without unlocking.
        /// </summary>
        public void SetCancelCallback(Action callback)
        {
            _onCancel = callback;
        }

        private void OnPasswordKeyDown(object sender, System.Windows.Input.KeyEventArgs e)
        {
            if (e.Key == Key.Enter && !string.IsNullOrWhiteSpace(txtPassword.Password))
            {
                OnUnlockClicked(null, null);
            }
        }

        private void OnUnlockClicked(object sender, RoutedEventArgs e)
        {
            string password = txtPassword.Password;

            if (string.IsNullOrWhiteSpace(password))
            {
                ShowError("Please enter a password");
                return;
            }

            // Validate password
            if (_passwordValidator != null && !_passwordValidator(password))
            {
                ShowError("Incorrect password. Try again.");
                txtPassword.SelectAll();
                return;
            }

            MasterPassword = password;
            DialogResult = true;
            Close();
        }

        private void OnCancelClicked(object sender, RoutedEventArgs e)
        {
            if (_onCancel != null)
                _onCancel.Invoke();

            DialogResult = false;
            Close();
        }

        private void ShowError(string message)
        {
            lblError.Text = message;
            lblError.Visibility = Visibility.Visible;
        }
    }
}
