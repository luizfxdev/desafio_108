// Variáveis globais
let routes = [
    // Rotas padrão
    { "origem": "Terra", "destino": "Marte", "tempo": 5 },
    { "origem": "Marte", "destino": "Júpiter", "tempo": 4 },
    { "origem": "Terra", "destino": "Júpiter", "tempo": 15 },
    { "origem": "Júpiter", "destino": "Saturno", "tempo": 3 },
    { "origem": "Marte", "destino": "Saturno", "tempo": 8 }
];

// Elementos do DOM
const calcRouteBtn = document.getElementById('calcRoute');
const resetDataBtn = document.getElementById('resetData');
const resultBox = document.getElementById('resultBox');

// Ouvintes de eventos
document.addEventListener('DOMContentLoaded', () => {
    // Configura os ouvintes de eventos
    calcRouteBtn.addEventListener('click', calculateBestRoute);
    resetDataBtn.addEventListener('click', resetAllData);
});

/**
 * Reseta todos os dados e a interface
 */
function resetAllData() {
    document.getElementById('planetaOrigem').value = '';
    document.getElementById('planetaDestino').value = '';
    resultBox.innerHTML = '<p>Aguardando cálculo da rota...</p>';
    showAlert('Dados resetados com sucesso!', 'success');
}

/**
 * Calcula a melhor rota entre dois planetas
 */
function calculateBestRoute() {
    const startPlanet = document.getElementById('planetaOrigem').value.trim();
    const endPlanet = document.getElementById('planetaDestino').value.trim();

    // Valida os inputs
    if (!startPlanet || !endPlanet) {
        showAlert('Por favor, informe os planetas de origem e destino.');
        return;
    }

    // Verifica se os planetas existem nas rotas
    const allPlanets = getAllPlanets();
    if (!allPlanets.includes(startPlanet)) {
        showAlert(`O planeta de origem "${startPlanet}" não existe nas rotas definidas.`);
        return;
    }

    if (!allPlanets.includes(endPlanet)) {
        showAlert(`O planeta de destino "${endPlanet}" não existe nas rotas definidas.`);
        return;
    }

    // Encontra o caminho mais curto
    const result = dijkstra(startPlanet, endPlanet);

    if (result.shortestTime === Infinity) {
        resultBox.innerHTML = `
        <h3>Resultado:</h3>
        <p>Não há caminho possível entre ${startPlanet} e ${endPlanet}.</p>
      `;
        return;
    }

    // Exibe o resultado
    displayResult(result, startPlanet, endPlanet);
}

/**
 * Algoritmo de Dijkstra para encontrar o caminho mais curto
 */
function dijkstra(startPlanet, endPlanet) {
    // Obtém todos os planetas
    const planets = getAllPlanets();

    // Inicializa distâncias e nós anteriores
    const distances = {};
    const previous = {};
    const unvisited = new Set(planets);

    // Define distâncias iniciais
    planets.forEach(planet => {
        distances[planet] = planet === startPlanet ? 0 : Infinity;
        previous[planet] = null;
    });

    // Loop principal
    while (unvisited.size > 0) {
        // Encontra o planeta não visitado com a menor distância
        let currentPlanet = null;
        let smallestDistance = Infinity;

        unvisited.forEach(planet => {
            if (distances[planet] < smallestDistance) {
                smallestDistance = distances[planet];
                currentPlanet = planet;
            }
        });

        // Se nenhum planeta alcançável for encontrado ou chegamos ao planeta final
        if (currentPlanet === null || currentPlanet === endPlanet) {
            break;
        }

        // Remove o planeta atual dos não visitados
        unvisited.delete(currentPlanet);

        // Encontra todos os vizinhos do planeta atual
        const neighbors = getNeighbors(currentPlanet);

        // Atualiza as distâncias para os vizinhos
        neighbors.forEach(neighbor => {
            const route = routes.find(r =>
                r.origem === currentPlanet && r.destino === neighbor.planet
            );

            if (!route) return;

            const alt = distances[currentPlanet] + route.tempo;
            if (alt < distances[neighbor.planet]) {
                distances[neighbor.planet] = alt;
                previous[neighbor.planet] = currentPlanet;
            }
        });
    }

    // Constrói o caminho
    const path = [];
    let current = endPlanet;

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    // Verifica se um caminho foi encontrado
    if (path.length === 1 && path[0] !== startPlanet) {
        return {
            shortestTime: Infinity,
            path: []
        };
    }

    return {
        shortestTime: distances[endPlanet],
        path: path
    };
}

/**
 * Obtém todos os planetas das rotas
 */
function getAllPlanets() {
    const planetsSet = new Set();

    routes.forEach(route => {
        planetsSet.add(route.origem);
        planetsSet.add(route.destino);
    });

    return Array.from(planetsSet);
}

/**
 * Obtém todos os vizinhos de um planeta
 */
function getNeighbors(planet) {
    const neighbors = [];

    routes.forEach(route => {
        if (route.origem === planet) {
            neighbors.push({
                planet: route.destino,
                time: route.tempo
            });
        }
    });

    return neighbors;
}

/**
 * Exibe o resultado do cálculo do caminho mais curto
 */
function displayResult(result, startPlanet, endPlanet) {
    const { shortestTime, path } = result;

    // Cria a exibição do caminho com setas
    let pathHtml = '';
    if (path.length > 0) {
        pathHtml = '<div class="path-display">';
        path.forEach((planet, index) => {
            pathHtml += `<span>${planet}</span>`;
            if (index < path.length - 1) {
                pathHtml += '<i class="fas fa-arrow-right"></i>';
            }
        });
        pathHtml += '</div>';
    }

    // Calcula os tempos intermediários
    let timeDetails = '';
    if (path.length > 1) {
        timeDetails = '<div class="time-details">';
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const route = routes.find(r => r.origem === from && r.destino === to);
            if (route) {
                timeDetails += `<p>${from} → ${to}: ${route.tempo} horas</p>`;
            }
        }
        timeDetails += '</div>';
    }

    resultBox.innerHTML = `
      <h3>Resultado:</h3>
      <p>Menor tempo de viagem de ${startPlanet} para ${endPlanet}: <strong>${shortestTime} horas</strong></p>
      <h4>Caminho:</h4>
      ${pathHtml}
      <h4>Detalhes:</h4>
      ${timeDetails}
    `;
}

/**
 * Mostra uma mensagem de alerta
 */
function showAlert(message, type = 'error') {
    // Cria elemento de alerta
    const alertEl = document.createElement('div');
    alertEl.className = `alert ${type}`;
    alertEl.textContent = message;

    // Adiciona ao documento
    document.body.appendChild(alertEl);

    // Estiliza o alerta
    alertEl.style.position = 'fixed';
    alertEl.style.top = '20px';
    alertEl.style.left = '50%';
    alertEl.style.transform = 'translateX(-50%)';
    alertEl.style.padding = '12px 20px';
    alertEl.style.borderRadius = '5px';
    alertEl.style.zIndex = '9999';

    if (type === 'error') {
        alertEl.style.backgroundColor = 'rgba(255, 15, 135, 0.9)';
    } else {
        alertEl.style.backgroundColor = 'rgba(15, 240, 252, 0.9)';
    }

    alertEl.style.color = '#fff';
    alertEl.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    alertEl.style.backdropFilter = 'blur(10px)';

    // Remove após 3 segundos
    setTimeout(() => {
        alertEl.style.opacity = '0';
        alertEl.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.removeChild(alertEl);
        }, 500);
    }, 3000);
}