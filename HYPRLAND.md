# RapidCalc - Modo Zen y Always on Top en Hyprland

Para que la calculadora funcione como el modo **Picture-in-Picture (PiP) de Zen Browser**, se han mejorado las reglas y la integración.

## Nuevas Reglas de Hyprland (Recomendado)

Agrega estas reglas a tu `hyprland.conf` para que la calculadora aparezca siempre flotante, en todos los workspaces y en la esquina inferior derecha:

```bash
# RapidCalc - Reglas tipo Picture-in-Picture
windowrulev2 = float, class:^(calculator-tauri-svelte|RapidCalc)$
windowrulev2 = pin, class:^(calculator-tauri-svelte|RapidCalc)$
windowrulev2 = alwaysontop, class:^(calculator-tauri-svelte|RapidCalc)$
windowrulev2 = move 78% 60%, class:^(calculator-tauri-svelte|RapidCalc)$
windowrulev2 = size 340 520, class:^(calculator-tauri-svelte|RapidCalc)$
```

## Mejoras Realizadas:

1.  **Modo Zen (PiP):** Ahora puedes presionar el ícono de "cuadrito" (PiP) en la cabecera para encoger la calculadora, ocultar el teclado y dejar solo el resultado visible.
2.  **Pineado Automático:** La aplicación intenta usar `hyprctl` para fijarse en todos los workspaces al iniciar.
3.  **Sticky Window:** Al activar el ícono de "pin", la ventana se mantendrá visible aunque cambies de escritorio virtual.

## Solución de Problemas:

Si la ventana no se queda en todos los workspaces o no flota automáticamente:

1.  **Verificar Clase y Título:** Ejecuta este comando mientras la calculadora está abierta:
    ```bash
    hyprctl clients | grep -A 10 "RapidCalc"
    ```
    Busca la línea `class: ...` y asegúrate de que coincida con una de las reglas en `hyprland-rapidcalc.conf`.
    
2.  **Activar Manualmente:** Si el botón de la interfaz falla, puedes forzar el "pin" manualmente desde la terminal para probar:
    ```bash
    hyprctl dispatch setfloating active
    hyprctl dispatch pin active
    ```

3.  **Asegurar hyprctl:** La aplicación depende de `hyprctl` para comunicarse con Hyprland. Asegúrate de que esté en tu `$PATH`.

## Recargar configuración:
```bash
hyprctl reload
```