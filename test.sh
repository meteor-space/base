#!/usr/bin/env bash

if [ "$PORT" ]; then
  meteor test-packages ./ --port $PORT
else
   meteor test-packages ./
fi
