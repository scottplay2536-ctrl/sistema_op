const http = require("http");

const port = process.env.PORT || 3000;

const tasks = [
  { id: 1, phase: "Planificacion", task: "Confirmar Azure como proveedor cloud", owner: "Equipo", priority: "Alta", status: "Completado", evidence: "Resource Group creado" },
  { id: 2, phase: "Planificacion", task: "Usar GitHub Actions para CI/CD", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "Workflow activo" },
  { id: 3, phase: "Planificacion", task: "Usar AKS como orquestador", owner: "DevOps / SRE", priority: "Alta", status: "Completado", evidence: "Cluster AKS creado" },
  { id: 4, phase: "Diseno", task: "Crear diagrama de arquitectura cloud", owner: "Infraestructura TI", priority: "Alta", status: "En proceso", evidence: "Diagrama en README" },
  { id: 5, phase: "Diseno", task: "Crear diagrama CI/CD", owner: "DevOps", priority: "Alta", status: "En proceso", evidence: "Pipeline documentado" },
  { id: 6, phase: "Azure", task: "Crear Resource Group", owner: "Cloud Engineering", priority: "Alta", status: "Completado", evidence: "rg-sistema-op" },
  { id: 7, phase: "Azure", task: "Crear Azure Container Registry", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "acrsistemaop2536" },
  { id: 8, phase: "Azure", task: "Crear cluster Azure Kubernetes Service", owner: "Cloud Engineering", priority: "Alta", status: "Completado", evidence: "aks-sistema-op" },
  { id: 9, phase: "Azure", task: "Conectar AKS con ACR", owner: "Cloud Engineering", priority: "Alta", status: "Completado", evidence: "Imagen descargada por pods" },
  { id: 10, phase: "Azure", task: "Activar Azure Monitor / Container Insights", owner: "SRE", priority: "Alta", status: "Completado", evidence: "ama-logs activo" },
  { id: 11, phase: "Contenedores", task: "Crear Dockerfile", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "Dockerfile en repo" },
  { id: 12, phase: "Contenedores", task: "Construir imagen Docker", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "Build local y CI/CD" },
  { id: 13, phase: "Contenedores", task: "Publicar imagen en ACR", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "Imagen latest en ACR" },
  { id: 14, phase: "Kubernetes", task: "Crear namespace", owner: "DevOps", priority: "Media", status: "Completado", evidence: "devops-demo" },
  { id: 15, phase: "Kubernetes", task: "Crear deployment", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "2 replicas Running" },
  { id: 16, phase: "Kubernetes", task: "Crear service LoadBalancer", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "IP publica activa" },
  { id: 17, phase: "CI/CD", task: "Configurar secrets de Azure en GitHub", owner: "DevOps / Seguridad", priority: "Alta", status: "Completado", evidence: "5 secrets configurados" },
  { id: 18, phase: "CI/CD", task: "Ejecutar pipeline automatico", owner: "DevOps", priority: "Alta", status: "Completado", evidence: "GitHub Actions exitoso" },
  { id: 19, phase: "Seguridad", task: "Asignar permisos minimos para ACR", owner: "Seguridad / Cloud", priority: "Alta", status: "Completado", evidence: "AcrPush asignado" },
  { id: 20, phase: "Documentacion", task: "Agregar capturas de evidencias", owner: "Equipo", priority: "Alta", status: "Pendiente", evidence: "Azure, GitHub, AKS, Monitor" },
  { id: 21, phase: "Documentacion", task: "Exportar documento tecnico PDF", owner: "Equipo", priority: "Alta", status: "Pendiente", evidence: "PDF final" },
  { id: 22, phase: "Presentacion", task: "Preparar demostracion final", owner: "Equipo", priority: "Alta", status: "Pendiente", evidence: "Demo pipeline, AKS y monitoreo" }
];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, html) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function statusClass(status) {
  return status.toLowerCase().replace(" ", "-");
}

