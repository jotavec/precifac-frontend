import { useState, useEffect, useRef } from "react";
import DespesasFixas from "./DespesasFixas";
import FolhaDePagamento from "./FolhaDePagamento";
import EncargosSobreVenda from "./EncargosSobreVenda";

const CATEGORIAS_PRINCIPAIS = [
  { nome: "Despesas Fixas", subcategorias: [] },
  { nome: "Folha de Pagamento", funcionarios: [] }
];

const CAMPOS_PERCENTUAIS = [
  { key: "fgts", label: "FGTS" },
  { key: "inss", label: "INSS" },
  { key: "rat", label: "RAT" },
  { key: "provisao", label: "Férias + 13º" },
  { key: "valeTransporte", label: "Vale Transporte" },
  { key: "valeAlimentacao", label: "Vale Alimentação" },
  { key: "valeRefeicao", label: "Vale Refeição" },
  { key: "planoSaude", label: "Plano de Saúde" },
  { key: "outros", label: "Outros" }
];

const styles = {
  header: { display: "flex", alignItems: "center", marginBottom: 10, gap: 18 },
  title: { fontWeight: 700, fontSize: 32, color: "#fff", marginRight: 12 },
  breadcrumbArrow: { color: "#ffe060", fontSize: 32, margin: "0 6px" },
  activeCategory: { color: "#ffe060", fontSize: 32 },
  primaryButton: {
    background: "#b388ff",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 34px",
    fontWeight: 700,
    fontSize: 18,
    marginTop: 0,
    marginLeft: 0,
    marginBottom: 20,
    cursor: "pointer",
    transition: "background .2s"
  }
};

