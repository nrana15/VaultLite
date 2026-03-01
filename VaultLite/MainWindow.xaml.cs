using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using VaultLite.Data;
using VaultLite.Models;

namespace VaultLite
{
    public partial class MainWindow : Window
    {
        private readonly Database _db;
        private List<Note> _allNotes = new();
        private List<Note> _currentNotes = new();
        private Note? _selectedNote;
        private string? _activeTag;

        public MainWindow()
        {
            try 
            {
                Console.WriteLine("MainWindow constructor starting...");
                
                InitializeComponent();
                
                // Wire up button click events
                btnNewNote.Click += OnNewNoteClick;
                btnPin.Click += OnPinClicked;
                btnArchive.Click += OnArchiveClicked;
                btnDelete.Click += OnDeleteClicked;
                
                Console.WriteLine("Component initialization complete");
                
                // Set data directory relative to executable
                var appPath = AppDomain.CurrentDomain.BaseDirectory;
                Console.WriteLine($"App path: {appPath}");
                
                var dataPath = Path.Combine(appPath, "data");
                var dbPath = Path.Combine(dataPath, "vault.db");

                if (!Directory.Exists(dataPath))
                    Directory.CreateDirectory(dataPath);
                    
                Console.WriteLine($"Data directory ready at: {dataPath}");

                // Check for encrypted database
                bool encryptionEnabled = false;
                
                try
                {
                    using var conn = new Microsoft.Data.Sqlite.SqliteConnection($"Data Source={dbPath}");
                    conn.Open();
                    
                    var cmd = conn.CreateCommand();
                    cmd.CommandText = "SELECT COUNT(*) FROM notes WHERE is_encrypted = 1 LIMIT 1";
                    var result = cmd.ExecuteScalar();
                    
                    if (result != null && Convert.ToInt32(result) > 0)
                        encryptionEnabled = true;
                        
                    Console.WriteLine($"Encryption enabled: {encryptionEnabled}");
                }
                catch (Exception ex) 
                {
                    Console.WriteLine($"DB check exception (normal): {ex.Message}");
                }

                _db = new Database(dataPath, encryptionEnabled);
                Console.WriteLine("Database initialized");

                // If encryption is enabled and database exists, show lock dialog
                if (encryptionEnabled && File.Exists(dbPath))
                {
                    var lockDialog = new LockDialog();
                    
                    lockDialog.SetValidation(_db.ValidatePassword);
                    lockDialog.SetSuccessCallback(() => OnUnlockSuccessful());
                    lockDialog.SetCancelCallback(() => CloseVault());

                    // Show modal dialog
                    bool? result = lockDialog.ShowDialog();
                    
                    if (result != true)
                        return; // User cancelled, don't show main window
                        
                    Console.WriteLine("Password validated successfully");
                }
                
                Console.WriteLine("Showing main window...");
                this.Show();
            }
            catch (Exception ex) 
            {
                Console.WriteLine($"FATAL ERROR in MainWindow: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }

        private void OnUnlockSuccessful()
        {
            // Password validated successfully - extract from lock dialog
            if (Application.Current.MainWindow is LockDialog lockDlg)
                _db.SetMasterPassword(lockDlg.MasterPassword);
        }

        private void CloseVault()
        {
            Application.Current.Shutdown();
        }

        private void RefreshNotes()
        {
            _allNotes = _activeTag != null 
                ? _db.GetNotesByTag(_activeTag)
                : _db.GetAllNotes().Where(n => !n.IsArchived).ToList();

            string? searchQuery = txtSearch.Text.Length > 0 ? txtSearch.Text : null;
            
            if (searchQuery != null && searchQuery.Length > 0)
            {
                _currentNotes = _db.SearchNotes(searchQuery);
            }
            else
            {
                _currentNotes = _allNotes;
            }

            lstNotes.ItemsSource = null;
            lstNotes.ItemsSource = _currentNotes;
            
            // Clear selection if not found
            if (_selectedNote == null || !_currentNotes.Contains(_selectedNote))
            {
                _selectedNote = _currentNotes.Count > 0 ? _currentNotes[0] : null;
            }
            
            UpdateEditor();
        }

        private void UpdateTagsList()
        {
            var tags = new HashSet<string>();
            foreach (var note in _db.GetAllNotes())
            {
                foreach (var tag in note.Tags)
                    tags.Add(tag);
            }
            
            lstTags.ItemsSource = null;
            lstTags.ItemsSource = tags.OrderByDescending(t => t).ToList();
        }

        private void UpdateEditor()
        {
            if (_selectedNote == null)
            {
                txtNoteTitle.Text = "";
                txtNoteContent.Text = "";
                lblTagsWatermark.Visibility = Visibility.Visible;
                return;
            }

            txtNoteTitle.Text = _selectedNote.Title;
            txtNoteContent.Text = _selectedNote.Content;
            
            btnPin.Content = _selectedNote.IsPinned ? "Unpin" : "Pin";
            btnArchive.Content = _selectedNote.IsArchived ? "Restore" : "Archive";
        }

        private void SaveCurrentNote()
        {
            if (_selectedNote == null) return;

            var tagsText = txtTagsInput.Text.Trim();
            _selectedNote.Title = txtNoteTitle.Text;
            _selectedNote.Content = txtNoteContent.Text;
            
            if (!string.IsNullOrEmpty(tagsText))
                _selectedNote.Tags = tagsText.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            else
                _selectedNote.Tags = Array.Empty<string>();

            _selectedNote.UpdatedAt = DateTime.Now;
            
            _db.SaveNote(_selectedNote);
            RefreshNotes();
        }

        // Event Handlers
        
        private void OnNewNoteClick(object sender, RoutedEventArgs e)
        {
            _selectedNote = new Note 
            { 
                Title = "Untitled", 
                Content = "", 
                Tags = Array.Empty<string>(),
                IsPinned = false,
                IsArchived = false,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _db.SaveNote(_selectedNote);
            
            if (_activeTag != null && !_selectedNote.Tags.Contains(_activeTag))
            {
                var newTags = _selectedNote.Tags.Concat(new[] { _activeTag }).ToArray();
                _selectedNote.Tags = newTags;
                _db.SaveNote(_selectedNote);
            }

            RefreshNotes();
            
            txtNoteTitle.Focus();
            SelectAll(txtNoteTitle);
        }

        private void OnPinClicked(object sender, RoutedEventArgs e)
        {
            if (_selectedNote == null) return;

            var currentStatus = btnPin.Content.ToString()!;
            _selectedNote.IsPinned = currentStatus != "Unpin";
            
            SaveCurrentNote();
        }

        private void OnArchiveClicked(object sender, RoutedEventArgs e)
        {
            if (_selectedNote == null) return;

            var isArchived = btnArchive.Content.ToString()!.Contains("Restore");
            
            _selectedNote.IsArchived = !isArchived;
            SaveCurrentNote();
        }

        private void OnDeleteClicked(object sender, RoutedEventArgs e)
        {
            if (_selectedNote == null) return;

            var result = MessageBox.Show(
                $"Are you sure you want to delete \"{_selectedNote.Title}\"?",
                "Confirm Delete",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                _db.DeleteNote(_selectedNote.Id);
                
                _selectedNote = null;
                RefreshNotes();
            }
        }

        private void OnTagsKeyDown(object sender, KeyEventArgs e)
        {
            // Hide watermark when user starts typing (any key except Enter/Esc)
            if (e.Key != Key.Enter && e.Key != Key.Escape)
            {
                lblTagsWatermark.Visibility = Visibility.Collapsed;
            }

            // Save tags on Enter key
            if (e.Key == Key.Enter && _selectedNote != null)
            {
                SaveCurrentNote();
            }
        }

        private void OnNoteTitleKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
                txtNoteContent.Focus();
            
            if (_selectedNote != null && !string.IsNullOrEmpty(txtNoteTitle.Text))
            {
                _selectedNote.Title = txtNoteTitle.Text;
                RefreshNotes();
            }
        }

        private void OnNoteTextChanged(object sender, RoutedEventArgs e)
        {
            // Auto-save on content change with debounce
            if (_selectedNote != null && txtNoteContent.Text != _selectedNote.Content)
            {
                System.Threading.Thread.Sleep(300); // Debounce
                SaveCurrentNote();
            }
            
            // Show/hide watermark when typing in tags field
            lblTagsWatermark.Visibility = string.IsNullOrEmpty(txtTagsInput.Text) 
                ? Visibility.Visible 
                : Visibility.Collapsed;
        }

        private void OnSearchKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
                RefreshNotes();
        }

        private void OnNoteSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (lstNotes.SelectedItem is Note note && note != _selectedNote)
            {
                // Save current note before switching
                if (_selectedNote != null)
                    _db.SaveNote(_selectedNote);

                _selectedNote = note;
                UpdateEditor();
            }
        }

        private void OnTagSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (lstTags.SelectedItem is string tag)
            {
                _activeTag = tag;
                RefreshNotes();
            }
        }

        private static void SelectAll(TextBox box)
        {
            box?.SelectAll();
        }

        protected override void OnClosing(System.ComponentModel.CancelEventArgs e)
        {
            base.OnClosing(e);
            
            // Save current note before closing
            if (_selectedNote != null)
                _db.SaveNote(_selectedNote);

            _db.Dispose();
        }
    }
}
