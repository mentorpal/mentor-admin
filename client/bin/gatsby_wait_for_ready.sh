#!/usr/bin/env bash
set -e 
timeout=1800
timer=0
echo "waiting for server to respond"
until $(curl --max-time 1 --output /dev/null --silent --head --fail http://localhost:8000/); do
    printf '.'
    timer=$((timer+1))
    if [[ "${timer}" -gt "${timeout}" ]]; then
        echo
        echo "ERROR: timeout waited ${timeout} secs for server to respond"
        exit 1
    fi
    sleep 1
done
echo 
echo "server ready..."

