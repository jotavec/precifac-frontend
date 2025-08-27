import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaCog } from "react-icons/fa";
import AbaGeralReceita from "./AbaGeralReceita";
import AbaComposicaoReceita from "./AbaComposicaoReceita";
import AbaProjecaoReceita from "./AbaProjecaoReceita";
import AbaMarkupReceita from "./AbaMarkupReceita";
import AbaImpressaoReceita from "./AbaImpressaoReceita";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import ModalConfiguracoes from "./ModalConfiguracoes";
import { pdf } from "@react-pdf/renderer";
import FichaTecnicaPDF from "./FichaTecnicaPDF";
import ModalUpgradePlano from "../modals/ModalUpgradePlano";
import { useAuth } from "../../App";
import "./CentralReceitas.css";

/** Bases do backend vindas do .env */
const VITE_API_URL = import.meta.env.VITE_API_URL;

let BACKEND_URL, API_BASE;

if (VITE_API_URL) {
  // Use complete API URL if provided
  API_BASE = String(VITE_API_URL).replace(/\/+$/, "");
  // Extract backend URL for uploads (remove /api suffix if present)
  BACKEND_URL = API_BASE.replace(/\/api$/, "");
} else {
  // Fallback to legacy configuration
  BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"; // usado para servir /uploads
  API_BASE = `${BACKEND_URL}${import.meta.env.VITE_API_PREFIX || ""}`; // usado para rotas da API (/api)
}
const api = (path) => `${API_BASE}${path}`;

const ABAS = [
  { label: "Composição", componente: AbaComposicaoReceita },
  { label: "Geral", componente: AbaGeralReceita },
  { label: "Projeção", componente: AbaProjecaoReceita },
  { label: "Markup", componente: AbaMarkupReceita },
  { label: "Impressão", componente: AbaImpressaoReceita },
];

const defaultConservacao = [
  { descricao: "Congelado", temp: "-18", tempoNum: "6", tempoUnidade: 1 },
  { descricao: "Refrigerado", temp: "4", tempoNum: "3", tempoUnidade: 0 },
  { descricao: "Ambiente", temp: "20", tempoNum: "2", tempoUnidade: 2 },
];

function normalizeBlocoAtivo(valor) {
  if (valor === undefined || valor === null || valor === "") return "subreceita";
  if (typeof valor === "number") return String(valor);
  return String(valor);
}

