import React, { useEffect, useState } from "react";
import Select from "react-select";
import ModalUpgradePlano from "../modals/ModalUpgradePlano";
import { useAuth } from "../../App";
import "./Movimentacoes.css";

// Estilo dos selects igual aos inputs do sistema
const selectEstilo = {
  menu: base => ({
    ...base,
    zIndex: 9999,
    background: "#fff",
    borderRadius: 13,
    border: "none"
  }),
  control: (base, state) => ({
    ...base,
    background: "#f8fafd",
    border: `2px solid ${state.isFocused ? "#00cfff" : "#2196f3"}`,
    borderRadius: 13,
    minHeight: 44,
    height: 44,
    color: "#237be7",
    fontSize: "1.08rem",
    outline: "none",
    boxShadow: "none",
    cursor: "pointer",
    width: "100%",
    transition: "border .2s",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    '&:hover': {
      border: "2px solid #00cfff"
    }
  }),
  valueContainer: base => ({
    ...base,
    padding: "0 10px",
    minHeight: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box"
  }),
  singleValue: base => ({
    ...base,
    color: "#237be7",
    fontWeight: 700,
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  placeholder: base => ({
    ...base,
    color: "#b4c7e8",
    fontWeight: 500,
    margin: 0,
    padding: 0,
    opacity: 1,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  input: base => ({
    ...base,
    color: "#237be7",
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    height: 44,
    minHeight: 44,
    boxSizing: "border-box"
  }),
  dropdownIndicator: base => ({
    ...base,
    color: "#2196f3",
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
    color: "#2196f3",
    paddingLeft: 6,
    paddingRight: 2,
    display: "flex",
    alignItems: "center",
    height: "100%"
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "#e1e9f7" : "#fff",
    color: "#237be7",
    fontWeight: state.isSelected ? 900 : 700,
    fontSize: "1.08rem",
    cursor: "pointer",
    padding: "12px 18px"
  }),
};

export default function Movimentacoes() {
  // ===== LIMITE DE PLANO =====
  const { user, setAba } = useAuth() || {};
  const plano = user?.plano || "gratuito";
  const isPlanoGratuito = plano === "gratuito";
  const [showUpgrade, setShowUpgrade] = useState(isPlanoGratuito);

  // BLOQUEIA ACESSO NO PLANO GRATUITO
  if (isPlanoGratuito) {
    return (
      <ModalUpgradePlano
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        irParaPlanos={() => {
          setAba("perfil_planos");
          setShowUpgrade(false);
        }}
      />
    );
  }

  // =========== ACESSO LIBERADO PARA PLANOS PAGOS =============

  const [movs, setMovs] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtroProduto, setFiltroProduto] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState(""); // "entrada", "saida", ""
  const [buscaNome, setBuscaNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [deletando, setDeletando] = useState(null);

  // Busca movimentações
  function buscarMovs() {
    setCarregando(true);
    fetch("/api/movimentacoes", { credentials: "include" })
      .then(res => res.json())
      .then(data => setMovs(data))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    buscarMovs();
  }, []);

  useEffect(() => {
    fetch("/api/produtos", { credentials: "include" })
      .then(res => res.json())
      .then(setProdutos);
  }, []);

  // Filtragem (produto, tipo, busca por nome)
  const movsFiltradas = movs.filter(mov => {
    const prodNome = produtos.find(p => p.id === mov.produtoId)?.nome || "";
    if (filtroProduto && mov.produtoId !== filtroProduto.value) return false;
    if (filtroTipo && mov.tipo !== filtroTipo) return false;
    if (buscaNome && !prodNome.toLowerCase().includes(buscaNome.toLowerCase())) return false;
    return true;
  });

  // ====== DELETAR MOVIMENTAÇÃO ======
  async function handleDelete(mov) {
    if (deletando) return;
    if (!window.confirm("Tem certeza que deseja apagar esta movimentação?")) return;

    setDeletando(mov.id);
    try {
      const rota = `/api/movimentacoes/${mov.tipo === "entrada" ? "entrada" : "saida"}/${mov.id}`;
      const res = await fetch(rota, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Erro ao deletar movimentação");
      buscarMovs();
    } catch (e) {
      alert("Erro ao deletar movimentação!");
    }
    setDeletando(null);
  }

  return (
    <div className="estoque-mov-main">
      <h2
        className="estoque-mov-titulo"
        style={{
          marginLeft: 10,
          marginTop: 10,
          marginBottom: 24,
          textAlign: "left"
        }}
      >
        Movimentações de Estoque
      </h2>

      <section className="estoque-mov-section">
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
              style={{ height: 44, minHeight: 44, boxSizing: "border-box" }}
            />
          </div>
          <div className="filtro-select">
            <label className="filtro-label">Filtrar por produto:</label>
            <Select
              options={produtos.map(p => ({ value: p.id, label: p.nome }))}
              value={filtroProduto}
              onChange={setFiltroProduto}
              styles={selectEstilo}
              isClearable
              placeholder="Selecione"
              theme={theme => ({
                ...theme,
                colors: { ...theme.colors, primary25: "#e1e9f7", primary: "#2196f3" }
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
                colors: { ...theme.colors, primary25: "#e1e9f7", primary: "#2196f3" }
              })}
            />
          </div>
        </div>

        <div className="tabela-container">
          <table className="estoque-mov-table">
            <thead>
              <tr>
                <th style={{ width: "18%" }}>Data</th>
                <th style={{ width: "30%" }}>Produto</th>
                <th style={{ width: "16%" }}>Tipo</th>
                <th style={{ width: "16%" }}>Quantidade</th>
                <th style={{ width: "20%" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>Carregando...</td>
                </tr>
              ) : movsFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#b4c7e8" }}>Nenhuma movimentação encontrada</td>
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
                    <td className="acoes-col">
                      <div className="btns-acoes-mov">
                        <button
                          className="btn-excluir-mov"
                          onClick={() => handleDelete(mov)}
                          title="Excluir movimentação"
                          disabled={deletando === mov.id}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
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
