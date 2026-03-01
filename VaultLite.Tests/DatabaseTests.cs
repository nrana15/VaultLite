using System;
using System.IO;
using System.Linq;
using VaultLite.Data;
using VaultLite.Models;
using Xunit;

namespace VaultLite.Tests
{
    public class DatabaseTests : IDisposable
    {
        private readonly string _testDbPath;
        private readonly Database _db;

        public DatabaseTests()
        {
            _testDbPath = Path.Combine(Path.GetTempPath(), $"vaultlite_test_{Guid.NewGuid()}");
            Directory.CreateDirectory(_testDbPath);
            _db = new Database(_testDbPath);
        }

        [Fact]
        public void SaveNote_CreatesNewNote()
        {
            // Arrange
            var note = new Note
            {
                Title = "Test Note",
                Content = "This is a test",
                Tags = new[] { "test", "unit" },
                IsPinned = false,
                IsArchived = false
            };

            // Act
            _db.SaveNote(note);

            // Assert
            Assert.True(note.Id > 0);
            var savedNotes = _db.GetAllNotes();
            Assert.Single(savedNotes);
        }

        [Fact]
        public void UpdateNote_ModifiesExistingNote()
        {
            // Arrange
            var note = new Note { Title = "Original", Content = "Content" };
            _db.SaveNote(note);

            // Act
            note.Title = "Updated";
            note.Content = "New content";
            _db.SaveNote(note);

            // Assert
            var savedNotes = _db.GetAllNotes();
            Assert.Single(savedNotes);
            Assert.Equal("Updated", savedNotes[0].Title);
        }

        [Fact]
        public void DeleteNote_RemovesFromDatabase()
        {
            // Arrange
            var note = new Note { Title = "To Delete" };
            _db.SaveNote(note);

            // Act
            _db.DeleteNote(note.Id);

            // Assert
            var savedNotes = _db.GetAllNotes();
            Assert.Empty(savedNotes);
        }

        [Fact]
        public void SearchNotes_FindsMatchingContent()
        {
            // Arrange
            _db.SaveNote(new Note { Title = "Important", Content = "Secret information" });
            _db.SaveNote(new Note { Title = "Meeting Notes", Content = "Team sync at 3pm" });

            // Act
            var results = _db.SearchNotes("secret");

            // Assert
            Assert.Single(results);
            Assert.Equal("Important", results[0].Title);
        }

        [Fact]
        public void GetNotesByTag_ReturnsFilteredNotes()
        {
            // Arrange
            var note1 = new Note 
            { 
                Title = "Tagged Note 1", 
                Tags = new[] { "work", "urgent" } 
            };
            var note2 = new Note 
            { 
                Title = "Tagged Note 2", 
                Tags = new[] { "personal" } 
            };
            _db.SaveNote(note1);
            _db.SaveNote(note2);

            // Act
            var results = _db.GetNotesByTag("work");

            // Assert
            Assert.Single(results);
            Assert.Equal("Tagged Note 1", results[0].Title);
        }

        [Fact]
        public void GetAllNotes_ReturnsAllUnarchived()
        {
            // Arrange
            _db.SaveNote(new Note { Title = "Active" });
            var archived = new Note { Title = "Archived", IsArchived = true };
            _db.SaveNote(archived);

            // Act
            var activeNotes = _db.GetAllNotes();

            // Assert
            Assert.Single(activeNotes);
        }

        public void Dispose()
        {
            try
            {
                if (Directory.Exists(_testDbPath))
                    Directory.Delete(_testDbPath, true);
            }
            catch { /* Ignore cleanup errors */ }
        }
    }
}
