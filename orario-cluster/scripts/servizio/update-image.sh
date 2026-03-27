#!/bin/bash
set -e # <--- Aggiungi questo: se il build fallisce, lo script si ferma subito!

APP_NAME="workhours-frontend"
LOCAL_IMAGE="workhours-frontend:latest"
REMOTE_IMAGE="ughippo/gestione-orario:latest" # Il tuo repository Docker Hub
CLUSTER_NAME="orario-cluster"
DOCKERFILE="$INSTALL_DIR/orario_lavorativo/orario-cluster/file/Dockerfile"
CONTEXT="$INSTALL_DIR/orario_lavorativo/orario-cluster/file"

echo ""
echo "🔧 1. Build dell'immagine Docker locale..."
docker buildx build --no-cache --load -f "$DOCKERFILE" -t $LOCAL_IMAGE "$CONTEXT"

echo ""
echo "🏷️ 2. Tagging dell'immagine per Docker Hub..."
docker tag $LOCAL_IMAGE $REMOTE_IMAGE

echo ""
echo "☁️ 3. Push dell'immagine su Docker Hub..."
# Nota: Assicurati di aver fatto 'docker login' una volta manualmente sul terminale
docker push $REMOTE_IMAGE
echo ""
echo " 4. Push delle modifiche su Git Hub..."
git add .
git commit -m "Update Image"
git push origin main --force > /dev/null 2>&1
echo ""
