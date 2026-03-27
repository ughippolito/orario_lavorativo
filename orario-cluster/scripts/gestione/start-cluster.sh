#!/bin/bash
set -euo pipefail

CLUSTER_NAME="orario-cluster"
SCRIPTS_DIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/scripts/gestione"
FQDN_APP="orario.local"
FQDN_DASH="dashboard.local"

echo ""
echo "🧹 Stop eventuale cluster $CLUSTER_NAME se attivo..."
k3d cluster stop "$CLUSTER_NAME"  >/dev/null 2>&1
echo ""
echo "🚀 Avvio cluster k3d: $CLUSTER_NAME"
if ! k3d cluster start "$CLUSTER_NAME"  >/dev/null 2>&1; then
       echo "❌ Errore critico durante l'invocazione di k3d"
       exit 1
fi
echo ""
echo "▶ Avvio control-plane..."
echo ""
echo "⏳ Attendo API server..."
ATTEMPTS=0
MAX_ATTEMPTS=60
until kubectl get --raw=/healthz >/dev/null 2>&1; do
  ((ATTEMPTS++))
  if [[ $ATTEMPTS -gt $MAX_ATTEMPTS ]]; then
    echo "❌ Timeout: API server non risponde"
    exit 1
  fi
  sleep 2
done
echo ""
echo "✔  API server pronto!"
echo ""
echo " ▶ Avvio nodi worker..."
sleep 5;
WORKER=$(kubectl get nodes  | grep agent | awk '{print $1}')
for node in ${WORKER}; do k3d node stop "${node}"; sleep 2; k3d node start "${node}" >/dev/null 2>&1; done
echo ""
echo "⏳ Attendo nodi Ready..."
until [[ $(kubectl get nodes --no-headers | awk '$2!="Ready"{c++} END{print c+0}') -eq 0 ]]; do
  sleep 5
done
echo""
echo "✔  Tutti i nodi sono READY!"
echo ""
echo "✔  Applicazione avviata!"
echo "https://$FQDN_APP"
echo ""
echo "✔  Dashboard avviata!"
echo "https://$FQDN_DASH"
echo ""
echo "🎉 Cluster avviato correttamente!"
echo ""
