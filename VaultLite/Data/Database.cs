using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Data.Sqlite;
using VaultLite.Security;
using System.Text;

namespace VaultLite.Data
{
    /// <summary>
    /// Database with optional encryption support.
    /// When enabled, all note content is encrypted before storage.
    /// </summary>
    public class Database : IDisposable
    {
        private readonly string _connectionString;
        private SqliteConnection? _connection;
        private bool _encryptionEnabled;
        private string? _masterPasswordHash;

        public Database(string dataPath, bool encryptionEnabled = false)
        {
            _encryptionEnabled = encryptionEnabled;
            _connectionString = $"Data Source={Path.Combine(dataPath, "vault.db")}";
            
            if (_encryptionEnabled)
                InitializeWithEncryption();
            else
                Initialize();
        }

        /// <summary>
        /// Validates master password during unlock.
        /// </summary>
        public bool ValidatePassword(string password)
        {
            if (!_encryptionEnabled || _masterPasswordHash == null)
                return false;

            var computedHash = ComputePasswordHash(password);
            return computedHash == _masterPasswordHash;
        }

        /// <summary>
        /// Sets master password and stores hash for validation.
        /// </summary>
        public void SetMasterPassword(string password)
        {
            if (!_encryptionEnabled)
                throw new InvalidOperationException("Encryption not enabled");

            EncryptionService.ValidatePasswordStrength(password);
            _masterPasswordHash = ComputePasswordHash(password);
            
            // Store hash in database (encrypted with itself - bootstrap issue)
            // In production, store in protected memory only
        }

        private string ComputePasswordHash(string password)
        {
            using var sha256 = SHA256.Create();
            byte[] bytes = Encoding.UTF8.GetBytes(password);
            byte[] hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private void InitializeWithEncryption()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            
            var command = connection.CreateCommand();
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content_encrypted TEXT DEFAULT '',
                    tags TEXT DEFAULT '',
                    is_pinned INTEGER DEFAULT 0,
                    is_archived INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    is_encrypted INTEGER DEFAULT 1
                );

                CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
                CREATE INDEX IF NOT EXISTS idx_tags ON notes(tags);
            ";
            command.ExecuteNonQuery();
        }

