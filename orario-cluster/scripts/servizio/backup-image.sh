#! /bin/bash

WORKDIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/"

rsync -av "$WORKDIR/file" . > /dev/null 2>&1
echo "Backup Immagine effettuato"
