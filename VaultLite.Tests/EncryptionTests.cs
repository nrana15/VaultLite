using System;
using VaultLite.Security;
using Xunit;

namespace VaultLite.Tests
{
    public class EncryptionServiceTests
    {
        [Fact]
        public void EncryptAndDecrypt_ReturnsOriginalText()
        {
            // Arrange
            string original = "This is a secret note content that should be encrypted";
            string password = "SecurePass123!";

            // Act
            string encrypted = EncryptionService.Encrypt(original, password);
            string decrypted = EncryptionService.Decrypt(encrypted, password);

            // Assert
            Assert.Equal(original, decrypted);
        }

        [Fact]
        public void DecryptWithWrongPassword_ThrowsOrReturnsGarbage()
        {
            // Arrange
            string original = "Secret data";
            string correctPassword = "CorrectPass123!";
            string wrongPassword = "WrongPass456!";

            // Act
            string encrypted = EncryptionService.Encrypt(original, correctPassword);
            
            // Should throw exception or return invalid content
            var exception = Record.Exception(() => 
                EncryptionService.Decrypt(encrypted, wrongPassword));

            // Assert - either throws or returns something not equal to original
            Assert.NotNull(exception);
        }

        [Fact]
        public void EncryptEmptyString_ReturnsEmpty()
        {
            // Arrange
            string empty = "";
            string password = "TestPass1!";

            // Act
            string encrypted = EncryptionService.Encrypt(empty, password);

            // Assert
            Assert.Equal("", encrypted);
        }

        [Fact]
        public void ValidatePasswordStrength_ThrowsForShortPassword()
        {
            // Arrange
            string shortPassword = "short";

            // Act & Assert
            var exception = Record.Exception(() => 
                EncryptionService.ValidatePasswordStrength(shortPassword));

            Assert.NotNull(exception);
            Assert.IsType<ArgumentException>(exception);
        }

        [Fact]
        public void ValidatePasswordStrength_AllowsComplexPassword()
        {
            // Arrange
            string validPassword = "ComplexPass123!";

            // Act & Assert
            var result = EncryptionService.ValidatePasswordStrength(validPassword);
            
            Assert.True(result);
        }

        [Fact]
        public void ValidatePasswordStrength_RejectsMissingRequirements()
        {
            // Arrange - only lowercase letters, no uppercase/digit/special
            string weakPassword = "onlylowercase";

            // Act & Assert
            var result = EncryptionService.ValidatePasswordStrength(weakPassword);
            
            // Should return false (less than 3 of 4 requirements)
            Assert.False(result);
        }

        [Fact]
        public void RoundTripMultipleTimes_ProducesSameResult()
        {
            // Arrange
            string original = "Test content for multiple rounds";
            string password = "RoundTrip123!";

            // Act - encrypt and decrypt twice
            string encrypted1 = EncryptionService.Encrypt(original, password);
            string decrypted1 = EncryptionService.Decrypt(encrypted1, password);
            
            string encrypted2 = EncryptionService.Encrypt(decrypted1, password);
            string decrypted2 = EncryptionService.Decrypt(encrypted2, password);

            // Assert
            Assert.Equal(original, decrypted1);
            Assert.Equal(original, decrypted2);
        }

        [Fact]
        public void EncryptDifferentPasswords_ProducesDifferentCiphertext()
        {
            // Arrange
            string original = "Same content";
            
            // Act
            string encryptedA = EncryptionService.Encrypt(original, "Password1!");
            string encryptedB = EncryptionService.Encrypt(original, "Password2!");

            // Assert - should be different even for same input
            Assert.NotEqual(encryptedA, encryptedB);
        }

        [Fact]
        public void DecryptUnicodeCharacters_HandlesSpecialChars()
        {
            // Arrange
            string unicodeText = "你好世界! Привет мир! 🎉";
            string password = "Unicode123!";

            // Act
            string encrypted = EncryptionService.Encrypt(unicodeText, password);
            string decrypted = EncryptionService.Decrypt(encrypted, password);

            // Assert
            Assert.Equal(unicodeText, decrypted);
        }

        [Fact]
        public void EncryptLargeContent_HandlesLongText()
        {
            // Arrange
            string longText = new string('A', 10000) + "\n\n" + "B".PadRight(5000);
            string password = "LargeContent1!";

            // Act
            string encrypted = EncryptionService.Encrypt(longText, password);
            string decrypted = EncryptionService.Decrypt(encrypted, password);

            // Assert
            Assert.Equal(longText.Length, decrypted.Length);
            Assert.Equal(longText, decrypted);
        }
    }
}
