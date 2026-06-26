# 🕒 Registro Orario Lavorativo (Kubernetes Edition)

Un'applicazione Full Stack per la gestione dei turni lavorativi, ingressi, rientri in sede e calcolo automatico delle ore. Progettata per essere eseguita in alta affidabilità su un cluster **Kubernetes (k3d)**.

## 🚀 Caratteristiche
- **Frontend/Backend**: Node.js + Express con interfaccia reattiva.
- **Alta Affidabilità**: Deployment con 6 repliche e strategie di Anti-Affinity.
- **Storage**: Persistenza dei dati tramite volumi locali montati sui pod.
- **Sicurezza**: Ingress configurato con TLS (HTTPS) e redirect automatico.
- **Automazione**: Script inclusi per la gestione totale del ciclo di vita del cluster.

---

## 📂 Struttura del Progetto
Il repository è organizzato per separare il codice dell'app dalla configurazione dell'infrastruttura:

- `orario-cluster/file/`: Codice sorgente (Dockerfile, server.js, index.html).
- `orario-cluster/k8s/`: Risorse Kubernetes (Deployment, Service, Ingress, Secret).
- `orario-cluster/scripts/`: Script per build, deploy e gestione cluster.
- `data/`: Directory per il database JSON e i backup (mappata nel cluster).
- `backup/`: Snapshot del cluster e delle immagini.

---

## 🛠 Installazione Rapida

### 1. Prerequisiti
Assicurati di avere installati:
- Docker & Docker Buildx
- k3d & kubectl
- mkcert (per i certificati locali)

### 2. Configurazione Certificati
Genera i certificati TLS per il dominio locale:
```bash
mkdir -p orario-cluster/certs
mkcert -install
mkcert -cert-file orario-cluster/certs/orario.local.pem -key-file orario-cluster/certs/orario.local-key.pem orario.local
3. Avvio del Cluster
Usa lo script di gestione per creare l'intero ambiente k3d:

Bash
chmod +x orario-cluster/scripts/gestione/crea_cluster_orario.sh
./orario-cluster/scripts/gestione/crea_cluster_orario.sh
L'applicazione sarà raggiungibile su: https://orario.local (previo inserimento nel file /etc/hosts).

🔄 Pipeline di Aggiornamento
Per aggiornare l'applicazione dopo una modifica al codice:

Modifica i file in orario-cluster/file/.

Esegui lo script di aggiornamento immagine:

Bash
./orario-cluster/scripts/servizio/update-image.sh
Lo script effettuerà il build, il push su Docker Hub, l'import in k3d e il rollout dei pod.

📝 Note sui Volumi
L'applicazione utilizza i seguenti percorsi sull'host per la persistenza:

Dati: /mnt/data/workhours -> mappato in /orario_lavorativo/data

Manuale: /mnt/data/manuale -> mappato in /orario_lavorativo/manuale

Assicurarsi che queste directory esistano sul sistema host prima dell'avvio.


---


