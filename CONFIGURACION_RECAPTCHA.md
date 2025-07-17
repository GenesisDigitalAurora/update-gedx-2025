# Configuración de Google reCAPTCHA

## Implementación realizada

Se ha implementado Google reCAPTCHA v2 en el formulario de contacto del sitio web. La implementación incluye:

### Cambios realizados:

1. **HTML (index.html)**:
   - Agregado script de Google reCAPTCHA en el `<head>`
   - Agregado widget reCAPTCHA en el formulario de contacto

2. **JavaScript (js/main.js)**:
   - Validación de reCAPTCHA antes del envío del formulario
   - Inclusión de token reCAPTCHA en datos enviados al servidor
   - Reset automático del reCAPTCHA en caso de error

3. **CSS (css/components.css)**:
   - Estilos responsivos para el widget reCAPTCHA
   - Centrado y escalado para diferentes tamaños de pantalla

## Configuración necesaria:

### 1. Obtener las claves de reCAPTCHA

1. Ve a [Google reCAPTCHA](https://www.google.com/recaptcha/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Admin Console" 
4. Crea un nuevo sitio con estos datos:
   - **Etiqueta**: GEDX Website
   - **Tipo de reCAPTCHA**: reCAPTCHA v2 ("No soy un robot")
   - **Dominios**: 
     - gedx.com.mx
     - www.gedx.com.mx
     - localhost (para testing)
   - **Propietarios**: agrega tu email

### 2. Configurar las claves

Una vez creado el sitio, obtendrás:
- **Clave del sitio** (Site Key): Para el frontend
- **Clave secreta** (Secret Key): Para el backend

### 3. Actualizar el código

**En index.html, línea 427:**
```html
<div class="g-recaptcha" data-sitekey="TU_SITE_KEY_AQUI"></div>
```

Reemplaza `TU_SITE_KEY_AQUI` con tu clave del sitio.

### 4. Validación del servidor

El formulario ahora envía el token reCAPTCHA al servidor. Tu backend debe validar este token:

```javascript
// Ejemplo de validación en Node.js
const recaptchaToken = req.body.recaptcha;
const secretKey = 'TU_SECRET_KEY_AQUI';

const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${recaptchaToken}`
});

const data = await response.json();

if (!data.success) {
    // reCAPTCHA fallido
    return res.status(400).json({ error: 'reCAPTCHA verification failed' });
}
```

### 5. Características implementadas

- **Validación frontend**: No permite enviar el formulario sin completar reCAPTCHA
- **Reset automático**: El reCAPTCHA se resetea automáticamente en caso de error
- **Diseño responsivo**: Se adapta a diferentes tamaños de pantalla
- **Integración visual**: Diseño integrado con el estilo del sitio

### 6. Testing

Para probar la implementación:

1. Reemplaza la site key en el HTML
2. Abre el sitio en un navegador
3. Completa el formulario de contacto
4. Verifica que el reCAPTCHA aparezca correctamente
5. Intenta enviar sin completar el reCAPTCHA (debería mostrar error)
6. Completa el reCAPTCHA y envía (debería funcionar)

### 7. Consideraciones adicionales

- El reCAPTCHA es visible y funcional solo en dominios registrados
- En desarrollo local, usa "localhost" como dominio registrado
- La clave secreta debe mantenerse segura en el servidor
- Considera implementar rate limiting adicional para mayor seguridad

### 8. Personalización

Si necesitas cambiar la apariencia:
- Modifica los estilos en `css/components.css` (líneas 1305-1327)
- Puedes cambiar el tema del reCAPTCHA agregando `data-theme="dark"` al div
- Puedes cambiar el tamaño con `data-size="compact"`

### 9. Soporte

Para problemas comunes:
- Verifica que la site key sea correcta
- Asegúrate de que el dominio esté registrado
- Comprueba que la validación del servidor funcione
- Revisa la consola del navegador para errores de JavaScript 