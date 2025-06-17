import { useState, useEffect } from "react";
import Perfil from "./components/Perfil";
import Configuracoes from "./components/Configuracoes";
import Custos from "./components/Custos/Custos";
import Markup from "./components/Markup/Markup";
import FaturamentoRealizado from "./components/Markup/FaturamentoRealizado";
import MarkupIdeal from "./components/Markup/MarkupIdeal";
import EncargosSobreVenda from "./components/Custos/EncargosSobreVenda";
import Estoque from "./components/Estoque";
import QuadroReceitas from "./components/QuadroReceitas";
import PlanejamentoVendas from "./components/PlanejamentoVendas/PlanejamentoVendas";
import SidebarMenu from "./SidebarMenu";
import "./App.css";
import "./AppContainer.css";

// ====== NOVO: Função para calcular custo total do funcionário ======

// Array de campos percentuais conforme seu modal
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

function parseBR(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, "").replace(",", "."));
}
function parsePercentBR(str) {
  if (!str) return 0;
  return parseFloat(str.replace(",", "."));
}

// Esta função pode ser usada em qualquer lugar, inclusive no MarkupIdeal
function calcularTotalFuncionarioObj(f) {
  const salarioNum = parseBR(f.salario);
  let total = salarioNum;
  CAMPOS_PERCENTUAIS.forEach(item => {
    const percNum = parsePercentBR(f[item.key] || "0");
    total += salarioNum * (percNum / 100);
  });
  return Number(total) || 0;
}

// ===============================================================

const initialEncargosState = {
  icms: { percent: "", value: "" },
  iss: { percent: "", value: "" },
  pisCofins: { percent: "", value: "" },
  irpjCsll: { percent: "", value: "" },
  ipi: { percent: "", value: "" },
  debito: { percent: "", value: "" },
  credito: { percent: "", value: "" },
  creditoParcelado: { percent: "", value: "" },
  boleto: { percent: "", value: "" },
  pix: { percent: "", value: "" },
  gateway: { percent: "", value: "" },
  marketing: { percent: "", value: "" },
  delivery: { percent: "", value: "" },
  saas: { percent: "", value: "" },
  colaboradores: { percent: "", value: "" }
};

const abasPrincipais = [
  { label: "Perfil", component: Perfil },
  { label: "Configurações", component: Configuracoes },
  { label: "Custos", component: Custos },
  { label: "Markup", component: Markup },
  { label: "Estoque", component: Estoque },
  { label: "Quadro de Receitas", component: QuadroReceitas },
  { label: "Planejamento de Vendas", component: PlanejamentoVendas },
];

const subCategoriasPrincipais = [
  { label: "Despesas Fixas" },
  { label: "Folha de Pagamento" },
  { label: "Encargos sobre Vendas" }
];

const subCategoriasMarkup = [
  { label: "Faturamentos Realizados" },
  { label: "Markup Ideal" },
];

