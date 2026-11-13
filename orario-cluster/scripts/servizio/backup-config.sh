#! /bin/bash

WORKDIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/"

rsync -av "$WORKDIR/k8s" . > /dev/null 2>&1
echo "Backup Configurazioni effettuato"
