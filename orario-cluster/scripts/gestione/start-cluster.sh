#!/bin/bash
set -euo pipefail

CLUSTER_NAME="orario-cluster"

echo ""
echo "🧹 Stop eventuale cluster $CLUSTER_NAME..."
k3d cluster stop "$CLUSTER_NAME" >/dev/null 2>&1

echo ""
echo -n "🚀 Avvio cluster k3d: $CLUSTER_NAME "

# Funzione per mostrare i puntini in background
show_progress() {
  local pid=$1
  local delay=0.75
  local spinstr='...'
  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    echo -n "."
    sleep $delay
  done
  echo " ✔"
}

# Avviamo k3d in background e nascondiamo l'output
k3d cluster start "$CLUSTER_NAME" >/dev/null 2>&1 &
K3D_PID=$!

# Avviamo l'animazione dei puntini passando il PID di k3d
show_progress $K3D_PID

echo ""
echo "🔄 Aggiornamento configurazione kubeconfig..."
k3d kubeconfig merge "$CLUSTER_NAME" -s -d >/dev/null 2>&1

echo ""
echo -n "⏳ Attendo API server "
ATTEMPTS=0
MAX_ATTEMPTS=30
until kubectl get --raw=/healthz >/dev/null 2>&1; do
    ((ATTEMPTS++))
    if [[ $ATTEMPTS -gt $MAX_ATTEMPTS ]]; then
        echo -e "\n❌ Timeout: API server non risponde"
        exit 1
    fi
    echo -n "."
    sleep 2
done

echo -e " ✔"

echo ""
echo "⏳ Attendo che tutti i nodi siano Ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=60s >/dev/null 2>&1

echo ""
echo "🎉 Cluster avviato correttamente!"
echo ""