// NOVO: Estado inicial para categorias de custos
const initialCategoriasCustos = [
  { nome: "Despesas Fixas", subcategorias: [] },
  { nome: "Folha de Pagamento", funcionarios: [] }
];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [aba, setAba] = useState(0);
  const [catIdx, setCatIdx] = useState(0);
  const [subCatMarkup, setSubCatMarkup] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // ESTADO GLOBAL dos Encargos (com persistência!)
  const [encargosData, setEncargosData] = useState(() => {
    const salvo = localStorage.getItem("encargosData");
    return salvo ? JSON.parse(salvo) : initialEncargosState;
  });
  const [outrosEncargos, setOutrosEncargos] = useState(() => {
    const salvo = localStorage.getItem("outrosEncargos");
    return salvo ? JSON.parse(salvo) : [];
  });

  // NOVO: Estado global para % gasto sobre faturamento!
  const [gastoSobreFaturamento, setGastoSobreFaturamento] = useState("0,0");

  // CENTRALIZAÇÃO: Estado global de todas as categorias de custos
  const [categoriasCustos, setCategoriasCustos] = useState(() => {
    const saved = localStorage.getItem("categoriasCustos2");
    return saved ? JSON.parse(saved) : initialCategoriasCustos;
  });

  // Sincroniza mudanças no localStorage!
  useEffect(() => {
    localStorage.setItem("encargosData", JSON.stringify(encargosData));
  }, [encargosData]);
  useEffect(() => {
    localStorage.setItem("outrosEncargos", JSON.stringify(outrosEncargos));
  }, [outrosEncargos]);
  useEffect(() => {
    localStorage.setItem("categoriasCustos2", JSON.stringify(categoriasCustos));
  }, [categoriasCustos]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMsg("Enviando...");
    setMsg("Cadastro realizado! Faça login.");
    setScreen("login");
    setForm({ name: "", email: "", password: "" });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("Entrando...");
    try {
      const res = await fetch("http://localhost:3000/users");
      const users = await res.json();
      const usuario = users.find(u => u.email === form.email);
      if (usuario) {
        setUser(usuario);
        setMsg("");
      } else {
        setMsg("Usuário não encontrado. Cadastre-se.");
      }
    } catch {
      setMsg("Erro ao buscar usuário");
    }
  }

  function handleLogout() {
    setUser(null);
    setScreen("login");
    setForm({ name: "", email: "", password: "" });
    setAba(0);
    setCatIdx(0);
    setSubCatMarkup(0);
    // Se quiser limpar as infos ao deslogar, descomente:
    // setEncargosData(initialEncargosState);
    // setOutrosEncargos([]);
    // setCategoriasCustos(initialCategoriasCustos);
  }

  function getSelectedLabel(aba, catIdx, subCatMarkup) {
    if (aba === 2) {
      return `Custos:${subCategoriasPrincipais[catIdx].label}`;
    }
    if (aba === 3) {
      return `Markup:${subCategoriasMarkup[subCatMarkup]?.label || ""}`;
    }
    return abasPrincipais[aba].label;
  }

  function handleSidebarSelect(label) {
    if (label.startsWith("Custos:")) {
      setAba(2);
      const sub = label.split(":")[1];
      const idx = subCategoriasPrincipais.findIndex(x => x.label === sub);
      setCatIdx(idx >= 0 ? idx : 0);
    } else if (label.startsWith("Markup:")) {
      setAba(3);
      const sub = label.split(":")[1];
      const idx = subCategoriasMarkup.findIndex(x => x.label === sub);
      setSubCatMarkup(idx >= 0 ? idx : 0);
    } else {
      const idx = abasPrincipais.findIndex(x => x.label === label);
      setAba(idx >= 0 ? idx : 0);
      setCatIdx(0);
      setSubCatMarkup(0);
    }
  }

  if (user) {
    const AbaComponent = abasPrincipais[aba].component;
    return (
      <div className={`app-container${sidebarExpanded ? " sidebar-expanded" : ""}`}>
        <SidebarMenu
          selected={getSelectedLabel(aba, catIdx, subCatMarkup)}
          onSelect={handleSidebarSelect}
          onLogout={handleLogout}
          subCategoriasPrincipais={subCategoriasPrincipais}
          subCategoriasMarkup={subCategoriasMarkup}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />
        <main className="main-content">
          {aba === 2
            ? catIdx === 2
              ? (
                <EncargosSobreVenda
                  data={encargosData}
                  setData={setEncargosData}
                  outros={outrosEncargos}
                  setOutros={setOutrosEncargos}
                />
              )
              : (
                <Custos
                  catIdx={catIdx}
                  categorias={categoriasCustos}
                  setCategorias={setCategoriasCustos}
                  user={user}
                />
              )
            : aba === 3
              ? subCatMarkup === 0
                ? (
                  <FaturamentoRealizado
                    user={user}
                    setGastoSobreFaturamento={setGastoSobreFaturamento}
                  />
                )
                : subCatMarkup === 1
                  ? (
                    <MarkupIdeal
                      user={user}
                      encargosData={encargosData}
                      outrosEncargos={outrosEncargos}
                      gastoSobreFaturamento={gastoSobreFaturamento}
                      despesasFixasSubcats={categoriasCustos[0]?.subcategorias || []}
                      funcionarios={categoriasCustos[1]?.funcionarios || []}
                      calcularTotalFuncionarioObj={calcularTotalFuncionarioObj} // <-- ADICIONADO!
                    />
                  )
                  : null
              : <AbaComponent user={user} />}
        </main>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 360, margin: "2rem auto", padding: 32, border: "1px solid #ccc", borderRadius: 16 }}>
      <h2>{screen === "login" ? "Login" : "Cadastro"}</h2>
      <form onSubmit={screen === "login" ? handleLogin : handleRegister}>
        {screen === "register" && (
          <input
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleChange}
            style={{ display: "block", width: "100%", marginBottom: 8 }}
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
          required
        />
        <button type="submit" style={{ width: "100%", marginBottom: 8 }}>
          {screen === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
      <button
        onClick={() => {
          setScreen(screen === "login" ? "register" : "login");
          setMsg("");
        }}
        style={{ width: "100%", background: "#eee", border: "none", color: "#222" }}
      >
        {screen === "login"
          ? "Não tem conta? Cadastre-se"
          : "Já tem conta? Faça login"}
      </button>
      <div style={{ color: "#900", marginTop: 8 }}>{msg}</div>
    </div>
  );
}