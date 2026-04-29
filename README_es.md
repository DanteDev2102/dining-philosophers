# Simulador del Problema de los Filósofos 🥢

[🇺🇸 English](README.md) | [🇪🇸 Español](README_es.md)

Una simulación gráfica y en tiempo real del clásico **Problema de la Cena de los Filósofos**, construido con **Go** y **Wails v2** (Vanilla JS + Vite).

![Vista previa de la simulación](frontend/src/assets/images/preview.png) *(Marcador de posición)*

## 🧠 El Problema

El problema de la cena de los filósofos es un problema clásico de las ciencias de la computación diseñado por Edsger Dijkstra para ilustrar problemas de sincronización y técnicas para resolverlos en el diseño de algoritmos concurrentes.

**El Escenario:**
Cinco filósofos se sientan alrededor de una mesa circular. Frente a cada filósofo hay un plato de espaguetis. Entre cada par de platos hay un solo palillo.
Un filósofo debe tener **dos palillos** para poder comer (el que está a su izquierda y el que está a su derecha). 
Como solo hay 5 palillos en total, deben compartirlos. Los filósofos alternan entre tres estados:
1. **Pensando** 🔵
2. **Hambriento** 🟡 (Esperando poder adquirir los dos palillos adyacentes)
3. **Comiendo** 🟢 (Sosteniendo ambos palillos)

**El Desafío:**
Si cada filósofo toma el palillo a su derecha en el mismo instante exacto, todos se quedarán esperando para siempre por el palillo de su izquierda. A esto se le conoce como **Interbloqueo (Deadlock)**.

**La Solución Implementada:**
Este simulador evita los interbloqueos (deadlocks) utilizando una **Jerarquía de Recursos**. A cada palillo se le asigna un ID numérico (del 0 al 4). Los filósofos están programados para intentar tomar siempre primero el palillo con el ID más bajo, y luego el de ID más alto. Esto rompe la condición de "espera circular" y garantiza que al menos un filósofo siempre pueda comer.

---

## 🛠️ Requisitos Previos

Antes de poder ejecutar o compilar este proyecto, asegúrate de tener instalado lo siguiente:
- [Go](https://go.dev/doc/install) (versión 1.18 o superior recomendada)
- [Node.js y npm](https://nodejs.org/) (para compilar el frontend con Vite)
- [Wails CLI v2](https://wails.io/docs/gettingstarted/installation)

Puedes instalar la consola de Wails ejecutando:
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

---

## 🚀 Cómo Ejecutar el Simulador (Modo Desarrollo)

1. **Clona o abre** el repositorio en tu terminal.
2. **Añadir Imágenes de los Filósofos:**
   La interfaz gráfica espera tener retratos históricos de los filósofos. Debes colocarlos en el siguiente directorio:
   `frontend/src/assets/images/`
   
   Los nombres de archivo requeridos son:
   - `socrates_thinking.png`, `socrates_hungry.png`, `socrates_eating.png`
   - `platon_thinking.png`, `platon_hungry.png`, `platon_eating.png`
   - `descartes_thinking.png`, `descartes_hungry.png`, `descartes_eating.png`
   - `aristoteles_thinking.png`, `aristoteles_hungry.png`, `aristoteles_eating.png`
   - `pitagoras_thinking.png`, `pitagoras_hungry.png`, `pitagoras_eating.png`
   *(Si falta alguna imagen, se mostrará un avatar gris genérico por defecto).*

3. **Iniciar el servidor de desarrollo:**
   Ejecuta el siguiente comando en la raíz del proyecto:
   ```bash
   wails dev
   ```
   Esto iniciará el proceso de backend en Go y una ventana de frontend que se actualizará automáticamente si haces cambios en el código.

---

## 📦 Cómo Compilar (Producción)

Para compilar la aplicación en un ejecutable independiente que puedas compartir o abrir sin necesidad de la consola:

1. Abre tu terminal en el directorio raíz del proyecto.
2. Ejecuta el comando de compilación:
   ```bash
   wails build
   ```
3. Una vez finalizado, tu ejecutable estará ubicado en el directorio `build/bin/` (por ejemplo, `sistemas-operativos.exe` en Windows). ¡Simplemente haz doble clic sobre él para iniciar el simulador!

---

## 🖥️ Stack Tecnológico
- **Backend:** Go (Goroutines, Mutexes, Channels)
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Framework:** Wails v2, Vite
