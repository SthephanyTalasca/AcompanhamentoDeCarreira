import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  const csRanking = [
    { id: 1, name: "Sthephany Talasca", overallScore: 4.8, meetingsCount: 45, churnRiskCount: 2, scores: { rapport: 4.9, management: 4.7, product: 4.8, business: 4.6 } },
    { id: 2, name: "Brayan Santos", overallScore: 4.5, meetingsCount: 38, churnRiskCount: 5, scores: { rapport: 4.4, management: 4.6, product: 4.5, business: 4.5 } },
    { id: 3, name: "Camille Vaz", overallScore: 4.7, meetingsCount: 42, churnRiskCount: 1, scores: { rapport: 4.8, management: 4.5, product: 4.7, business: 4.8 } },
    { id: 4, name: "Yuri Santos", overallScore: 4.2, meetingsCount: 50, churnRiskCount: 8, scores: { rapport: 4.0, management: 4.3, product: 4.2, business: 4.1 } },
  ];

  const meetings = [
    { id: "1", clientName: "Contabilidade Express", csName: "Sthephany Talasca", date: "2026-04-14", score: 4.9, health: "Saudável", churnRisk: "Baixo" },
    { id: "2", clientName: "Tech Solutions", csName: "Brayan Santos", date: "2026-04-13", score: 4.2, health: "Atenção", churnRisk: "Médio" },
    { id: "3", clientName: "Global Logistics", csName: "Camille Vaz", date: "2026-04-12", score: 4.7, health: "Saudável", churnRisk: "Baixo" },
    { id: "4", clientName: "Inovação Digital", csName: "Yuri Santos", date: "2026-04-11", score: 3.8, health: "Crítica", churnRisk: "Alto" },
  ];

  const insights = [
    { id: 1, type: "bug", description: "Erro ao importar extrato OFX no Nibo Gestão", product: "Nibo Gestão", frequency: 12 },
    { id: 2, type: "bug", description: "Lentidão na geração do relatório de DRE", product: "Nibo Contador", frequency: 8 },
    { id: 3, type: "improvement", description: "Adicionar filtro por categoria na conciliação", product: "Nibo Gestão", frequency: 15 },
    { id: 4, type: "improvement", description: "Integração direta com bancos via Open Banking", product: "Nibo Gestão", frequency: 20 },
    { id: 5, type: "bug", description: "Falha na sincronização de notas fiscais", product: "Nibo Gestão", frequency: 5 },
  ];

  // API Routes
  app.get("/api/cs-ranking", (req, res) => {
    res.json(csRanking);
  });

  app.get("/api/meetings", (req, res) => {
    res.json(meetings);
  });

  app.get("/api/insights", (req, res) => {
    const { product } = req.query;
    let filtered = insights;
    if (product && product !== "Todos") {
      filtered = insights.filter(i => i.product === product);
    }
    res.json(filtered);
  });

  app.get("/api/team-stats", (req, res) => {
    const categories = ["rapport", "management", "product", "business"];
    const stats = categories.map(cat => {
      const avg = csRanking.reduce((acc, cs) => acc + (cs.scores as any)[cat], 0) / csRanking.length;
      return { category: cat, score: parseFloat(avg.toFixed(1)) };
    });
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
