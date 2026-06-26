#!/bin/bash
set -euo pipefail
CLUSTER_NAME="${CLUSTER_NAME:-orario-cluster}"
echo ""
echo "🩺 Verifica Cluster --> $CLUSTER_NAME"
NOT_RUN="$(kubectl get nodes 2>&1 | grep refused || true)"
if [[ -n "${NOT_RUN}" ]]; then
  echo ""	
  echo "✔  Cluster DOWN"
  echo ""
  exit 0
fi
echo ""
echo "✔  Cluster UP"
echo ""
## echo "🩺 Verifica Nodi Cluster"
NOTREADY=$(kubectl get nodes --no-headers | awk '$2!="Ready"{print $1}')
if [[ -z "${NOTREADY}" ]]; then
  echo "✔  Tutti i nodi sono Ready."
  echo ""
  echo "✅ Verifica Cluster Completata."
  echo ""
  exit 0
fi
echo ""
echo "Nodi NotReady: ${NOTREADY}"
echo ""

for node in ${NOTREADY}; do
  if [[ "${node}" == k3d-* ]]; then
    echo "⏳ Restart k3d node: ${node}"
    k3d node stop "${node}" || true
    sleep 1
    k3d node start "${node}" || true
  else
    echo "ℹ Nodo non k3d: ${node} (skip restart)"
  fi

  if kubectl describe node "${node}" | grep -q 'node.kubernetes.io/unreachable'; then
    echo "🧹 Rimuovo taint unreachable da ${node}"
    kubectl taint nodes "${node}" node.kubernetes.io/unreachable:NoExecute- || true
    kubectl taint nodes "${node}" node.kubernetes.io/unreachable:NoSchedule- || true
  fi

done

ATTEMPTS=0; MAX_ATTEMPTS=30
while :; do
  NR=$(kubectl get nodes --no-headers | awk '$2!="Ready"{c++} END{print c+0}')
  if [[ "${NR}" -eq 0 ]]; then echo ""; echo "✔ Tutti i nodi sono Ready."; break; fi
  ATTEMPTS=$((ATTEMPTS+1))
  if [[ ${ATTEMPTS} -gt ${MAX_ATTEMPTS} ]]; then
    echo "⚠  Alcuni nodi ancora NotReady:"; kubectl get nodes -o wide; exit 1
  fi
  echo "⏳ Attesa nodi Ready..."
  sleep 2
done
echo ""
echo "✅ Riavvio Nodi Cluster Completato."
echo ""
