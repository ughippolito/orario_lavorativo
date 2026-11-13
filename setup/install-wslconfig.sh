#!/bin/bash

echo "=== Configurazione ambiente di sviluppo per orario_lavorativo ==="

# ==========================================
# 1. Installazione di .wslconfig in Windows
# ==========================================
WIN_USER=$(powershell.exe -Command "[System.Environment]::UserName" 2>/dev/null | tr -d '\r')

if [ -z "$WIN_USER" ]; then
    WIN_USER=$(ls /mnt/c/Users | grep -vE "Public|Default|All Users" | head -n 1)
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

PARAM1="fs.inotify.max_user_instances=1024"
PARAM2="fs.inotify.max_user_watches=1048576"

sudo bash -c "
grep -qxF '$PARAM1' /etc/sysctl.conf || echo '$PARAM1' >> /etc/sysctl.conf
grep -qxF '$PARAM2' /etc/sysctl.conf || echo '$PARAM2' >> /etc/sysctl.conf
"

if [ $? -eq 0 ]; then
    echo "[OK] Parametri inotify aggiunti o già presenti in /etc/sysctl.conf."
    sudo sysctl -p >/dev/null 2>&1 && echo "[OK] Parametri del kernel applicati!"
else
    echo "[ERRORE] Impossibile scrivere su /etc/sysctl.conf."
fi

# ==========================================
# 3. Installazione e configurazione Docker
# ==========================================
echo "Verifica installazione Docker..."
if ! command -v docker &> /dev/null; then
    echo "Installazione di Docker Engine in corso..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$USER"
    echo "[OK] Docker installato e utente '$USER' aggiunto al gruppo docker."
else
    echo "[OK] Docker è già installato ($(docker --version))."
    sudo usermod -aG docker "$USER" 2>/dev/null
fi

# Abilita e avvia il servizio Docker
sudo service docker start >/dev/null 2>&1 || sudo systemctl enable --now docker >/dev/null 2>&1

# ==========================================
# 4. Installazione e configurazione kubectl
# ==========================================
echo "Verifica installazione kubectl..."
if ! command -v kubectl &> /dev/null; then
    echo "Scaricamento e installazione di kubectl..."
    KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)
    curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm -f kubectl
    echo "[OK] kubectl installato correttamente."
else
    echo "[OK] kubectl è già installato ($(kubectl version --client --short 2>/dev/null || kubectl version --client | head -n 1))."
fi

# Configurazione directory ~/.kube e autocompletamento bash
mkdir -p "$HOME/.kube"
if ! grep -q "kubectl completion bash" "$HOME/.bashrc"; then
    echo 'source <(kubectl completion bash)' >> "$HOME/.bashrc"
    echo 'alias k=kubectl' >> "$HOME/.bashrc"
    echo 'complete -o default -F __start_kubectl k' >> "$HOME/.bashrc"
    echo "[OK] Autocompletamento e alias 'k' per kubectl configurati in .bashrc."
fi

# ==========================================
# 5. Verifica / Installazione k3d
# ==========================================
echo "Verifica installazione k3d..."
if ! command -v k3d &> /dev/null; then
    echo "Installazione di k3d..."
    curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
    echo "[OK] k3d installato correttamente."
else
    echo "[OK] k3d è già installato ($(k3d --version | head -n 1))."
fi

echo "=== Setup completato! ==="
echo "NOTA IMPORTANTE:"
echo "1. Esegui 'wsl --shutdown' da PowerShell di Windows e riapri il terminale per applicare .wslconfig e i permessi del gruppo docker."
echo "2. Dopo il riavvio, verifica con: docker info && kubectl version --client"
