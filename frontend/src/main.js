import './style.css';
import './app.css';
import { EventsOn } from '../wailsjs/runtime/runtime';
import { StartSimulation, StopSimulation, IsRunning } from '../wailsjs/go/main/App';

const getImageUrl = (philosopher, state) => {
    return new URL(`./assets/images/${philosopher}_${state}.png`, import.meta.url).href;
};

document.querySelector('#app').innerHTML = `
    <h2 class="main-title">PROBLEMA CLÁSICO - CENA DE LOS FILÓSOFOS</h2>
    <div class="container">
      <div class="canvas" id="canvas">
        <div class="circle-table">
            <div id="plates-layer" class="layer"></div>
            <div id="forks-layer" class="layer"></div>
        </div>
        <div id="philosophers-layer" class="layer"></div>
      </div>
      
      <div class="controls">
        <div class="legend">
          <div class="legend-item"><div class="dot" style="background: var(--blue)"></div> Pensando</div>
          <div class="legend-item"><div class="dot" style="background: var(--yellow)"></div> Hambriento</div>
          <div class="legend-item"><div class="dot" style="background: var(--green)"></div> Comiendo</div>
          <div class="legend-item"><div class="dot" style="background: var(--red)"></div> Deadlock</div>
        </div>
        
        <button class="btn-run" id="btnStart">INICIAR SIMULACIÓN</button>
        <button class="btn-reset" onclick="location.reload()" style="background: #4b5563; color: white;">RESETEAR</button>
        
        <div class="history-container">
          <p style="margin: 5px 0; font-size: 0.9rem; font-weight: bold; color: var(--blue);">HISTORIAL:</p>
          <div id="log"></div>
        </div>
      </div>
    </div>
`;

const btnStart = document.getElementById('btnStart');
const philosophersLayer = document.getElementById('philosophers-layer');
const platesLayer = document.getElementById('plates-layer');
const forksLayer = document.getElementById('forks-layer');
const log = document.getElementById('log');

let simulationRunning = false;
let previousStates = {};
let previousForks = [-1, -1, -1, -1, -1];

