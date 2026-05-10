-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS UserSession;
DROP TABLE IF EXISTS Reminder;
DROP TABLE IF EXISTS MedicalRecord;
DROP TABLE IF EXISTS PasswordReset;
DROP TABLE IF EXISTS FavoriteClinic;
DROP TABLE IF EXISTS Pet;
DROP TABLE IF EXISTS VetClinic;
DROP TABLE IF EXISTS PetOwner;

-- PetOwner Table
CREATE TABLE PetOwner (
    owner_id INT PRIMARY KEY IDENTITY(1,1),
    owner_name VARCHAR(100) NOT NULL,
    owner_email VARCHAR(100) NOT NULL UNIQUE,
    owner_password_hash VARCHAR(MAX) NOT NULL,
    owner_phone_number VARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETDATE()
);

-- Pet Table
CREATE TABLE Pet (
    pet_id INT PRIMARY KEY IDENTITY(1,1),
    owner_id INT NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    pet_type VARCHAR(50) NOT NULL,
    pet_dob DATE NOT NULL,
    pet_gender VARCHAR(20) NOT NULL,
    pet_note VARCHAR(MAX) NULL,
    pet_image VARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES PetOwner(owner_id) ON DELETE CASCADE
);

-- VetClinic Table
CREATE TABLE VetClinic (
    clinic_id INT PRIMARY KEY IDENTITY(1,1),
    clinic_name VARCHAR(100) NOT NULL,
    clinic_address VARCHAR(255) NOT NULL,
    clinic_latitude DECIMAL(10,8) NOT NULL,
    clinic_longitude DECIMAL(11,8) NOT NULL,
    clinic_phone VARCHAR(20) NULL,
    clinic_photo_url VARCHAR(MAX) NULL,
    place_id VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETDATE()
);

-- MedicalRecord Table
CREATE TABLE MedicalRecord (
    record_id INT PRIMARY KEY IDENTITY(1,1),
    pet_id INT NOT NULL,
    record_visit_date DATETIME NOT NULL,
    record_consultation_type VARCHAR(100) NOT NULL CHECK (record_consultation_type IN ('Vaccination', 'Checkup', 'Illness/Treatment', 'Surgery', 'Prescription Refill', 'Follow-up', 'Dental Care', 'Emergency', 'Consultation')),
    record_vet_name VARCHAR(100) NOT NULL,
    record_vet_clinic_name VARCHAR(100) NOT NULL,
    record_pet_weight DECIMAL(5,2) NOT NULL,
    record_pet_temperature DECIMAL(5,2) NOT NULL,
    record_note VARCHAR(MAX) NULL,
    record_image VARCHAR(MAX) NULL,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE,
    CHECK (record_visit_date <= GETDATE())
);

-- Reminder Table
CREATE TABLE Reminder (
    reminder_id INT PRIMARY KEY IDENTITY(1,1),
    owner_id INT NOT NULL,
    pet_id INT NOT NULL,
    reminder_date DATE NOT NULL,
    reminder_title VARCHAR(200) NOT NULL,
    reminder_time TIME NOT NULL,
    is_completed BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE
);

-- PasswordReset Table
CREATE TABLE PasswordReset (
    reset_id INT PRIMARY KEY IDENTITY(1,1),
    owner_id INT NOT NULL,
    verification_code VARCHAR(10) NULL,
    token_expiry DATETIME NOT NULL,
    code_attempts INT DEFAULT 0,
    is_used BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES PetOwner(owner_id) ON DELETE CASCADE
);

-- FavoriteClinic Table (max 3 favorites per owner)
CREATE TABLE FavoriteClinic (
    favorite_id INT PRIMARY KEY IDENTITY(1,1),
    owner_id INT NOT NULL,
    clinic_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES PetOwner(owner_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES VetClinic(clinic_id) ON DELETE CASCADE,
    UNIQUE (owner_id, clinic_id)
);

-- UserSession Table (track active login sessions per device)
CREATE TABLE UserSession (
    session_id INT PRIMARY KEY IDENTITY(1,1),
    owner_id INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    token VARCHAR(MAX) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES PetOwner(owner_id) ON DELETE CASCADE
);
