# openwrt 下配置 updpxy

以下配置需要将你的 openwrt 接入到光猫上支持 IPTV 的 LAN 口。

## 1. 安装 updpxy

```bash
opkg update
opkg install udpxy

uci set udpxy.@udpxy[0].disabled='0'
uci set udpxy.@udpxy[0].respawn='1'
uci set udpxy.@udpxy[0].bind='br-lan'
uci set udpxy.@udpxy[0].source='wan'
uci set udpxy.@udpxy[0].port='23234'
uci set udpxy.@udpxy[0].max_clients='3'
uci set udpxy.@udpxy[0].status='1'
uci commit udpxy
```

## 2. 启动 updpxy 和 wan 口防火墙规则

```bash
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-IPTV-Multicast-to-udpxy'
uci set firewall.@rule[-1].src='wan'
uci set firewall.@rule[-1].family='ipv4'
uci set firewall.@rule[-1].proto='udp'
uci set firewall.@rule[-1].dest_ip='239.0.0.0/8'
uci set firewall.@rule[-1].target='ACCEPT'
uci commit firewall
/etc/init.d/firewall reload

/etc/init.d/udpxy enable
/etc/init.d/udpxy restart
```

注意这里防火墙中的 `dest_ip` 是组播地址段，可能需要根据实际情况修改。