#!/bin/bash
set -euo pipefail

CLUSTER_NAME="orario-cluster"
K3D_CONFIG="$INSTALL_DIR/orario_lavorativo/orario-cluster/k8s/config_yaml"
K8S_DASH_DIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/k8s/dash_yaml"
K8S_APP_DIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/k8s/appl_yaml"
SCRIPTS_DIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/scripts/servizio"
NAMESPACE="gestione-orario"
FQDN_APP="orario.local"
FQDN_DASH="dashboard.local"

echo ""
echo "🧹 Rimuovo eventuale cluster $CLUSTER_NAME esistente..."
k3d cluster delete "$CLUSTER_NAME" >/dev/null 2>&1 || true
echo "✔  Cluster esistemte rimosso ..."
echo ""
echo "🚀 Creo cluster..."
k3d cluster create --config "$K3D_CONFIG/k3d-orario.yaml"
echo ""
echo "⏳ Attendo API server..."
until kubectl get --raw=/healthz >/dev/null 2>&1; do
  echo "⏳ API server non ancora pronto..."
  sleep 2
done
echo "✔  API server pronto!"
echo ""
echo "🚀 Creo il namespace " $NAMESPACE 
kubectl create namespace $NAMESPACE
echo ""
echo "🏷 Applico label e taint..."
kubectl taint nodes k3d-orario-cluster-server-0 node-role.kubernetes.io/control-plane=:NoSchedule --overwrite
kubectl label nodes k3d-orario-cluster-agent-0 node-role.kubernetes.io/worker=worker --overwrite
kubectl label nodes k3d-orario-cluster-agent-1 node-role.kubernetes.io/worker=worker --overwrite
echo ""
echo "📄 Applico manifest applicazione..."
cd $K8S_APP_DIR
kubectl apply -f .
echo ""
echo "⏳ Attendo che Traefik installi le CRD..."
until kubectl get crd ingressroutes.traefik.io >/dev/null 2>&1; do
  sleep 2
done
echo "✔  CRD di Traefik pronte!"
echo ""
# --- AGGIUNGI QUESTO PER ESSERE SICURO ---
echo "⏳ Attendo che la Dashboard sia distribuita..."
until kubectl get ns kubernetes-dashboard >/dev/null 2>&1; do
  sleep 2
done
echo ""
# -----------------------------------------
echo "📄 Applico manifest dashboard..."
cd $K8S_DASH_DIR
kubectl apply -f .
echo ""
$SCRIPTS_DIR/update-token.sh
echo ""
echo "✔  Applicazione avviata!"
echo "https://$FQDN_APP"
echo ""
echo "✔  Dashboard avviata!"
echo "https://$FQDN_DASH"
echo ""
echo "🎉 Cluster creato e configurato!"
echo ""
