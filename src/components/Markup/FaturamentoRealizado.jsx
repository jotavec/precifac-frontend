import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FaTrashAlt, FaFilter } from "react-icons/fa";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import "./FaturamentoRealizado.css"; // <-- IMPORTA O CSS

const API_URL = "/api/sales-results";
const corLinha = "#2196f3";   // <-- agora azul!
const corAmarelo = "#ffe156";

function maskMoneyBRL(v) {
  v = v.replace(/\D/g, "");
  if (v.length === 0) return "";
  while (v.length < 3) v = "0" + v;
  let reais = v.slice(0, -2);
  let centavos = v.slice(-2);
  reais = reais.replace(/^0+/, "") || "0";
  return "R$ " + reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + centavos;
}

function maskMonthYear(value) {
  value = value.replace(/\D/g, "");
  value = value.slice(0, 6);
  if (value.length > 2) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  }
  return value;
}

function formatarMes(mes) {
  if (!mes) return "";
  const partes = mes.includes("-") ? mes.split("-") : mes.split("/");
  if (partes.length === 2) return `${partes[1]}/${partes[0]}`;
  return mes;
}

function TooltipCustom({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="faturamento-tooltip">
        <div className="faturamento-tooltip-label">{formatarMes(label)}</div>
        <div className="faturamento-tooltip-value">
          Valor: R$ {payload[0].value.toLocaleString("pt-BR")}
        </div>
      </div>
    );
  }
  return null;
}

