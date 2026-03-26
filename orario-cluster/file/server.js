const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Percorso file dati
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'workhours.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const ARCHIVE_DIR = path.join(DATA_DIR, 'archivio');
const MANUALE_DIR = path.join(__dirname, 'manuale');

// Assicura che la cartella backup esista
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}   // <---- ❗❗❗ MANCAVA QUESTA PARENTESI

function backupDataFile() {
    if (!fs.existsSync(DATA_FILE)) return;

    const now = new Date();

    // Formattazione in locale (CET) — zero padding manuale
    const pad = n => String(n).padStart(2, "0");

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const timestamp = `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;

    const backupFile = path.join(BACKUP_DIR, `workhours-${timestamp}.json`);

    fs.copyFile(DATA_FILE, backupFile, (err) => {
        if (err) console.error("❌ Errore backup:", err);
        else {
            console.log("📝 Backup creato:", backupFile);
            applyRetentionPolicy();
        }
    });
}


// Quanti backup mantenere
const MAX_BACKUPS = 10;

function applyRetentionPolicy() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) return;

        let files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith("workhours-") && f.endsWith(".json"))
            .map(f => ({
                name: f,
                time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (files.length > MAX_BACKUPS) {
            const toDelete = files.slice(MAX_BACKUPS);
            toDelete.forEach(f => {
                const target = path.join(BACKUP_DIR, f.name);
                fs.unlinkSync(target);
                console.log("🗑️ Rimosso vecchio backup:", target);
            });
        }
    } catch (err) {
        console.error("❌ Errore retention policy:", err);
    }
}

// ✅ Rotazione annuale
function rotateYearIfNeeded() {
  if (!fs.existsSync(DATA_FILE)) return;
  const records = JSON.parse(fs.readFileSync(DATA_FILE));
  if (records.length === 0) return;

  const firstYear = new Date(records[0].date).getFullYear();
  const currentYear = new Date().getFullYear();
  if (firstYear < currentYear) {
    const archiveFile = path.join(ARCHIVE_DIR, `archivio-${firstYear}.json`);
    fs.renameSync(DATA_FILE, archiveFile);
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    console.log(`📦 Archivio creato: ${archiveFile}`);
  }
}

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ===================== SALVA / AGGIORNA RECORD =====================
app.post('/save', (req, res) => {
		
	rotateYearIfNeeded();   // ✅ ROTAZIONE ANNUALE QUI

    const record = req.body;
    let records = [];

    if (fs.existsSync(DATA_FILE)) {
        records = JSON.parse(fs.readFileSync(DATA_FILE));
    }

    const index = records.findIndex(r => r.date === record.date);
    if (index !== -1) {
        records[index] = record;
    } else {
        records.push(record);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));

    res.json({ success: true });

    backupDataFile();  // 🔥 Backup automatico	
	
});

// ===================== MOSTRA RECORD =====================
app.get('/records', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        res.send(fs.readFileSync(DATA_FILE));
    } else {
        res.send([]);
    }
});

// ===================== CANCELLA TUTTI I RECORD =====================
app.post('/clear', (req, res) => {

    backupDataFile();

    fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Errore nella cancellazione' });

        res.json({ success: true });
    });
});

// ===================== CANCELLA RECORD SINGOLO =====================
app.delete('/delete/:date', (req, res) => {

    backupDataFile();

    const targetDate = req.params.date;

    if (!fs.existsSync(DATA_FILE)) {
        return res.status(404).json({ success: false, message: 'Nessun record trovato' });
    }

    let records = JSON.parse(fs.readFileSync(DATA_FILE));
    const newRecords = records.filter(r => r.date !== targetDate);

    if (newRecords.length === records.length) {
        return res.status(404).json({ success: false, message: 'Record non trovato' });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(newRecords, null, 2));

    res.json({ success: true });
});

// ========================= BACKUP RESTORE ===========================
app.get('/backups', (req, res) => {
    if (!fs.existsSync(BACKUP_DIR)) return res.json([]);

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith(".json"))
        .sort();

    res.json(files);
});

app.post('/restore', (req, res) => {
    const { filename } = req.body;

    if (!filename) {
        return res.status(400).json({ success: false, message: "Filename richiesto" });
    }

    const source = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(source)) {
        return res.status(404).json({ success: false, message: "Backup non trovato" });
    }

    // Ripristina il file principale
    fs.copyFile(source, DATA_FILE, (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Errore nel ripristino", error: err });
        }

        console.log("♻️ Ripristinato backup:", filename);
        res.json({ success: true, restored: filename });
    });
});

// ========================= GESTIONE ARCHIVI ===========================
app.get('/archives', (req, res) => {
  if (!fs.existsSync(ARCHIVE_DIR)) return res.json([]);
  const files = fs.readdirSync(ARCHIVE_DIR)
    .filter(f => f.endsWith('.json'))
	.map(f => f.replace('.json', ''));
  res.json(files);
});

app.get('/archive/:filename', (req, res) => {  
  const filename = req.params.filename; // es. archivio-2025
  const archiveFile = path.join(ARCHIVE_DIR, `${filename}.json`);
  if (!fs.existsSync(archiveFile)) {
    return res.status(404).json({ success: false, message: 'Archivio non trovato' });
  }
  const data = fs.readFileSync(archiveFile);
  res.send(data);
});

// ===================== DOWNLOAD MANUALE =====================
app.get('/download-manuale', (req, res) => {
    // Utilizza __dirname per trovare la cartella montata correttamente
    const filePath = path.join(MANUALE_DIR, 'Manuale_Utente_Gestione_Ore_Lavoro_v3.pdf');
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'Manuale_Utente_v3.pdf');
    } else {
        console.error(`File manuale non trovato in: ${filePath}`);
        res.status(404).send("Errore: Il file del manuale non è disponibile sul server.");
    }
});

// ===================== AVVIO SERVER =====================
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

