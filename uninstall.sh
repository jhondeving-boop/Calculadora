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

# Update icon cache
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi

echo "--------------------------------------------------"
echo "RapidCalc uninstalled successfully and system is clean!"
echo "--------------------------------------------------"
