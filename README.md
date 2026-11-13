# 🕒 Gestione Ore Lavoro (v3.0)

Sistema web avanzato per il monitoraggio delle presenze lavorative, il calcolo automatico dei saldi orari, la gestione di ferie/smart working e l'orchestrazione su cluster Kubernetes locale (k3d), sviluppato con Node.js, Express e un'interfaccia grafica moderna in stile Single Page Application (SPA).

---

## 📋 Panoramica del Progetto

Il progetto nasce per tracciare con precisione la propria attività lavorativa giornaliera (in sede, fuori sede, smart working o assenze), offrendo una panoramica statistica in tempo reale, grafici dinamici e strumenti di backup/ripristino dei dati. L'applicazione è progettata per essere eseguita agilmente sia in locale sia containerizzata all'interno di un cluster Kubernetes gestito tramite k3d.

---

## 🚀 Caratteristiche Principali

* **Tracciamento Giornaliero Flessibile:** Registrazione di orari di entrata, uscita, tipologia di sede e note descrittive.
* **Calcolo Uscita Teorica e Saldi (Smart Logic):** 
  * Gestione automatica della soglia minima mattutina (es. ingresso prima delle 08:00 calcolato a partire dalle 08:00).
  * Calcolo dinamico dell'orario di uscita ideale basato sulla durata configurabile della giornata lavorativa (es. 8 ore e 06 minuti).
  * Calcolo in tempo reale del saldo minuti giornaliero e totale (con evidenza visiva di eventuali deficit).
* **Doppia Vista Interattiva:**
  * **Tabella:** Elenco paginato e ordinabile dei record con filtri avanzati per mese, anno, sede e ricerca testuale nelle note.
  * **Calendario Mensile:** Visualizzazione grafica a griglia mensile con indicazione dei giorni festivi italiani (inclusa Pasqua/Pasquetta calcolate dinamicamente), weekend e colorazione basata sullo stato della giornata.
* **Dashboard Statistica:**
  * Grafici a torta per la ripartizione delle sedi (Presenza, Smart Working, Assenze).
  * Grafici a barre per il monitoraggio storico del saldo minuti giornaliero.
* **Resilienza e Gestione Dati:**
  * Salvataggio su file JSON locale (`data/workhours.json`).
  * Sistema di **auto-backup** temporizzato con policy di retention integrata (mantenimento degli ultimi backup).
  * Funzionalità di **rotazione annuale** automatica dell'archivio storico.
  * Ripristino rapido dei dati da file di backup o archivi passati.
* **Esportazione e Documentazione:**
  * Esportazione dei dati filtrati in formato CSV (con supporto BOM per una corretta visualizzazione dei caratteri speciali e accenti in Excel).
  * Download diretto del manuale utente in formato PDF integrato nell'interfaccia.

---

## 🛠️ Stack Tecnologico

* **Backend:** Node.js, Express
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla), Chart.js (per la generazione della dashboard grafica)
* **Containerizzazione & Orchestrazione:** Docker, Kubernetes (k3d), Traefik Ingress, certificati TLS locali con `mkcert`
* **Automazione & Scripting:** Bash scripts per la gestione del ciclo di vita del cluster, dei backup e dei deployment

---

## 📂 Struttura del Repository

```text
.
├── backup/                 # Directory di sicurezza per i backup generali
├── data/                   # Contiene i dati attivi, i backup storici e l'archivio annuale
│   ├── archivio/           # JSON storici per anno (es. rotazione annuale)
│   ├── backups/            # Snapshot temporizzati dei dati
│   └── workhours.json      # Database JSON principale dei record
├── doc/                    # Documentazione e note di installazione
├── logs/                   # Log di sistema e operativi
├── manuale/                # Manuali utente in formato PDF
├── orario-cluster/         # Configurazione completa per Kubernetes / k3d
│   ├── certs/              # Certificati TLS locali
│   ├── file/               # Sorgenti dell'applicazione web (Server Node.js e frontend)
│   ├── k8s/                # Manifest YAML per Deployment, Service, Ingress e Dashboard
│   └── scripts/            # Script di automazione (gestione cluster, backup, aggiornamenti)
└── setup/                  # Script e configurazioni di setup ambiente (es. WSL)
