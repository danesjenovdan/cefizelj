#!/usr/bin/env bash

shopt -s globstar

for f in **/*.{html,css,js}
do
  envsubst '$COMMIT_SHA' < $f > $f.tmp
  mv $f.tmp $f
done
