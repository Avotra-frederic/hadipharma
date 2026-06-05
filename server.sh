#!/bin/bash

echo "Starting server..."

cd backend
npm run dev &
BACKEND_PID=$!
cd ../frontend
npm run dev &
FRONTEND_PID=$!

cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

trap cleanup EXIT

wait

