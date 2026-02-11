#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$SCRIPT_DIR/.env" ]; then
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
fi

DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
IMAGE_NAME="${IMAGE_NAME:-crt-ambar-css}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

if [ -z "$DOCKER_USERNAME" ]; then
    echo "ERROR: DOCKER_USERNAME is required."
    echo "Set it via environment variable or .env file."
    echo "  export DOCKER_USERNAME=your-username"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "ERROR: docker is not installed or not in PATH."
    exit 1
fi

FULL_IMAGE="${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "==> Building image: ${FULL_IMAGE}"
docker build \
    -t "$FULL_IMAGE" \
    -f "$PROJECT_ROOT/devops/Dockerfile" \
    "$PROJECT_ROOT"

echo "==> Pushing image: ${FULL_IMAGE}"
docker push "$FULL_IMAGE"

echo "==> Done: ${FULL_IMAGE}"
