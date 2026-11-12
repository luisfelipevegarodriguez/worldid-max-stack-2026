#!/bin/bash
# Retired. This used to claim a zero-touch production deploy (GCP, Vercel CLI,
# deployer key, GitHub Actions canary). Actions on this account is blocked by
# billing, and the script could print a success banner without those services.
set -euo pipefail

echo "infra/zero-touch.sh does not activate production."
echo "Follow docs/BOOTSTRAP.md (Vercel Hobby + Supabase free, optional Docker on Cloud Run or Fly)."
echo "GitHub issue #1 stays open until those steps are done with real credentials."
exit 2
