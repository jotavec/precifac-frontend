import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ajuste o caminho se necessário

const planos = {
  gratuito: null,
  padrao: "ID_DO_PLANO_PADRAO",   // Troque pelo ID real
  premium: "ID_DO_PLANO_PREMIUM"  // Troque pelo ID real
};

export default function TabelaPlanos() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Pega dados do usuário logado (email, nome, etc)

  async function handleAssinar(plano) {
    if (plano === "Gratuito") {
      alert("Plano gratuito ativado!");
      // Aqui você pode atualizar o plano do usuário no sistema, se quiser
      return;
    }

    const planoId =
      plano === "Padrão"
        ? planos.padrao
        : plano === "Premium"
        ? planos.premium
        : null;

    if (!planoId) {
      alert("Plano ainda não disponível. Tente novamente mais tarde.");
      return;
    }

    if (!user?.email) {
      alert("Você precisa estar logado para assinar um plano!");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/mercadopago/criar-assinatura", {
        email: user.email,
        planoId
      });
      window.location.href = data.url; // Redireciona pro checkout Mercado Pago
    } catch (err) {
      alert("Erro ao iniciar assinatura: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{
        color: "#2196f3", textAlign: "center", fontWeight: 900,
        fontSize: 28, marginBottom: 32, letterSpacing: 1
      }}>
        Compare os Planos
      </h2>
      {loading && (
        <div style={{
          background: "#fffbe8", color: "#f3aa13", padding: "18px 0", borderRadius: 9,
          textAlign: "center", fontWeight: 700, marginBottom: 20, fontSize: 17
        }}>
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
        <div style={{
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
          justifyContent: "flex-start"
        }}>
          <div style={{
            color: "#2091e9",
            fontWeight: 900,
            fontSize: 24,
            marginBottom: 10
          }}>Gratuito</div>
          <div style={{
            color: "#2196f3",
            fontWeight: 900,
            fontSize: 20,
            marginBottom: 26
          }}>R$0</div>
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
              transition: "background .18s"
            }}
            disabled={loading}
          >
            Usar Gratuito
          </button>
        </div>
        {/* PADRÃO */}
        <div style={{
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
          justifyContent: "flex-start"
        }}>
          <div style={{
            color: "#fff",
            background: "#2196f3",
            fontWeight: 900,
            fontSize: 24,
            borderRadius: 8,
            marginBottom: 10,
            display: "inline-block",
            padding: "4px 32px"
          }}>Padrão</div>
          <div style={{
            color: "#2196f3",
            fontWeight: 900,
            fontSize: 20,
            marginBottom: 26
          }}>R$39,90</div>
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
              transition: "background .18s"
            }}
            disabled={loading}
          >
            Assinar Padrão
          </button>
        </div>
        {/* PREMIUM */}
        <div style={{
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
          justifyContent: "flex-start"
        }}>
          <div style={{
            color: "#fff",
            background: "#fdab00",
            fontWeight: 900,
            fontSize: 24,
            borderRadius: 8,
            marginBottom: 10,
            display: "inline-block",
            padding: "4px 32px"
          }}>Premium</div>
          <div style={{
            color: "#fdab00",
            fontWeight: 900,
            fontSize: 20,
            marginBottom: 26
          }}>R$59,90</div>
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
              transition: "background .18s"
            }}
            disabled={loading}
          >
            Assinar Premium
          </button>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 36, color: "#8b8b8b", fontSize: 14 }}>
        <b>Dica:</b> Basta clicar no botão para migrar ou assinar seu novo plano 😉
      </div>
      {/* CSS responsivo */}
      <style>
        {`
        @media (max-width: 1100px) {
          .tabela-planos-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 800px) {
          .tabela-planos-grid {
            grid-template-columns: 1fr !important;
          }
        }
        `}
      </style>
    </div>
  );
}
