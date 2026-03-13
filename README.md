# 🚀 LocalBoost IA - Marketing Content Generator

## 📖 Descripción / Description

**LocalBoost IA** es una aplicación web progresiva (PWA) que utiliza inteligencia artificial para generar contenido de marketing personalizado para negocios locales. La aplicación crea contenido optimizado para diferentes plataformas de redes sociales, campañas promocionales, newsletters y mucho más.

**LocalBoost IA** is a progressive web application (PWA) that uses artificial intelligence to generate personalized marketing content for local businesses. The app creates optimized content for different social media platforms, promotional campaigns, newsletters, and much more.

## ✨ Características Principales / Key Features

### 🤖 Generación de Contenido IA / AI Content Generation
- **Contenido para Redes Sociales**: Instagram, TikTok, X/Twitter, Facebook
- **Prompts para Gemini IA**: Optimizados para generación de imágenes
- **Sugerencias de Imágenes**: Ideas visuales personalizadas
- **Texto Promocional**: Contenido para ofertas especiales
- **Newsletter**: Emails marketing personalizados
- **Campañas Creativas**: Estrategias de marketing innovadoras

### 🎨 Generador de Imágenes IA / AI Image Generator
- **Estilos Múltiples**: Realista, Artístico, Cartoon, Minimalista, Vintage
- **Formatos Variados**: Cuadrado, Retrato, Paisaje, Panorámico
- **Contenido Contextual**: Generación basada en tipo de negocio
- **Efectos Visuales**: Iluminación, texturas, filtros profesionales

### 📱 Características PWA / PWA Features
- **Instalación**: Como aplicación nativa
- **Modo Offline**: Funcionalidad básica sin conexión
- **Diseño Responsive**: Perfecta adaptación móvil/desktop
- **Notificaciones**: Sistema de alertas integrado

### 🎯 Tipos de Negocio Soportados / Supported Business Types
- **🍽 Restaurantes/Cafés**: Restaurants/Cafés
- **🛍️ Tiendas Minoristas**: Retail Stores
- **💄 Belleza/Salones**: Beauty/Salons
- **💪 Fitness/Gimnasios**: Fitness/Gyms
- **🥐 Panaderías/Pastelerías**: Bakeries/Pastry Shops
- **🏪 Supermercados**: Grocery Stores
- **💊 Farmacias**: Pharmacies
- **🐕 Tiendas de Mascotas**: Pet Shops
- **🔩 Ferreterías**: Hardware Stores
- **💐 Florerías**: Flower Shops
- **🥩 Carnicerías**: Butcher Shops
- **🐟 Pescaderías**: Fishmongers
- **🍎 Fruterías**: Fruit Stores
- **📝 Papelerías**: Stationery Stores
- **👕 Lavanderías**: Laundries
- **👟 Zapaterías**: Shoe Stores
- **📚 Librerías**: Bookstores
- **🧸 Juguerterías**: Toy Stores
- **💎 Joyerías**: Jewelry Stores
- **👓️ Ópticas**: Optics
- **🏪 Otros**: Other

## 🛠️ Instalación / Installation

### Requisitos / Requirements
- **Navegador Moderno**: Chrome, Firefox, Safari, Edge
- **Conexión a Internet**: Para funcionalidad completa
- **Espacio Almacenamiento**: ~5MB para instalación PWA

### Pasos de Instalación / Installation Steps

1. **Clonar Repositorio**:
   ```bash
   git clone https://github.com/iegidosl-prog/LocalBoost-AI.git
   cd LocalBoost-AI
   ```

2. **Abrir Aplicación**:
   - Doble clic en `index.html`
   - O usar servidor web local

3. **Instalar como PWA**:
   - Abrir en navegador moderno
   - Clic en "Instalar App"
   - Seguir instrucciones del navegador

### Servidor Local / Local Server
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx serve .

