#!/bin/bash
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-orario-cluster}"

DIR="$(cd "$(dirname "$0")" && pwd)"
"${DIR}/stop-cluster.sh" || true
"${DIR}/start-cluster.sh"
