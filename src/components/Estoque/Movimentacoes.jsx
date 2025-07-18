import React, { useEffect, useState } from "react";
import Select from "react-select";

// CSS global, input e tabela bonitos
const styles = `
.estoque-limpo-main {
  min-height: 100vh;
  background: linear-gradient(135deg,#191825 80%,#443C68 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
}
.estoque-limpo-titulo {
  color: #FFD93D;
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 32px;
  text-shadow: 2px 4px 12px #0007;
  letter-spacing: 2px;
}
.estoque-limpo-section {
  background: #2d2242;
  padding: 36px 36px 24px 36px;
  border-radius: 22px;
  box-shadow: 0 8px 28px #0002, 0 2px 5px #0003;
  width: 100%;
  max-width: 900px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
}
.filtros-linha {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 22px;
}
.filtro-busca, .filtro-select {
  flex: 1 1 0;
  min-width: 180px;
  display: flex;
  flex-direction: column;
}
.filtro-label {
  font-size: 1rem;
  color: #FFD93D;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: 1px;
}
.busca-input {
  padding: 10px 16px;
  border-radius: 12px;
  border: 2px solid #FFD93D;
  background: #191333;
  color: #fff;
  font-size: 1.08rem;
  margin-top: 3px;
  outline: none;
  transition: border .2s, box-shadow .2s;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  height: 44px;
  display: flex;
  align-items: center;
}
.busca-input::placeholder {
  color: #fff;
  opacity: 0.7;
  font-weight: 400;
}
.busca-input:focus {
  border: 2px solid #FFD93D;
  box-shadow: none;
  background: #23183a;
}
.tabela-container {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.estoque-mov-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 1.02rem;
  margin-top: 2px;
  background: #23183a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px #0003;
}
.estoque-mov-table thead tr {
  background: #2d2242;
}
.estoque-mov-table th, .estoque-mov-table td {
  padding: 12px 8px;
  text-align: left;
}
.estoque-mov-table th {
  color: #FFD93D;
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: .7px;
  border-bottom: 2px solid #FFD93D22;
}
.estoque-mov-table tbody tr {
  border-radius: 8px;
  transition: background .14s;
}
.estoque-mov-table tbody tr:hover {
  background: #3c2a5b55;
}
.estoque-mov-table td {
  color: #fff;
  font-weight: 500;
  border-bottom: 1px solid #3c2a5b33;
}
.estoque-mov-table td.tipo-entrada {
  color: #64f87b;
  font-weight: 700;
  text-shadow: 0 0 2px #256d3b77;
}
.estoque-mov-table td.tipo-saida {
  color: #ff6161;
  font-weight: 700;
  text-shadow: 0 0 2px #6d252577;
}
::-webkit-scrollbar { height: 7px; background: #443C6822; border-radius: 2px;}
::-webkit-scrollbar-thumb { background: #FFD93D44; border-radius: 2px;}
@media (max-width: 950px) {
  .estoque-limpo-section { padding: 16px 1vw; min-width: 0; }
  .filtros-linha { flex-direction: column; gap: 12px; }
  .estoque-mov-table th, .estoque-mov-table td { padding: 7px 4px; }
}
`;
// Injeta CSS uma vez só
if (typeof document !== "undefined" && !document.getElementById("estoque-limpo-css")) {
  const style = document.createElement("style");
  style.id = "estoque-limpo-css";
  style.innerHTML = styles;
  document.head.appendChild(style);
}

