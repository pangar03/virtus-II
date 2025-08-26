import data from '../data/dem.json' with { type: 'json' };

const parametros = data.DEM;
const monitor = document.getElementById('mission-monitor');
let status = "Incompleta";
const reportes = localStorage.getItem('dem') ? JSON.parse(localStorage.getItem('dem')) : [];

const renderExperiment = () => {
    monitor.innerHTML = `
        <h1>Bienvenidos a la División de Medicina Extraterrestre - DME</h1>
        <h1>ScienOS v22.2.1</h1>
        <h2>Objetivo de la misión: ${parametros.mission}</h2>
        <h2>Estado de la misión: ${status}</h2>
        <h3>Para realizar el experimento, añade las variables necesarias y haz clic en "Iniciar Experimento".</h3>
        <form id="experiment-form">
            <label for="temperature">Temperatura (°C)</label>
            <input type="number" id="temperature" name="temp_c" placeholder="Temperatura" min="-273" value="0">
            <label for="silvatos">Silvatos (mL)</label>
            <input type="number" id="silvatos" name="Silvatos" placeholder="Cantidad de Silvatos" min="0" value="0">
            <label for="ixetornifin">Ixetornifin (uL)</label>
            <input type="number" id="ixetornifin" name="Ixetornifin" placeholder="Cantidad de Ixetornifin" min="0" value="0">
            <label for="ambar">Tiempo de exposición a Luz ámbar (min)</label>
            <input type="number" id="ambar" name="amber_light_min" placeholder="Tiempo de exposición" min="0" value="0">
            <label for="iron">Porcentaje de hierro (%)</label>
            <input type="number" id="iron" name="iron_pct" placeholder="Porcentaje de hierro" min="0" value="0">
            <button type="submit">Iniciar Experimento</button>
        </form>
        <button id="cancel-button">Cancelar</button>
    `;

    document.getElementById('cancel-button').addEventListener('click', () => { renderDashboard(); });

    const experimentForm = document.getElementById('experiment-form');

    experimentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(experimentForm);
        const variables = {};
        formData.forEach((value, key) => {
            variables[key] = Number(value);
        });
        renderExecution(variables);
        localStorage.setItem('dem', JSON.stringify(reportes));
    });
};

const renderExecution = (variables) => {
    let timer = 180;
    const interval = setInterval(() => {
        monitor.innerHTML = `
        <h1>Ejecutando el experimento...</h1>
        <h2>Tiempo restante: ${timer} segundos</h2>
        `;
        timer--;
        if (timer < 0) {
            clearInterval(interval);    
            alert("El experimento ha finalizado.");
            reportes.push({try: reportes.length + 1, result: checkResult(variables)});
            renderDashboard();
        }
    }, 1000);
}

const renderDashboard = () => {
    monitor.innerHTML = `
        <h1>Bienvenidos a la División de Medicina Extraterrestre - DME</h1>
        <h1>ScienOS v22.2.1</h1>
        <h2>Objetivo de la misión: ${parametros.mission}</h2>
        <h2>Estado de la misión: ${status}</h2>
        <div id="options">
            <button id="report-button">Revisar reportes</button>
            <button id="experiment-button">Iniciar Experimento</button>
        </div>
    `;

    document.getElementById('report-button').addEventListener('click', renderReports);
    document.getElementById('experiment-button').addEventListener('click', renderExperiment);
}

const renderReports = () => {
    monitor.innerHTML = `
        <h1>Bienvenidos a la División de Medicina Extraterrestre - DME</h1>
        <h1>ScienOS v22.2.1</h1>
        <h2>Objetivo de la misión: ${parametros.mission}</h2>
        <h2>Estado de la misión: ${status}</h2>
        <ul id="reports"></ul>
        <button id="cancel-button">Cancelar</button>
    `;

    document.getElementById('cancel-button').addEventListener('click', () => { renderDashboard(); });

    reportes.forEach((report) => {
        const li = document.createElement('li');
        li.textContent = `Intento ${report.try}: ${report.result}`;
        document.getElementById('reports').appendChild(li);
    });
}

const checkResult = (input) => {
    const rules = parametros.rules;

    for (let rule of rules) {
        let success = true;
        for (let variable in rule.conditions) {
            let condition = rule.conditions[variable];
            let value = input[variable];

            // Rango numérico
            if (condition.min !== undefined && value < condition.min) success = false;
            if (condition.max !== undefined && value > condition.max) success = false;

            // Igualdad exacta (ej: light: "low")
            if (typeof condition === "string" && condition !== value) success = false;
        }

        if (success){
            if(rule.success) status = "Completada";
            return rule.result
        }
    }
    return "El experimento no mostró resultados concluyentes.";
}

renderDashboard();
