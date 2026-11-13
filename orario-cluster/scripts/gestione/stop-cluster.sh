#!/bin/bash

CLUSTER_NAME="${CLUSTER_NAME:-orario-cluster}"

# Controlla se ci sono container attivi legati al cluster
RUNNING_CONTAINERS=$(docker ps --filter "name=k3d-${CLUSTER_NAME}-" -q)

if [ -z "$RUNNING_CONTAINERS" ]; then
        echo ""
        echo "Cluster $CLUSTER_NAME già fermo."
        echo ""
else
        echo ""
        echo "==== Arresto controllato del cluster k3d: ${CLUSTER_NAME} ===="
        echo ""
        echo "Stato iniziale:"
        kubectl get nodes -o wide 2>/dev/null || echo "Impossibile contattare il cluster (già irraggiungibile)"
        kubectl get pod -o wide -n gestione-orario 2>/dev/null || true
        echo ""
        echo "Arresto cluster..."
        k3d cluster stop "${CLUSTER_NAME}"
        echo ""
        echo "==== 🟢 Arresto completato. ===="
        echo ""
fi
