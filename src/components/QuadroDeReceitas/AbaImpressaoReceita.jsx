import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AbaImpressaoReceita.css";

const API_URL = "/api";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function getFullAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return BACKEND_URL.replace(/\/$/, "") + "/" + avatarUrl.replace(/^\//, "");
}

const TEMPO_UNIDADE_TXT = ["dias", "meses", "anos"];

export default function AbaImpressaoReceita({ nomeReceita, imagemFinal, conservacaoData }) {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const { data: user } = await axios.get(`${API_URL}/users/me`, { withCredentials: true });
        const { data: empresa } = await axios.get(`${API_URL}/company-config`, { withCredentials: true });
        setPerfil({
          avatarUrl: user.avatarUrl,
          empresaNome: empresa.companyName,
          cnpj: empresa.cnpj,
          rua: empresa.rua,
          numero: empresa.numero,
          bairro: empresa.bairro,
          cidade: empresa.cidade,
          estado: empresa.estado,
          cep: empresa.cep,
        });
      } catch {
        setPerfil({});
      }
    }
    fetchPerfil();
  }, []);

  if (!perfil) {
    return (
      <div className="painel-a4-impressao-scroll">
        <div className="painel-a4-impressao-linhas">
          <div className="folha-a4-impressao">
            <div style={{ color: "#0094e7", fontWeight: 700, padding: 40 }}>Carregando dados da empresa...</div>
          </div>
        </div>
      </div>
    );
  }

  const endereco = perfil.rua
    ? `${perfil.rua}${perfil.numero ? ", " + perfil.numero : ""}`
    : "ENDEREÇO";
  const cidadeLinha =
    perfil.bairro || perfil.cidade || perfil.estado
      ? `${perfil.bairro || ""}${perfil.bairro && perfil.cidade ? ", " : ""}${perfil.cidade || ""}${perfil.cidade && perfil.estado ? ", " : ""}${perfil.estado || ""}`
      : "BAIRRO, CIDADE, ESTADO";
  const cep = perfil.cep || "CEP";
  const avatarUrl = getFullAvatarUrl(perfil.avatarUrl);

  // Foto da receita
  const receitaFotoUrl = imagemFinal
    ? (imagemFinal.startsWith("http") ? imagemFinal : BACKEND_URL.replace(/\/$/, "") + "/" + imagemFinal.replace(/^\//, ""))
    : null;

  // Fallback de conservação se não vier nada:
  const listaConservacao = Array.isArray(conservacaoData) && conservacaoData.length
    ? conservacaoData
    : [
        { descricao: "Congelado", temp: "-18", tempoNum: "6", tempoUnidade: 1 },
        { descricao: "Refrigerado", temp: "4", tempoNum: "3", tempoUnidade: 0 },
        { descricao: "Ambiente", temp: "20", tempoNum: "2", tempoUnidade: 2 }
      ];

  return (
    <div className="painel-a4-impressao-scroll">
      <div className="painel-a4-impressao-linhas">
        <div className="folha-a4-impressao">
          {/* TOPO DA EMPRESA */}
          <div className="a4-topo-empresa">
            <div className="a4-empresa-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Logo"
                  className="a4-empresa-logo-img"
                  onError={e => (e.target.style.display = "none")}
                />
              ) : (
                <span className="a4-logo-placeholder">Sem foto</span>
              )}
            </div>
            <div className="a4-empresa-dados">
              <div className="a4-empresa-nome">{perfil.empresaNome || "RAZÃO SOCIAL"}</div>
              <div className="a4-empresa-cnpj">{perfil.cnpj || "CNPJ"}</div>
              <div className="a4-empresa-endereco">{endereco}</div>
              <div className="a4-empresa-cidade">{cidadeLinha}</div>
              <div className="a4-empresa-cep">{cep}</div>
            </div>
          </div>
          {/* NOME DA RECEITA CENTRALIZADO */}
          <div className="a4-nome-receita">
            {nomeReceita || <span style={{ color: "#bcc9e1" }}>Nome da receita</span>}
          </div>
          {/* FOTO DA RECEITA */}
          {receitaFotoUrl && (
            <div className="a4-foto-receita-wrap">
              <img src={receitaFotoUrl} alt="Foto da Receita" className="a4-foto-receita-img" />
            </div>
          )}
          {/* CONSERVAÇÃO */}
          <div className="a4-quadro-conservacao">
            <div className="a4-conservacao-titulo">Conservação</div>
            <div className="a4-conservacao-tabela-head">
              <span>Descrição</span>
              <span>Temp. °C</span>
              <span>Tempo</span>
            </div>
            <div className="a4-conservacao-linhas">
              {listaConservacao.map((c, idx) => (
                <div className="a4-conservacao-item" key={idx}>
                  <span className="a4-cons-desc">{c.descricao}</span>
                  <span className="a4-cons-temp">{c.temp}°C</span>
                  <span className="a4-cons-tempo">
                    {c.tempoNum} {TEMPO_UNIDADE_TXT[c.tempoUnidade] || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
