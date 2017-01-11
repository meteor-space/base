#!/usr/bin/env bash

export PACKAGE_DIRS='packages'

if [ "$PORT" ]; then
  spacejam test-packages ./ --driver-package=practicalmeteor:mocha-console-runner --port $PORT
else
   spacejam test-packages ./ --driver-package=practicalmeteor:mocha-console-runner
fi