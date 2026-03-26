# k8s-tools (WSL2 + k3d helper)

Toolkit pensato per ambienti **WSL2 + Docker Desktop + k3d/k3s**. Risolve i problemi tipici di startup/shutdown (nodi NotReady, agent Unreachable, ingress non raggiungibile) e fornisce comandi rapidi.

## Contenuto
- `start-cluster.sh` – Avvio sicuro: attende rete e Docker, avvia k3d e riavvia gli agent per evitare `NotReady`.
- `stop-cluster.sh` – Arresto ordinato: pulisce pod zombie e ferma i nodi in sequenza corretta.
- `restart-cluster.sh` – Stop + Start con un solo comando.
- `logs-cluster.sh` – Colleziona log di k3d (docker) e dei pod core (kube-system) in una cartella timestamp.
- `heal-nodes.sh` – Tenta il recupero automatico dei nodi `NotReady` (riavvio nodi k3d + rimozione taint `unreachable`).

## Requisiti
- Docker Desktop installato e **non** in auto-start.
- k3d e kubectl nella PATH della WSL.
- Cluster esistente chiamato `orario-cluster` (o imposta `CLUSTER_NAME`).

## Installazione

```bash
chmod +x start-cluster.sh stop-cluster.sh restart-cluster.sh logs-cluster.sh heal-nodes.sh
```

Opzionale: aggiungi alias al tuo `~/.bashrc`:

```bash
echo 'alias k3dup="~/k8s-tools/start-cluster.sh"' >> ~/.bashrc
echo 'alias k3dstop="~/k8s-tools/stop-cluster.sh"' >> ~/.bashrc
source ~/.bashrc
```

## Uso

- Avvio sicuro:
  ```bash
  ./start-cluster.sh
  ```
- Arresto sicuro:
  ```bash
  ./stop-cluster.sh
  ```
- Riavvio:
  ```bash
  ./restart-cluster.sh
  ```
- Raccogli log:
  ```bash
  ./logs-cluster.sh
  ```
- Heal nodi NotReady:
  ```bash
  ./heal-nodes.sh
  ```

## Nota su host personalizzati (es. `orario.local`)
Aggiungi nel file **hosts di Windows** (non quello della WSL):
```
C:\Windows\System32\drivers\etc\hosts
127.0.0.1   orario.local
```

## Variabili
Puoi impostare `CLUSTER_NAME` prima di eseguire gli script:
```bash
CLUSTER_NAME=orario-cluster ./start-cluster.sh
```
