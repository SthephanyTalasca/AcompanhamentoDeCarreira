import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Star, Calendar, AlertTriangle, TrendingUp, Award, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface CSRanking {
  id: number;
  name: string;
  overallScore: number;
  meetingsCount: number;
  churnRiskCount: number;
  scores: Record<string, number>;
}

interface Meeting {
  id: string;
  clientName: string;
  csName: string;
  date: string;
  score: number;
  health: string;
  churnRisk: string;
}

interface TeamStat {
  category: string;
  score: number;
}

export default function Dashboard() {
  const [csRanking, setCsRanking] = useState<CSRanking[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [csRes, meetingsRes, statsRes] = await Promise.all([
          fetch("/api/cs-ranking"),
          fetch("/api/meetings"),
          fetch("/api/team-stats")
        ]);
        
        setCsRanking(await csRes.json());
        setMeetings(await meetingsRes.json());
        setTeamStats(await statsRes.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nibo-roxo"></div>
      </div>
    );
  }

  const topCS = [...csRanking].sort((a, b) => b.overallScore - a.overallScore)[0];
  const mostMeetingsCS = [...csRanking].sort((a, b) => b.meetingsCount - a.meetingsCount)[0];

  return (
    <div className="max-w-7xl mx-auto space-y-nibo-xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-nibo-petroleo">Dashboard de Performance</h2>
          <p className="text-slate-500">Visão geral da qualidade do atendimento do time de CS.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-nibo-md py-nibo-sm rounded-lg border border-nibo-gelo/30 shadow-sm">
          Últimos 30 dias
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-nibo-lg">
        <HighlightCard
          title="Média Geral do Time"
          value="4.5"
          subtitle="+0.2 vs mês passado"
          icon={TrendingUp}
          color="purple"
        />
        <HighlightCard
          title="Destaque em Nota"
          value={topCS?.name || "-"}
          subtitle={`Nota: ${topCS?.overallScore || "-"}`}
          icon={Award}
          color="pink"
        />
        <HighlightCard
          title="Destaque em Volume"
          value={mostMeetingsCS?.name || "-"}
          subtitle={`${mostMeetingsCS?.meetingsCount || "-"} reuniões realizadas`}
          icon={Users}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-nibo-xl">
        {/* CS Ranking */}
        <section className="bg-white rounded-nibo-card border border-nibo-gelo/30 shadow-nibo overflow-hidden">
          <div className="p-nibo-md border-b border-nibo-gelo/20 flex justify-between items-center">
            <h3 className="font-bold text-nibo-petroleo flex items-center gap-nibo-xs">
              <Users className="w-5 h-5 text-nibo-azul-escuro" />
              Ranking de CSs
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-nibo-gelo/10">
                  <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider">CS</th>
                  <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nota</th>
                  <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Reuniões</th>
                  <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Risco Churn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nibo-gelo/10">
                {csRanking.map((cs) => (
                  <tr key={cs.id} className="hover:bg-nibo-gelo/5 transition-colors">
                    <td className="px-nibo-md py-nibo-md">
                      <div className="font-semibold text-nibo-petroleo">{cs.name}</div>
                    </td>
                    <td className="px-nibo-md py-nibo-md text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold",
                        cs.overallScore >= 4.5 ? "bg-emerald-100 text-emerald-700" : "bg-nibo-amarelo/20 text-nibo-petroleo"
                      )}>
                        {cs.overallScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-nibo-md py-nibo-md text-center text-sm text-slate-600">{cs.meetingsCount}</td>
                    <td className="px-nibo-md py-nibo-md text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold",
                        cs.churnRiskCount > 5 ? "bg-nibo-pink/10 text-nibo-pink" : "bg-slate-100 text-slate-600"
                      )}>
                        {cs.churnRiskCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Team Score Ranking */}
        <section className="bg-white rounded-nibo-card border border-nibo-gelo/30 shadow-nibo p-nibo-md">
          <h3 className="font-bold text-nibo-petroleo mb-nibo-md flex items-center gap-nibo-xs">
            <TrendingUp className="w-5 h-5 text-nibo-azul-escuro" />
            Pontuação Geral do Time por Categoria
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamStats} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                  {teamStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 4.5 ? "#0072ce" : "#6431e2"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-nibo-xs p-nibo-md bg-nibo-gelo/10 rounded-xl border border-nibo-gelo/20">
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-nibo-petroleo">Insight:</span> O time está performando melhor em <span className="font-bold text-nibo-roxo">Rapport</span> e precisa de melhoria em <span className="font-bold text-nibo-roxo">Gestão de Negócio</span>.
            </p>
          </div>
        </section>
      </div>

      {/* Recent Meetings */}
      <section className="bg-white rounded-nibo-card border border-nibo-gelo/30 shadow-nibo overflow-hidden">
        <div className="p-nibo-md border-b border-nibo-gelo/20 flex justify-between items-center">
          <h3 className="font-bold text-nibo-petroleo flex items-center gap-nibo-xs">
            <Calendar className="w-5 h-5 text-nibo-azul-escuro" />
            Histórico de Reuniões Recentes
          </h3>
          <Link to="/history" className="text-xs font-bold text-nibo-roxo hover:underline flex items-center gap-nibo-xs">
            Ver todas <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nibo-gelo/10">
                <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider">CS</th>
                <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nota</th>
                <th className="px-nibo-md py-nibo-md text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Saúde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nibo-gelo/10">
              {meetings.slice(0, 5).map((meeting) => (
                <tr key={meeting.id} className="hover:bg-nibo-gelo/5 transition-colors cursor-pointer">
                  <td className="px-nibo-md py-nibo-md">
                    <div className="font-semibold text-nibo-petroleo">{meeting.clientName}</div>
                  </td>
                  <td className="px-nibo-md py-nibo-md text-sm text-slate-600">{meeting.csName}</td>
                  <td className="px-nibo-md py-nibo-md text-sm text-slate-500">{meeting.date}</td>
                  <td className="px-nibo-md py-nibo-md text-center">
                    <span className="font-bold text-nibo-petroleo">{meeting.score.toFixed(1)}</span>
                  </td>
                  <td className="px-nibo-md py-nibo-md text-center">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      meeting.health === "Saudável" ? "bg-emerald-100 text-emerald-700" :
                      meeting.health === "Atenção" ? "bg-nibo-amarelo/20 text-nibo-petroleo" : "bg-nibo-pink/10 text-nibo-pink"
                    )}>
                      {meeting.health}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HighlightCard({ title, value, subtitle, icon: Icon, color }: { title: string, value: string, subtitle: string, icon: any, color: "purple" | "pink" | "blue" }) {
  const colors = {
    purple: "bg-nibo-roxo/10 text-nibo-roxo border-nibo-roxo/20",
    pink: "bg-nibo-pink/10 text-nibo-pink border-nibo-pink/20",
    blue: "bg-nibo-azul-escuro/10 text-nibo-azul-escuro border-nibo-azul-escuro/20"
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-nibo-md rounded-nibo-card border border-nibo-gelo/30 shadow-nibo flex items-start gap-nibo-md"
    >
      <div className={cn("p-3 rounded-xl border", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-nibo-xs">{title}</p>
        <p className="text-xl font-bold text-nibo-petroleo mb-nibo-xs">{value}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}
