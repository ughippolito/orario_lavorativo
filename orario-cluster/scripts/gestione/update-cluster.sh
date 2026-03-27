#!/bin/bash

SERVIZIODIR="$INSTALL_DIR/orario_lavorativo/orario-cluster/scripts/servizio"
BACKUPDIR="$INSTALL_DIR/orario_lavorativo/backup/"
FILENAME="immagine_$(date +%Y%m%d_%H%M)"

mkdir -p "$BACKUPDIR$FILENAME"
cd $BACKUPDIR$FILENAME

echo ""
$SERVIZIODIR/backup-image.sh
echo "$BACKUPDIR$FILENAME"
echo ""

$SERVIZIODIR/update-image.sh
$SERVIZIODIR/deploy-image.sh

