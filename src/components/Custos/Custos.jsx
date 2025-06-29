import { useState, useEffect, useRef } from "react";
import DespesasFixas from "./DespesasFixas";
import FolhaDePagamento from "./FolhaDePagamento";
import EncargosSobreVenda from "./EncargosSobreVenda";

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

export default function Custos({ catIdx = 0, categorias, setCategorias }) {
  const [categoriaPrincipal, setCategoriaPrincipal] = useState(catIdx);

  useEffect(() => {
    setCategoriaPrincipal(catIdx);
  }, [catIdx]);

  // CRUD Funcionário (INALTERADO)
  const [editandoFuncionarioIdx, setEditandoFuncionarioIdx] = useState(null);
  const [modalFuncionarioAberto, setModalFuncionarioAberto] = useState(false);
  const inputRefs = useRef([]);

  const funcionarioInitial = {
    nome: "",
    cargo: "",
    tipoMaoDeObra: "Direta",
    salario: "",
    ...Object.fromEntries(CAMPOS_PERCENTUAIS.map(c => [c.key, ""])),
    ...Object.fromEntries(CAMPOS_PERCENTUAIS.map(c => [`${c.key}Valor`, ""]))
  };
  const [funcionarioTemp, setFuncionarioTemp] = useState(funcionarioInitial);

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

  // Valor total das despesas (Despesas Fixas)
  const somaSubcat = subcat =>
    subcat?.despesas?.reduce((acc, d) => acc + (Number(String(d.valor).replace(/\./g, "").replace(",", ".")) || 0), 0) || 0;
  const totalGeralDespesas = categorias[0]?.subcategorias
    ? categorias[0].subcategorias.reduce((acc, sc) => acc + somaSubcat(sc), 0)
    : 0;

  const setSubcategorias = (newSubcats) => {
    const novas = [...categorias];
    novas[0].subcategorias = newSubcats;
    setCategorias(novas);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Despesas Fixas */}
      {categoriaPrincipal === 0 && (
        <DespesasFixas
          subcategorias={categorias[0].subcategorias}
          setSubcategorias={setSubcategorias}
        />
      )}
      {/* Folha de Pagamento */}
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
      {/* Encargos sobre Vendas */}
      {categoriaPrincipal === 2 && (
        <EncargosSobreVenda />
      )}
    </div>
  );
}