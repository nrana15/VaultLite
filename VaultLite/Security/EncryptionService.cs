using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace VaultLite.Security
{
    /// <summary>
    /// AES-256 encryption service for protecting note content.
    /// All encryption is local-only, no keys stored on disk.
    /// </summary>
    public static class EncryptionService
    {
        private const int KeySize = 256; // bits
        private const int BlockSize = 128; // bits
        private const int SaltSize = 16; // bytes (128 bits)
        private const int Iterations = 10000;

        /// <summary>
        /// Encrypts plaintext using password-derived key.
        /// Returns base64-encoded ciphertext with salt prepended.
        /// </summary>
        public static string Encrypt(string plainText, string password)
        {
            if (string.IsNullOrWhiteSpace(plainText))
                return string.Empty;

            byte[] salt = new byte[SaltSize];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(salt);

            using var deriveBytes = new Rfc2898DeriveBytes(password, salt, Iterations);
            byte[] key = deriveBytes.GetBytes(KeySize / 8);
            byte[] iv = deriveBytes.GetBytes(BlockSize / 8);

            byte[] encrypted;
            using (var ms = new MemoryStream())
            {
                using var cs = new CryptoStream(ms, CreateEncryptor(key, iv), CryptoStreamMode.Write);
                byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
                cs.Write(plainBytes, 0, plainBytes.Length);
                cs.FlushFinalBlock();

                // Prepend salt to ciphertext
                encrypted = new byte[salt.Length + ms.Length];
                Buffer.BlockCopy(salt, 0, encrypted, 0, salt.Length);
                Buffer.BlockCopy(ms.ToArray(), 0, encrypted, salt.Length, (int)ms.Length);
            }

            return Convert.ToBase64String(encrypted);
        }

        /// <summary>
        /// Decrypts base64-encoded ciphertext using password-derived key.
        /// Extracts salt from beginning of data.
        /// </summary>
        public static string Decrypt(string cipherText, string password)
        {
            if (string.IsNullOrWhiteSpace(cipherText))
                return string.Empty;

            byte[] encryptedData = Convert.FromBase64String(cipherText);
            
            // Extract salt from beginning
            byte[] salt = new byte[SaltSize];
            Buffer.BlockCopy(encryptedData, 0, salt, 0, SaltSize);

            using var deriveBytes = new Rfc2898DeriveBytes(password, salt, Iterations);
            byte[] key = deriveBytes.GetBytes(KeySize / 8);
            byte[] iv = deriveBytes.GetBytes(BlockSize / 8);

            byte[] decrypted;
            using (var ms = new MemoryStream(encryptedData, SaltSize, encryptedData.Length - SaltSize))
            {
                using var cs = new CryptoStream(ms, CreateDecryptor(key, iv), CryptoStreamMode.Read);
                using var resultStream = new MemoryStream();
                cs.CopyTo(resultStream);
                decrypted = resultStream.ToArray();
            }

            return Encoding.UTF8.GetString(decrypted);
        }

        private static ICryptoTransform CreateEncryptor(byte[] key, byte[] iv)
        {
            using var aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            return aes.CreateEncryptor();
        }

        private static ICryptoTransform CreateDecryptor(byte[] key, byte[] iv)
        {
            using var aes = Aes.Create();
            aes.Key = key;
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            return aes.CreateDecryptor();
        }

        /// <summary>
        /// Validates that password is strong enough for encryption.
        /// </summary>
        public static bool ValidatePasswordStrength(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return false;

            if (password.Length < 8)
                throw new ArgumentException("Password must be at least 8 characters");

            // Check for complexity
            bool hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
            
            foreach (char c in password)
            {
                if (char.IsUpper(c)) hasUpper = true;
                else if (char.IsLower(c)) hasLower = true;
                else if (char.IsDigit(c)) hasDigit = true;
                else if (!char.IsLetterOrDigit(c)) hasSpecial = true;
            }

            // Require at least 3 of 4 complexity requirements
            int count = 0;
            if (hasUpper) count++;
            if (hasLower) count++;
            if (hasDigit) count++;
            if (hasSpecial) count++;

            return count >= 3;
        }
    }
}
