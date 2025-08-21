import React, { useMemo, useState } from "react";
import axios from "axios";

// IDs de planos do Mercado Pago
// Mensal (já existentes no seu arquivo atual)
const planosMensal = {
  gratuito: null,
  padrao: "b05758cf2d2844c0b1e807e4c6768618",
  premium: "37036273772c472d894fbbcee4ae32d8",
};

// Anual (crie no Mercado Pago e cole os IDs aqui)
const planosAnual = {
  gratuito: null,
  padrao: "COLE_ID_ANUAL_PADRAO_AQUI",
  premium: "COLE_ID_ANUAL_PREMIUM_AQUI",
};

// Preços exibidos na UI (edite conforme sua tabela de preços)
// Mantive os mensais como no seu layout atual.
// Os anuais, por padrão, mostram 20% de desconto no valor “por mês”.
const PRECO_MENSAL = { padrao: 39.9, premium: 59.9 };
const PRECO_ANUAL_POR_MES = {
  padrao: +(PRECO_MENSAL.padrao * 0.8).toFixed(2),
  premium: +(PRECO_MENSAL.premium * 0.8).toFixed(2),
};

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

  const precos = useMemo(
    () => (ciclo === "anual" ? PRECO_ANUAL_POR_MES : PRECO_MENSAL),
    [ciclo]
  );

  async function handleAssinar(planoRotulo) {
    if (planoRotulo === "Gratuito") {
      alert("Plano gratuito ativado!");
      // Se quiser, chame seu backend para gravar o plano gratuito no usuário
      return;
    }

    const chave =
      planoRotulo === "Padrão" ? "padrao" : planoRotulo === "Premium" ? "premium" : null;

    const planoId =
      ciclo === "anual" ? planosAnual[chave] : planosMensal[chave];

    if (!planoId) {
      alert(
        "Plano ainda não disponível. Cole o ID correto do plano " +
          (ciclo === "anual" ? "ANUAL" : "MENSAL") +
          " do Mercado Pago no arquivo."
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
      const { data } = await axios.post(
        "/api/mercadopago/criar-assinatura",
        { email, planoId },
        { withCredentials: true }
      );

      const url = data?.url || data?.init_point || data?.sandbox_init_point;
      if (!url) {
        console.error("Resposta inesperada do backend:", data);
        alert("Não foi possível iniciar o checkout (resposta inválida).");
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

  const notaCiclo = (plano) => {
    if (ciclo === "mensal") return "no plano mensal";
    const totalAno = (precos[plano] * 12).toFixed(2);
    return `no plano anual • ${currencyBRL(+totalAno)} cobrados 1x/ano`;
  };

  return (
    <div style={{ padding: 32, width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <h2
        style={{
          color: "#2196f3",
          textAlign: "center",
          fontWeight: 900,
          fontSize: 28,
          marginBottom: 24,
          letterSpacing: 1,
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
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 999,
            padding: 6,
          }}
          role="tablist"
          aria-label="Alternar ciclo de cobrança"
        >
          <button
            role="tab"
            aria-selected={ciclo === "mensal"}
            onClick={() => setCiclo("mensal")}
            style={{
              border: 0,
              background: ciclo === "mensal" ? "#f8fafc" : "transparent",
              color: ciclo === "mensal" ? "#111827" : "#6b7280",
              fontWeight: 700,
              borderRadius: 999,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Mensal
          </button>
          <button
            role="tab"
            aria-selected={ciclo === "anual"}
            onClick={() => setCiclo("anual")}
            style={{
              border: 0,
              background: ciclo === "anual" ? "#f8fafc" : "transparent",
              color: ciclo === "anual" ? "#111827" : "#6b7280",
              fontWeight: 700,
              borderRadius: 999,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Anual
          </button>

          {ciclo === "anual" && (
            <span
              style={{
                position: "absolute",
                top: -14,
                right: -16,
                background: "linear-gradient(135deg,#7c3aed,#f97316)",
                color: "#fff",
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                fontWeight: 800,
                letterSpacing: ".2px",
              }}
            >
              Economize 20%
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div
          style={{
            background: "#fffbe8",
            color: "#f3aa13",
            padding: "18px 0",
            borderRadius: 9,
            textAlign: "center",
            fontWeight: 700,
            marginBottom: 20,
            fontSize: 17,
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
          gap: 36,
          justifyItems: "center",
          alignItems: "stretch",
        }}
      >
        {/* GRATUITO */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 18,
            boxShadow: "0 2px 14px #00cfff11",
            padding: "32px 24px 36px 24px",
            textAlign: "center",
            border: "2.5px solid #2091e9",
            minWidth: 280,
            maxWidth: 350,
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <div style={{ color: "#2091e9", fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
            Gratuito
          </div>
          <div style={{ color: "#2196f3", fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
            {currencyBRL(0)} <span style={{ color: "#6b7280", fontSize: 14 }}>/mês</span>
          </div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>{notaCiclo("padrao")}</div>

          <ul style={{ listStyle: "none", padding: 0, textAlign: "left", fontSize: 16, color: "#247", flex: 1 }}>
            <li>✅ 30 cadastros de matéria-prima</li>
            <li>✅ 5 receitas</li>
            <li>✅ Monitore seu lucro</li>
            <li>✅ Simulação de preço</li>
            <li>✅ 1 bloco de markup</li>
            <li>✅ Suporte humanizado</li>
          </ul>

          <button
            onClick={() => handleAssinar("Gratuito")}
            style={{
              marginTop: 22,
              background: "#e1ecfa",
              color: "#2091e9",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              width: "100%",
              cursor: "pointer",
              transition: "background .18s",
            }}
            disabled={loading}
          >
            Usar Gratuito
          </button>
        </div>

        {/* PADRÃO (destaque) */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 24px #00cfff19",
            padding: "32px 24px 36px 24px",
            textAlign: "center",
            border: "3px solid #2196f3",
            minWidth: 280,
            maxWidth: 350,
            minHeight: 420,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              color: "#fff",
              background: "#2196f3",
              fontWeight: 900,
              fontSize: 24,
              borderRadius: 8,
              marginBottom: 10,
              display: "inline-block",
              padding: "4px 32px",
            }}
          >
            Padrão
          </div>

          <div style={{ color: "#2196f3", fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
            {currencyBRL(precos.padrao)} <span style={{ color: "#6b7280", fontSize: 14 }}>/mês</span>
          </div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>{notaCiclo("padrao")}</div>

          <ul style={{ listStyle: "none", padding: 0, textAlign: "left", fontSize: 16, color: "#247", flex: 1 }}>
            <li>✅ Cadastro ilimitado de matéria-prima</li>
            <li>✅ Movimentação de estoque</li>
            <li>✅ 60 receitas</li>
            <li>✅ Monitore seu lucro</li>
            <li>✅ Simulação de preço</li>
            <li>✅ 3 blocos de markup</li>
            <li>✅ Suporte humanizado</li>
            <li>✅ Sistema em desenvolvimento: acompanhe novidades e sugira melhorias</li>
          </ul>

          <button
            onClick={() => handleAssinar("Padrão")}
            style={{
              marginTop: 22,
              background: "#2196f3",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              width: "100%",
              cursor: "pointer",
              boxShadow: "0 2px 14px #2196f322",
              transition: "background .18s",
            }}
            disabled={loading}
          >
            Assinar Padrão
          </button>
        </div>

        {/* PREMIUM */}
        <div
          style={{
            background: "#f7fbfd",
            borderRadius: 18,
            boxShadow: "0 2px 14px #fdab0022",
            padding: "32px 24px 36px 24px",
            textAlign: "center",
            border: "2.5px solid #fdab00",
            minWidth: 280,
            maxWidth: 350,
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              color: "#fff",
              background: "#fdab00",
              fontWeight: 900,
              fontSize: 24,
              borderRadius: 8,
              marginBottom: 10,
              display: "inline-block",
              padding: "4px 32px",
            }}
          >
            Premium
          </div>

          <div style={{ color: "#fdab00", fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
            {currencyBRL(precos.premium)}{" "}
            <span style={{ color: "#6b7280", fontSize: 14 }}>/mês</span>
          </div>
          <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>{notaCiclo("premium")}</div>

          <ul style={{ listStyle: "none", padding: 0, textAlign: "left", fontSize: 16, color: "#247", flex: 1 }}>
            <li>✅ Cadastro ilimitado de matéria-prima</li>
            <li>✅ Movimentação de estoque</li>
            <li>✅ Receitas ilimitadas</li>
            <li>✅ Monitore seu lucro</li>
            <li>✅ Simulação de preço</li>
            <li>✅ Blocos de markup ilimitados</li>
            <li>✅ Suporte humanizado</li>
            <li>✅ Sistema em desenvolvimento: acompanhe novidades e sugira melhorias</li>
          </ul>

          <button
            onClick={() => handleAssinar("Premium")}
            style={{
              marginTop: 22,
              background: "#fdab00",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              width: "100%",
              cursor: "pointer",
              boxShadow: "0 2px 14px #fdab0022",
              transition: "background .18s",
            }}
            disabled={loading}
          >
            Assinar Premium
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 36, color: "#8b8b8b", fontSize: 14 }}>
        <b>Dica:</b> alterne entre mensal e anual para ver o preço por mês. No anual, a cobrança é feita 1x ao ano.
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
