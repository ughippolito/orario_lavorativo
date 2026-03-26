#!/bin/bash
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-orario-cluster}"
SCRIPTDIR="/home/ugo/progetti/orario_lavorativo/orario-cluster/scripts/gestione"

echo ""
echo "==== Arresto controllato del cluster k3d: ${CLUSTER_NAME} ===="
echo ""
echo "Stato iniziale:"
kubectl get nodes || true
echo ""
echo "Arresto cluster..."
k3d cluster stop "${CLUSTER_NAME}" || true
echo ""
echo "Verifica container k3d residui..."
LEFT=$(docker ps --format '{{.Names}}' | grep k3d || true)
if [[ -n "${LEFT}" ]]; then
  echo "⚠  Ancora attivi:"
  echo "${LEFT}"
else
  echo "✔  Nessun container k3d attivo."
fi
echo ""
echo "Riepilogo:"
kubectl get nodes 2>/dev/null || echo "(Cluster fermo)"
echo ""
echo "==== 🟢 Arresto completato. ===="
echo ""
