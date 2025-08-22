import data from '../data/ddir.json' with { type: 'json' };

const parametros = data.DDIR;
const monitor = document.getElementById('mission-monitor');
let status = "Incompleta";
const reportes = localStorage.getItem('ddir') ? JSON.parse(localStorage.getItem('ddir')) : [];

const renderExperiment = () => {
    monitor.innerHTML = `
        <h1>Bienvenidos a la División de Desarrollo e Innovación Robótica - DDIR</h1>
        <h1>ScienOS v22.2.1</h1>
        <h2>Objetivo de la misión: ${parametros.mission}</h2>
        <h2>Estado de la misión: ${status}</h2>
        <h3>Para realizar el experimento, añade las variables necesarias y haz clic en "Iniciar Experimento".</h3>
        <form id="experiment-form">
            <label for="battery_large_count">Baterías Grandes (qty)</label>
            <input type="number" id="battery_large_count" name="battery_large_count" placeholder="Número de baterias" min="0" max="2" value="0">
            <label for="battery_small_count">Baterías Pequeñas (qty)</label>
            <input type="number" id="battery_small_count" name="battery_small_count" placeholder="Número de baterias" min="0" max="2" value="0">
            <label for="sensor">Porcentaje de activación del sensor (%)</label>
            <input type="number" id="sensor" name="sensors_pct" placeholder="Porcentaje de activación" min="0" max="100" value="0">
            <label for="pattern">Patrón de movimiento (ZigZag/Recto)</label>
            <select id="pattern" name="pattern">
                <option value="zigzag">ZigZag</option>
                <option value="recto">Recto</option>
            </select>
            <label for="terrain">Tipo de terreno (Suave/Duro)</label>
            <select id="terrain" name="terrain">
                <option value="soft">Suave</option>
                <option value="rough">Duro</option>
            </select>
            <button type="submit">Iniciar Experimento</button>
        </form>
        <button id="cancel-button">Cancelar</button>
    `;

    document.getElementById('cancel-button').addEventListener('click', () => { renderDashboard(); });

    const experimentForm = document.getElementById('experiment-form');

    experimentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(experimentForm);
        let variables = {};
        formData.forEach((value, key) => {
            variables[key] = Number(value) || String(value);
        });
        alert("Se ha iniciado un experimento, por favor espera 1 minuto para ver los resultados.");
        renderExecution();
        reportes.push({try: reportes.length + 1, result: checkResult(variables)});
        localStorage.setItem('ddir', JSON.stringify(reportes));
    });
};

const renderExecution = () => {
    let timer = 3;
    const interval = setInterval(() => {
        monitor.innerHTML = `
            <h1>Ejecutando el experimento...</h1>
            <h2>Tiempo restante: ${timer} segundos</h2>
        `;
        timer--;
        if (timer < 0) {
            clearInterval(interval);    
            alert("El experimento ha finalizado.");
            renderDashboard();
        }
    }, 1000);
}

const renderDashboard = () => {
    monitor.innerHTML = `
        <h1>Bienvenidos a la División de Desarrollo e Innovación Robótica - DDIR</h1>
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
        <h1>Bienvenidos a la División de Desarrollo e Innovación Robótica - DDIR</h1>
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
