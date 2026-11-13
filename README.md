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


# 🚀 Guida Rapida (Quick Start) — Ambiente Windows 11 / WSL2

Il progetto è progettato e ottimizzato per essere eseguito su **Windows 11 tramite WSL2 (Windows Subsystem for Linux)**. Segui i passaggi nell'ordine indicato per preparare l'ambiente e avviare l'infrastruttura completa.

---

### 📋 Prerequisiti di Sistema
* **Sistema Operativo:** Windows 11 con **WSL2** attivo (distribuzione consigliata: Ubuntu 22.04 o 24.04).
* **Permessi:** Privilegi di amministratore (`sudo`) all'interno della distribuzione Linux WSL.

---

### ⚙️ Step 1: Setup Preliminare dell'Ambiente WSL2
Prima di avviare il progetto per la prima volta, esegui lo script di configurazione dalla root del repository. Questo script automatizza l'intera preparazione dell'ambiente:
1. Copia il file `.wslconfig` nella directory utente di Windows 11 per ottimizzare le risorse assegnate a WSL2.
2. Configura i parametri `inotify` del kernel Linux (`/etc/sysctl.conf`) necessari per evitare errori di limite file durante l'esecuzione dei container.
3. Verifica, installa e configura automaticamente **Docker Engine**, **kubectl** (con autocompletamento e alias `k`) e **k3d**.

```bash
# Posizionati nella root del progetto
cd ~/orario_lavorativo

# Assegna i permessi di esecuzione ed avvia lo script di setup
chmod +x setup/install-wslconfig.sh
./setup/install-wslconfig.sh
```

> **⚠️ PASSAGGIO OBBLIGATORIO — Riavvio di WSL2:**  
> Al termine dello script, affinché Windows 11 applichi le modifiche del file `.wslconfig` e WSL2 aggiorni i permessi del gruppo `docker`, apri **PowerShell** (o il Terminale Windows) ed esegui:
> ```powershell
> wsl --shutdown
> ```
> Riapri quindi il terminale Ubuntu WSL2 e verifica che tutto sia operativo con:
> ```bash
> docker info && kubectl version --client && k3d version
> ```

---

### ☸️ Step 2: Creazione e Avvio del Cluster Kubernetes (k3d)
Una volta riavviato WSL2, puoi creare e avviare l'intero cluster Kubernetes locale completo di applicazione web, Traefik Ingress, dashboard di monitoraggio e certificati TLS locali utilizzando gli script presenti in `orario-cluster/scripts/gestione/`:

```bash
# Assegna i permessi di esecuzione agli script di gestione (se necessario)
chmod +x orario-cluster/scripts/gestione/*.sh
chmod +x orario-cluster/scripts/servizio/*.sh

# Crea e avvia il cluster completo
./orario-cluster/scripts/gestione/crea_cluster_orario.sh
```

#### Comandi Utili per la Gestione Quotidiana del Cluster
All'interno di `orario-cluster/scripts/gestione/` sono disponibili tutti gli script per controllare il ciclo di vita del sistema:

* **Verificare lo stato di nodi, pod e servizi:**
  ```bash
  ./orario-cluster/scripts/gestione/stato-cluster.sh
  ```
* **Fermare il cluster (mantenendo i dati e la configurazione):**
  ```bash
  ./orario-cluster/scripts/gestione/stop-cluster.sh
  ```
* **Riavviare un cluster già creato:**
  ```bash
  ./orario-cluster/scripts/gestione/start-cluster.sh
  ```
* **Consultare i log dell'applicazione nel cluster:**
  ```bash
  ./orario-cluster/scripts/gestione/logs-cluster.sh
  ```
* **Aggiornare l'immagine applicativa dopo modifiche al codice:**
  ```bash
  ./orario-cluster/scripts/gestione/update-image-cluster.sh
  ```

---

### 💻 Step 3 (Alternativo): Avvio Standalone in Locale (Solo Node.js)
Se desideri avviare esclusivamente l'applicazione web senza utilizzare Docker o il cluster Kubernetes k3d:

```bash
cd ~/orario_lavorativo/orario-cluster/file
npm install
node server.js
```
L'applicazione sarà immediatamente accessibile dal browser di Windows 11 all'indirizzo `http://localhost:3000`.