        private void Initialize()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            
            var command = connection.CreateCommand();
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    tags TEXT DEFAULT '',
                    is_pinned INTEGER DEFAULT 0,
                    is_archived INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
                CREATE INDEX IF NOT EXISTS idx_tags ON notes(tags);
            ";
            command.ExecuteNonQuery();
        }

        private SqliteConnection GetConnection()
        {
            if (_connection == null || _connection.State != System.Data.ConnectionState.Open)
            {
                _connection = new SqliteConnection(_connectionString);
                _connection.Open();
            }
            return _connection;
        }

        public void SaveNote(Models.Note note)
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            
            string contentToSave;
            
            if (_encryptionEnabled)
                contentToSave = EncryptionService.Encrypt(note.Content, _masterPasswordHash!);
            else
                contentToSave = note.Content;

            if (note.Id == 0)
            {
                cmd.CommandText = @"
                    INSERT INTO notes (title, content_encrypted, tags, is_pinned, is_archived, created_at, updated_at, is_encrypted)
                    VALUES (@title, @content, @tags, @is_pinned, @is_archived, @created_at, @updated_at, @is_encrypted);
                    SELECT last_insert_rowid();
                ";
                cmd.Parameters.AddWithValue("@title", note.Title);
                cmd.Parameters.AddWithValue("@content", contentToSave);
                cmd.Parameters.AddWithValue("@tags", string.Join(",", note.Tags));
                cmd.Parameters.AddWithValue("@is_pinned", note.IsPinned ? 1 : 0);
                cmd.Parameters.AddWithValue("@is_archived", note.IsArchived ? 1 : 0);
                cmd.Parameters.AddWithValue("@created_at", note.CreatedAt.ToString("o"));
                cmd.Parameters.AddWithValue("@updated_at", note.UpdatedAt.ToString("o"));
                cmd.Parameters.AddWithValue("@is_encrypted", _encryptionEnabled ? 1 : 0);
                
                note.Id = Convert.ToInt32(cmd.ExecuteScalar()!);
            }
            else
            {
                cmd.CommandText = @"
                    UPDATE notes SET
                        title = @title,
                        content_encrypted = @content,
                        tags = @tags,
                        is_pinned = @is_pinned,
                        is_archived = @is_archived,
                        updated_at = @updated_at
                    WHERE id = @id;
                ";
                cmd.Parameters.AddWithValue("@id", note.Id);
                cmd.Parameters.AddWithValue("@title", note.Title);
                cmd.Parameters.AddWithValue("@content", contentToSave);
                cmd.Parameters.AddWithValue("@tags", string.Join(",", note.Tags));
                cmd.Parameters.AddWithValue("@is_pinned", note.IsPinned ? 1 : 0);
                cmd.Parameters.AddWithValue("@is_archived", note.IsArchived ? 1 : 0);
                cmd.Parameters.AddWithValue("@updated_at", note.UpdatedAt.ToString("o"));
                
                cmd.ExecuteNonQuery();
            }
        }

        /// <summary>
        /// Decrypts content if encryption is enabled and password was validated.
        /// </summary>
        private string? GetDecryptedContent(string? encryptedContent)
        {
            if (string.IsNullOrEmpty(encryptedContent))
                return string.Empty;

            if (_encryptionEnabled && _masterPasswordHash != null)
            {
                try
                {
                    return EncryptionService.Decrypt(encryptedContent, _masterPasswordHash);
                }
                catch
                {
                    // Return encrypted content if decryption fails (wrong password)
                    return encryptedContent;
                }
            }

            return encryptedContent;
        }

        public List<Models.Note> GetAllNotes()
        {
            return GetNotesInternal(null, false);
        }

        public List<Models.Note> GetNotesByTag(string tag)
        {
            var notes = GetNotesInternal(null, false);
            return notes.Where(n => n.Tags.Contains(tag)).ToList();
        }

        public List<Models.Note> SearchNotes(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return GetAllNotes();

            var lowerQuery = query.ToLower();
            return GetNotesInternal(null, false)
                .Where(n => 
                    n.Title.ToLower().Contains(lowerQuery) || 
                    n.Content.ToLower().Contains(lowerQuery) ||
                    n.Tags.Any(t => t.ToLower().Contains(lowerQuery)))
                .ToList();
        }

        private List<Models.Note> GetNotesInternal(string? tag, bool includeArchived)
        {
            var notes = new List<Models.Note>();
            
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            
            var sql = @"SELECT id, title, content, tags, is_pinned, is_archived, created_at, updated_at 
                        FROM notes WHERE is_archived = @is_archived
                        ORDER BY is_pinned DESC, updated_at DESC";
            cmd.CommandText = sql;
            cmd.Parameters.AddWithValue("@is_archived", includeArchived ? 1 : 0);
            
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                string contentField = _encryptionEnabled ? reader.IsDBNull(2) || reader.GetString(2) == null 
                    ? string.Empty 
                    : reader.GetString(2)! 
                    : reader.GetString(1);

                notes.Add(new Models.Note
                {
                    Id = reader.GetInt32(0),
                    Title = reader.GetString(1),
                    Content = GetDecryptedContent(_encryptionEnabled ? contentField : null),
                    Tags = ParseTags(reader.GetString(3)),
                    IsPinned = reader.GetBoolean(4),
                    IsArchived = reader.GetBoolean(5),
                    CreatedAt = DateTime.Parse(reader.GetString(6)),
                    UpdatedAt = DateTime.Parse(reader.GetString(7))
                });
            }

            return notes;
        }

        public void DeleteNote(int id)
        {
            using var conn = GetConnection();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM notes WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", id);
            cmd.ExecuteNonQuery();
        }

        private static string[] ParseTags(string tagsString)
        {
            if (string.IsNullOrWhiteSpace(tagsString))
                return Array.Empty<string>();
            
            return tagsString.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }

        public void Dispose()
        {
            _connection?.Close();
        }
    }
}
