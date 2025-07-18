import { useState, useEffect } from "react";
import Perfil from "./components/Perfil";
import Configuracoes from "./components/Configuracoes";
import Custos from "./components/Custos/Custos";
import Markup from "./components/Markup/Markup";
import FaturamentoRealizado from "./components/Markup/FaturamentoRealizado";
import MarkupIdeal from "./components/Markup/MarkupIdeal";
import EncargosSobreVenda from "./components/Custos/EncargosSobreVenda";
import Estoque from "./components/Estoque/Estoque";
import Cadastro from "./components/Estoque/Cadastro";
import EntradaEstoque from "./components/Estoque/EntradaEstoque";
import SaidaEstoque from "./components/Estoque/SaidaEstoque";
import Movimentacoes from "./components/Estoque/Movimentacoes";
import Fornecedores from "./components/Estoque/Fornecedores";
import QuadroReceitas from "./components/QuadroReceitas";
import PlanejamentoVendas from "./components/PlanejamentoVendas";
import SidebarMenu from "./SidebarMenu";
import FolhaDePagamento from "./components/Custos/FolhaDePagamento";
import TesteIcones from "./TesteIcones";
import CadastroReceita from "./components/QuadroDeReceitas/Cadastro";
import CentralReceitas from "./components/QuadroDeReceitas/CentralReceitas"; // <-- NOVO
import "./App.css";
import "./AppContainer.css";

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

function calcularTotalFuncionarioObj(f) {
  const salarioNum = parseBR(f.salario);
  let total = salarioNum;
  CAMPOS_PERCENTUAIS.forEach(item => {
    const percNum = parsePercentBR(f[item.key] || "0");
    total += salarioNum * (percNum / 100);
  });
  return Number(total) || 0;
}

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
  { label: "Planejamento de Vendas", component: PlanejamentoVendas }
];

const subCategoriasPrincipais = [
  { label: "Despesas Fixas" },
  { label: "Folha de Pagamento" },
  { label: "Encargos sobre Vendas" }
];

const subCategoriasMarkup = [
  { label: "Faturamentos Realizados" },
  { label: "Markup Ideal" }
];

const initialCategoriasCustos = [
  { nome: "Despesas Fixas", subcategorias: [] },
  { nome: "Folha de Pagamento", funcionarios: [] }
];

function getNavState() {
  if (typeof window !== "undefined") {
    const navState = localStorage.getItem("navState");
    if (navState) {
      const { aba, catIdx, subCatMarkup } = JSON.parse(navState);
      return {
        aba: aba ?? 0,
        catIdx: catIdx ?? 0,
        subCatMarkup: subCatMarkup ?? 0,
      };
    }
  }
  return { aba: 0, catIdx: 0, subCatMarkup: 0 };
}

