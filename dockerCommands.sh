#!/bin/bash

# Start Redis Server
/usr/bin/redis-server --daemonize yes

# Start article processor Service
pm2-runtime /usr/src/app/build/server.js --node-args="--max_old_space_size=6144"

# node --max_old_space_size=4096 /usr/src/app/build/server.js

# node --max-old-space-size=1024 index.js #increase to 1gb
# node --max-old-space-size=2048 index.js #increase to 2gb
# node --max-old-space-size=3072 index.js #increase to 3gb
# node --max-old-space-size=4096 index.js #increase to 4gb
# node --max-old-space-size=5120 index.js #increase to 5gb
# node --max-old-space-size=6144 index.js #increase to 6gb
# node --max-old-space-size=7168 index.js #increase to 7gb
# node --max-old-space-size=8192 index.js #increase to 8gb
