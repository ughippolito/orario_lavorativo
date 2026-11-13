#!/bin/bash
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-orario-cluster}"
TS=$(date +%Y%m%d-%H%M%S)
OUTDIR="logs-${TS}"
mkdir -p "${OUTDIR}"

echo "📦 Raccolgo log in ${OUTDIR}..."

# k3d nodes (docker logs)
for n in $(docker ps --format '{{.Names}}' | grep "k3d-${CLUSTER_NAME}-" || true); do
  echo "- docker logs ${n}"
  docker logs --since 30m "$n" > "${OUTDIR}/${n}.log" 2>&1 || true
done

# kubectl snapshots
kubectl get nodes -o wide > "${OUTDIR}/kubectl_get_nodes.txt" 2>&1 || true
kubectl get pods -A -o wide > "${OUTDIR}/kubectl_get_pods_all.txt" 2>&1 || true
kubectl get events -A --sort-by=.lastTimestamp > "${OUTDIR}/kubectl_events.txt" 2>&1 || true
kubectl get ingress -A > "${OUTDIR}/kubectl_get_ingress.txt" 2>&1 || true

# describe core components (kube-system, default)
for ns in kube-system default; do
  for p in $(kubectl -n "$ns" get pods -o name 2>/dev/null | sed 's#.*/##'); do
    kubectl -n "$ns" describe pod "$p" > "${OUTDIR}/describe_${ns}_${p}.txt" 2>&1 || true
  done
  # logs of traefik & coredns
  for app in traefik coredns; do
    for p in $(kubectl -n "$ns" get pods -l app.kubernetes.io/name=${app} -o name 2>/dev/null | sed 's#.*/##'); do
      kubectl -n "$ns" logs "$p" --tail=1000 > "${OUTDIR}/logs_${ns}_${app}_${p}.log" 2>&1 || true
    done
  done
done

echo "✅ Log raccolti. Cartella: ${OUTDIR}"
