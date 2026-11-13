#!/bin/bash

echo "=== Configurazione ambiente di sviluppo per orario_lavorativo ==="

# ==========================================
# 1. Installazione di .wslconfig in Windows
# ==========================================
WIN_USER=$(powershell.exe -Command "[System.Environment]::UserName" 2>/dev/null | tr -d '\r')

if [ -z "$WIN_USER" ]; then
    WIN_USER=$(ls /mnt/c/Users | grep -v "Public|Default|All Users" | head -n 1)
fi

TARGET_DIR="/mnt/c/Users/$WIN_USER"
TARGET_FILE="$TARGET_DIR/.wslconfig"
SOURCE_FILE="./setup/.wslconfig"

echo "Utente Windows rilevato: $WIN_USER"

if [ -f "$SOURCE_FILE" ]; then
    cp "$SOURCE_FILE" "$TARGET_FILE"
    if [ $? -eq 0 ]; then
        echo "[OK] File .wslconfig copiato correttamente in Windows."
    else
        echo "[ERRORE] Impossibile copiare il file .wslconfig in Windows."
    fi
else
    echo "[AVVISO] File sorgente $SOURCE_FILE non trovato, salto la copia di .wslconfig."
fi

# ==========================================
# 2. Configurazione inotify in /etc/sysctl.conf
# ==========================================
echo "Configurazione dei parametri inotify in /etc/sysctl.conf..."

# Parametri da aggiungere
PARAM1="fs.inotify.max_user_instances=1024"
PARAM2="fs.inotify.max_user_watches=1048576"

# Controlla se il blocco esiste già per evitare duplicati
sudo bash -c "
grep -qxF '$PARAM1' /etc/sysctl.conf || echo '$PARAM1' >> /etc/sysctl.conf
grep -qxF '$PARAM2' /etc/sysctl.conf || echo '$PARAM2' >> /etc/sysctl.conf
"

if [ $? -eq 0 ]; then
    echo "[OK] Parametri inotify aggiunti o già presenti in /etc/sysctl.conf."
    
    # Ricarica le configurazioni del kernel
    echo "Applicazione delle modifiche con sysctl -p..."
    sudo sysctl -p
    
    if [ $? -eq 0 ]; then
        echo "[OK] Parametri del kernel applicati con successo!"
    else
        echo "[ERRORE] Errore durante l'applicazione di sysctl -p."
    fi
else
    echo "[ERRORE] Impossibile scrivere su /etc/sysctl.conf (permessi insufficienti o errore sudo)."
fi

echo "=== Setup completato! ==="
echo "Ricorda di riavviare WSL da PowerShell (eseguendo 'wsl --shutdown') per applicare le modifiche a .wslconfig."
