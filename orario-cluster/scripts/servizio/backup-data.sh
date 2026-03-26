#! /bin/bash

DATADIR="/home/ugo/progetti/orario_lavorativo/data"

rsync -av "$DATADIR" . > /dev/null 2>&1
echo "Backup Dati effettuato"