function renderPage() {
  const completed = tasks.filter((task) => task.status === "Completado").length;
  const inProgress = tasks.filter((task) => task.status === "En proceso").length;
  const pending = tasks.filter((task) => task.status === "Pendiente").length;
  const progress = Math.round((completed / tasks.length) * 100);
  const phases = [...new Set(tasks.map((task) => task.phase))];

  const phaseRows = phases.map((phase) => {
    const phaseTasks = tasks.filter((task) => task.phase === phase);
    const phaseDone = phaseTasks.filter((task) => task.status === "Completado").length;
    const phaseProgress = Math.round((phaseDone / phaseTasks.length) * 100);

    return `
      <section class="phase">
        <div class="phase-header">
          <div>
            <h2>${phase}</h2>
            <p>${phaseDone} de ${phaseTasks.length} tareas completadas</p>
          </div>
          <span>${phaseProgress}%</span>
        </div>
        <div class="bar"><div style="width: ${phaseProgress}%"></div></div>
      </section>
    `;
  }).join("");

  const taskRows = tasks.map((task) => `
    <tr>
      <td>${task.id}</td>
      <td>${task.phase}</td>
      <td>${task.task}</td>
      <td>${task.owner}</td>
      <td><span class="priority ${task.priority.toLowerCase()}">${task.priority}</span></td>
      <td><span class="status ${statusClass(task.status)}">${task.status}</span></td>
      <td>${task.evidence}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Control de tareas DevOps Azure</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #172033;
      --muted: #667085;
      --line: #d9e1ea;
      --panel: #ffffff;
      --bg: #f4f7fb;
      --blue: #1769aa;
      --green: #1f8a5b;
      --amber: #b7791f;
      --red: #b42318;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--ink);
    }

    header {
      background: #10233f;
      color: #fff;
      padding: 28px 5vw;
      border-bottom: 5px solid #24a0ed;
    }

    header h1 {
      margin: 0 0 8px;
      font-size: clamp(28px, 4vw, 48px);
      letter-spacing: 0;
    }

    header p {
      margin: 0;
      max-width: 860px;
      color: #d6e6f7;
      font-size: 17px;
      line-height: 1.5;
    }

    main {
      width: min(1180px, 90vw);
      margin: 28px auto 42px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }

    .metric, .phase, .table-wrap {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 10px 24px rgba(16, 35, 63, 0.06);
    }

    .metric {
      padding: 18px;
      min-height: 112px;
    }

    .metric span {
      display: block;
      color: var(--muted);
      font-size: 13px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .metric strong {
      display: block;
      margin-top: 10px;
      font-size: 34px;
    }

    .progress-box {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 18px;
    }

    .progress-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
      font-weight: 700;
    }

    .bar {
      width: 100%;
      height: 12px;
      background: #e6edf5;
      border-radius: 999px;
      overflow: hidden;
    }

    .bar div {
      height: 100%;
      background: #1f8a5b;
    }

    .phases {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }

    .phase {
      padding: 16px;
    }

    .phase-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 12px;
    }

    .phase h2 {
      margin: 0 0 4px;
      font-size: 18px;
    }

    .phase p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }

    .phase span {
      font-weight: 800;
      color: var(--blue);
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 980px;
    }

    caption {
      text-align: left;
      padding: 18px;
      font-size: 22px;
      font-weight: 800;
    }

    th, td {
      padding: 13px 14px;
      border-top: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      font-size: 14px;
      line-height: 1.35;
    }

    th {
      background: #eef4fb;
      color: #31415a;
      font-size: 12px;
      text-transform: uppercase;
    }

    .status, .priority {
      display: inline-block;
      min-width: 94px;
      text-align: center;
      padding: 6px 9px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 12px;
      white-space: nowrap;
    }

    .completado { color: #0f5132; background: #dff3e8; }
    .en-proceso { color: #7a4b00; background: #fff0cc; }
    .pendiente { color: #7a271a; background: #fde2dd; }
    .alta { color: #842029; background: #f8d7da; }
    .media { color: #664d03; background: #fff3cd; }

    footer {
      width: min(1180px, 90vw);
      margin: 0 auto 32px;
      color: var(--muted);
      font-size: 13px;
    }

    @media (max-width: 820px) {
      .summary, .phases { grid-template-columns: 1fr; }
      header { padding: 24px 20px; }
      main, footer { width: calc(100vw - 32px); }
    }
  </style>
</head>
<body>
  <header>
    <h1>Control de tareas DevOps Azure</h1>
    <p>Tablero de seguimiento para el proyecto de migracion a la nube con Docker, GitHub Actions, Azure Container Registry, AKS y Azure Monitor.</p>
  </header>
  <main>
    <section class="summary" aria-label="Resumen del proyecto">
      <div class="metric"><span>Total tareas</span><strong>${tasks.length}</strong></div>
      <div class="metric"><span>Completadas</span><strong>${completed}</strong></div>
      <div class="metric"><span>En proceso</span><strong>${inProgress}</strong></div>
      <div class="metric"><span>Pendientes</span><strong>${pending}</strong></div>
    </section>

    <section class="progress-box">
      <div class="progress-title">
        <span>Avance general del proyecto</span>
        <span>${progress}%</span>
      </div>
      <div class="bar" aria-label="Avance general"><div style="width: ${progress}%"></div></div>
    </section>

    <section class="phases" aria-label="Avance por fase">
      ${phaseRows}
    </section>

    <section class="table-wrap">
      <table>
        <caption>Detalle de tareas</caption>
        <thead>
          <tr>
            <th>No.</th>
            <th>Fase</th>
            <th>Tarea</th>
            <th>Responsable</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Evidencia</th>
          </tr>
        </thead>
        <tbody>${taskRows}</tbody>
      </table>
    </section>
  </main>
  <footer>
    Proyecto desplegado en Azure Kubernetes Service. Endpoint de salud: /health. Datos del tablero: /api/tasks.
  </footer>
</body>
</html>`;
}

function handleRequest(req, res) {
  if (req.url === "/") {
    sendHtml(res, renderPage());
    return;
  }

  if (req.url === "/health") {
    sendJson(res, 200, { status: "healthy" });
    return;
  }

  if (req.url === "/api/tasks") {
    sendJson(res, 200, { tasks });
    return;
  }

  sendJson(res, 404, { error: "not_found" });
}

if (require.main === module) {
  http.createServer(handleRequest).listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { handleRequest };
