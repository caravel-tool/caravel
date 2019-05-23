#!/bin/bash
cd $(dirname $0)/..
watchexec -r -w src --signal SIGTERM -- ./dev/build-exec.sh "$@"