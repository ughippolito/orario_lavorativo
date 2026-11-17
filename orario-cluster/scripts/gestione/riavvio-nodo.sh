#!/bin/bash

echo ""

NODE_NAME="$1"

# Se il nome del nodo non è stato passato come argomento, mostriamo la lista con lo stato K8s
if [ -z "$NODE_NAME" ]; then
    echo "Nessun nodo specificato."
    echo ""
    echo "==> Nodi k3d disponibili e stato Kubernetes:"
    echo "-------------------------------------------------------------------"
    printf "%-35s %-15s %-15s\n" "NOME NODO" "RUOLO K3D" "STATO K8S"
    echo "-------------------------------------------------------------------"
    
    # Recupera la mappa "nome_nodo -> stato" da kubectl (se il cluster è raggiungibile)
    K8S_STATUS=$(kubectl get nodes --no-headers 2>/dev/null | awk '{print $1, $2}')
    
    # Cicla sui nodi di k3d saltando l'intestazione
    k3d node list --no-headers | while read -r n_name n_role n_cluster n_status; do
        # Cerca lo stato del nodo nell'output di kubectl
        ready_state=$(echo "$K8S_STATUS" | awk -v node="$n_name" '$1 == node {print $2}')
        
        # Se non è presente in kubectl (es. serverlb o cluster fermo), gestiamo il fallback
        if [ -z "$ready_state" ]; then
            if [[ "$n_role" == "loadbalancer" || "$n_role" == "registry" ]]; then
                ready_state="N/A (infra)"
            else
                ready_state="Sconosciuto/Off"
            fi
        fi
        
        printf "%-35s %-15s %-15s\n" "$n_name" "$n_role" "$ready_state"
    done
    
    echo "-------------------------------------------------------------------"
    echo ""
    
    read -p "Inserisci il nome esatto del nodo da riavviare: " NODE_NAME
    
    if [ -z "$NODE_NAME" ]; then
        echo "Operazione annullata. Nessun nodo inserito."
        exit 1
    fi
fi

echo ""
echo "==> Arresto del nodo k3d: $NODE_NAME..."
k3d node stop "$NODE_NAME"

if [ $? -ne 0 ]; then
    echo "Errore durante l'arresto del nodo $NODE_NAME."
    exit 1
fi

echo "==> Avvio del nodo k3d: $NODE_NAME..."
k3d node start "$NODE_NAME"

if [ $? -eq 0 ]; then
    echo "==> Nodo $NODE_NAME riavviato con successo!"
    echo "Attendere la verifica del nodo..."
    sleep 10
    echo "Verifica stato attuale in Kubernetes:"
    kubectl get node "$NODE_NAME" 2>/dev/null || echo "(Nodo non gestito direttamente da Kubernetes)"
else
    echo "Errore durante l'avvio del nodo $NODE_NAME."
    exit 1
fi