function addHistory(msg, color = "#00ff00") {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.style.borderLeftColor = color;
    entry.innerHTML = `<span style="color: ${color}">${msg}</span>`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function initUI() {
    const NUM_PHILOSOPHERS = 5;

    const philosopherRadius = 240;
    const plateRadius = 130;
    const forkRadius = 130;

    philosophersLayer.innerHTML = '';
    platesLayer.innerHTML = '';
    forksLayer.innerHTML = '';

    for (let i = 0; i < NUM_PHILOSOPHERS; i++) {
        const angle = (i * 2 * Math.PI) / NUM_PHILOSOPHERS - Math.PI / 2;

        const px = Math.cos(angle) * philosopherRadius;
        const py = Math.sin(angle) * philosopherRadius;

        const pElem = document.createElement('div');
        pElem.className = 'phil Pensando';
        pElem.id = `philosopher-${i}`;
        pElem.style.transform = `translate(${px}px, ${py}px)`;

        pElem.innerHTML = `
            <img id="img-phil-${i}" src="" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzMzMyIvPjwvc3ZnPg=='" />
            <div class="name-badge" id="name-phil-${i}">Filósofo ${i}</div>
        `;
        philosophersLayer.appendChild(pElem);

        const plateX = Math.cos(angle) * plateRadius;
        const plateY = Math.sin(angle) * plateRadius;

        const plateElem = document.createElement('div');
        plateElem.className = 'plate';
        plateElem.id = `plate-${i}`;
        plateElem.style.transform = `translate(${plateX}px, ${plateY}px)`;

        plateElem.innerHTML = `
            <div class="spaghetti">
                <svg viewBox="0 0 100 100" class="spaghetti-svg">
                    <path d="M30,50 Q40,30 50,50 T70,50 Q60,70 50,50 T30,50" stroke="#f4d03f" fill="none" stroke-width="3" stroke-linecap="round"/>
                    <path d="M40,40 Q50,20 60,40 T80,40" stroke="#f4d03f" fill="none" stroke-width="3" stroke-linecap="round"/>
                    <path d="M20,60 Q30,40 40,60 T60,60" stroke="#f4d03f" fill="none" stroke-width="3" stroke-linecap="round"/>
                    <path d="M35,65 Q45,55 55,75 T75,55" stroke="#f4d03f" fill="none" stroke-width="3" stroke-linecap="round"/>
                    <path d="M45,35 Q55,45 65,25 T85,45" stroke="#f4d03f" fill="none" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
        `;
        platesLayer.appendChild(plateElem);

        const forkAngle = angle + Math.PI / NUM_PHILOSOPHERS;
        const fx = Math.cos(forkAngle) * forkRadius;
        const fy = Math.sin(forkAngle) * forkRadius;

        const fElem = document.createElement('div');
        fElem.className = 'chopstick-container';
        fElem.id = `fork-${i}`;

        const rotation = (forkAngle * 180 / Math.PI) + 90;
        fElem.dataset.fx = fx;
        fElem.dataset.fy = fy;
        fElem.dataset.rot = rotation;

        fElem.style.transform = `translate(${fx}px, ${fy}px) rotate(${rotation}deg)`;

        fElem.innerHTML = `
            <div class="chopstick single"></div>
        `;
        forksLayer.appendChild(fElem);
    }
}

function updateUI(state) {
    if (!state) return;

    simulationRunning = state.running;
    if (simulationRunning) {
        btnStart.className = 'btn-danger';
        btnStart.textContent = 'DETENER SIMULACIÓN';
    } else {
        btnStart.className = 'btn-run';
        btnStart.textContent = 'INICIAR SIMULACIÓN';
    }

    const stateLabels = {
        'thinking': 'Pensando',
        'hungry': 'Hambriento',
        'eating': 'Comiendo'
    };

    const colors = {
        'thinking': 'var(--blue)',
        'hungry': 'var(--yellow)',
        'eating': 'var(--green)'
    };

    state.philosophers.forEach((p, index) => {
        const pElem = document.getElementById(`philosopher-${index}`);
        const pImg = document.getElementById(`img-phil-${index}`);
        const pName = document.getElementById(`name-phil-${index}`);
        const plateElem = document.getElementById(`plate-${index}`);

        if (pElem && plateElem) {
            pName.textContent = p.name;

            const translatedState = stateLabels[p.stateStr] || p.stateStr;
            pElem.className = `phil ${translatedState}`;

            if (p.stateStr === 'eating') {
                plateElem.classList.add('eating-plate');
            } else {
                plateElem.classList.remove('eating-plate');
            }

            try {
                pImg.src = getImageUrl(p.fileName, p.stateStr);
            } catch (e) { }

            if (previousStates[index] !== p.stateStr) {
                if (previousStates[index]) {
                    addHistory(`${p.name} está ${translatedState.toUpperCase()}`, colors[p.stateStr]);
                }
                previousStates[index] = p.stateStr;
            }
        }
    });

    state.forks.forEach((ownerId, index) => {
        const forkElem = document.getElementById(`fork-${index}`);
        if (forkElem) {
            const fx = parseFloat(forkElem.dataset.fx);
            const fy = parseFloat(forkElem.dataset.fy);
            const rot = parseFloat(forkElem.dataset.rot);

            if (ownerId !== -1) {
                const ownerAngle = (ownerId * 2 * Math.PI) / 5 - Math.PI / 2;
                const plateRadius = 130;

                const plateX = Math.cos(ownerAngle) * plateRadius;
                const plateY = Math.sin(ownerAngle) * plateRadius;

                const newRot = (ownerAngle * 180 / Math.PI) + 90;
                const perpAngle = ownerAngle + Math.PI / 2;
                const spacing = 8;

                let offsetX = 0;
                let offsetY = 0;

                if (index === ownerId) {
                    offsetX = Math.cos(perpAngle) * spacing;
                    offsetY = Math.sin(perpAngle) * spacing;
                } else {
                    offsetX = -Math.cos(perpAngle) * spacing;
                    offsetY = -Math.sin(perpAngle) * spacing;
                }

                const newFx = plateX + offsetX;
                const newFy = plateY + offsetY;

                forkElem.style.transform = `translate(${newFx}px, ${newFy}px) rotate(${newRot}deg) scale(1)`;
                forkElem.classList.add('active');

                if (previousForks[index] !== ownerId) {
                    addHistory(`${state.philosophers[ownerId]?.name} tomó el palillo ${index}`, '#aaa');
                }
            } else {
                forkElem.style.transform = `translate(${fx}px, ${fy}px) rotate(${rot}deg) scale(1)`;
                forkElem.classList.remove('active');

                if (previousForks[index] !== -1 && previousForks[index] !== undefined) {
                    addHistory(`${state.philosophers[previousForks[index]]?.name} liberó el palillo ${index}`, '#666');
                }
            }
            previousForks[index] = ownerId;
        }
    });
}

btnStart.addEventListener('click', async () => {
    try {
        const isCurrentlyRunning = await IsRunning();
        if (isCurrentlyRunning) {
            addHistory("KERNEL: Deteniendo hilos...", "var(--red)");
            await StopSimulation();
        } else {
            addHistory("KERNEL: Hilos iniciados.", "var(--blue)");
            await StartSimulation();
        }
    } catch (e) {
        console.error("Failed to toggle simulation:", e);
    }
});

EventsOn("simulation:update", (state) => {
    updateUI(state);
});

initUI();
IsRunning().then(running => {
    simulationRunning = running;
});
