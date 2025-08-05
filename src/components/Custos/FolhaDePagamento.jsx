import { useEffect, useState, useRef } from "react";
import { FaTrashAlt } from "react-icons/fa";
import './FolhaDePagamento.css';
import ModalFuncionario from './ModalFuncionario';

// --- Funções utilitárias ---
function parseBR(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, "").replace(",", "."));
}
function parsePercentBR(str) {
  if (!str) return 0;
  return parseFloat(str.replace(",", "."));
}
function maskMoneyBR(str) {
  if (!str) return "0,00";
  let v = str.replace(/\D/g, "");
  if (!v) return "0,00";
  let num = parseFloat(v) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatPercentForDisplay(value, editing) {
  let v = (value || "").replace(/\D/g, "");
  if (!v) return editing ? "" : "0";
  if (editing) {
    while (v.length < 3) v = "0" + v;
    let intPart = v.slice(0, v.length - 2);
    let decPart = v.slice(-2);
    let res = intPart + "," + decPart;
    res = res.replace(/^0+(\d)/, "$1");
    return res;
  } else {
    let perc = parsePercentBR(value);
    return perc.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,00$/, "");
  }
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
  { key: "outros", label: "Outros (%)" }
];

function calcularTotalFuncionarioObj(f) {
  const salarioNum = parseBR(f.salario);
  let total = salarioNum;
  CAMPOS_PERCENTUAIS.forEach(item => {
    const percNum = parsePercentBR(f[item.key] || "0");
    total += salarioNum * (percNum / 100);
  });
  return Number(total) || 0;
}
function valorHoraFuncionario(f) {
  const horas = Number(f.totalHorasMes || 220);
  if (!horas) return 0;
  const custo = calcularTotalFuncionarioObj(f);
  return custo / horas;
}
function valorHoraMedio(funcionarios) {
  if (!funcionarios.length) return 0;
  let totalCusto = 0, totalHoras = 0;
  funcionarios.forEach(f => {
    const h = Number(f.totalHorasMes || 220);
    totalCusto += calcularTotalFuncionarioObj(f);
    totalHoras += h;
  });
  return totalHoras ? (totalCusto / totalHoras) : 0;
}

function getFuncionarioVazio() {
  let vazio = {
    nome: "",
    cargo: "",
    tipoMaoDeObra: "Direta",
    salario: "",
    totalHorasMes: "220"
  };
  CAMPOS_PERCENTUAIS.forEach(item => {
    vazio[item.key] = "";
    vazio[item.key + "Valor"] = "";
  });
  return vazio;
}

