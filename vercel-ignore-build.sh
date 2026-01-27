#!/bin/bash

# Vercel Ignore Build Step Script
# Returns 0 to CANCEL build (if only ignored files changed)
# Returns 1 to PROCEED with build (if significant files changed)

# Check for changes, excluding Storybook related files
# If git diff returns 0 (no changes found after exclusion), we exit 0 (cancel build)
# If git diff returns 1 (changes found), we exit 1 (proceed build)

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [ "$VERCEL_GIT_COMMIT_REF" == "main" ] || [ "$VERCEL_GIT_COMMIT_REF" == "master" ]; then
  # Optional: Always build main/master to be safe, or apply same logic.
  # For now, applying same logic is usually fine, but some prefer safety.
  # echo "✅ - Always build main/master"
  # exit 1 
  : # Pass through to check
fi

# Compare against the previous commit (HEAD^ usually works in Vercel env, 
# but VERCEL_GIT_PREVIOUS_SHA might be safer if available. 
# 'git diff HEAD^ HEAD' is the standard Vercel recommendation for simple checks).

git diff HEAD^ HEAD --quiet -- . \
  ':(exclude).storybook' \
  ':(exclude)stories' \
  ':(exclude)**/*.stories.tsx' \
  ':(exclude)**/*.stories.ts' \
  ':(exclude)**/*.stories.mdx'

# Capture the exit code of git diff
# 0 = No changes (only ignored files changed) -> Cancel Build
# 1 = Changes detected -> Proceed Build
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "🛑 - Build cancelled (Only Storybook changes)"
  exit 0
else
  echo "✅ - Build can proceed (App changes detected)"
  exit 1
fi