function maskMoneyBR(value) {
  let v = value.replace(/\D/g, "");
  if (v.length === 0) return "0,00";
  if (v.length > 9) v = v.slice(0, 9);
  let number = parseFloat(v) / 100;
  return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBR(v) {
  if (!v) return 0;
  return parseFloat(v.replace(/\./g, "").replace(",", "."));
}

export default function Custos({ catIdx = 0 }) {
  const [categorias, setCategorias] = useState(() => {
    const saved = localStorage.getItem("categoriasCustos2");
    return saved ? JSON.parse(saved) : CATEGORIAS_PRINCIPAIS;
  });
  const [categoriaPrincipal, setCategoriaPrincipal] = useState(catIdx);
  const [subcatIdx, setSubcatIdx] = useState(0);
  const [editandoSubcatIdx, setEditandoSubcatIdx] = useState(null);
  const [nomeSubcatTemp, setNomeSubcatTemp] = useState("");
  const [editandoDespesaIdx, setEditandoDespesaIdx] = useState(null);
  const [despesaTemp, setDespesaTemp] = useState({ nome: "", valor: "" });
  const [editandoFuncionarioIdx, setEditandoFuncionarioIdx] = useState(null);
  const [modalFuncionarioAberto, setModalFuncionarioAberto] = useState(false);

  const funcionarioInitial = {
    nome: "",
    cargo: "",
    tipoMaoDeObra: "Direta",
    salario: "",
    ...Object.fromEntries(CAMPOS_PERCENTUAIS.map(c => [c.key, ""])),
    ...Object.fromEntries(CAMPOS_PERCENTUAIS.map(c => [`${c.key}Valor`, ""]))
  };
  const [funcionarioTemp, setFuncionarioTemp] = useState(funcionarioInitial);

  const inputRefs = useRef([]);

  useEffect(() => {
    localStorage.setItem("categoriasCustos2", JSON.stringify(categorias));
  }, [categorias]);

  useEffect(() => {
    setCategoriaPrincipal(catIdx);
    setSubcatIdx(0);
    setEditandoSubcatIdx(null);
    setEditandoDespesaIdx(null);
    setEditandoFuncionarioIdx(null);
  }, [catIdx]);

  useEffect(() => {
    if (modalFuncionarioAberto) {
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [modalFuncionarioAberto]);

  // CRUD Subcategoria
  const handleAddSubcat = () => {
    const novas = [...categorias];
    novas[0].subcategorias.push({ nome: "Nova Subcategoria", despesas: [] });
    setCategorias(novas);
    setSubcatIdx(novas[0].subcategorias.length - 1);
    setEditandoSubcatIdx(novas[0].subcategorias.length - 1);
    setNomeSubcatTemp("");
  };
  const handleSalvarSubcat = idx => {
    if (!nomeSubcatTemp.trim()) return;
    const novas = [...categorias];
    novas[0].subcategorias[idx].nome = nomeSubcatTemp.trim();
    setCategorias(novas);
    setEditandoSubcatIdx(null);
    setNomeSubcatTemp("");
  };
  const handleEditarSubcat = idx => {
    setEditandoSubcatIdx(idx);
    setNomeSubcatTemp(categorias[0].subcategorias[idx].nome);
  };
  const handleApagarSubcat = idx => {
    if (!window.confirm("Apagar essa subcategoria?")) return;
    const novas = [...categorias];
    novas[0].subcategorias.splice(idx, 1);
    setCategorias(novas);
    setSubcatIdx(0);
  };

  // CRUD Despesa
  const handleAddDespesa = () => {
    setEditandoDespesaIdx("novo");
    setDespesaTemp({ nome: "", valor: "" });
  };
  const handleSalvarDespesa = idx => {
    if (!despesaTemp.nome.trim() || despesaTemp.valor === "") return;
    const novas = [...categorias];
    if (editandoDespesaIdx === "novo") {
      novas[0].subcategorias[subcatIdx].despesas.push({
        nome: despesaTemp.nome.trim(),
        valor: despesaTemp.valor
      });
    } else {
      novas[0].subcategorias[subcatIdx].despesas[idx] = {
        nome: despesaTemp.nome.trim(),
        valor: despesaTemp.valor
      };
    }
    setCategorias(novas);
    setEditandoDespesaIdx(null);
    setDespesaTemp({ nome: "", valor: "" });
  };
  const handleEditarDespesa = idx => {
    setEditandoDespesaIdx(idx);
    setDespesaTemp({
      nome: categorias[0].subcategorias[subcatIdx].despesas[idx].nome,
      valor: categorias[0].subcategorias[subcatIdx].despesas[idx].valor
    });
  };
  const handleExcluirDespesa = idx => {
    const novas = [...categorias];
    novas[0].subcategorias[subcatIdx].despesas.splice(idx, 1);
    setCategorias(novas);
    setEditandoDespesaIdx(null);
    setDespesaTemp({ nome: "", valor: "" });
  };

  const somaSubcat = subcat => subcat?.despesas?.reduce((acc, d) => acc + (Number(String(d.valor).replace(/\./g, "").replace(",", ".")) || 0), 0) || 0;
  const totalGeralDespesas = categorias[0]?.subcategorias
    ? categorias[0].subcategorias.reduce((acc, sc) => acc + somaSubcat(sc), 0)
    : 0;

  // CRUD Funcionário (INALTERADO)
  const handleAddFuncionario = () => {
    setFuncionarioTemp(funcionarioInitial);
    setEditandoFuncionarioIdx("novo");
    setModalFuncionarioAberto(true);
  };
  const handleEditarFuncionario = idx => {
    const f = categorias[1].funcionarios[idx] || {};
    let ft = { ...funcionarioInitial, ...f };
    setFuncionarioTemp(ft);
    setEditandoFuncionarioIdx(idx);
    setModalFuncionarioAberto(true);
  };
  const handleSalvarFuncionario = idx => {
    if (!funcionarioTemp.nome.trim() || !funcionarioTemp.cargo.trim() || funcionarioTemp.salario === "") return;
    const novas = [...categorias];
    const obj = { ...funcionarioTemp };
    if (editandoFuncionarioIdx === "novo") {
      novas[1].funcionarios.push(obj);
    } else {
      novas[1].funcionarios[idx] = obj;
    }
    setCategorias(novas);
    setEditandoFuncionarioIdx(null);
    setModalFuncionarioAberto(false);
    setFuncionarioTemp(funcionarioInitial);
  };
  const handleExcluirFuncionario = idx => {
    const novas = [...categorias];
    novas[1].funcionarios.splice(idx, 1);
    setCategorias(novas);
    setEditandoFuncionarioIdx(null);
    setFuncionarioTemp(funcionarioInitial);
  };

  function calcularTotalFuncionarioObj(funcionario) {
    const salario = parseBR(funcionario.salario);
    let soma = salario;
    CAMPOS_PERCENTUAIS.forEach(({ key }) => {
      let perc = parseBR(funcionario[key]);
      soma += salario * (isNaN(perc) ? 0 : perc / 100);
    });
    return soma;
  }

  const totalFolha = categorias[1].funcionarios.reduce((acc, f) =>
    acc + calcularTotalFuncionarioObj(f), 0);

  const handleTab = (e, idx) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const totalInputs = inputRefs.current.length;
      let nextIdx;
      if (e.shiftKey) {
        nextIdx = idx === 0 ? totalInputs - 1 : idx - 1;
      } else {
        nextIdx = idx === totalInputs - 1 ? 0 : idx + 1;
      }
      inputRefs.current[nextIdx]?.focus();
    }
  };

  // Renderização principal das abas fixas
  return (
    <div style={{ width: "100%" }}>
      {/* Cabeçalho */}
      <div style={styles.header}>
        <span style={styles.title}>
          Custos <span style={styles.breadcrumbArrow}>&gt;</span>
          <span style={styles.activeCategory}>
            {categoriaPrincipal === 0 && "Despesas Fixas"}
            {categoriaPrincipal === 1 && "Folha de Pagamento"}
            {categoriaPrincipal === 2 && "Encargos sobre Vendas"}
          </span>
        </span>
      </div>
      {/* Valor total das despesas */}
      {categoriaPrincipal === 0 && (
        <div style={{
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 14px 0",
          color: "#fff"
        }}>
          Valor Total das Despesas:{" "}
          <span style={{ color: "#b388ff", fontWeight: 700 }}>
            {totalGeralDespesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      )}
      {/* Botão adicionar categoria */}
      {categoriaPrincipal === 0 && (
        <button onClick={handleAddSubcat} style={styles.primaryButton}>
          + Adicionar categoria
        </button>
      )}
      {/* Barra de subcategorias DINÂMICAS - só para Despesas Fixas */}
      {categoriaPrincipal === 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 18,
          gap: 0
        }}>
          {categorias[0].subcategorias.map((subcat, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                background: subcatIdx === i ? "#7d3cff" : "transparent",
                borderRadius: "13px 13px 0 0",
                padding: "0 18px",
                height: 41,
                fontWeight: 800,
                fontSize: 18,
                color: subcatIdx === i ? "#fff" : "#bbb",
                cursor: "pointer",
                marginRight: 10,
                borderBottom: subcatIdx === i ? "4px solid #ffe060" : "4px solid transparent",
                position: "relative",
                minWidth: 120
              }}>
              {editandoSubcatIdx === i ? (
                <input
                  value={nomeSubcatTemp}
                  onChange={e => setNomeSubcatTemp(e.target.value)}
                  autoFocus
                  onBlur={() => handleSalvarSubcat(i)}
                  style={{
                    padding: "2px 7px",
                    borderRadius: 5,
                    fontWeight: 700,
                    fontSize: 17,
                    border: "1.5px solid #b388ff",
                    outline: "none",
                    marginRight: 6,
                    background: "#2d2153",
                    color: "#ffe060"
                  }}
                  onKeyDown={e => { if (e.key === "Enter") handleSalvarSubcat(i); }}
                />
              ) : (
                <span
                  onClick={() => { setSubcatIdx(i); setEditandoDespesaIdx(null); }}
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    color: subcatIdx === i ? "#fff" : "#bbb",
                    marginRight: 8
                  }}
                >
                  {subcat.nome}
                </span>
              )}
              {editandoSubcatIdx !== i && (
                <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <button
                    onClick={() => handleEditarSubcat(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffe060",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "2px 6px"
                    }}
                    title="Editar"
                  >✏️</button>
                  <button
                    onClick={() => handleApagarSubcat(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4e4e",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "2px 6px"
                    }}
                    title="Apagar"
                  >🗑️</button>
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo principal de cada categoria fixa */}
      {categoriaPrincipal === 0 && (
        <DespesasFixas
          subcat={categorias[0].subcategorias[subcatIdx]}
          editandoDespesaIdx={editandoDespesaIdx}
          setEditandoDespesaIdx={setEditandoDespesaIdx}
          despesaTemp={despesaTemp}
          setDespesaTemp={setDespesaTemp}
          handleAddDespesa={handleAddDespesa}
          handleSalvarDespesa={handleSalvarDespesa}
          handleEditarDespesa={handleEditarDespesa}
          handleExcluirDespesa={handleExcluirDespesa}
          somaSubcat={somaSubcat}
        />
      )}
      {categoriaPrincipal === 1 && (
        <FolhaDePagamento
          categorias={categorias}
          handleAddFuncionario={handleAddFuncionario}
          handleEditarFuncionario={handleEditarFuncionario}
          handleExcluirFuncionario={handleExcluirFuncionario}
          totalFolha={totalFolha}
          calcularTotalFuncionarioObj={calcularTotalFuncionarioObj}
          funcionarioTemp={funcionarioTemp}
          setFuncionarioTemp={setFuncionarioTemp}
          editandoFuncionarioIdx={editandoFuncionarioIdx}
          modalFuncionarioAberto={modalFuncionarioAberto}
          setModalFuncionarioAberto={setModalFuncionarioAberto}
          handleSalvarFuncionario={handleSalvarFuncionario}
          inputRefs={inputRefs}
          handleTab={handleTab}
          CAMPOS_PERCENTUAIS={CAMPOS_PERCENTUAIS}
          maskMoneyBR={maskMoneyBR}
          parseBR={parseBR}
        />
      )}
      {categoriaPrincipal === 2 && (
        <EncargosSobreVenda />
      )}
    </div>
  );
}
