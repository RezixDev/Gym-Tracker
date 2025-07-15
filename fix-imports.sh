#!/bin/bash

set -e

echo "🔧 Fixing relative imports in TypeScript files..."

# Only replace ../../../ with '@/features/nutrition/' — based on your real structure
find src/features/nutrition -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|\.\./\.\./\.\./|@/features/nutrition/|g' {} +

# Replace ../../ with '@/features/nutrition/'
find src/features/nutrition -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|\.\./\.\./|@/features/nutrition/|g' {} +

# Replace ../ with '@/features/nutrition/'
find src/features/nutrition -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|\.\./|@/features/nutrition/|g' {} +

echo "✅ Imports updated with correct base '@/features/nutrition/'."
echo "🧪 Consider running: pnpm lint && pnpm typecheck"
