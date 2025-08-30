import React, { useMemo, useState } from "react";
import api, { API_URL } from "../services/api";

// IDs de planos do Mercado Pago (exemplo; ajuste conforme seu backend)
const planosMensal = {
  free: null,
  pro: "b05758cf2d2844c0b1e807e4c6768618",
  enterprise: "37036273772c472d894fbbcee4ae32d8",
};

const planosAnual = {
  free: null,
  pro: "COLE_ID_ANUAL_PROFISSIONAL_AQUI",
  enterprise: "COLE_ID_ANUAL_EMPRESARIAL_AQUI",
};

// Preços exibidos na UI (por mês)
const PRECO_MENSAL = { pro: 49.9, enterprise: 89.9 };
const PRECO_ANUAL_POR_MES = { pro: 39.9, enterprise: 69.9 };

function currencyBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function TabelaPlanos({ userEmail }) {
  const [loading, setLoading] = useState(false);
  const [ciclo, setCiclo] = useState("mensal"); // 'mensal' | 'anual'
  const isAnnual = ciclo === "anual";

  const precos = useMemo(
    () => (isAnnual ? PRECO_ANUAL_POR_MES : PRECO_MENSAL),
    [isAnnual]
  );

  const notaCiclo = (chave) => {
    if (!isAnnual) return "no plano mensal";
    const totalAno = (precos[chave] * 12).toFixed(2);
    return `no plano anual • ${currencyBRL(+totalAno)} cobrados 1x/ano`;
  };

  async function handleAssinar(planoChave) {
    if (planoChave === "free") {
      alert("Plano gratuito ativado!");
      return;
    }

    const planoId = isAnnual ? planosAnual[planoChave] : planosMensal[planoChave];
    if (!planoId) {
      alert(
        `Plano ainda não disponível. Cole o ID do plano ${isAnnual ? "ANUAL" : "MENSAL"} do Mercado Pago.`
      );
      return;
    }

    const email = userEmail?.trim();
    if (!email) {
      alert("Você precisa estar logado para assinar um plano!");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post(
        `${API_URL}/mercadopago/criar-assinatura`,
        { email, planoId },
        { withCredentials: true }
      );
      const url = data?.url || data?.init_point || data?.sandbox_init_point;
      if (!url) {
        console.error("Resposta inesperada:", data);
        alert("Não foi possível iniciar o checkout.");
        return;
      }
      window.location.href = url;
    } catch (err) {
      console.error("Erro ao iniciar assinatura:", err?.response?.data || err);
      alert(
        "Erro ao iniciar assinatura: " +
          (err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            err.message)
      );
    } finally {
      setLoading(false);
    }
  }

  // Abrir WhatsApp/Contate.me com mensagem pré-preenchida
  const abrirContatoVendas = (mensagem) => {
    const numero = "5562992622545";
    const msg = encodeURIComponent(mensagem);
    // Usa contate.me (abre WhatsApp com o número e texto)
    const url = `https://contate.me/${numero}?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Helpers visuais (borda gradiente + superfície neutra)
  const cardStyle = (gradStart, gradEnd, emphasized = false) => ({
    background: `linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, ${gradStart}, ${gradEnd}) border-box`,
    border: emphasized ? "2.5px solid transparent" : "2px solid transparent",
    borderRadius: 16,
    boxShadow: emphasized
      ? "0 12px 28px rgba(0,0,0,.12)"
      : "0 8px 22px rgba(0,0,0,.08)",
    padding: "28px 22px 32px 22px",
    minWidth: 280,
    maxWidth: 360,
    minHeight: 430,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    textAlign: "left",
    position: "relative", // garante que o selo absoluto use este card como referência
  });

  const titleStyle = (gradStart, gradEnd) => ({
    fontSize: 22,
    fontWeight: 900,
    margin: 0,
    background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  });

  const priceStyle = (accent) => ({
    color: accent,
    fontSize: 28,
    fontWeight: 900,
    marginTop: 10,
    display: "flex",
    alignItems: "baseline",
    gap: 6,
  });

  const noteStyle = { color: "#6b7280", fontSize: 12, marginTop: 6 };

  const featureListStyle = {
    listStyle: "none",
    padding: 0,
    margin: "16px 0 18px 0",
    display: "grid",
    gap: 8,
    color: "#1f2937",
  };

  const buttonGradient = (start, end) => ({
    background: `linear-gradient(135deg, ${start}, ${end})`,
    color: "#fff",
    fontWeight: 800,
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    textAlign: "center",
    width: "100%",
    boxShadow: "0 6px 18px rgba(0,0,0,.12)",
  });

  const buttonOutline = (start, end) => ({
    background: `linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, ${start}, ${end}) border-box`,
    color: "#0f172a",
    fontWeight: 800,
    border: "2px solid transparent",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    textAlign: "center",
    width: "100%",
  });

  const check = (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ color: "#16a34a" }}>
      <path
        fill="currentColor"
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
      />
    </svg>
  );

  return (
    <div style={{ padding: 32, width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontWeight: 900,
          fontSize: 28,
          marginBottom: 20,
          letterSpacing: 0.4,
          background: "linear-gradient(135deg,#7c3aed,#f97316)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Compare os Planos
      </h2>

      {/* Toggle Mensal/Anual */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            gap: 6,
            background:
              "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg,#a78bfa,#fb923c) border-box",
            border: "2px solid transparent",
            borderRadius: 999,
            padding: 6,
          }}
          role="tablist"
          aria-label="Alternar ciclo de cobrança"
        >
          <button
            role="tab"
            aria-selected={!isAnnual}
            onClick={() => setCiclo("mensal")}
            style={{
              border: 0,
              background: !isAnnual ? "#f8fafc" : "transparent",
              color: !isAnnual ? "#111827" : "#6b7280",
              fontWeight: 800,
              borderRadius: 999,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Mensal
          </button>
          <button
            role="tab"
            aria-selected={isAnnual}
            onClick={() => setCiclo("anual")}
            style={{
              border: 0,
              background: isAnnual ? "#f8fafc" : "transparent",
              color: isAnnual ? "#111827" : "#6b7280",
              fontWeight: 800,
              borderRadius: 999,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Anual
          </button>

          <span
            style={{
              position: "absolute",
              top: -14,
              right: -16,
              background: "linear-gradient(135deg,#ef5da8,#fb923c)",
              color: "#fff",
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 999,
              fontWeight: 900,
              letterSpacing: ".2px",
            }}
          >
            Economize 20%
          </span>
        </div>
      </div>

      {loading && (
        <div
          style={{
            background: "#fffbe8",
            color: "#f3aa13",
            padding: "14px 0",
            borderRadius: 9,
            textAlign: "center",
            fontWeight: 800,
            marginBottom: 16,
            fontSize: 15,
          }}
        >
          Aguarde, direcionando para pagamento...
        </div>
      )}

      <div
        className="tabela-planos-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 28,
          justifyItems: "stretch",
          alignItems: "stretch",
        }}
      >
        {/* FREE */}
        <div style={cardStyle("#94a3b8", "#64748b")}>
          <h3 style={titleStyle("#94a3b8", "#64748b")}>Free</h3>
          <p style={{ color: "#6b7280", margin: "6px 0 0 0" }}>
            Para quem está começando.
          </p>

          <div style={priceStyle("#111827")}>
            <span>{currencyBRL(0)}</span>
            <span style={{ color: "#6b7280", fontSize: 14 }}>/mês</span>
          </div>

          <ul style={featureListStyle}>
            <li>{check} Cadastro de até 5 produtos</li>
            <li>{check} Cálculo com markup simples</li>
          </ul>

          <div style={{ marginTop: "auto" }}>
            <button
              onClick={() => handleAssinar("free")}
              style={{
                background: "#eef2ff",
                color: "#1f2937",
                fontWeight: 800,
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",
                textAlign: "center",
                width: "100%",
              }}
              disabled={loading}
            >
              Começar Agora
            </button>
          </div>
        </div>

        {/* PROFISSIONAL (DESTAQUE) */}
        <div style={cardStyle("#7c3aed", "#fb923c", true)}>
          {/* Selo posicionado em cima do card */}
          <div
            style={{
              position: "absolute",
              top: -14,
              left: 24,
              zIndex: 2,
              background: "linear-gradient(135deg,#7c3aed,#fb923c)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              pointerEvents: "none",
            }}
          >
            MAIS POPULAR
          </div>

          <h3 style={titleStyle("#7c3aed", "#fb923c")}>Profissional</h3>
          <p style={{ color: "#6b7280", margin: "6px 0 0 0" }}>
            Para quem quer crescer com segurança.
          </p>

          <div style={priceStyle("#111827")}>
            <span>{currencyBRL(precos.pro)}</span>
            <span style={{ color: "#6b7280", fontSize: 14 }}>/mês</span>
          </div>
          <div style={noteStyle}>{notaCiclo("pro")}</div>

          <ul style={featureListStyle}>
            <li>{check} Cálculos avançados (markup + lucro)</li>
            <li>{check} Produtos e receitas ilimitados</li>
            <li>{check} Gestão de despesas por categoria</li>
            <li>{check} Impressão de receitas prontas</li>
            <li>{check} Evolução com a Comunidade</li>
          </ul>

          <div style={{ marginTop: "auto" }}>
            <button
              onClick={() => handleAssinar("pro")}
              style={buttonGradient("#7c3aed", "#fb923c")}
              disabled={loading}
            >
              Escolher Plano Profissional
            </button>
          </div>
        </div>

        {/* EMPRESARIAL */}
        <div style={cardStyle("#0ea5e9", "#22c55e")}>
          <h3 style={titleStyle("#0ea5e9", "#22c55e")}>Empresarial</h3>
          <p style={{ color: "#6b7280", margin: "6px 0 0 0" }}>
            Para negócios com equipes e maior volume.
          </p>

          <div style={priceStyle("#111827")}>
            <span>{currencyBRL(precos.enterprise)}</span>
            <span style={{ color: "#6b7280", fontSize: 14 }}>/mês</span>
          </div>
          <div style={noteStyle}>{notaCiclo("enterprise")}</div>

          <ul style={featureListStyle}>
            <li>{check} Tudo do Profissional</li>
            <li>{check} Acesso multiusuário (2–5 logins)</li>
            <li>{check} Relatórios avançados com gráficos</li>
            <li>{check} Exportação em PDF/Excel</li>
            <li>{check} Suporte prioritário</li>
          </ul>

          <div style={{ marginTop: "auto" }}>
            <button
              onClick={() =>
                abrirContatoVendas(
                  "Olá, gostaria de mais informações sobre o plano Profissional."
                )
              }
              style={buttonOutline("#0ea5e9", "#22c55e")}
              disabled={loading}
            >
              Falar com Vendas
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 28, color: "#6b7280", fontSize: 13 }}>
        Dica: alterne entre mensal e anual para ver o preço por mês. No anual, a cobrança é feita 1x ao ano.
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .tabela-planos-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 800px) {
          .tabela-planos-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
