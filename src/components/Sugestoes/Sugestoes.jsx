// src/pages/Sugestoes.jsx
import React, { useState, useEffect } from "react";
import { API_PREFIX } from "../../services/api";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function Sugestoes() {
  const [assunto, setAssunto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);

  // ---- Modal de feedback ----
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState("ok"); // "ok" | "erro"
  const [modalMsg, setModalMsg] = useState("");

  useEffect(() => {
    if (!modalOpen) return;
    const t = setTimeout(() => setModalOpen(false), 2500);
    return () => clearTimeout(t);
  }, [modalOpen]);

  // Lista fixa (somente 3 ideias internas)
  const listaFixa = [
    {
      id: 1,
      titulo: "Ordem de produção",
      detalhe:
        "Organize o dia da produção com a nova Ordem de Produção: atribua receitas e atividades a cada colaborador, defina horário de início e prazo de entrega, gere uma via impressa para assinatura e uma versão digital registrada no sistema. Acompanhe em tempo real o andamento por funcionário, compare metas x execução e visualize a produtividade em gráficos claros para ajustar a carga de trabalho, identificar gargalos e elevar a eficiência da equipe.",
    },
    {
      id: 2,
      titulo: "Lista de compras automática",
      detalhe:
        "Gere a lista de compras a partir do controle de estoque: mínimo, ponto de reposição e consumo projetado. Em um clique, envie o pedido via WhatsApp para seus fornecedores; ao receber os preços de volta, importe a cotação no sistema e veja a comparação automática por item, indicando onde comprar (melhor preço/condição) e onde não comprar. Tudo para simplificar logística, padronizar pedidos, reduzir custos e economizar tempo de quem compra.",
    },
    {
      id: 3,
      titulo: "AnalisaGPT (IA de concorrência)",
      detalhe:
        "Deixe a IA estudar o mercado por você: o AnalisaGPT cruza suas receitas, custos, porções e preços com os principais concorrentes para gerar um diagnóstico prático. Ele aponta oportunidades de redução de custo (ingredientes-chave e substituições), sugere ajustes de markup e preço ideal por canal, indica diferenciais de produto, recomenda melhorias na ficha técnica (rendimento, etapas críticas e tempo), e entrega um plano de ação claro com próximos passos. Resultado: decisão mais rápida, posicionamento mais forte e cardápio competitivo—tudo explicado em linguagem simples, pronto para executar.",
    },
  ];

  async function adicionarSugestao(e) {
    e.preventDefault();
    if (!assunto.trim() || !descricao.trim() || enviando) return;

    setEnviando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}${API_PREFIX}/sugestoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          assunto: assunto.trim(),
          descricao: descricao.trim(),
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Falha ao enviar sugestão:", res.status, txt);
        setModalTipo("erro");
        setModalMsg("Não foi possível enviar sua sugestão. Tente novamente.");
        setModalOpen(true);
      } else {
        setModalTipo("ok");
        setModalMsg("Sugestão enviada! Obrigado por contribuir 🙌");
        setModalOpen(true);
        setAssunto("");
        setDescricao("");
      }
    } catch (err) {
      console.error("Erro de rede ao enviar sugestão:", err);
      setModalTipo("erro");
      setModalMsg("Erro de conexão. Verifique sua internet e tente de novo.");
      setModalOpen(true);
    } finally {
      setEnviando(false);
    }
  }

  const gradAzul = "linear-gradient(90deg, #00C6FF 0%, #0072FF 100%)";

  return (
    <div
      style={{
        padding: "26px 32px",
        paddingLeft: "72px",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* CSS interno para grid responsivo e efeitos dos cards */}
      <style>{`
        .grid-breve {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (max-width: 1024px) {
          .grid-breve { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .grid-breve { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        }

        .card-sug {
          position: relative;
          border-radius: 18px;
          padding: 16px 18px;
          background:
            linear-gradient(#ffffff, #ffffff) padding-box,
            linear-gradient(135deg, #6ecbff, #2ea0ff, #0b66ff) border-box;
          border: 2px solid transparent;
          box-shadow: 0 6px 24px rgba(231, 238, 247, 0.35);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }
        .card-sug:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 114, 255, 0.18);
          filter: saturate(1.05);
        }

        .dot {
          width: 10px; height: 10px; border-radius: 999px;
          background: linear-gradient(90deg, #48c6ff, #2ea0ff);
          box-shadow: 0 0 0 3px rgba(46,160,255,.12);
        }
      `}</style>

      <h1
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          color: "#32A6FF",
          margin: "10px 0 18px 0",
          letterSpacing: ".5px",
        }}
      >
        Sugestões
      </h1>

      {/* Form */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 6px 28px #e7eef755",
          padding: 22,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: "1fr 2fr auto",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <label style={{ display: "block", color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>
            Assunto
          </label>
          {/* Assunto como TEXTAREA para igualar exatamente o layout */}
          <textarea
            rows={3}
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Ex.: Integração com Impressora"
            style={{
              width: "100%",
              background: "#f6f7fb",
              border: "none",
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 15.5,
              outline: "none",
              boxShadow: "inset 0 2px 8px #eef1f6",
              color: "#2b2b2b",
              height: "80px",
              resize: "none",
              lineHeight: 1.4,
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>
            Descrição
          </label>
          <textarea
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Explique sua ideia rapidamente…"
            style={{
              width: "100%",
              background: "#f6f7fb",
              border: "none",
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 15.5,
              outline: "none",
              boxShadow: "inset 0 2px 8px #eef1f6",
              color: "#2b2b2b",
              height: "80px",
              resize: "none",
              lineHeight: 1.4,
            }}
          />
        </div>

        <button
          onClick={adicionarSugestao}
          disabled={enviando}
          style={{
            height: 44,
            border: "none",
            borderRadius: 12,
            padding: "0 22px",
            fontWeight: 800,
            fontSize: 15.5,
            color: "#fff",
            cursor: enviando ? "not-allowed" : "pointer",
            opacity: enviando ? 0.7 : 1,
            background: gradAzul,
            boxShadow: "0 10px 20px #00c6ff2d",
            transition: "opacity .2s ease",
          }}
        >
          {enviando ? "Enviando..." : "Adicionar"}
        </button>
      </div>

      {/* Título "Em breve" com MESMO estilo de "Sugestões" */}
      <h1
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          color: "#32A6FF",
          margin: "22px 0 18px 0",
          letterSpacing: ".5px",
        }}
      >
        Em breve
      </h1>

      {/* Cards 3x por linha, com bordas em gradient (apenas 3 itens) */}
      <div className="grid-breve">
        {listaFixa.map((s) => (
          <div key={s.id} className="card-sug">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="dot" />
              <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a", fontWeight: 800 }}>
                {s.titulo}
              </h3>
            </div>
            <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.5 }}>
              {s.detalhe}
            </p>
          </div>
        ))}
      </div>

      {/* ===== Modal de Feedback ===== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-live="assertive"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(17,24,39,.35)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            animation: "fadeIn .15s ease-out",
          }}
        >
          <div
            style={{
              width: "min(92vw, 440px)",
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 30px 80px rgba(0,0,0,.25)",
              transform: "translateY(0)",
              animation: "pop .18s ease-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background:
                    modalTipo === "ok"
                      ? "linear-gradient(90deg, #34d399, #10b981)"
                      : "linear-gradient(90deg, #fb7185, #ef4444)",
                  boxShadow:
                    modalTipo === "ok"
                      ? "0 10px 20px rgba(16,185,129,.25)"
                      : "0 10px 20px rgba(239,68,68,.25)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                {modalTipo === "ok" ? "✓" : "!"}
              </span>
              <h3 style={{ margin: 0, fontSize: 18.5, color: "#111827", fontWeight: 800 }}>
                {modalTipo === "ok" ? "Tudo certo!" : "Ops..."}
              </h3>
            </div>

            <p style={{ margin: "6px 0 14px 0", color: "#4b5563", lineHeight: 1.45 }}>
              {modalMsg}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  height: 40,
                  padding: "0 18px",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 800,
                  color: "#fff",
                  cursor: "pointer",
                  background:
                    modalTipo === "ok"
                      ? "linear-gradient(90deg, #60a5fa, #3b82f6)"
                      : "linear-gradient(90deg, #fb7185, #ef4444)",
                  boxShadow:
                    modalTipo === "ok"
                      ? "0 10px 20px rgba(59,130,246,.25)"
                      : "0 10px 20px rgba(239,68,68,.25)",
                }}
              >
                OK
              </button>
            </div>
          </div>

          {/* animações simples */}
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes pop { from { opacity: 0; transform: translateY(6px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
          `}</style>
        </div>
      )}
    </div>
  );
}