export default function FaturamentoRealizado({ user, setGastoSobreFaturamento }) {
  const USER_ID = user?.id;
  const [month, setMonth] = useState("");
  const [value, setValue] = useState("");
  const [lista, setLista] = useState([]);
  const [totalDespesasFixas, setTotalDespesasFixas] = useState(0);
  const [totalFolha, setTotalFolha] = useState(0);

  // Filtro de média: agora local!
  const [mediaTipo, setMediaTipo] = useState("6");

  // Modal filtro de média
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef();

  // Modal de confirmação de delete
  const [idParaDeletar, setIdParaDeletar] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const opcoes = [
    { label: "Último mês", value: "1" },
    { label: "Últimos 3 meses", value: "3" },
    { label: "Últimos 6 meses", value: "6" },
    { label: "Últimos 12 meses", value: "12" },
    { label: "Considerar todos", value: "all" }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    }
    if (modalOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  // Busca o filtro salvo no backend apenas uma vez ao carregar
  useEffect(() => {
    async function fetchFiltro() {
      try {
        const res = await axios.get("/api/filtro-faturamento", { withCredentials: true });
        if (res.data?.filtro && res.data.filtro !== mediaTipo) {
          setMediaTipo(res.data.filtro);
        }
      } catch {
        setMediaTipo("6");
      }
    }
    fetchFiltro();
    // eslint-disable-next-line
  }, [USER_ID]);

  function handleSelect(tipo) {
    setMediaTipo(tipo);
    setModalOpen(false);
    axios.post("/api/users/filtro-faturamento", { filtro: tipo }, { withCredentials: true }).catch(() => { });
  }

  useEffect(() => {
    if (USER_ID) buscar();
    // eslint-disable-next-line
  }, [USER_ID]);

  async function buscar() {
    try {
      const res = await axios.get(API_URL, { withCredentials: true });
      setLista(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLista([]);
    }
  }

  // Busca despesas fixas e folha do backend
  useEffect(() => {
    async function fetchTotais() {
      try {
        const resDespesas = await axios.get("/api/despesasfixas/subcategorias", { withCredentials: true });
        const categorias = Array.isArray(resDespesas.data) ? resDespesas.data : [];
        let totalFixas = 0;
        categorias.forEach(cat => {
          if (Array.isArray(cat.fixedCosts)) {
            cat.fixedCosts.forEach(custo => {
              totalFixas += Number(custo.value || 0);
            });
          }
        });

        const resFolha = await axios.get("/api/folhapagamento/funcionarios", { withCredentials: true });
        const funcionarios = Array.isArray(resFolha.data) ? resFolha.data : [];
        let totalFolha = 0;
        funcionarios.forEach(f => {
          const val = Number((f.salario || "").toString().replace(",", "."));
          if (!isNaN(val)) totalFolha += val;
        });

        setTotalDespesasFixas(totalFixas);
        setTotalFolha(totalFolha);
      } catch (err) {
        setTotalDespesasFixas(0);
        setTotalFolha(0);
      }
    }
    fetchTotais();
  }, []);

  async function salvar(e) {
    e.preventDefault();
    try {
      const [mm, yyyy] = month.split("/");
      const mesConvertido = yyyy && mm ? `${yyyy}-${mm}` : month;
      const valorNumerico = Number(value.replace(/\D/g, "")) / 100;

      await axios.post(API_URL, {
        month: mesConvertido,
        value: valorNumerico
      }, { withCredentials: true });

      setMonth("");
      setValue("");
      await buscar();
    } catch (err) {
      alert("Erro ao lançar faturamento!");
    }
  }

  // ---- FUNÇÕES DO MODAL DE DELETE ----
  function pedirConfirmacao(id) {
    setIdParaDeletar(id);
    setShowConfirmModal(true);
  }

  async function apagarConfirmado() {
    if (!idParaDeletar) return;
    try {
      await axios.delete(`${API_URL}/${idParaDeletar}`, { withCredentials: true });
      await buscar();
      setShowConfirmModal(false);
      setIdParaDeletar(null);
    } catch {
      alert("Erro ao apagar lançamento!");
      setShowConfirmModal(false);
      setIdParaDeletar(null);
    }
  }

  // ---- CÁLCULO DA MÉDIA ----
  let listaMedia;
  if (mediaTipo === "all") listaMedia = lista;
  else listaMedia = lista.slice(-Number(mediaTipo));
  const mediaCustom = Array.isArray(listaMedia) && listaMedia.length > 0
    ? listaMedia.reduce((acc, cur) => acc + cur.value, 0) / listaMedia.length
    : 0;

  const ultimos6 = Array.isArray(lista) ? lista.slice(-6) : [];

  const percentualGastos = mediaCustom > 0
    ? ((totalDespesasFixas + totalFolha) / mediaCustom) * 100
    : 0;

  const percentualGastosFormatado =
    percentualGastos % 1 === 0
      ? percentualGastos.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
      : percentualGastos.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="painel-root">
      {/* Header padrão */}
      <div className="painel-header">
        <div>
          <div className="painel-titulo-pagina">
            Faturamentos Realizados
          </div>
        </div>
        <div className="painel-total-geral">
          <span>Média de Faturamento</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <b>
              {mediaCustom
                ? `R$ ${mediaCustom.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "R$ 0,00"}
            </b>
            <FaFilter
              size={27}
              className="icon-filtro"
              title="Configurar média"
              style={{ cursor: "pointer", marginLeft: 6, marginTop: 0 }}
              onClick={() => setModalOpen(!modalOpen)}
              tabIndex={0}
            />
          </div>
          {modalOpen && (
            <div ref={modalRef} className="faturamento-filtro-modal">
              <div className="faturamento-filtro-titulo">
                Considerar quantos meses?
              </div>
              {opcoes.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`faturamento-filtro-opcao${opt.value === mediaTipo ? " ativo" : ""}`}
                  tabIndex={0}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
          {/* === % Gastos sobre faturamento === */}
          <div className="faturamento-badge-gastos">
            % Gastos sobre faturamento: <b>{percentualGastosFormatado}%</b>
          </div>
        </div>
      </div>

      {/* Bloco principal */}
      <div className="painel-content painel-content-faturamento">
        {/* Formulário de lançamento */}
        <form className="faturamento-form" onSubmit={salvar}>
          <input
            type="text"
            placeholder="MM/YYYY"
            value={month}
            onChange={e => setMonth(maskMonthYear(e.target.value))}
            required
            pattern="^(0[1-9]|1[0-2])\/\d{4}$"
            maxLength={7}
            title="Ex: 06/2024"
            className="faturamento-input-mes"
          />
          <input
            type="text"
            placeholder="Valor (R$)"
            value={value}
            onChange={e => setValue(maskMoneyBRL(e.target.value))}
            required
            inputMode="numeric"
            pattern="^R\$ (\d{1,3}(\.\d{3})*|\d+),\d{2}$"
            className="faturamento-input-valor"
          />
          <button type="submit" className="btn-azul-grad">
            Lançar
          </button>
        </form>

        {/* Gráfico */}
        <div className="faturamento-grafico-bloco">
          <div className="faturamento-grafico-titulo">
            Relação Gráfica dos Últimos 6 Meses
          </div>
          <ResponsiveContainer width="99%" height={250}>
            <LineChart data={ultimos6} margin={{ top: 32, right: 32, left: 32, bottom: 32 }}>
              <CartesianGrid stroke="#e1e9f7" strokeDasharray="4 6" />
              <XAxis dataKey="month" tickFormatter={formatarMes} stroke="#237be7" tick={{ fontSize: 15 }} tickMargin={18} />
              <Tooltip content={<TooltipCustom />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={corLinha}         // Linha azul #2196f3
                strokeWidth={3}
                dot={{ r: 5, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Histórico */}
        <h4 className="faturamento-historico-titulo">Histórico lançado:</h4>
        <ul className="faturamento-historico-lista">
          {Array.isArray(lista) && lista.slice().reverse().map(x => (
            <li key={x.id} className="faturamento-historico-item">
              <span className="faturamento-historico-label">
                <b>{formatarMes(x.month)}</b>: R$ {x.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <FaTrashAlt
                onClick={() => pedirConfirmacao(x.id)}
                className="faturamento-trash-btn"
                size={28}
                title="Apagar lançamento"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      <ConfirmDeleteModal
        isOpen={showConfirmModal}
        onRequestClose={() => {
          setShowConfirmModal(false);
          setIdParaDeletar(null);
        }}
        onConfirm={apagarConfirmado}
        itemLabel="faturamento"
      />
    </div>
  );
}
