#!/bin/bash

SERVIZIODIR="/home/ugo/progetti/orario_lavorativo/orario-cluster/scripts/servizio"
BACKUPDIR="/home/ugo/progetti/orario_lavorativo/backup/"
FILENAME="immagine_$(date +%Y%m%d_%H%M)"

mkdir -p "$BACKUPDIR$FILENAME"
cd $BACKUPDIR$FILENAME

echo ""
$SERVIZIODIR/backup-image.sh
echo "$BACKUPDIR$FILENAME"
echo ""

$SERVIZIODIR/update-image.sh
$SERVIZIODIR/deploy-image.sh

