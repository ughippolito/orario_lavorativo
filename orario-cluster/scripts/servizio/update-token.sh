#!/bin/bash

K8S_DASH_DIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/k8s/dash_yaml"

# 1. Recupera il token dal Secret statico (già decodificato)
NEW_TOKEN=$(kubectl -n kubernetes-dashboard get secret admin-user-token -o jsonpath={".data.token"} | base64 -d)

# 2. Usa sed per sostituire il segnaposto nel template e creare il file finale
# 's' sta per substitute, TOKEN_DA_SOSTITUIRE è il target, $NEW_TOKEN è il valore
sed "s|TOKEN_DA_SOSTITUIRE|$NEW_TOKEN|g" $K8S_DASH_DIR/template/dashboard-middleware.yaml.tmpl > $K8S_DASH_DIR/04_dashboard-middleware.yaml

kubectl apply -f $K8S_DASH_DIR/04_dashboard-middleware.yaml > /dev/null 

echo "✅ Middleware aggiornato con il nuovo token!"
