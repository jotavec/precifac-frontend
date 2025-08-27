import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import FichaTecnicaPDF from "./FichaTecnicaPDF";
import { toPublicUrl } from "../../lib/api";
import "./AbaImpressaoReceita.css";
const TEMPO_UNIDADE_TXT = ["dias", "meses", "anos"];

function renderizaMarcasImpressao(marca) {
  if (!marca) return "-";
  if (Array.isArray(marca)) {
    if (marca.length === 0) return "-";
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {marca.map((m, i) => (
          <li key={i} style={{ margin: 0, padding: 0, lineHeight: 1.2 }}>{m}</li>
        ))}
      </ul>
    );
  }
  if (typeof marca === "string" && marca.includes(",")) {
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {marca.split(",").map((m, i) => (
          <li key={i} style={{ margin: 0, padding: 0, lineHeight: 1.2 }}>{m.trim()}</li>
        ))}
      </ul>
    );
  }
  return marca;
}

function getImgSrc(imagem) {
  return toPublicUrl(imagem);
}

function FolhaHeader({
  nomeReceita, imagemFinal, conservacaoData, dataUltimaAtualizacao, rendimentoNumero,
  rendimentoUnidade, pesoUnitario, tipoSelecionado, tempoTotal, tempoUnidade
}) {
  const receitaFotoUrl = getImgSrc(imagemFinal);
  const listaConservacao = Array.isArray(conservacaoData) && conservacaoData.length
    ? conservacaoData
    : [
      { descricao: "Congelado", temp: "-18", tempoNum: "6", tempoUnidade: 1 },
      { descricao: "Refrigerado", temp: "4", tempoNum: "3", tempoUnidade: 0 },
      { descricao: "Ambiente", temp: "20", tempoNum: "2", tempoUnidade: 2 }
    ];
  const corPadrao = "#222";
  const fundoCabecalho = "#eaf6ff";
  function formatarData(dataStr) {
    if (!dataStr) return "-";
    const d = new Date(dataStr);
    if (isNaN(d)) return dataStr;
    return d.toLocaleDateString("pt-BR");
  }
  function formatarTempo() {
    if (!tempoTotal || !tempoUnidade) return "-";
    return `${tempoTotal} ${tempoUnidade}`;
  }
  function formatarPeso() {
    if (!pesoUnitario) return "-";
    return `${pesoUnitario} G`;
  }
  function formatarTipo() {
    return tipoSelecionado?.label || "-";
  }
  function formatarRendimento() {
    return `${rendimentoNumero || "-"} ${rendimentoUnidade || ""}`;
  }

  return (
    <div>
      <div className="a4-nome-receita" style={{ marginBottom: 24, color: "#222" }}>
        {nomeReceita || <span style={{ color: "#bcc9e1" }}>Nome da receita</span>}
      </div>
      <div className="a4-dupla-bloco-centralizado">
        <div className="a4-bloco-img-364">
          {receitaFotoUrl && (
            <img
              src={receitaFotoUrl}
              alt="Foto da Receita"
              className="a4-imagem-impressao-img"
            />
          )}
        </div>
        <div className="a4-bloco-conservacao-364"
          style={{
            padding: "10px 9px",
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: "#f7fafd",
            borderRadius: 14,
            height: 364,
            boxSizing: "border-box",
            justifyContent: "flex-start"
          }}>
          <div>
            <div className="a4-conservacao-titulo"
              style={{
                marginBottom: 8,
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: 0.1,
                color: corPadrao
              }}>
              Conservação
            </div>
            <div
              className="a4-conservacao-tabela-head"
              style={{
                fontSize: 13.5,
                display: "grid",
                gridTemplateColumns: "2.1fr 1.1fr 1.2fr",
                gap: "14px",
                padding: "0 2px 2.5px 2px",
                borderBottom: "1.2px solid #eaf3ff",
                marginBottom: 3,
                color: corPadrao,
                fontWeight: 800,
                background: fundoCabecalho,
                borderRadius: 5
              }}
            >
              <span>Descrição</span>
              <span style={{ textAlign: "center", whiteSpace: "nowrap" }}>Temp. °C</span>
              <span style={{ textAlign: "center" }}>Tempo</span>
            </div>
            <div className="a4-conservacao-linhas"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                marginTop: 1.5
              }}>
              {listaConservacao.map((c, idx) => (
                <div
                  className="a4-conservacao-item"
                  key={idx}
                  style={{
                    fontSize: 12.5,
                    display: "grid",
                    gridTemplateColumns: "2.1fr 1.1fr 1.2fr",
                    gap: "14px",
                    padding: "2.5px 2px",
                    alignItems: "center",
                    borderRadius: 4,
                    background: idx % 2 === 0 ? "#f9fbfe" : "#f2f8fd"
                  }}
                >
                  <span className="a4-cons-desc" style={{ color: corPadrao, fontWeight: 700 }}>{c.descricao}</span>
                  <span className="a4-cons-temp" style={{ color: corPadrao, fontWeight: 700, textAlign: "center", whiteSpace: "nowrap" }}>{c.temp}°C</span>
                  <span className="a4-cons-tempo" style={{ color: corPadrao, fontWeight: 700, textAlign: "center" }}>
                    {c.tempoNum} {TEMPO_UNIDADE_TXT[c.tempoUnidade] || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div
              className="a4-dados-titulo"
              style={{
                margin: "6px 0 0 0",
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: 0.1,
                color: corPadrao
              }}
            >
              Dados do produto
            </div>
            <div
              className="a4-dados-tabela-head"
              style={{
                fontSize: 13.5,
                display: "grid",
                gridTemplateColumns: "2fr 2.7fr",
                gap: "14px",
                padding: "0 2px 2.5px 2px",
                borderBottom: "1.2px solid #eaf3ff",
                margin: "3px 0 3px 0",
                color: corPadrao,
                fontWeight: 800,
                background: fundoCabecalho,
                borderRadius: 5
              }}
            >
              <span>Descrição</span>
              <span style={{ textAlign: "center" }}>Dados</span>
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              marginTop: 1.5,
              fontSize: 12.5
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.7fr",
                gap: "14px",
                padding: "2.5px 2px",
                alignItems: "center",
                borderRadius: 4,
                background: "#f9fbfe"
              }}>
                <span style={{ color: corPadrao, fontWeight: 700 }}>Atualização</span>
                <span style={{ color: corPadrao, textAlign: "center", fontWeight: 700 }}>{formatarData(dataUltimaAtualizacao)}</span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.7fr",
                gap: "14px",
                padding: "2.5px 2px",
                alignItems: "center",
                borderRadius: 4,
                background: "#f2f8fd"
              }}>
                <span style={{ color: corPadrao, fontWeight: 700 }}>Rendimento</span>
                <span style={{ color: corPadrao, textAlign: "center", fontWeight: 700 }}>{formatarRendimento()}</span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.7fr",
                gap: "14px",
                padding: "2.5px 2px",
                alignItems: "center",
                borderRadius: 4,
                background: "#f9fbfe"
              }}>
                <span style={{ color: corPadrao, fontWeight: 700 }}>Peso (un)</span>
                <span style={{ color: corPadrao, textAlign: "center", fontWeight: 700 }}>{formatarPeso()}</span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.7fr",
                gap: "14px",
                padding: "2.5px 2px",
                alignItems: "center",
                borderRadius: 4,
                background: "#f2f8fd"
              }}>
                <span style={{ color: corPadrao, fontWeight: 700 }}>Tipo</span>
                <span style={{ color: corPadrao, textAlign: "center", fontWeight: 700 }}>{formatarTipo()}</span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.7fr",
                gap: "14px",
                padding: "2.5px 2px",
                alignItems: "center",
                borderRadius: 4,
                background: "#f9fbfe"
              }}>
                <span style={{ color: corPadrao, fontWeight: 700 }}>Tempo total</span>
                <span style={{ color: corPadrao, textAlign: "center", fontWeight: 700 }}>{formatarTempo()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= TABELAS ===================
function TabelaIngredientes({ ingredientes = [] }) {
  return (
    <table style={{ width: "100%", marginTop: 18, borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f7fafd", color: "#222", fontWeight: 800, fontSize: 18 }}>
          <th style={{ textAlign: "left", padding: 8 }}>Ingredientes</th>
          <th style={{ textAlign: "center", padding: 8 }}>Marca</th>
          <th style={{ textAlign: "center", padding:8 }}>Un. Medida</th>
          <th style={{ textAlign: "center", padding: 8 }}>1 Receita</th>
          <th style={{ textAlign: "center", padding: 8 }}>2 Receitas</th>
          <th style={{ textAlign: "center", padding: 8 }}>3 Receitas</th>
        </tr>
      </thead>
      <tbody>
        {ingredientes.map((item, idx) => {
          const qt1 = Number(item.qtUsada || item.quantidade || 0);
          return (
            <tr key={idx} style={{
              background: idx % 2 === 0 ? "#fafdff" : "#f5faff",
              color: "#222",
              fontSize: 16,
              borderBottom: "1px solid #e8f3ff",
            }}>
              <td style={{ textAlign: "left", padding: 8 }}>{item.nome || item.ingrediente || item.label || item.produtoId || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{renderizaMarcasImpressao(item.marca)}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{item.unMedida || item.unidadeMedida || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 ? qt1 * 2 : "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 ? qt1 * 3 : "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TabelaSubReceitas({ subReceitas = [] }) {
  return (
    <table style={{ width: "100%", marginTop: 18, borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f7fafd", color: "#222", fontWeight: 800, fontSize: 18 }}>
          <th style={{ textAlign: "left", padding: 8 }}>Sub Receitas</th>
          <th style={{ textAlign: "center", padding: 8 }}>Tipo</th>
          <th style={{ textAlign: "center", padding: 8 }}>Un. Medida</th>
          <th style={{ textAlign: "center", padding: 8 }}>1 Receita</th>
          <th style={{ textAlign: "center", padding: 8 }}>2 Receitas</th>
          <th style={{ textAlign: "center", padding: 8 }}>3 Receitas</th>
        </tr>
      </thead>
      <tbody>
        {subReceitas.map((item, idx) => {
          const qt1 = Number(item.qt || item.quantidade || 0);
          return (
            <tr key={idx} style={{
              background: idx % 2 === 0 ? "#fafdff" : "#f5faff",
              color: "#222",
              fontSize: 16,
              borderBottom: "1px solid #e8f3ff",
            }}>
              <td style={{ textAlign: "left", padding: 8 }}>{item.nome || item.receita || item.label || item.receitaId || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{item.tipo || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{item.medida || item.unidadeMedida || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 ? qt1 * 2 : "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 ? qt1 * 3 : "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TabelaEmbalagens({ embalagens = [] }) {
  return (
    <table style={{ width: "100%", marginTop: 18, borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f7fafd", color: "#222", fontWeight: 800, fontSize: 18 }}>
          <th style={{ textAlign: "left", padding: 8 }}>Embalagem</th>
          <th style={{ textAlign: "center", padding: 8 }}>Marca</th>
          <th style={{ textAlign: "center", padding: 8 }}>Un. Medida</th>
          <th style={{ textAlign: "center", padding: 8 }}>1 Receita</th>
          <th style={{ textAlign: "center", padding: 8 }}>2 Receitas</th>
          <th style={{ textAlign: "center", padding: 8 }}>3 Receitas</th>
        </tr>
      </thead>
      <tbody>
        {embalagens.map((item, idx) => {
          const qt1 = Number(item.qtUsada || item.quantidade || 0);
          return (
            <tr key={idx} style={{
              background: idx % 2 === 0 ? "#fafdff" : "#f5faff",
              color: "#222",
              fontSize: 16,
              borderBottom: "1px solid #e8f3ff",
            }}>
              <td style={{ textAlign: "left", padding: 8 }}>{item.nome || item.embalagem || item.label || item.produtoId || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{renderizaMarcasImpressao(item.marca)}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{item.unMedida || item.unidadeMedida || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 || "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 ? qt1 * 2 : "-"}</td>
              <td style={{ textAlign: "center", padding: 8 }}>{qt1 ? qt1 * 3 : "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ================= MODO DE PREPARO ===================
function ListaPreparo({ passosPreparo = [] }) {
  const corPadrao = "#222";
  return (
    <div
      style={{
        marginTop: 22,
        width: "100%",
        boxSizing: "border-box",
        background: "#f7fafd",
        borderRadius: 8,
        paddingBottom: 6,
      }}
    >
      <div style={{
        color: corPadrao,
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: 0.1,
        padding: "0 10px 6px 6px",
        marginBottom: 0,
        borderRadius: 8,
        background: "#f7fafd"
      }}>
        <span style={{ textAlign: "left" }}>Modo de Preparo</span>
      </div>
      <ol style={{ margin: "12px 0 0 24px", padding: 0, fontSize: 16, color: "#222" }}>
        {passosPreparo.map((passo, idx) => (
          <React.Fragment key={idx}>
            <li
              style={{
                marginBottom: 14,
                position: "relative",
                minHeight: 90,
                display: "flex",
                alignItems: "center",
                wordBreak: "break-word"
              }}
            >
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: corPadrao }}>{`Passo ${idx + 1}: `}</span>
                <span style={{ wordBreak: "break-word" }}>
                  {passo.descricao || "-"}
                </span>
              </div>
              {passo.imagem && getImgSrc(passo.imagem) && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minWidth: 110,
                }}>
                  <img
                    src={getImgSrc(passo.imagem)}
                    alt={`Passo ${idx + 1}`}
                    style={{
                      width: 80,
                      height: 80,
                      maxWidth: 80,
                      maxHeight: 80,
                      borderRadius: 8,
                      objectFit: "cover",
                      boxShadow: "0 2px 7px #22222216",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                </div>
              )}
            </li>
            {idx !== passosPreparo.length - 1 && (
              <hr style={{
                margin: "0 0 14px 0",
                border: 0,
                borderTop: "1px solid #e8f3ff"
              }} />
            )}
          </React.Fragment>
        ))}
      </ol>
    </div>
  );
}

// =================== COMPONENTE PREVIEW PRINCIPAL =====================
export default function AbaImpressaoReceita(props) {
  // Teste se tem observações
  const temObservacoes = !!(props.observacoes && props.observacoes.trim().length > 0);

  return (
    <div className="painel-a4-impressao-scroll" style={{
      width: "100%",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      // Não centralize verticalmente aqui
    }}>
      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        marginBottom: 0,
        paddingTop: 24, // espaço do topo
        paddingRight: 24
      }}>
        <PDFDownloadLink
          document={<FichaTecnicaPDF {...props} />}
          fileName={`${props.nomeReceita || "Ficha_Tecnica"}.pdf`}
        >
          {({ loading }) =>
            <button
              style={{
                background: "linear-gradient(90deg, #009ffd 0%, #2a80ff 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 32px",
                fontWeight: 900,
                fontSize: "1.1rem",
                cursor: "pointer",
                boxShadow: "0 2px 12px #00cfff29",
                margin: "0 20px 0 0",
                letterSpacing: "0.5px",
                transition: "filter 0.12s"
              }}
            >
              {loading ? "Gerando PDF..." : "Baixar PDF em Texto"}
            </button>
          }
        </PDFDownloadLink>
      </div>
      <div className="painel-a4-impressao-linhas" style={{
        flex: 1,
        display: "flex",
        flexDirection: "row",
        gap: 36,
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: 32,
      }}>
        <div className="folha-a4-impressao">
          <FolhaHeader {...props} />
          {props.ingredientes && props.ingredientes.length > 0 && <TabelaIngredientes ingredientes={props.ingredientes} />}
          {props.subReceitas && props.subReceitas.length > 0 && <TabelaSubReceitas subReceitas={props.subReceitas} />}
          {props.embalagens && props.embalagens.length > 0 && <TabelaEmbalagens embalagens={props.embalagens} />}
          {props.passosPreparo && props.passosPreparo.length > 0 && <ListaPreparo passosPreparo={props.passosPreparo} />}

          {/* BLOCO DE OBSERVAÇÕES NO FINAL */}
          {temObservacoes && (
            <div
              className="a4-bloco-observacoes"
              style={{
                marginTop: 26,
                background: "#fff6e0",
                border: "1px solid #ffe6aa",
                borderRadius: 10,
                padding: "13px 15px 11px 15px",
                fontSize: 14,
                color: "#333",
                fontWeight: 600,
                whiteSpace: "pre-line",
                boxShadow: "0 2px 10px #f6cc6e1a"
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 6, color: "#b1850d", letterSpacing: 0.02 }}>
                Observações
              </div>
              <div>{props.observacoes.trim()}</div>
            </div>
          )}
          {/* FIM BLOCO DE OBSERVAÇÕES */}
        </div>
      </div>
    </div>
  );
}