export default function App() {
  const navInit = getNavState();
  const [screen, setScreen] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [aba, setAba] = useState(navInit.aba);
  const [catIdx, setCatIdx] = useState(navInit.catIdx);
  const [subCatMarkup, setSubCatMarkup] = useState(navInit.subCatMarkup);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [encargosData, setEncargosData] = useState(initialEncargosState);
  const [outrosEncargos, setOutrosEncargos] = useState([]);
  const [gastoSobreFaturamento, setGastoSobreFaturamento] = useState("0,0");
  const [categoriasCustos, setCategoriasCustos] = useState(initialCategoriasCustos);

  useEffect(() => {
    if (!user) return;
    async function fetchFuncionarios() {
      try {
        const res = await fetch("/api/folhapagamento/funcionarios", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCategoriasCustos(cats => {
            const novas = [...cats];
            novas[1].funcionarios = Array.isArray(data) ? data : [];
            return novas;
          });
        }
      } catch {
        setCategoriasCustos(cats => {
          const novas = [...cats];
          novas[1].funcionarios = [];
          return novas;
        });
      }
    }
    fetchFuncionarios();
  }, [user]);

  async function handleAddFuncionario(novoFuncionario) {
    const res = await fetch("/api/folhapagamento/funcionarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(novoFuncionario)
    });
    if (res.ok) {
      const novo = await res.json();
      setCategoriasCustos(cats => {
        const novas = [...cats];
        novas[1].funcionarios = [...novas[1].funcionarios, novo];
        return novas;
      });
      return true;
    }
    return false;
  }

  async function handleEditarFuncionario(idx, funcionarioEditado) {
    const id = categoriasCustos[1].funcionarios[idx].id;
    const res = await fetch(`/api/folhapagamento/funcionarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(funcionarioEditado)
    });
    if (res.ok) {
      const atualizado = await res.json();
      setCategoriasCustos(cats => {
        const novas = [...cats];
        novas[1].funcionarios = novas[1].funcionarios.map((f, i) => i === idx ? atualizado : f);
        return novas;
      });
      return true;
    }
    return false;
  }

  async function handleExcluirFuncionario(idx) {
    const id = categoriasCustos[1].funcionarios[idx].id;
    const res = await fetch(`/api/folhapagamento/funcionarios/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (res.ok) {
      setCategoriasCustos(cats => {
        const novas = [...cats];
        novas[1].funcionarios = novas[1].funcionarios.filter((_, i) => i !== idx);
        return novas;
      });
      return true;
    }
    return false;
  }

  useEffect(() => {
    const navState = { aba, catIdx, subCatMarkup };
    localStorage.setItem("navState", JSON.stringify(navState));
  }, [aba, catIdx, subCatMarkup]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me", {
          method: "GET",
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {}
    }
    fetchUser();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMsg("Enviando...");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        setMsg(errorData.error || "Erro ao cadastrar.");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setMsg("");
    } catch (err) {
      setMsg("Erro de conexão ao cadastrar.");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("Entrando...");
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        setMsg(errorData.error || "Erro ao fazer login.");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setMsg("");
    } catch (err) {
      setMsg("Erro ao fazer login.");
    }
  }

  async function handleLogout() {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
    setScreen("login");
    setForm({ name: "", email: "", password: "" });
    setAba(0);
    setCatIdx(0);
    setSubCatMarkup(0);
  }

  function getSelectedLabel(aba, catIdx, subCatMarkup) {
    if (aba === 2) {
      return `Custos:${subCategoriasPrincipais[catIdx].label}`;
    }
    if (aba === 3) {
      return `Markup:${subCategoriasMarkup[subCatMarkup]?.label || ""}`;
    }
    if (aba === "cadastros") {
      return "Estoque:Cadastros";
    }
    if (aba === "entrada") {
      return "Estoque:Entrada";
    }
    if (aba === "fornecedores") {
      return "Estoque:Fornecedores";
    }
    if (aba === "saida") {
      return "Estoque:Saída";
    }
    if (aba === "movimentacoes") {
      return "Estoque:Movimentações";
    }
    if (aba === "cadastro_receita") {
      return "Quadro de Receitas:Cadastro";
    }
    if (aba === "central_receitas") { // <-- NOVO
      return "Quadro de Receitas:Central de Receitas";
    }
    return abasPrincipais[aba]?.label || "";
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
    } else if (label === "Estoque:Cadastros") {
      setAba("cadastros");
    } else if (label === "Estoque:Entrada") {
      setAba("entrada");
    } else if (label === "Estoque:Fornecedores") {
      setAba("fornecedores");
    } else if (label === "Estoque:Saída") {
      setAba("saida");
    } else if (label === "Estoque:Movimentações") {
      setAba("movimentacoes");
    } else if (label === "Quadro de Receitas:Cadastro") {
      setAba("cadastro_receita");
    } else if (label === "Quadro de Receitas:Central de Receitas") { // <-- NOVO
      setAba("central_receitas");
    } else {
      const idx = abasPrincipais.findIndex(x => x.label === label);
      setAba(idx >= 0 ? idx : 0);
      setCatIdx(0);
      setSubCatMarkup(0);
    }
  }

  const despesasFixasCarregadas = Array.isArray(categoriasCustos[0]?.subcategorias);
  const funcionariosCarregados = Array.isArray(categoriasCustos[1]?.funcionarios);

  if (user) {
    const AbaComponent = typeof aba === "number" ? abasPrincipais[aba].component : null;
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
          {aba === 2 ? (
            catIdx === 2 ? (
              <EncargosSobreVenda
                data={encargosData}
                setData={setEncargosData}
                outros={outrosEncargos}
                setOutros={setOutrosEncargos}
                user={user}
              />
            ) : catIdx === 1 ? (
              <FolhaDePagamento
                funcionarios={categoriasCustos[1].funcionarios}
                setFuncionarios={funcs =>
                  setCategoriasCustos(cats => {
                    const novas = [...cats];
                    novas[1].funcionarios = funcs;
                    return novas;
                  })
                }
                handleAddFuncionario={handleAddFuncionario}
                handleEditarFuncionario={handleEditarFuncionario}
                handleExcluirFuncionario={handleExcluirFuncionario}
                totalFolha={categoriasCustos[1].funcionarios.reduce(
                  (acc, f) => acc + calcularTotalFuncionarioObj(f),
                  0
                )}
                calcularTotalFuncionarioObj={calcularTotalFuncionarioObj}
                CAMPOS_PERCENTUAIS={CAMPOS_PERCENTUAIS}
              />
            ) : (
              <Custos
                catIdx={catIdx}
                categorias={categoriasCustos}
                setCategorias={setCategoriasCustos}
                user={user}
              />
            )
          ) : aba === 3 ? (
            subCatMarkup === 0 ? (
              <FaturamentoRealizado
                user={user}
                setGastoSobreFaturamento={setGastoSobreFaturamento}
              />
            ) : subCatMarkup === 1 ? (
              <MarkupIdeal
                user={user}
                encargosData={encargosData}
                outrosEncargos={outrosEncargos}
                gastoSobreFaturamento={gastoSobreFaturamento}
                despesasFixasSubcats={categoriasCustos[0]?.subcategorias || []}
                funcionarios={categoriasCustos[1]?.funcionarios || []}
                calcularTotalFuncionarioObj={calcularTotalFuncionarioObj}
              />
            ) : null
          ) : aba === "cadastros" ? (
            <Cadastro />
          ) : aba === "entrada" ? (
            <EntradaEstoque />
          ) : aba === "fornecedores" ? (
            <Fornecedores />
          ) : aba === "saida" ? (
            <SaidaEstoque />
          ) : aba === "movimentacoes" ? (
            <Movimentacoes />
          ) : aba === "cadastro_receita" ? (
            <CadastroReceita />
          ) : aba === "central_receitas" ? ( // <-- NOVO
            <CentralReceitas />
          ) : AbaComponent ? (
            <AbaComponent user={user} />
          ) : null}
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "2rem auto",
        padding: 32,
        border: "1px solid #ccc",
        borderRadius: 16
      }}
    >
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
        style={{
          width: "100%",
          background: "#eee",
          border: "none",
          color: "#222"
        }}
      >
        {screen === "login"
          ? "Não tem conta? Cadastre-se"
          : "Já tem conta? Faça login"}
      </button>
      <div style={{ color: "#900", marginTop: 8 }}>{msg}</div>
    </div>
  );
}
