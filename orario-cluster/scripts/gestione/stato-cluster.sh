#! /bin/bash
#
echo ""
echo "Stato cluster:"
kubectl get nodes -o wide
kubectl get pod -o wide -n gestione-orario
echo ""
