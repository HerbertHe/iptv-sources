#!/bin/bash

pnpm build
pnpm m3u
cp -f ./public/index.* m3u/
