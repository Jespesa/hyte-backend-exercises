import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// SQL-komennot
const sql = `
-- Tietokantapäivitykset lääkitys- ja liikuntaosioille

-- Luodaan liikunta-taulu, jos sitä ei vielä ole
CREATE TABLE IF NOT EXISTS Exercises (
  exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  duration INT NOT NULL,
  intensity VARCHAR(50),
  date DATE NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Lisää esimerkkidataa lääkitystauluun
INSERT INTO Medications (user_id, name, dosage, frequency, start_date, end_date) VALUES
(1, 'Ibuprofeiini', '400 mg', 'Tarvittaessa', '2025-01-15', '2025-02-15'),
(1, 'D-vitamiini', '10 µg', 'Kerran päivässä', '2025-01-01', NULL),
(2, 'Paracetamol', '500 mg', 'Tarvittaessa', '2025-01-10', '2025-01-25'),
(3, 'Omega-3', '1000 mg', 'Kerran päivässä', '2025-01-05', NULL),
(4, 'Magnesium', '375 mg', 'Iltaisin', '2025-01-15', NULL);

-- Lisää esimerkkidataa liikuntaan
INSERT INTO Exercises (user_id, type, duration, intensity, date, notes) VALUES
(1, 'Juoksu', 45, 'medium', '2025-02-15', 'Hyvä lenkki, tasainen maasto'),
(1, 'Kuntosali', 60, 'high', '2025-02-17', 'Keskittynyt ylävartaloon'),
(2, 'Uinti', 30, 'medium', '2025-02-16', 'Uimahallissa, 20 kierrosta'),
(3, 'Pyöräily', 75, 'medium', '2025-02-15', 'Pitkä lenkkireitti'),
(4, 'Jooga', 45, 'low', '2025-02-18', 'Rauhallinen sessio kotona');
`;

async function updateDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Tärkeä!
    });

    console.log('Yhdistetty tietokantaan, suoritetaan päivitykset...');
    await connection.query(sql);
    console.log('Tietokantapäivitykset suoritettu onnistuneesti!');

    await connection.end();
  } catch (error) {
    console.error('Virhe tietokantapäivityksessä:', error);
  }
}

updateDatabase();