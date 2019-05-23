#!/bin/bash
DATE=`date "+%F %T"`
cd $(dirname $0)/..
echo "Build init: $DATE"
shards build "$1"
echo "Build status: Success"
echo "##################"
