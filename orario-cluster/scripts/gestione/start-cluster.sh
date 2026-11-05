#!/bin/bash

CLUSTER_NAME="${CLUSTER_NAME:-orario-cluster}"

echo ""
echo "==== Avvio controllato del cluster k3d: ${CLUSTER_NAME} ===="
echo ""

# 1. Verifica preventiva: controlliamo se il Load Balancer è già in esecuzione
LB_CONTAINER=$(docker ps --filter "name=k3d-${CLUSTER_NAME}-serverlb" --filter "status=running" -q)

if [ -z "$LB_CONTAINER" ]; then
        # Se il Load Balancer è spento, procediamo con l'avvio normale
        echo "Avvio cluster..."
        k3d cluster start "${CLUSTER_NAME}"
        echo ""
        echo "Attendiamo 10 secondi l'inizializzazione dei nodi..."
        sleep 10
else
        echo "I container risultano già accesi. Verifichiamo lo stato dei nodi di Kubernetes..."
fi

# 2. Controllo rigoroso dello stato dei nodi (valida sia se appena acceso che se già attivo)
NOT_READY_COUNT=$(kubectl get nodes --no-headers 2>/dev/null | grep -w "NotReady" | wc -l)
TOTAL_NODES=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)

# 3. Se ci sono nodi non pronti o kubectl non risponde
if [ "$TOTAL_NODES" -eq 0 ] || [ "$NOT_READY_COUNT" -gt 0 ]; then
        echo ""
        echo "⚠️  ATTENZIONE: Rilevati $NOT_READY_COUNT nodi in stato 'NotReady'."
        echo "I container Docker sono accesi, ma i nodi worker non sono sincronizzati con la rete."
        echo ""
        
        read -p "Vuoi eseguire un riavvio forzato del cluster per riallineare la rete? (s/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Ss]$ ]]; then
                echo "Esecuzione riavvio forzato in corso..."
                k3d cluster stop "${CLUSTER_NAME}"
                sleep 3
                k3d cluster start "${CLUSTER_NAME}"
                
                echo "Attendiamo 10 secondi l'allineamento definitivo della rete..."
                sleep 10
        else
                echo "Operazione annullata. Il cluster rimane non utilizzabile."
                exit 1
        fi
fi

echo ""
echo "Stato corrente del cluster:"
kubectl get nodes -o wide
kubectl get pod -o wide -n gestione-orario
echo ""
echo "==== 🟢 Avvio completato con successo. ===="
echo ""
