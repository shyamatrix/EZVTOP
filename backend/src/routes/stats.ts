import { Router } from "express";
import { inMemoryStats } from "../lib/Logger";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const range = _req.query.range || "30d" as string;
    let startDate: Date | null = null;
    const now = new Date();

    switch (range) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "full":
      default:
        startDate = null;
        break;
    }

    const statsDocs: any[] = [];
    for (const entry of inMemoryStats.values()) {
      if (!startDate || entry.hour >= startDate) {
        statsDocs.push(entry);
      }
    }
    statsDocs.sort((a, b) => a.hour.getTime() - b.hour.getTime());

    function formatIST(dateObj: any) {
      const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
      const offsetNow = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
      const year = offsetNow.getUTCFullYear();
      const month = String(offsetNow.getUTCMonth() + 1).padStart(2, '0');
      const day = String(offsetNow.getUTCDate()).padStart(2, '0');
      const hour = String(offsetNow.getUTCHours()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:00`;
    }

    const hourlyData = statsDocs.map((doc: any) => {
      const hrStr = formatIST(doc.hour);
      return {
        hour: hrStr,
        total: doc.total || 0,
        routes: doc.routes || {},
        sources: doc.sources || {}
      };
    });

    const hourLabels = hourlyData.map((d: any) => d.hour);
    const hourCounts = hourlyData.map((d: any) => Number(d.total));

    const routeKeysSet = new Set<string>();
    const sourceKeysSet = new Set<string>();
    hourlyData.forEach(d => {
      Object.keys(d.routes).forEach(r => routeKeysSet.add(r));
      Object.keys(d.sources).forEach(s => sourceKeysSet.add(s));
    });

    const routesList = Array.from(routeKeysSet);
    const sourcesList = Array.from(sourceKeysSet);

    function decodeRouteField(field: string) {
      if (field === "unknown") return "unknown";
      return field
        .replace(/_/g, "/")
        .replace(/\$/g, ":");
    }

    function decodeSourceField(field: string) {
      return field.replace(/_/g, ".");
    }

    const routeDatasets = routesList.map((routeField, index) => {
      const colors = [
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(199, 199, 199)',
        'rgb(83, 102, 255)',
        'rgb(255, 99, 255)',
        'rgb(99, 255, 132)',
      ];
      const color = colors[index % colors.length] || 'rgb(100, 100, 100)';
      
      return {
        label: decodeRouteField(routeField),
        data: hourlyData.map(d => Number(d.routes[routeField] || 0)),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        borderWidth: 2,
        tension: 0.3,
        fill: false
      };
    });

    const sourceDatasets = sourcesList.map((sourceField, index) => {
      const sourceColors = [
        "rgb(54, 162, 235)",
        "rgb(255, 99, 132)",
        "rgb(75, 192, 192)",
        "rgb(255, 206, 86)",
        "rgb(153, 102, 255)",
        "rgb(255, 159, 64)",
      ];
      const color = sourceColors[index % sourceColors.length] || 'rgb(100, 100, 100)';

      return {
        label: decodeSourceField(sourceField),
        data: hourlyData.map(d => Number(d.sources[sourceField] || 0)),
        borderColor: color,
        backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.15)"),
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      };
    });

    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>API Usage Stats</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
  :root {
    --bg: #0f1115;
    --card: #151821;
    --border: #2a2f3a;
    --text-primary: #e5e7eb;
    --text-secondary: #9ca3af;
    --accent: #38bdf8;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    padding: 20px;
    background: var(--bg);
    color: var(--text-primary);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    background: var(--card);
    padding: 30px;
    border-radius: 12px;
    border: 1px solid var(--border);
    height: fit-content;
  }

  h1 {
    color: var(--text-primary);
    margin-bottom: 30px;
  }

  h2 {
    color: var(--text-secondary);
    margin-top: 40px;
    margin-bottom: 20px;
    font-weight: 500;
  }

  .chart-container {
    position: relative;
    height: 400px;
    margin-bottom: 50px;
    background: #11141b;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid var(--border);
  }

  canvas {
    max-width: 100%;
  }

  .range-btn {
  background: #11141b;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

  .range-btn:hover {
    color: var(--text-primary);
    border-color: var(--accent);
  }

  .range-btn.active {
    background: var(--accent);
    color: #000;
    border-color: var(--accent);
  }

</style>
</head>
<body>
  <div class="container">
    <div style="display:flex; gap:12px; margin-bottom:20px;">
      <button class="range-btn" data-range="24h">Last 24 Hours</button>
      <button class="range-btn" data-range="7d">Last 7 Days</button>
      <button class="range-btn" data-range="30d">Last 30 Days</button>
      <button class="range-btn" data-range="full">To Date</button>
    </div>

    <h2>Total Requests Per Hour</h2>
    <div class="chart-container">
      <canvas id="hourChart"></canvas>
    </div>
    
    <h2>Requests Per Route Per Hour</h2>
    <div class="chart-container" style="height: 500px;">
      <canvas id="routeHourChart"></canvas>
    </div>
    <h2>Requests by Source Domain</h2>
    <div class="chart-container" style="height: 500px;">
      <canvas id="sourceChart"></canvas>
    </div>
</div>

  </div>
  
  <script>
  Chart.defaults.color = "#9ca3af";
  Chart.defaults.borderColor = "#2a2f3a";
  Chart.defaults.font.family =
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  </script>
  <script>
    new Chart(document.getElementById("hourChart"), {
      type: "line",
      data: {
        labels: ${JSON.stringify(hourLabels)},
        datasets: [{
          label: "Total Requests",
          data: ${JSON.stringify(hourCounts)},
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
    
    new Chart(document.getElementById("routeHourChart"), {
      type: "line",
      data: {
        labels: ${JSON.stringify(hourLabels)},
        datasets: ${JSON.stringify(routeDatasets)}
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });

new Chart(document.getElementById("sourceChart"), {
  type: "line",
  data: {
    labels: ${JSON.stringify(hourLabels)},
    datasets: ${JSON.stringify(sourceDatasets)}
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right"
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }
});
  </script>
  <script>
    const params = new URLSearchParams(window.location.search);
    const currentRange = params.get("range") || "30d";

    document.querySelectorAll(".range-btn").forEach(btn => {
      if (btn.dataset.range === currentRange) {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => {
        params.set("range", btn.dataset.range);
        window.location.search = params.toString();
      });
    });
  </script>
</body>
</html>
`);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).send("Error generating stats");
  }
});

export default router;
