import React from "react";

// Função utilitária para formatar preço (caso venha número ou string)
function formatarBRL(valor) {
  if (valor === null || valor === undefined || valor === "" || valor === "-") return "-";
  let num = Number(
    String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );
  if (isNaN(num)) return "-";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FichaTecnicaImpressao({ receita, perfil = {} }) {
  if (!receita) return null;

  // DEBUG: mostrar o objeto receita para inspeção no console
  console.log("DEBUG receita:", receita);

  const backendUrl = "http://localhost:3000";

  // Dados da empresa do perfil (se não vier nada, mostra placeholders)
  const razaoSocial = perfil.empresaNome || "RAZAO SOCIAL";
  const cnpj = perfil.cnpj || "CNPJ";
  const endereco = perfil.rua
    ? `${perfil.rua}${perfil.numero ? ", " + perfil.numero : ""}`
    : "ENDEREÇO";
  const cidadeLinha =
    perfil.bairro || perfil.cidade || perfil.estado
      ? `${perfil.bairro || ""}${perfil.bairro && perfil.cidade ? ", " : ""}${
          perfil.cidade || ""
        }${perfil.cidade && perfil.estado ? ", " : ""}${perfil.estado || ""}`
      : "BAIRRO, CIDADE, ESTADO";
  const cep = perfil.cep || "CEP";

  const avatarUrl = perfil.avatarUrl
    ? perfil.avatarUrl.startsWith("http")
      ? perfil.avatarUrl
      : `${backendUrl}${perfil.avatarUrl}`
    : null;

  return (
    <div
      className="ficha-tecnica-impressao"
      style={{
        background: "#fff",
        border: "1.5px solid #e5eaf2",
        borderRadius: 10,
        padding: 0,
        marginBottom: 28,
        fontSize: 15,
        color: "#222",
        width: "100%",
        boxSizing: "border-box",
        pageBreakInside: "avoid",
        maxWidth: "790px",
        margin: "28px auto",
      }}
    >
      {/* TOPO ESTILO WORD */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          overflow: "hidden",
          borderBottom: "none",
          padding: "10px 20px",
          gap: 20,
        }}
      >
        {/* Avatar maior, sem fundo e sem bordas tracejadas */}
        <div
          style={{
            minWidth: 84,
            height: 110,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Logo"
              style={{
                width: 70,
                height: "100%",
                objectFit: "cover",
                borderRadius: 10,
                border: "none",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "";
              }}
            />
          ) : (
            <span
              style={{
                color: "#176582",
                fontWeight: "700",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Sem foto
            </span>
          )}
        </div>

        {/* Dados da empresa */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            paddingRight: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            lineHeight: 1.2,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "#2196f3",
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            {razaoSocial}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            {cnpj}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
            {endereco}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
            {cidadeLinha}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{cep}</div>
        </div>
      </div>

      {/* Faixa azul escura + nome da receita com estilo do botão do sistema, sem sombra e sem bordas arredondadas */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #00cfff 0%, #2196f3 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 39,
          padding: 0,
          margin: 0,
          borderRadius: 0,
          boxShadow: "none",
        }}
      >
        <div
          style={{
            padding: "6px 32px",
            fontWeight: 900,
            fontSize: 22,
            color: "#fff",
            letterSpacing: "0.7px",
            textAlign: "center",
            userSelect: "none",
            cursor: "default",
          }}
        >
          {receita.nomeProduto || receita.name || "NOME DA RECEITA"}
        </div>
      </div>

      {/* RESTO DA FICHA */}
      <div style={{ padding: 22, paddingTop: 20, fontSize: 15 }}>
        {/* Ingredientes */}
        <div style={{ marginBottom: 10 }}>
          <strong>Ingredientes:</strong>
          {receita.ingredientes && receita.ingredientes.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              {receita.ingredientes.map((ing, idx) => (
                <li key={idx}>
                  {ing.nome || ing.desc || "Ingrediente"}
                  {" — "}
                  {ing.qtd ? `${ing.qtd} ` : ""}
                  {ing.unidade || ""}
                </li>
              ))}
            </ul>
          ) : (
            <span> Nenhum ingrediente cadastrado.</span>
          )}
        </div>

        {/* Sub-Receitas */}
        {receita.subReceitas && receita.subReceitas.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <strong>Sub-Receitas:</strong>
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              {receita.subReceitas.map((sub, idx) => (
                <li key={idx}>{sub.nome || sub.desc || "Sub-receita"}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Embalagens */}
        {receita.embalagens && receita.embalagens.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <strong>Embalagens:</strong>
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              {receita.embalagens.map((emb, idx) => (
                <li key={idx}>{emb.nome || emb.desc || "Embalagem"}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Número da ficha */}
        <div style={{ marginBottom: 10 }}>
          <strong>Número da ficha:</strong> {receita.numeroFicha || "----"}
        </div>

        {/* Observações */}
        <div style={{ marginBottom: 10 }}>
          <strong>Observações:</strong> {receita.observacoes || "-"}
        </div>

        {/* Modo de Preparo */}
        <div style={{ marginBottom: 10 }}>
          <strong>Modo de Preparo:</strong>
          {receita.passosPreparo && receita.passosPreparo.length > 0 ? (
            <ol style={{ margin: 0, paddingLeft: 22 }}>
              {receita.passosPreparo.map((passo, idx) => (
                <li key={idx}>{passo.descricao || "-"}</li>
              ))}
            </ol>
          ) : (
            <span> Não informado.</span>
          )}
        </div>

        {/* Conservação */}
        {receita.conservacaoData && receita.conservacaoData.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <strong>Conservação:</strong>
            <ul style={{ margin: 0, paddingLeft: 22 }}>
              {receita.conservacaoData.map((cons, idx) => (
                <li key={idx}>
                  {cons.descricao || "-"}
                  {" | Temp: "}
                  {cons.temp || "-"}°C
                  {" | Tempo: "}
                  {cons.tempoNum || "-"}{" "}
                  {cons.tempoUnidade === 0
                    ? "dias"
                    : cons.tempoUnidade === 1
                    ? "meses"
                    : cons.tempoUnidade === 2
                    ? "anos"
                    : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rendimento e Preço */}
        <div style={{ marginBottom: 10 }}>
          <strong>Rendimento:</strong> {receita.rendimentoNumero || "-"}{" "}
          {receita.rendimentoUnidade || ""}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Preço de Venda (un.):</strong> {formatarBRL(receita.precoVenda)}
        </div>
      </div>
    </div>
  );
}
