#!/usr/bin/env bash

# Exit on error
set -e

echo "=== RapidCalc Installer for Arch Linux ==="

# 1. Verify Arch Linux
if [ ! -f /etc/arch-release ]; then
    echo "Warning: This script is optimized for Arch Linux. Proceeding anyway..."
fi

# 2. Check and install system-level build/runtime dependencies
echo "Checking required system dependencies via pacman..."
MISSING_DEPS=()
for dep in webkit2gtk-4.1 libsoup3 gtk3 libnm openssl sqlite; do
    if ! pacman -Qi "$dep" >/dev/null 2>&1; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo "The following dependencies are missing: ${MISSING_DEPS[*]}"
    echo "Installing missing dependencies..."
    sudo pacman -S --needed --noconfirm "${MISSING_DEPS[@]}"
else
    echo "All system dependencies are already installed."
fi

# 3. Check for development tools
for cmd in node npm cargo; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Error: '$cmd' is not installed. Please install it to build RapidCalc."
        exit 1
    fi
done

# 4. Install Node dependencies and build
echo "Installing project Node.js dependencies..."
npm install

echo "Building RapidCalc in production/release mode..."
npm run tauri:build

# 5. Determine binary location
BIN_PATH="src-tauri/target/release/rapidcalc"
if [ ! -f "$BIN_PATH" ]; then
    BIN_PATH="src-tauri/target/release/RapidCalc"
fi

if [ ! -f "$BIN_PATH" ]; then
    # Fallback search for compiled binary
    FOUND_BIN=$(find src-tauri/target/release -maxdepth 1 -type f -executable -not -name "*.d" -not -name "*.so" | head -n 1)
    if [ -n "$FOUND_BIN" ]; then
        BIN_PATH="$FOUND_BIN"
    else
        echo "Error: Compiled binary not found."
        exit 1
    fi
fi

echo "Binary found at: $BIN_PATH"

# 6. Install files system-wide
echo "Installing binary to /usr/local/bin..."
sudo cp "$BIN_PATH" /usr/local/bin/rapidcalc
sudo chmod +x /usr/local/bin/rapidcalc

# Install desktop entry
echo "Installing desktop entry to /usr/share/applications..."
sudo mkdir -p /usr/share/applications
sudo tee /usr/share/applications/rapidcalc.desktop > /dev/null <<EOF
[Desktop Entry]
Name=RapidCalc
Comment=Calculadora moderna y de alto rendimiento (Rust/Svelte)
Exec=/usr/local/bin/rapidcalc
Icon=rapidcalc
Terminal=false
Type=Application
Categories=Utility;Calculator;
StartupWMClass=rapidcalc
EOF

# Install icons
echo "Installing application icons..."
sudo mkdir -p /usr/share/icons/hicolor/128x128/apps
sudo cp src-tauri/icons/128x128.png /usr/share/icons/hicolor/128x128/apps/rapidcalc.png
sudo mkdir -p /usr/share/pixmaps
sudo cp src-tauri/icons/icon.png /usr/share/pixmaps/rapidcalc.png

# Update icon cache
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi

# 7. Hyprland configuration
echo "Installing Hyprland configuration template..."
sudo mkdir -p /usr/share/rapidcalc
sudo cp hyprland-rapidcalc.conf /usr/share/rapidcalc/

# Detect actual user's home directory (resolves issue when running under sudo)
REAL_USER=${SUDO_USER:-$USER}
REAL_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)
HYPR_CONF="$REAL_HOME/.config/hypr/hyprland.conf"

if [ -f "$HYPR_CONF" ]; then
    echo "Hyprland configuration detected for user '$REAL_USER' at: $HYPR_CONF"
    # Clean previous rules if exist
    sed -i '/# === RAPIDCALC HYPRLAND RULES START ===/,/# === RAPIDCALC HYPRLAND RULES END ===/d' "$HYPR_CONF"
    
    # Append the rules
    echo "Appending window rules to $HYPR_CONF..."
    cat << 'EOF' >> "$HYPR_CONF"

# === RAPIDCALC HYPRLAND RULES START ===
# Reglas para RapidCalc (Calculadora) en Hyprland
windowrulev2 = float, title:^(RapidCalc)$
windowrulev2 = pin, title:^(RapidCalc)$
windowrulev2 = alwaysontop, title:^(RapidCalc)$
windowrulev2 = workspace, special, title:^(RapidCalc)$
windowrulev2 = float, class:^(calculator-tauri-svelte)$
windowrulev2 = pin, class:^(calculator-tauri-svelte)$
windowrulev2 = alwaysontop, class:^(calculator-tauri-svelte)$
windowrulev2 = move 78% 60%, title:^(RapidCalc)$
windowrulev2 = size 340 520, title:^(RapidCalc)$
windowrulev2 = noblur, title:^(RapidCalc)$
windowrulev2 = noshadow, title:^(RapidCalc)$
windowrulev2 = focusonactivate off, title:^(RapidCalc)$
# === RAPIDCALC HYPRLAND RULES END ===
EOF
    
    # Reload hyprland configuration if active
    if command -v hyprctl >/dev/null 2>&1; then
        echo "Reloading Hyprland configuration..."
        sudo -u "$REAL_USER" XDG_RUNTIME_DIR="/run/user/$(id -u "$REAL_USER")" hyprctl reload || true
    fi
else
    echo "Hyprland config not found at $HYPR_CONF. Skipping automatic rules injection."
fi

echo "--------------------------------------------------"
echo "RapidCalc installed successfully!"
echo "You can launch it by running 'rapidcalc' or from your application launcher."
if [ -f "$HYPR_CONF" ]; then
    echo "Hyprland window rules have been automatically added to your config!"
else
    echo "If you use Hyprland, manually apply the rules in /usr/share/rapidcalc/hyprland-rapidcalc.conf."
fi
echo "--------------------------------------------------"
