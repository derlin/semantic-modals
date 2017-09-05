#!/bin/sh

SOURCE_BRANCH=`git rev-parse --abbrev-ref HEAD`
DEST_BRANCH=gh-pages

git checkout $DEST_BRANCH

# Make sure we actually made it to the destination branch
if [ `git rev-parse --abbrev-ref HEAD` != $DEST_BRANCH ]; then
  echo "!!!! Something went wrong check the errors above and try again !!!!"
  exit 0
fi

# Checkout code to deploy on destination branch
git reset --hard $SOURCE_BRANCH

# Prepare build dependencies
bower install

# ignore .gitignore and commit build dependencies
git add --force bower_components
git commit -m "add bower components"

# Overwrite the destination branch
git push origin $DEST_BRANCH --force

# Like nothing ever happened
git checkout $SOURCE_BRANCH