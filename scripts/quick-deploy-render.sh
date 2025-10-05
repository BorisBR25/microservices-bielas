#!/bin/bash

# Script de deploy rápido a Render
# Asegúrate de haber configurado tu repositorio Git y tener acceso a Render

echo "🚀 Preparando deployment a Render..."
echo ""

# Verificar si estamos en un repositorio git
if [ ! -d .git ]; then
    echo "❌ Error: No estás en un repositorio Git"
    echo "Ejecuta primero: git init"
    exit 1
fi

# Mostrar estado actual
echo "📊 Estado actual del repositorio:"
git status --short
echo ""

# Preguntar si quiere hacer commit
read -p "¿Deseas hacer commit de los cambios? (s/n): " do_commit
if [ "$do_commit" = "s" ]; then
    read -p "Mensaje del commit: " commit_msg
    git add .
    git commit -m "$commit_msg"
    echo "✅ Commit realizado"
fi

# Verificar si hay remote configurado
if ! git remote | grep -q "origin"; then
    echo ""
    echo "⚠️  No hay remote 'origin' configurado"
    read -p "Ingresa la URL de tu repositorio GitHub: " repo_url
    git remote add origin "$repo_url"
    echo "✅ Remote agregado"
fi

# Push
echo ""
echo "📤 Subiendo cambios a GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Código subido exitosamente a GitHub"
    echo ""
    echo "🎯 Próximos pasos:"
    echo "1. Ve a https://render.com"
    echo "2. Inicia sesión o crea una cuenta"
    echo "3. Click en 'New +' → 'Blueprint'"
    echo "4. Conecta tu repositorio GitHub"
    echo "5. Render detectará automáticamente render.yaml"
    echo "6. Click en 'Apply'"
    echo ""
    echo "⏳ El deployment tomará aproximadamente 10-15 minutos"
    echo ""
    echo "📚 Una vez completado, tu Swagger estará en:"
    echo "   https://api-gateway-XXXXX.onrender.com/api/docs"
    echo ""
    echo "⚠️  IMPORTANTE: Después del primer deploy, actualiza las URLs"
    echo "   de los servicios en las variables de entorno de cada servicio"
    echo "   (ver RENDER_DEPLOYMENT.md para más detalles)"
else
    echo ""
    echo "❌ Error al subir código a GitHub"
    echo "Verifica tu conexión y credenciales"
    exit 1
fi