# Usando Live Server (VS Code)
# Instalar extensión "Live Server"
# Right click en index.html → "Open with Live Server"
```

## 🚀 Uso / Usage

### Paso 1: Configuración / Configuration
1. **Idioma**: Español, Català, English
2. **Tipo de Negocio**: Seleccionar de la lista
3. **Red Social**: Instagram, TikTok, X/Twitter, Facebook, Todas
4. **Formato**: Automático o específico
5. **Estilo de Comunicación**: Profesional, Casual, Creativo
6. **Productos**: Lista de productos/servicios
7. **Promociones**: Ofertas especiales

### Paso 2: Generación / Generation
1. **Presionar Botón**: "✨ Generate Marketing Content"
2. **Esperar Procesamiento**: ~1 segundo
3. **Ver Resultados**: Contenido generado en cards elegantes

### Paso 3: Utilización / Utilization
- **📋 Copiar Prompts**: Para usar con Gemini IA
- **🖼️ Generar Imágenes**: Con el generador integrado
- **📅 Agendar Contenido**: Con el calendario interactivo
- **📤 Compartir**: Directamente a plataformas

## 🎨 Tecnologías Utilizadas / Technologies Used

### Frontend
- **HTML5**: Semántico y accesible
- **CSS3**: Grid, Flexbox, Animaciones
- **JavaScript ES6+**: Moderno y optimizado
- **PWA**: Service Worker, Manifest

### Diseño y UX
- **Diseño Responsive**: Mobile-first
- **Gradientes Modernos**: Efectos visuales atractivos
- **Animaciones Suaves**: Transiciones fluidas
- **Interfaz Intuitiva**: Fácil navegación

### Algoritmos IA
- **Generación Contextual**: Basada en tipo de negocio
- **Optimización de Contenido**: Adaptable a plataformas
- **Sugerencias Inteligentes**: Recomendaciones personalizadas

## 📁 Estructura del Proyecto / Project Structure

```
LocalBoost-AI/
├── 📄 index.html          # Página principal
├── 🎨 styles.css          # Estilos CSS
├── ⚡ script.js           # Lógica JavaScript
├── 📱 manifest.json       # Configuración PWA
├── 🔧 sw.js              # Service Worker
├── 📖 README.md           # Documentación
└── 🖼️ assets/            # Recursos visuales
    ├── icons/            # Iconos de la app
    └── images/           # Imágenes de muestra
```

## 🌐 Despliegue / Deployment

### GitHub Pages (Recomendado)
1. **Hacer Fork** del repositorio
2. **Activar GitHub Pages**:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
3. **Acceder**: `https://username.github.io/LocalBoost-AI`

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod --dir .
```

## 🔧 Configuración Avanzada / Advanced Configuration

### Personalización de Colores / Color Customization
```css
:root {
    --primary-gradient: linear-gradient(135deg, #6366f1, #a855f7);
    --accent-color: #6366f1;
    --text-primary: #1f2937;
    --text-secondary: #64748b;
}
```

### Configuración de Negocio / Business Configuration
```javascript
// Agregar nuevo tipo de negocio
const businessTypes = {
    'new-business': {
        name: 'New Business Type',
        colors: ['#primary', '#secondary'],
        icon: '🆕'
    }
};
```

## 🐛 Solución de Problemas / Troubleshooting

### Problemas Comunes / Common Issues

**❌ El botón no genera contenido**:
- ✅ **Solución**: Abrir consola del navegador (F12)
- ✅ **Ver logs**: Buscar errores en JavaScript
- ✅ **Verificar campos**: Todos los campos requeridos completos

**❌ Las imágenes no se generan**:
- ✅ **Solución**: Verificar conexión a internet
- ✅ **Limpiar caché**: Ctrl+Shift+R
- ✅ **Intentar otro navegador**

**❌ La app no se instala**:
- ✅ **Solución**: Usar navegador compatible
- ✅ **Verificar HTTPS**: Requiere conexión segura
- ✅ **Limpiar datos**: Configuración del sitio

### Logs de Depuración / Debug Logs
La aplicación incluye logs detallados en la consola:
- 🚀 `generateContent() called` - Botón presionado
- 📋 `Form values:` - Valores del formulario
- ✅ `Validation passed` - Validación correcta
- 🎨 `displayResults() called` - Resultados mostrados

## 🤝 Contribución / Contributing

### ¿Cómo Contribuir? / How to Contribute?
1. **Hacer Fork** del proyecto
2. **Crear Rama**: `git checkout -b feature/amazing-feature`
3. **Hacer Cambios**: Implementar mejoras
4. **Hacer Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Pull Request**: Proponer cambios

### Guía de Estilo / Style Guide
- **Indentación**: 4 espacios
- **Comentarios**: Claros y descriptivos
- **Nomenclatura**: camelCase para JavaScript, kebab-case para CSS
- **Mensajes**: Bilingüe (Español/Inglés)

## 📄 Licencia / License

Este proyecto está bajo la **Licencia MIT** - puedes usarlo, modificarlo y distribuirlo libremente.

## 🙏 Agradecimientos / Acknowledgments

- **OpenAI**: Por inspiración en generación de contenido
- **Google**: Por herramientas de desarrollo web
- **Comunidad**: Por feedback y sugerencias

## 📞 Contacto / Contact

- **GitHub**: [iegidosl-prog](https://github.com/iegidosl-prog)
- **Issues**: [Reportar problemas](https://github.com/iegidosl-prog/LocalBoost-AI/issues)
- **Email**: Para consultas comerciales

---

## 🌟 Demo en Vivo / Live Demo

🔗 **https://iegidosl-prog.github.io/LocalBoost-AI/**

---

<div align="center">
    <p>Hecho con ❤️ para negocios locales</p>
    <p>Made with ❤️ for local businesses</p>
    <p>
        <a href="#top">⬆️ Volver arriba / Back to top</a>
    </p>
</div>