from cryptography.fernet import Fernet

# Generate a key
key = Fernet.generate_key()
with open('crypto.key', 'wb') as key_file:
    key_file.write(key)
print(f"Key generated and saved to crypto.key")

# Get the credentials to encrypt
username = input("Enter your username: ")
password = input("Enter your password: ")

# Create a cipher using the key
cipher = Fernet(key)

# Encrypt the credentials
encrypted_username = cipher.encrypt(username.encode()).decode()
encrypted_password = cipher.encrypt(password.encode()).decode()

# Print in Robot Framework variable format with prefix
print("\nAdd these to your Robot Framework test:")
print(f"${{ENCRYPTED_USERNAME}}    encrypt:{encrypted_username}")
print(f"${{ENCRYPTED_PASSWORD}}    encrypt:{encrypted_password}")