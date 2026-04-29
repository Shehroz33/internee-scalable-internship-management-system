CREATE DATABASE IF NOT EXISTS internship_management;

USE internship_management;

CREATE TABLE IF NOT EXISTS intern_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  track VARCHAR(100) NOT NULL,
  city VARCHAR(80) NOT NULL,
  status ENUM('Pending', 'Shortlisted', 'Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status ON intern_applications(status);
CREATE INDEX idx_track ON intern_applications(track);
CREATE INDEX idx_created_at ON intern_applications(created_at);
