#!/usr/bin/env bash
set -e 
npm ci
npx gatsby telemetry --disable
npm run develop &
bash ./bin/gatsby_wait_for_ready.sh
npx cypress run --env updateSnapshots=true
