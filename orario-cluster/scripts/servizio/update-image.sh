#!/bin/bash
set -e 

# --- CONFIGURAZIONE ---
# 1. Usa il percorso assoluto della ROOT del tuo repository
REPO_ROOT="/home/uaippolito/orario_lavorativo"
APP_NAME="workhours-frontend"
LOCAL_IMAGE="workhours-frontend:latest"
REMOTE_IMAGE="ughippo/gestione-orario:latest"

# 2. Percorsi file (relativi alla REPO_ROOT)
DOCKERFILE="$REPO_ROOT/orario-cluster/file/Dockerfile"
CONTEXT="$REPO_ROOT/orario-cluster/file"

echo "📂 Entro nella directory del repository..."
cd "$REPO_ROOT"

# --- LOGICA DOCKER ---
echo "🔧 1. Build dell'immagine Docker locale..."
docker buildx build --no-cache --load -f "$DOCKERFILE" -t $LOCAL_IMAGE "$CONTEXT"

echo "🏷️ 2. Tagging immagine..."
docker tag $LOCAL_IMAGE $REMOTE_IMAGE

echo "☁️ 3. Push su Docker Hub..."
docker push $REMOTE_IMAGE

echo "📂 Mi sposto nella root del repo: $REPO_ROOT"
cd "$REPO_ROOT"

# --- LOGICA GITHUB ---
echo "📖 4. Controllo modifiche Git..."

# Aggiungiamo i file per vedere se c'è qualcosa di nuovo
git add .

git config user.email "ughippo@example.com"
git config user.name "ughippo"

git commit -m "Update Image: $(date +'%Y-%m-%d %H:%M:%S')"
   
# Se hai configurato il Token come ti ho suggerito prima, 
# questo comando non chiederà password.
git push origin main --force
echo "✅ GitHub aggiornato!"

echo ""
echo "✨ Operazione completata con successo!"
