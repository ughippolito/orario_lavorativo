#!/bin/bash
#
DEPLOYMENT_NAME="workhours-frontend"
DEPLOYMENT_YAML="$INSTALL_DIR/orario_lavorativo/orario-cluster/k8s/appl_yaml/02_orario-deployment.yaml"
FQDN="orario.local"
NAMESPACE="gestione-orario"

echo ""
echo "📦 Aggiorno il deployment YAML..."
kubectl apply -f $DEPLOYMENT_YAML
kubectl rollout restart deployment $DEPLOYMENT_NAME -n $NAMESPACE

echo ""

echo "🚀 Applicazione aggiornata!"
echo""
echo "🔗 URL: http://$FQDN"
echo ""
