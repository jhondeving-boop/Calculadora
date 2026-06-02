#!/usr/bin/env bash

# Exit on error
set -e

echo "=== RapidCalc Uninstaller for Arch Linux ==="

echo "Removing binary from /usr/local/bin..."
sudo rm -f /usr/local/bin/rapidcalc

echo "Removing desktop entry..."
sudo rm -f /usr/share/applications/rapidcalc.desktop

echo "Removing icons..."
sudo rm -f /usr/share/icons/hicolor/128x128/apps/rapidcalc.png
sudo rm -f /usr/share/pixmaps/rapidcalc.png

echo "Removing configuration templates..."
sudo rm -rf /usr/share/rapidcalc

# Clean Hyprland configuration rules
REAL_USER=${SUDO_USER:-$USER}
REAL_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)
HYPR_CONF="$REAL_HOME/.config/hypr/hyprland.conf"

if [ -f "$HYPR_CONF" ]; then
    echo "Removing RapidCalc window rules from $HYPR_CONF..."
    sed -i '/# === RAPIDCALC HYPRLAND RULES START ===/,/# === RAPIDCALC HYPRLAND RULES END ===/d' "$HYPR_CONF"
    
    # Reload hyprland configuration if active
    if command -v hyprctl >/dev/null 2>&1; then
        echo "Reloading Hyprland configuration..."
        sudo -u "$REAL_USER" XDG_RUNTIME_DIR="/run/user/$(id -u "$REAL_USER")" hyprctl reload || true
    fi
fi

# Update icon cache
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi

echo "--------------------------------------------------"
echo "RapidCalc uninstalled successfully and system is clean!"
echo "--------------------------------------------------"
