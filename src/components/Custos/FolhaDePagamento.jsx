// src/pages/FolhaDePagamento/FolhaDePagamento.jsx
import { useEffect, useState, useRef } from "react";
import { FaTrashAlt } from "react-icons/fa";
import "./FolhaDePagamento.css";
import ModalFuncionario from "./ModalFuncionario";
import api from "../../services/api";

// --- helpers de formatação ---
function parseBR(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/\./g, "").replace(",", "."));
}
function parsePercentBR(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(",", "."));
}
function maskMoneyBR(str) {
  if (!str) return "0,00";
  const only = String(str).replace(/\D/g, "");
  if (!only) return "0,00";
  const num = Number(only) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatPercentForDisplay(value, editing) {
  let v = String(value || "").replace(/\D/g, "");
  if (!v) return editing ? "" : "0";
  if (editing) {
    while (v.length < 3) v = "0" + v; // garante pelo menos 0,00
    const intPart = v.slice(0, -2);
    const decPart = v.slice(-2);
    return `${intPart},${decPart}`.replace(/^0+(\d)/, "$1");
  }
  const perc = parsePercentBR(value);
  return perc
    .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/,00$/, "");
}

const CAMPOS_PERCENTUAIS = [
  { key: "fgts", label: "FGTS (%)" },
  { key: "inss", label: "INSS (%)" },
  { key: "rat", label: "RAT (%)" },
  { key: "ferias13", label: "Férias + 13º (%)" },
  { key: "valeTransporte", label: "Vale Transporte (%)" },
  { key: "valeAlimentacao", label: "Vale Alimentação (%)" },
  { key: "valeRefeicao", label: "Vale Refeição (%)" },
  { key: "planoSaude", label: "Plano de Saúde (%)" },
  { key: "outros", label: "Outros (%)" },
];

function calcularTotalFuncionarioObj(f) {
  const salarioNum = parseBR(f.salario);
  let total = salarioNum;
  CAMPOS_PERCENTUAIS.forEach(({ key }) => {
    const p = parsePercentBR(f[key] || "0");
    total += salarioNum * (p / 100);
  });
  return Number(total) || 0;
}
function valorHoraFuncionario(f) {
  const horas = Number(f.totalHorasMes || 220);
  if (!horas) return 0;
  return calcularTotalFuncionarioObj(f) / horas;
}
function valorHoraMedio(funcionarios) {
  if (!funcionarios.length) return 0;
  let totalCusto = 0;
  let totalHoras = 0;
  funcionarios.forEach((f) => {
    const h = Number(f.totalHorasMes || 220);
    totalCusto += calcularTotalFuncionarioObj(f);
    totalHoras += h;
  });
  return totalHoras ? totalCusto / totalHoras : 0;
}

function getFuncionarioVazio() {
  const base = {
    nome: "",
    cargo: "",
    tipoMaoDeObra: "Direta",
    salario: "",
    totalHorasMes: "220",
  };
  CAMPOS_PERCENTUAIS.forEach(({ key }) => {
    base[key] = "";
    base[`${key}Valor`] = "";
  });
  return base;
}

