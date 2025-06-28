import React, { useState } from "react";
import { FaCog } from "react-icons/fa";
import ModalEscolhaCadastro from "./ModalEscolhaCadastro";
import ModalCadastroManual from "./ModalCadastroManual";
import ModalLeitorCodigoBarras from "./ModalLeitorCodigoBarras";
import "./Cadastro.css";

// Switch visual (apenas visual, igual ao Markup Ideal)
function SwitchAtivo({ checked }) {
  return (
    <label className="switch-ativo">
      <input type="checkbox" checked={checked} disabled />
      <span className="switch-slider" />
    </label>
  );
}

function gerarCodigoUnico() {
  // Exemplo simples: timestamp + 3 dígitos randômicos
  return Date.now().toString().slice(-6) + Math.floor(Math.random() * 900 + 100);
}

export default function Cadastro() {
  // Modais
  const [escolhaModalOpen, setEscolhaModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [leitorModalOpen, setLeitorModalOpen] = useState(false);

  const [ingredienteEdit, setIngredienteEdit] = useState({});
  // Lista de ingredientes (mock, depois substitui pelo banco/backend)
  const [busca, setBusca] = useState("");
  const [ingredientes, setIngredientes] = useState([
    {
      codigo: "001",
      codBarras: "789490011517",
      nome: "Farinha de Trigo",
      categoria: "Farinhas",
      marca: "Dona Benta",
      unidade: "kg",
      estoque: "10,00",
      custo: "5,00",
      ativo: true,
    },
    {
      codigo: "002",
      codBarras: "7896098902107",
      nome: "Ovos",
      categoria: "Frescos",
      marca: "Granjas XYZ",
      unidade: "un",
      estoque: "120",
      custo: "0,75",
      ativo: true,
    },
    {
      codigo: "003",
      codBarras: "7891910000197",
      nome: "Açúcar",
      categoria: "Farinhas",
      marca: "União",
      unidade: "kg",
      estoque: "7,5",
      custo: "3,90",
      ativo: false,
    },
  ]);

  // Filtro simples
  const ingredientesFiltrados = ingredientes.filter((item) =>
    (item.nome + item.codigo + (item.codBarras || "") + item.marca)
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  function handleNovoCadastro() {
    setEscolhaModalOpen(true);
  }

  // Quando escolhe manual, abre o modal manual
  function handleEscolhaManual() {
    setEscolhaModalOpen(false);
    setIngredienteEdit({
      codigo: gerarCodigoUnico(),
      codBarras: "",
      nome: "",
      categoria: "",
      marca: "",
      unidade: "",
      estoque: "",
      custo: "",
      ativo: true,
      imagem: null,
    });
    setManualModalOpen(true);
  }

  // Novo: Quando escolhe automático, abre o leitor de código de barras
  function handleEscolhaAutomatico() {
    setEscolhaModalOpen(false);
    setLeitorModalOpen(true);
  }

  // Novo: Quando o leitor retorna um código (e opcionalmente um nome)
  function handleCodigoEncontrado({ codBarras, nome }) {
    setLeitorModalOpen(false);

    // Verifica se já existe na lista
    const encontrado = ingredientes.find(item => item.codBarras === codBarras);

    if (encontrado) {
      // Se já existe, abre pra editar
      setIngredienteEdit(encontrado);
      setManualModalOpen(true);
    } else {
      // Se não existe, abre cadastro já com o código (e nome se vier)
      setIngredienteEdit({
        codigo: gerarCodigoUnico(),
        codBarras,
        nome: nome || "",
        categoria: "",
        marca: "",
        unidade: "",
        estoque: "",
        custo: "",
        ativo: true,
        imagem: null,
      });
      setManualModalOpen(true);
    }
  }

  // Editar ingrediente já cadastrado (da lista)
  function editarIngrediente(item) {
    setIngredienteEdit(item);
    setManualModalOpen(true);
  }

  // Salvar e excluir (mock, depois põe backend)
  function handleSalvarIngrediente(ingrediente) {
    // Substitui ou adiciona na lista (mock)
    setIngredientes(prev => {
      const idx = prev.findIndex(item => item.codigo === ingrediente.codigo);
      if (idx !== -1) {
        const novaLista = [...prev];
        novaLista[idx] = ingrediente;
        return novaLista;
      } else {
        return [...prev, ingrediente];
      }
    });
    setManualModalOpen(false);
  }
  function handleExcluirIngrediente() {
    setIngredientes(prev =>
      prev.filter(item => item.codigo !== ingredienteEdit.codigo)
    );
    setManualModalOpen(false);
  }

  return (
    <div className="cadastro-main">
      {/* Bloco superior */}
      <div className="cadastro-header">
        <h2>Cadastros</h2>
        <div className="cadastro-header-actions">
          <button className="btn-novo-cadastro" onClick={handleNovoCadastro}>
            + Novo Cadastro
          </button>
          <div className="cadastro-config-icon" title="Configurações">
            <FaCog size={24} color="#a78bfa" />
          </div>
        </div>
      </div>

      {/* Filtro */}
      <div className="cadastro-filtro">
        <input
          type="text"
          placeholder="Filtrar por nome, código, marca, etc..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="cadastro-tabela-wrap">
        <table className="cadastro-tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cód. Barras</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Marca</th>
              <th>Unidade</th>
              <th>Estoque</th>
              <th>Custo (R$)</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ingredientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: 24, color: "#bbb" }}>
                  Nenhum ingrediente encontrado.
                </td>
              </tr>
            )}
            {ingredientesFiltrados.map((item) => (
              <tr
                key={item.codigo}
                className={item.ativo ? "linha-ativo" : "linha-inativo"}
              >
                <td>{item.codigo}</td>
                <td>{item.codBarras || ""}</td>
                <td>{item.nome}</td>
                <td>{item.categoria}</td>
                <td>{item.marca}</td>
                <td>{item.unidade}</td>
                <td>{item.estoque}</td>
                <td>R$ {item.custo}</td>
                <td>
                  <SwitchAtivo checked={item.ativo} />
                </td>
                <td>
                  <button className="btn-editar" onClick={() => editarIngrediente(item)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de escolha automático/manual */}
      <ModalEscolhaCadastro
        open={escolhaModalOpen}
        onClose={() => setEscolhaModalOpen(false)}
        onManual={handleEscolhaManual}
        onAuto={handleEscolhaAutomatico}
      />

      {/* Modal leitor de código de barras */}
      <ModalLeitorCodigoBarras
        open={leitorModalOpen}
        onClose={() => setLeitorModalOpen(false)}
        onEncontrado={handleCodigoEncontrado}
      />

      {/* Modal de cadastro manual */}
      <ModalCadastroManual
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        ingrediente={ingredienteEdit}
        onSave={handleSalvarIngrediente}
        onDelete={handleExcluirIngrediente}
        onChange={setIngredienteEdit}
      />
    </div>
  );
}
