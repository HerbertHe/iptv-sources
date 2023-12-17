#!/bin/sh

# 定时构建命令
docker stop iptv-sources && docker rm iptv-sources && docker pull herberthe0229/iptv-sources:latest && docker run --name iptv-sources -p 3000:8080 -d herberthe0229/iptv-sources:latest