export default function FolhaDePagamento() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null); // index do item ou null
  const [funcionarioTemp, setFuncionarioTemp] = useState(getFuncionarioVazio());
  const [editingPercent, setEditingPercent] = useState({});
  const [totalHorasMes, setTotalHorasMes] = useState("220");

  const inputRefs = useRef([]);

  // ------- API: listar -------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/folhapagamento/funcionarios");
        setFuncionarios(Array.isArray(data) ? data : []);
      } catch {
        setFuncionarios([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // recalcula valores R$ dos percentuais quando salário muda
  function calcularCamposPercentuais(ft) {
    const salarioNum = parseBR(ft.salario);
    const novo = { ...ft };
    CAMPOS_PERCENTUAIS.forEach(({ key }) => {
      const percNum = parsePercentBR(ft[key] || "0");
      const valorNum = salarioNum * (percNum / 100);
      novo[`${key}Valor`] = maskMoneyBR(String(Math.round(valorNum * 100)));
    });
    return novo;
  }

  function handleSalarioChange(e) {
    let only = String(e.target.value).replace(/[^\d]/g, "");
    if (!only) {
      setFuncionarioTemp((ft) => calcularCamposPercentuais({ ...ft, salario: "" }));
      return;
    }
    if (only.length > 9) only = only.slice(0, 9);
    const number = Number(only) / 100;
    const formatted = number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setFuncionarioTemp((ft) => calcularCamposPercentuais({ ...ft, salario: formatted }));
  }

  function abrirModal(novo = true, idx = null) {
    if (novo) {
      setFuncionarioTemp(getFuncionarioVazio());
      setTotalHorasMes("220");
      setEditando(null);
    } else {
      const f = funcionarios[idx];
      setFuncionarioTemp(f);
      setTotalHorasMes(f.totalHorasMes || "220");
      setEditando(idx);
    }
    setModalAberto(true);
    setTimeout(() => inputRefs.current[1]?.focus(), 100);
  }

  // ------- API: salvar/criar e editar -------
  async function salvarFuncionario() {
    try {
      if (editando === null) {
        const { data: novo } = await api.post("/folhapagamento/funcionarios", funcionarioTemp);
        setFuncionarios((prev) => [...prev, novo]);
      } else {
        const id = funcionarios[editando].id;
        const { data: atualizado } = await api.put(`/folhapagamento/funcionarios/${id}`, funcionarioTemp);
        setFuncionarios((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
      }
      setModalAberto(false);
    } catch (e) {
      alert("Não foi possível salvar o funcionário.");
    }
  }

  // ------- API: excluir -------
  async function excluirFuncionario(idx) {
    try {
      const id = funcionarios[idx].id;
      await api.delete(`/folhapagamento/funcionarios/${id}`);
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Não foi possível excluir o funcionário.");
    }
  }

  // espelha totalHorasMes no objeto em edição
  useEffect(() => {
    setFuncionarioTemp((ft) => ({ ...ft, totalHorasMes }));
  }, [totalHorasMes]);

  // recalcula percentuais quando o salário muda
  useEffect(() => {
    if (!funcionarioTemp.salario) return;
    setFuncionarioTemp((ft) => calcularCamposPercentuais(ft));
  }, [funcionarioTemp.salario]);

  const totalFolha = funcionarios.reduce((acc, f) => acc + calcularTotalFuncionarioObj(f), 0);
  const valorMedioHora = valorHoraMedio(funcionarios);

  function handleTab(e, idx) {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const next = idx + 1;
      inputRefs.current[next]?.focus();
    }
  }

  return (
    <div className="painel-root">
      {/* ====== CABEÇALHO FLUTUANTE ====== */}
      <div className="folha-cabecalho-topo">
        <div className="folha-titulo-principal">Folha de Pagamento</div>
        <div className="folha-bloco-total-info">
          <span className="folha-total-titulo">Total da Folha</span>
          <span className="folha-total-valor-destaque">
            {totalFolha.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          {funcionarios.length > 1 && (
            <span className="folha-total-hora-media">
              Valor médio da hora:{" "}
              <b>
                R$
                {valorMedioHora.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </b>
            </span>
          )}
        </div>
      </div>

      {/* ====== CONTEÚDO ====== */}
      <div className="painel-content folha-content">
        <div className="painel-table-area">
          <table className="painel-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: 140 }}>Nome</th>
                <th style={{ textAlign: "left", width: 120 }}>Cargo</th>
                <th style={{ textAlign: "left", width: 90 }}>Tipo</th>
                <th style={{ textAlign: "right", width: 150 }}>Custo Total</th>
                <th style={{ textAlign: "right", width: 150 }}>Valor da Hora</th>
                <th style={{ textAlign: "center", width: 160 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="painel-table-empty">
                    Carregando funcionários...
                  </td>
                </tr>
              ) : funcionarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="painel-table-empty">
                    Nenhum funcionário cadastrado.
                    <br />
                    Clique em <b>Adicionar Funcionário</b> para começar.
                  </td>
                </tr>
              ) : (
                funcionarios.map((f, idx) => {
                  const valorHoraF = valorHoraFuncionario(f);
                  return (
                    <tr key={f.id || idx} className="painel-table-row">
                      <td style={{ textAlign: "left" }}>{f.nome}</td>
                      <td style={{ textAlign: "left" }}>{f.cargo}</td>
                      <td style={{ textAlign: "left" }}>
                        <span className="painel-tag-tipo">{f.tipoMaoDeObra || "Direta"}</span>
                      </td>
                      <td className="painel-table-valor" style={{ textAlign: "right" }}>
                        {calcularTotalFuncionarioObj(f).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="painel-table-valor" style={{ textAlign: "right" }}>
                        {valorHoraF.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="painel-table-acoes">
                          <button onClick={() => abrirModal(false, idx)} className="btn-chip-acao">
                            Editar
                          </button>
                          <FaTrashAlt
                            onClick={() => excluirFuncionario(idx)}
                            className="painel-table-trash-icon"
                            size={28}
                            color="#da3c3c"
                            title="Excluir funcionário"
                            style={{ cursor: "pointer", transition: "color 0.16s" }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="painel-add-btn-area" style={{ justifyContent: "flex-end" }}>
          <button onClick={() => abrirModal(true)} className="btn-azul-grad">
            + Adicionar Funcionário
          </button>
        </div>
      </div>

      <ModalFuncionario
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        funcionarioTemp={funcionarioTemp}
        setFuncionarioTemp={setFuncionarioTemp}
        totalHorasMes={totalHorasMes}
        setTotalHorasMes={setTotalHorasMes}
        editingPercent={editingPercent}
        setEditingPercent={setEditingPercent}
        editando={editando}
        handleTab={handleTab}
        inputRefs={inputRefs}
        calcularTotalFuncionarioObj={calcularTotalFuncionarioObj}
        formatPercentForDisplay={formatPercentForDisplay}
        valorHoraFuncionario={valorHoraFuncionario}
        salvarFuncionario={salvarFuncionario}
      />
    </div>
  );
}
