#! /bin/bash

DATE=$(date +%Y%m%d%H%M)
BACKUPDIR="$INSTALL_DIR/orario_lavorativo/backup/"
BACKUPFILE="cluster_$(date +%Y%m%d_%H%M)"
BACKUPSCRIPT="$INSTALL_DIR/orario_lavorativo/orario-cluster/scripts/servizio/"

mkdir -p "$BACKUPDIR$BACKUPFILE"
cd $BACKUPDIR$BACKUPFILE
echo ""
echo "Directory di Backup creata"
echo "$BACKUPFILE"
echo ""
$BACKUPSCRIPT/backup-image.sh
echo ""
$BACKUPSCRIPT/backup-config.sh
echo ""
$BACKUPSCRIPT/backup-data.sh
echo ""
echo "Backup Cluster effettuato"
echo "$BACKUPDIR$BACKUPFILE"
echo ""
touch "$BACKUPDIR$BACKUPFILE"