// Estilo do Select: texto centralizado verticalmente
const selectEstilo = {
  menu: base => ({
    ...base,
    zIndex: 9999,
    background: "#191333",
    borderRadius: 12,
    border: "none"
  }),
  control: (base, state) => ({
    ...base,
    background: "#191333",
    border: `2px solid #FFD93D`,
    borderRadius: 12,
    minHeight: 44,
    height: 44,
    color: "#fff",
    fontSize: "1.08rem",
    outline: "none",
    boxShadow: "none",
    cursor: "pointer",
    width: "100%",
    transition: "border .2s",
    display: "flex",
    alignItems: "center",
    '&:hover': {
      border: "2px solid #FFD93D"
    }
  }),
  valueContainer: base => ({
    ...base,
    padding: "0 10px",
    minHeight: 44,
    height: 44,
    display: "flex",
    alignItems: "center"
  }),
  singleValue: base => ({
    ...base,
    color: "#fff",
    fontWeight: 400,
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  placeholder: base => ({
    ...base,
    color: "#fff",
    fontWeight: 400,
    margin: 0,
    padding: 0,
    opacity: 0.7,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  input: base => ({
    ...base,
    color: "#fff",
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  dropdownIndicator: base => ({
    ...base,
    color: "#fff",
    paddingRight: 10,
    paddingLeft: 4,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  indicatorSeparator: base => ({
    ...base,
    background: "transparent",
    width: 0,
    margin: 0
  }),
  clearIndicator: base => ({
    ...base,
    color: "#fff",
    paddingLeft: 6,
    paddingRight: 2,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "#FFD93D22" : "#191333",
    color: "#fff",
    fontWeight: state.isSelected ? 700 : 500,
    fontSize: "1.08rem",
    cursor: "pointer",
    padding: "12px 18px"
  }),
};

export default function Movimentacoes() {
  const [movs, setMovs] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtroProduto, setFiltroProduto] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState(""); // "entrada", "saida", ""
  const [buscaNome, setBuscaNome] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchMovs() {
      setCarregando(true);
      try {
        const res = await fetch("/api/movimentacoes", { credentials: "include" });
        const data = await res.json();
        setMovs(data);
      } catch (err) {
        setMovs([]);
      }
      setCarregando(false);
    }
    fetchMovs();
  }, []);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await fetch("/api/produtos", { credentials: "include" });
        setProdutos(await res.json());
      } catch {}
    }
    fetchProdutos();
  }, []);

  // Filtragem (produto, tipo, busca por nome)
  const movsFiltradas = movs.filter(mov => {
    const prodNome = produtos.find(p => p.id === mov.produtoId)?.nome || "";
    if (filtroProduto && mov.produtoId !== filtroProduto.value) return false;
    if (filtroTipo && mov.tipo !== filtroTipo) return false;
    if (buscaNome && !prodNome.toLowerCase().includes(buscaNome.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="estoque-limpo-main">
      <h2 className="estoque-limpo-titulo">Movimentações de Estoque</h2>

      <section className="estoque-limpo-section">
        <div className="filtros-linha">
          <div className="filtro-busca">
            <label className="filtro-label">Buscar produto:</label>
            <input
              className="busca-input"
              type="text"
              placeholder="Digite o nome do produto"
              value={buscaNome}
              onChange={e => setBuscaNome(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="filtro-select">
            <label className="filtro-label">Filtrar por:</label>
            <Select
              options={produtos.map(p => ({ value: p.id, label: p.nome }))}
              value={filtroProduto}
              onChange={setFiltroProduto}
              styles={selectEstilo}
              isClearable
              placeholder="Selecione"
              theme={theme => ({
                ...theme,
                colors: { ...theme.colors, primary25: "#FFD93D22", primary: "#FFD93D" }
              })}
            />
          </div>
          <div className="filtro-select">
            <label className="filtro-label">Tipo:</label>
            <Select
              options={[
                { value: "", label: "Todos" },
                { value: "entrada", label: "Entrada" },
                { value: "saida", label: "Saída" },
              ]}
              value={[
                { value: "", label: "Todos" },
                { value: "entrada", label: "Entrada" },
                { value: "saida", label: "Saída" },
              ].find(o => o.value === filtroTipo)}
              onChange={opt => setFiltroTipo(opt.value)}
              styles={selectEstilo}
              placeholder="Todos"
              theme={theme => ({
                ...theme,
                colors: { ...theme.colors, primary25: "#FFD93D22", primary: "#FFD93D" }
              })}
            />
          </div>
        </div>

        <div className="tabela-container">
          <table className="estoque-mov-table">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Data</th>
                <th style={{ width: "32%" }}>Produto</th>
                <th style={{ width: "22%" }}>Tipo</th>
                <th style={{ width: "24%" }}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>Carregando...</td>
                </tr>
              ) : movsFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#ccc" }}>Nenhuma movimentação encontrada</td>
                </tr>
              ) : (
                movsFiltradas.map((mov, i) => (
                  <tr key={mov.id || i}>
                    <td>{mov.data ? mov.data.slice(0, 10).split("-").reverse().join("/") : ""}</td>
                    <td>{produtos.find(p => p.id === mov.produtoId)?.nome || mov.produtoId}</td>
                    <td className={mov.tipo === "entrada" ? "tipo-entrada" : "tipo-saida"}>
                      {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                    </td>
                    <td>{mov.quantidade}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}