export default function FolhaDePagamento() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [funcionarioTemp, setFuncionarioTemp] = useState(getFuncionarioVazio());
  const [editingPercent, setEditingPercent] = useState({});
  const [totalHorasMes, setTotalHorasMes] = useState("220");
  const inputRefs = useRef([]);

  // Buscar funcionários
  useEffect(() => {
    async function fetchFuncionarios() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/folhapagamento/funcionarios", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setFuncionarios(Array.isArray(data) ? data : []);
        } else {
          setFuncionarios([]);
        }
      } catch {
        setFuncionarios([]);
      }
      setLoading(false);
    }
    fetchFuncionarios();
  }, []);

  function calcularCamposPercentuais(ft) {
    let salarioNum = parseBR(ft.salario);
    let novo = { ...ft };
    CAMPOS_PERCENTUAIS.forEach(item => {
      let percStr = ft[item.key] || "0";
      let percNum = parsePercentBR(percStr);
      let valorNum = salarioNum * (percNum / 100);
      novo[`${item.key}Valor`] = maskMoneyBR(String(Math.round(valorNum * 100)));
    });
    return novo;
  }

  function handleSalarioChange(e) {
    let value = e.target.value;
    let onlyNumbers = value.replace(/[^\d]/g, "");
    if (!onlyNumbers) {
      setFuncionarioTemp(calcularCamposPercentuais({ ...funcionarioTemp, salario: "" }));
      return;
    }
    if (onlyNumbers.length > 9) onlyNumbers = onlyNumbers.slice(0, 9);
    let number = parseFloat(onlyNumbers) / 100;
    let formatted = number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setFuncionarioTemp(ft => calcularCamposPercentuais({ ...ft, salario: formatted }));
  }

  function abrirModal(novo = true, idx = null) {
    if (novo) {
      setFuncionarioTemp(getFuncionarioVazio());
      setTotalHorasMes("220");
      setEditando(null);
    } else {
      setFuncionarioTemp(funcionarios[idx]);
      setTotalHorasMes(funcionarios[idx].totalHorasMes || "220");
      setEditando(idx);
    }
    setModalAberto(true);
    setTimeout(() => inputRefs.current[1]?.focus(), 100);
  }

  async function salvarFuncionario() {
    if (editando === null) {
      const res = await fetch("http://localhost:3000/api/folhapagamento/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(funcionarioTemp)
      });
      if (res.ok) {
        const novo = await res.json();
        setFuncionarios(funcs => [...funcs, novo]);
        setModalAberto(false);
      }
    } else {
      const id = funcionarios[editando].id;
      const res = await fetch(`http://localhost:3000/api/folhapagamento/funcionarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(funcionarioTemp)
      });
      if (res.ok) {
        const atualizado = await res.json();
        setFuncionarios(funcs => funcs.map(f => f.id === id ? atualizado : f));
        setModalAberto(false);
      }
    }
  }

  async function excluirFuncionario(idx) {
    const id = funcionarios[idx].id;
    const res = await fetch(`http://localhost:3000/api/folhapagamento/funcionarios/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (res.ok) {
      setFuncionarios(funcs => funcs.filter(f => f.id !== id));
    }
  }

  useEffect(() => {
    setFuncionarioTemp(ft => ({
      ...ft,
      totalHorasMes: totalHorasMes
    }));
  }, [totalHorasMes]);

  useEffect(() => {
    if (!funcionarioTemp.salario) return;
    setFuncionarioTemp(ft => calcularCamposPercentuais(ft));
  }, [funcionarioTemp.salario]);

  const totalFolha = funcionarios.reduce((acc, f) => acc + calcularTotalFuncionarioObj(f), 0);
  const valorMedioHora = valorHoraMedio(funcionarios);

  function handleTab(e, idx) {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const nextIdx = idx + 1;
      if (inputRefs.current[nextIdx]) inputRefs.current[nextIdx].focus();
    }
  }

  return (
    <div className="painel-root">
      {/* ====== CABEÇALHO FLUTUANTE FORA DA CAIXA ====== */}
      <div className="folha-cabecalho-topo">
        <div className="folha-titulo-principal">
          Folha de Pagamento
        </div>
        <div className="folha-bloco-total-info">
          <span className="folha-total-titulo">Total da Folha</span>
          <span className="folha-total-valor-destaque">
            {totalFolha.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          {funcionarios.length > 1 && (
            <span className="folha-total-hora-media">
              Valor médio da hora: <b>R$ {valorMedioHora.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
            </span>
          )}
        </div>
      </div>

      {/* ====== BLOCO PRINCIPAL (CAIXA BRANCA) ====== */}
      <div className="painel-content folha-content">
        <div className="painel-table-area">
          <table className="painel-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: 140 }}>Nome</th>
                <th style={{ textAlign: 'left', width: 120 }}>Cargo</th>
                <th style={{ textAlign: 'left', width: 90 }}>Tipo</th>
                <th style={{ textAlign: 'right', width: 150 }}>Custo Total</th>
                <th style={{ textAlign: 'right', width: 150 }}>Valor da Hora</th>
                <th style={{ textAlign: 'center', width: 160 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="painel-table-empty">Carregando funcionários...</td>
                </tr>
              ) : funcionarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="painel-table-empty">
                    Nenhum funcionário cadastrado.<br />
                    Clique em <b>Adicionar Funcionário</b> para começar.
                  </td>
                </tr>
              ) : (
                funcionarios.map((f, idx) => {
                  const valorHoraF = valorHoraFuncionario(f);
                  return (
                    <tr key={f.id || idx} className="painel-table-row">
                      <td style={{ textAlign: 'left' }}>{f.nome}</td>
                      <td style={{ textAlign: 'left' }}>{f.cargo}</td>
                      <td style={{ textAlign: 'left' }}>
                        <span className="painel-tag-tipo">{f.tipoMaoDeObra || "Direta"}</span>
                      </td>
                      <td className="painel-table-valor" style={{ textAlign: 'right' }}>
                        {calcularTotalFuncionarioObj(f).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="painel-table-valor" style={{ textAlign: 'right' }}>
                        {valorHoraF.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="painel-table-acoes">
                          <button
                            onClick={() => abrirModal(false, idx)}
                            className="btn-chip-acao"
                          >
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
        <div className="painel-add-btn-area" style={{ justifyContent: 'flex-end' }}>
          <button
            onClick={() => abrirModal(true)}
            className="btn-azul-grad"
          >
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
