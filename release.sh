#!/usr/bin/env sh
set -e
echo "Current version:"
npm dist-tag ls
echo ""
echo "Enter release version: "
read VERSION
read -p "is beta - are you sure? (y/n)" -n 1 -r TAG_BETA
echo  # (optional) move to a new line
read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r RELEASE
echo  # (optional) move to a new line

if [[ $RELEASE =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  npm --no-git-tag-version --allow-same-version version $VERSION

  # publish
  if [[ $TAG_BETA =~ ^[Yy]$ ]]
  then
    echo "npm publish --tag beta ..."
    npm publish --tag beta
  else
    echo "npm publish"
    npm publish
  fi

  echo  # (optional) move to a new line
  echo "npm publish success!!!"
  echo  # (optional) move to a new line
  read -p "Async git - are you sure? (y/n)" -n 1 -r ASYNC_GIT
  echo  # (optional) move to a new line

  # async git
  if [[ $ASYNC_GIT =~ ^[Yy]$ ]]
  then
    echo "git push ..."
    npm version $VERSION --allow-same-version --force --message "chore: [release] $VERSION"
    git push
    git push origin --tags
  else
    echo "Not async git"
  fi
fi
