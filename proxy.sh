#!/bin/bash
# Proxy URL and origin can be overridden via env (defaults match previous lcp behavior)
export PROXY_URL="${PROXY_URL:-https://design.digiserve.org/}"
export ORIGIN="${ORIGIN:-http://localhost:5173}"
exec node proxy-server.js