function formatarBRL(valor) {
  if (valor === null || valor === undefined || valor === "" || valor === "-") return "-";
  let num = Number(
    String(valor).replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
  );
  if (isNaN(num)) return "-";
  const valCorrigido = Math.abs(num) < 0.005 ? 0 : num;
  return valCorrigido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function gerarNumeroFicha(receitas) {
  const usados = receitas.map((r) => parseInt(r.numeroFicha)).filter((n) => !isNaN(n));
  const maior = usados.length > 0 ? Math.max(...usados) : 0;
  return String(maior + 1).padStart(4, "0");
}

function parseBRL(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  let valorLimpo = String(valor).replace(/[^0-9,.-]/g, "");
  if ((valorLimpo.match(/,/g) || []).length > 1) {
    const partes = valorLimpo.split(",");
    valorLimpo = partes.slice(0, -1).join("") + "." + partes[partes.length - 1];
  } else {
    valorLimpo = valorLimpo.replace(",", ".");
  }
  if (valorLimpo === "" || isNaN(valorLimpo)) return 0;
  return Number(valorLimpo);
}

/** ===== Helpers de URL da imagem ===== */
function toPublicUrl(url) {
  if (!url) return url;
  if (url.startsWith("data:image")) return url; // base64 (preview)
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${BACKEND_URL}${url}`; // servir pelo host SEM /api
  return url;
}
function toStoredUrl(url) {
  if (!url) return url;
  // remove o host com ou sem /api
  if (url.startsWith(API_BASE)) return url.replace(API_BASE, "");
  if (url.startsWith(BACKEND_URL)) return url.replace(BACKEND_URL, "");
  return url; // já relativo
}

export default function CentralReceitas() {
  const { user, setAba } = useAuth() || {};
  const plano = user?.plano || "gratuito";
  const isPlanoGratuito = plano === "gratuito";
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [receitas, setReceitas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [editandoId, setEditandoId] = useState(null);

  const [nome, setNome] = useState("");
  const [imagemFinal, setImagemFinal] = useState(null); // sempre pública p/ preview e PDF
  const [conservacaoData, setConservacaoData] = useState(defaultConservacao);
  const [observacoes, setObservacoes] = useState("");
  const [passosPreparo, setPassosPreparo] = useState([{ id: 1, descricao: "", imagem: null }]);
  const [ingredientes, setIngredientes] = useState([]);
  const [subReceitas, setSubReceitas] = useState([]);
  const [embalagens, setEmbalagens] = useState([]);
  const [maoDeObra, setMaoDeObra] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [rendimentoNumero, setRendimentoNumero] = useState("");
  const [rendimentoUnidade, setRendimentoUnidade] = useState("unidade");
  const [tempoTotal, setTempoTotal] = useState("");
  const [tempoUnidade, setTempoUnidade] = useState("minutos");
  const [precoVenda, setPrecoVenda] = useState("");
  const [pesoUnitario, setPesoUnitario] = useState("");
  const [descontoReais, setDescontoReais] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState("");
  const [blocosMarkup, setBlocosMarkup] = useState([]);
  const [dataUltimaAtualizacao, setDataUltimaAtualizacao] = useState("");
  const [numeroFicha, setNumeroFicha] = useState("");
  const [filtro, setFiltro] = useState("");

  const [blocoMarkupAtivo, setBlocoMarkupAtivo] = useState("subreceita");

  // MODAIS
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [receitaPraDeletar, setReceitaPraDeletar] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [deleteSelecionadosModalOpen, setDeleteSelecionadosModalOpen] = useState(false);

  // PERFIL DA EMPRESA/USUÁRIO (PARA FICHA TÉCNICA)
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    fetchReceitas();
    fetchBlocosMarkup();
    fetchPerfil();
  }, []);

  useEffect(() => {
    setAllSelected(false);
  }, [filtro]);

  async function fetchReceitas() {
    try {
      const res = await fetch(api("/receitas"), { credentials: "include" });
      if (res.ok) setReceitas(await res.json());
    } catch {}
  }

  async function fetchBlocosMarkup() {
    try {
      const res = await fetch(api("/markup-ideal"), { credentials: "include" });
      if (res.ok) setBlocosMarkup(await res.json());
    } catch {
      setBlocosMarkup([]);
    }
  }

  async function fetchPerfil() {
    try {
      const resUser = await fetch(api("/users/me"), { credentials: "include" });
      const user = resUser.ok ? await resUser.json() : {};

      const resConfig = await fetch(api("/company-config"), { credentials: "include" });
      const empresa = resConfig.ok ? await resConfig.json() : {};

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

  function handleEditar(receita) {
    setEditandoId(receita.id);
    setNome(receita.nomeProduto || receita.name || "");
    // normaliza para URL pública (preview/PDF)
    setImagemFinal(toPublicUrl(receita.imagemFinal || null));
    setConservacaoData(receita.conservacaoData || defaultConservacao);
    setObservacoes(receita.observacoes || receita.notes || "");
    setPassosPreparo(receita.passosPreparo || [{ id: 1, descricao: "", imagem: null }]);
    setIngredientes(receita.ingredientes || []);
    setSubReceitas(receita.subReceitas || []);
    setEmbalagens(receita.embalagens || []);
    setMaoDeObra(receita.maoDeObra || []);
    setTipoSelecionado(receita.tipoSelecionado || null);
    setRendimentoNumero(receita.rendimentoNumero || receita.yieldQty || "");
    setRendimentoUnidade(receita.rendimentoUnidade || receita.yieldUnit || "unidade");
    setTempoTotal(receita.tempoTotal || "");
    setTempoUnidade(receita.tempoUnidade || "minutos");
    setPrecoVenda(
      receita.precoVenda !== undefined && receita.precoVenda !== null
        ? parseBRL(receita.precoVenda)
        : ""
    );
    setPesoUnitario(receita.pesoUnitario || "");
    setDescontoReais(receita.descontoReais || "");
    setDescontoPercentual(receita.descontoPercentual || "");
    setDataUltimaAtualizacao(receita.dataUltimaAtualizacao || "");
    setBlocoMarkupAtivo(normalizeBlocoAtivo(receita.blocoMarkupAtivo));
    setNumeroFicha(receita.numeroFicha || "");
    setAbaAtiva(0);
    setModalOpen(true);
  }

  function handleApagar(id) {
    const receita = receitas.find((r) => r.id === id);
    setReceitaPraDeletar(receita);
    setDeleteModalOpen(true);
  }

  async function confirmarDelete() {
    if (!receitaPraDeletar) return;
    try {
      const res = await fetch(api(`/receitas/${receitaPraDeletar.id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchReceitas();
      setDeleteModalOpen(false);
      setReceitaPraDeletar(null);
    } catch {
      setDeleteModalOpen(false);
      setReceitaPraDeletar(null);
    }
  }

  function handleCadastrar() {
    // Pré-checagem de cota: plano gratuito limita a 5 receitas
    if (isPlanoGratuito && receitas.length >= 5) {
      setShowUpgrade(true);
      return;
    }

    setEditandoId(null);
    setNome("");
    setImagemFinal(null);
    setConservacaoData(defaultConservacao);
    setObservacoes("");
    setPassosPreparo([{ id: 1, descricao: "", imagem: null }]);
    setIngredientes([]);
    setSubReceitas([]);
    setEmbalagens([]);
    setMaoDeObra([]);
    setTipoSelecionado(null);
    setRendimentoNumero("");
    setRendimentoUnidade("unidade");
    setTempoTotal("");
    setTempoUnidade("minutos");
    setPrecoVenda("");
    setPesoUnitario("");
    setDescontoReais("");
    setDescontoPercentual("");
    setDataUltimaAtualizacao("");
    setBlocoMarkupAtivo("subreceita");
    setNumeroFicha(gerarNumeroFicha(receitas));
    setAbaAtiva(0);
    setModalOpen(true);
  }

  function getNomeBlocoMarkup(blocoAtivo) {
    if (!blocoAtivo || blocoAtivo === "subreceita") return "SubReceita";
    const bloco = blocosMarkup.find(
      (b, idx) => String(b.id || b.nome || idx) === String(blocoAtivo)
    );
    return bloco ? bloco.nome || bloco.label || bloco.categoria || "-" : "-";
  }

  function getNumeroFichaVisual(receita, idx) {
    if (receita.numeroFicha) return String(receita.numeroFicha).padStart(4, "0");
    return String(idx + 1).padStart(4, "0");
  }

  function calcularCustoUnitario(receita) {
    const ing = receita.ingredientes || [];
    const sub = receita.subReceitas || [];
    const emb = receita.embalagens || [];
    const mao = receita.maoDeObra || [];
    const rend = receita.rendimentoNumero || receita.yieldQty || "";
    const custoTotal =
      ing.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      sub.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      emb.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      mao.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);
    return rend && custoTotal > 0
      ? (custoTotal / Number(rend)).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "-";
  }

  function getBlocoMarkupDaReceita(receita) {
    if (!receita || !receita.blocoMarkupAtivo || receita.blocoMarkupAtivo === "subreceita") {
      return {
        markupIdeal: 1,
        gastosFaturamento: 0,
        impostos: 0,
        taxasPagamento: 0,
        comissoes: 0,
        outros: 0,
        totalEncargosReais: 0,
      };
    }
    const bloco = blocosMarkup.find(
      (b, idx) => String(b.id || b.nome || idx) === String(receita.blocoMarkupAtivo)
    );
    return (
      bloco || {
        markupIdeal: 1,
        gastosFaturamento: 0,
        impostos: 0,
        taxasPagamento: 0,
        comissoes: 0,
        outros: 0,
        totalEncargosReais: 0,
      }
    );
  }

  function calcularLucroLiquido(receita) {
    const bloco = getBlocoMarkupDaReceita(receita);
    const custo = calcularCustoUnitarioNum(receita);
    const preco = parseBRL(receita.precoVenda);
    if (!preco || !custo) return "-";
    const descontoTotalPercent =
      parseBRL(bloco.gastosFaturamento) +
      parseBRL(bloco.impostos) +
      parseBRL(bloco.taxasPagamento) +
      parseBRL(bloco.comissoes) +
      parseBRL(bloco.outros);
    const descontoEmReais = preco * (descontoTotalPercent / 100);
    const lucroLiquido = preco - descontoEmReais - custo - parseBRL(bloco.totalEncargosReais);
    const valCorrigido = Math.abs(lucroLiquido) < 0.005 ? 0 : lucroLiquido;
    return valCorrigido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function calcularCustoUnitarioNum(receita) {
    const ing = receita.ingredientes || [];
    const sub = receita.subReceitas || [];
    const emb = receita.embalagens || [];
    const mao = receita.maoDeObra || [];
    const rend = receita.rendimentoNumero || receita.yieldQty || "";
    const custoTotal =
      ing.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      sub.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      emb.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
      mao.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);
    return rend && custoTotal > 0 ? custoTotal / Number(rend) : 0;
  }

  function calcularMargemContribuicao(receita) {
    return calcularLucroLiquido(receita);
  }

  function autoSaveAbaAtual() {}

  function handleTrocarAba(idx) {
    autoSaveAbaAtual();
    setAbaAtiva(idx);
  }

  function handleSelectCheckbox(id) {
    setSelecionados((prev) => {
      const already = prev.includes(id);
      let novaSelecao;
      if (already) {
        novaSelecao = prev.filter((sid) => sid !== id);
      } else {
        novaSelecao = [...prev, id];
      }
      setAllSelected(novaSelecao.length === receitasFiltradas.length && receitasFiltradas.length > 0);
      return novaSelecao;
    });
  }

  function handleSelectAll() {
    if (!allSelected) {
      setSelecionados(receitasFiltradas.map((r) => r.id));
      setAllSelected(true);
    } else {
      setSelecionados([]);
      setAllSelected(false);
    }
  }

  function handleDeleteSelecionados() {
    setDeleteSelecionadosModalOpen(true);
  }

  async function confirmarDeleteSelecionados() {
    if (selecionados.length === 0) return;
    for (const id of selecionados) {
      try {
        await fetch(api(`/receitas/${id}`), { method: "DELETE", credentials: "include" });
      } catch {}
    }
    await fetchReceitas();
    setSelecionados([]);
    setAllSelected(false);
    setModalConfigOpen(false);
    setDeleteSelecionadosModalOpen(false);
  }

  // ----------- DOWNLOAD DIRETO DO PDF AO IMPRIMIR -----------
  async function handlePrintSelecionados() {
    if (selecionados.length === 0) return;
    setModalConfigOpen(false);

    const receitasValidas = receitas.filter(
      (r) => selecionados.includes(r.id) && r && typeof r === "object"
    );
    if (receitasValidas.length === 0) {
      alert("Nenhuma receita válida para exportar.");
      return;
    }

    try {
      const blob = await pdf(<FichaTecnicaPDF receitas={receitasValidas} perfil={perfil} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fichas-tecnicas.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erro ao gerar PDF: " + e.message);
    }
  }
  // ----------------------------------------------------------

  // ---------- SALVAR RECEITA -----------
  async function handleSalvar() {
    if (!nome.trim()) {
      alert("Preencha o nome da receita antes de salvar!");
      return;
    }

    // salvamos SEM o host (ex.: "/uploads/receitas/...jpg")
    const imagemUrlParaSalvar = toStoredUrl(imagemFinal);

    const safeBlocoAtivo = normalizeBlocoAtivo(blocoMarkupAtivo);
    const fichaParaSalvar = editandoId ? numeroFicha : gerarNumeroFicha(receitas);

    const dadosReceita = {
      nome: nome,
      ingredientes,
      subReceitas,
      embalagens,
      maoDeObra,
      tipoSelecionado,
      rendimentoNumero,
      rendimentoUnidade,
      tempoTotal,
      tempoUnidade,
      precoVenda: Number(parseBRL(precoVenda)).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      pesoUnitario,
      descontoReais,
      descontoPercentual,
      imagemFinal: imagemUrlParaSalvar || null,
      conservacaoData,
      observacoes,
      passosPreparo,
      dataUltimaAtualizacao,
      blocoMarkupAtivo: safeBlocoAtivo,
      numeroFicha: fichaParaSalvar,
    };

    try {
      let res;
      if (editandoId) {
        res = await fetch(api(`/receitas/${editandoId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(dadosReceita),
        });
      } else {
        res = await fetch(api(`/receitas`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(dadosReceita),
        });
      }
      if (res.ok) {
        await fetchReceitas();
        setModalOpen(false);
        setEditandoId(null);
        setNumeroFicha("");
      } else if (res.status === 403) {
        setShowUpgrade(true);
        return;
      } else {
        alert("Erro ao salvar receita!");
      }
    } catch {
      alert("Erro de rede ao salvar receita.");
    }
  }
  // --------------------------------------------------------------

  const custoTotalReceita =
    ingredientes.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
    subReceitas.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
    embalagens.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0) +
    maoDeObra.reduce((acc, cur) => acc + (Number(cur.valorTotal) || 0), 0);

  const rendimento = Number(rendimentoNumero) || 1;
  const custoUnitario = custoTotalReceita > 0 ? custoTotalReceita / rendimento : 0;

  const receitasFiltradas = receitas.filter((r) => {
    const texto = filtro.trim().toLowerCase();
    if (!texto) return true;
    return (
      (r.nomeProduto || r.name || "").toLowerCase().includes(texto) ||
      (r.tipoProduto || (r.tipoSelecionado && r.tipoSelecionado.label) || "")
        .toLowerCase()
        .includes(texto) ||
      (getNomeBlocoMarkup(normalizeBlocoAtivo(r.blocoMarkupAtivo)) || "")
        .toLowerCase()
        .includes(texto)
    );
  });

  const AbaComp = ABAS[abaAtiva].componente;

  function getImpressaoProps() {
    return {
      perfil,
      nomeReceita: nome,
      imagemFinal, // pública p/ PDF
      conservacaoData,
      observacoes,
      passosPreparo,
      ingredientes,
      subReceitas,
      embalagens,
      maoDeObra,
      tipoSelecionado,
      rendimentoNumero,
      rendimentoUnidade,
      tempoTotal,
      tempoUnidade,
      precoVenda,
      pesoUnitario,
      descontoReais,
      descontoPercentual,
      blocosMarkup,
      dataUltimaAtualizacao,
      blocoMarkupAtivo,
      numeroFicha,
    };
  }

  return (
    <div className="central-receitas-main">
      <div className="central-receitas-header">
        <h1 className="central-receitas-titulo">Central de Receitas</h1>
        <div className="central-receitas-header-row" style={{ alignItems: "center" }}>
          <input
            className="central-receitas-filtro-input"
            type="text"
            placeholder="Filtrar por nome, tipo, categoria, etc..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            autoComplete="off"
          />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={handleCadastrar} className="btn-nova-receita">
              <FaPlus /> Nova Receita
            </button>
            <button
              className="btn-configuracoes"
              title="Configurações"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "9px",
                borderRadius: "11px",
                marginLeft: "3px",
                fontSize: "1.38rem",
                color: "#00cfff",
                transition: "background 0.16s",
              }}
              onClick={() => setModalConfigOpen(true)}
            >
              <FaCog />
            </button>
          </div>
        </div>
      </div>

      <div className="central-receitas-tabela-wrap">
        <table className="central-receitas-tabela">
          <thead className="central-receitas-thead">
            <tr>
              <th className="central-receitas-th">Nº Ficha</th>
              <th className="central-receitas-th">Nome do Produto</th>
              <th className="central-receitas-th">Tipo do Produto</th>
              <th className="central-receitas-th">Categoria Markup</th>
              <th className="central-receitas-th">Custo (un.)</th>
              <th className="central-receitas-th">Margem de Contribuição (un.)</th>
              <th className="central-receitas-th">Lucro Líquido Esperado (un.)</th>
              <th className="central-receitas-th">Preço de Venda (un.)</th>
              <th className="central-receitas-th central-receitas-th-acoes">Editar</th>
              <th className="central-receitas-th central-receitas-th-acoes">Selecionar</th>
            </tr>
          </thead>
          <tbody>
            {receitasFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="central-receitas-td-centralizada central-receitas-td-vazia"
                >
                  Nenhuma receita cadastrada.
                </td>
              </tr>
            ) : (
              receitasFiltradas.map((receita, idx) => (
                <tr key={receita.id} className="central-receitas-tabela-linha">
                  <td className="central-receitas-td">{getNumeroFichaVisual(receita, idx)}</td>
                  <td className="central-receitas-td">
                    {receita.nomeProduto || receita.name || "-"}
                  </td>
                  <td className="central-receitas-td">
                    {receita.tipoProduto ||
                      (receita.tipoSelecionado && receita.tipoSelecionado.label) ||
                      "-"}
                  </td>
                  <td className="central-receitas-td">
                    {getNomeBlocoMarkup(normalizeBlocoAtivo(receita.blocoMarkupAtivo))}
                  </td>
                  <td className="central-receitas-td">{calcularCustoUnitario(receita)}</td>
                  <td className="central-receitas-td">{calcularMargemContribuicao(receita)}</td>
                  <td className="central-receitas-td">{calcularLucroLiquido(receita)}</td>
                  <td className="central-receitas-td">{formatarBRL(receita.precoVenda)}</td>
                  <td className="central-receitas-td central-receitas-td-acao">
                    <button
                      onClick={() => handleEditar(receita)}
                      className="central-receitas-btn-acao"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                  </td>
                  <td
                    className="central-receitas-td central-receitas-td-acao"
                    style={{ textAlign: "center" }}
                  >
                    <label className="checkbox-custom">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(receita.id)}
                        onChange={() => handleSelectCheckbox(receita.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="central-receitas-modal-bg">
          <div className="central-receitas-modal">
            <div className="central-receitas-modal-abas">
              {ABAS.map((aba, idx) => (
                <div
                  key={aba.label}
                  onClick={() => handleTrocarAba(idx)}
                  className={`central-receitas-aba${
                    abaAtiva === idx ? " central-receitas-aba-ativa" : ""
                  }`}
                >
                  {aba.label}
                </div>
              ))}
            </div>
            <div className="central-receitas-modal-content custom-scrollbar">
              {ABAS[abaAtiva].label === "Impressão" ? (
                <AbaImpressaoReceita {...getImpressaoProps()} />
              ) : (
                <AbaComp
                  nome={nome}
                  setNome={setNome}
                  imagemFinal={imagemFinal}
                  setImagemFinal={(v) => setImagemFinal(toPublicUrl(v))}
                  conservacaoData={conservacaoData}
                  setConservacaoData={setConservacaoData}
                  observacoes={observacoes}
                  setObservacoes={setObservacoes}
                  passosPreparo={passosPreparo}
                  setPassosPreparo={setPassosPreparo}
                  ingredientes={ingredientes}
                  setIngredientes={setIngredientes}
                  subReceitas={subReceitas}
                  setSubReceitas={setSubReceitas}
                  embalagens={embalagens}
                  setEmbalagens={setEmbalagens}
                  maoDeObra={maoDeObra}
                  setMaoDeObra={setMaoDeObra}
                  tipoSelecionado={tipoSelecionado}
                  setTipoSelecionado={setTipoSelecionado}
                  rendimentoNumero={rendimentoNumero}
                  setRendimentoNumero={setRendimentoNumero}
                  rendimentoUnidade={rendimentoUnidade}
                  setRendimentoUnidade={setRendimentoUnidade}
                  tempoTotal={tempoTotal}
                  setTempoTotal={setTempoTotal}
                  tempoUnidade={tempoUnidade}
                  setTempoUnidade={setTempoUnidade}
                  precoVenda={precoVenda}
                  setPrecoVenda={setPrecoVenda}
                  pesoUnitario={pesoUnitario}
                  setPesoUnitario={setPesoUnitario}
                  descontoReais={descontoReais}
                  setDescontoReais={setDescontoReais}
                  descontoPercentual={descontoPercentual}
                  setDescontoPercentual={setDescontoPercentual}
                  blocosMarkup={blocosMarkup}
                  custoTotalReceita={custoTotalReceita}
                  custoUnitario={custoUnitario}
                  dataUltimaAtualizacao={dataUltimaAtualizacao}
                  setDataUltimaAtualizacao={setDataUltimaAtualizacao}
                  blocoMarkupAtivo={blocoMarkupAtivo}
                  setBlocoMarkupAtivo={setBlocoMarkupAtivo}
                  numeroFicha={numeroFicha}
                  setNumeroFicha={setNumeroFicha}
                />
              )}
            </div>
            <div className="central-receitas-modal-footer">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditandoId(null);
                }}
                className="btn-cancelar-modal-receita"
              >
                Cancelar
              </button>
              <button onClick={handleSalvar} className="btn-salvar-modal-receita">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÕES */}
      <ModalConfiguracoes
        open={modalConfigOpen}
        onClose={() => setModalConfigOpen(false)}
        selecionados={selecionados}
        onDeleteSelecionados={handleDeleteSelecionados}
        onPrintSelecionados={handlePrintSelecionados}
        totalReceitas={receitasFiltradas.length}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
      />

      {/* MODAL DE CONFIRMAR DELETE INDIVIDUAL */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onRequestClose={() => {
          setDeleteModalOpen(false);
          setReceitaPraDeletar(null);
        }}
        onConfirm={confirmarDelete}
        itemLabel={receitaPraDeletar?.nomeProduto || receitaPraDeletar?.name || "receita"}
      />

      {/* MODAL DE CONFIRMAR DELETE DE SELECIONADOS */}
      <ConfirmDeleteModal
        isOpen={deleteSelecionadosModalOpen}
        onRequestClose={() => setDeleteSelecionadosModalOpen(false)}
        onConfirm={confirmarDeleteSelecionados}
        itemLabel={
          selecionados.length > 1
            ? `${selecionados.length} receitas selecionadas`
            : "1 receita selecionada"
        }
      />

      {/* Modal de Upgrade quando extrapola limite */}
      <ModalUpgradePlano
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        irParaPlanos={() => {
          setAba("perfil_planos");
          setShowUpgrade(false);
        }}
      />
    </div>
  );
}
