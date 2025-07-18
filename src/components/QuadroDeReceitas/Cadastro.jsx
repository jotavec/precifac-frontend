import React, { useRef, useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import Select from "react-select";
import { FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import BlocoResumoMarkup from "./BlocoResumoMarkup";
import "./Cadastro.css";

// ===== FUNÇÕES UTILITÁRIAS =====
function calcularValorHoraFuncionario(f) {
  const salario = Number(String(f.salario).replace(/\./g, '').replace(',', '.')) || 0;
  const horas = Number(f.totalHorasMes || 220) || 1;
  let total = salario;
  return salario && horas ? total / horas : 0;
}

function getCroppedImg(imageSrc, crop) {
  const exportWidth = 1200;
  const exportHeight = 1600;
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, exportWidth, exportHeight
      );
      resolve(canvas.toDataURL("image/jpeg"));
    };
  });
}

function formatarCustoUn(custo, unidade) {
  const val = Number(custo);
  if (isNaN(val)) return "-";
  const unidadesQuatroCasas = [
    "Grama (g)", "Miligrama (mg)", "Micrograma (mcg)",
    "Mililitro (ml)", "Centímetro (cm)", "Milímetro (mm)"
  ];
  const casas = unidadesQuatroCasas.includes(unidade) ? 4 : 2;
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}`;
}

function formatarDinheiro(valor, casas = 2) {
  const n = Number(valor);
  if (isNaN(n)) return "-";
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}`;
}

function getPesoUnitarioNumber(pesoUnitario) {
  const match = (pesoUnitario || "").replace(/[^\d.,]/g, "").replace(",", ".");
  return Number(match) || 0;
}

// ===== CONSTANTES =====
const unidades = [
  { singular: "dia", plural: "dias" },
  { singular: "mês", plural: "meses" },
  { singular: "hora", plural: "horas" },
  { singular: "ano", plural: "anos" }
];

const opcoesTempo = [
  { value: "minutos", label: "minutos" },
  { value: "horas", label: "horas" }
];

const opcoesRendimento = [
  { value: "unidade", label: "Unidade (un)" },
  { value: "grama", label: "Grama (g)" },
  { value: "quilo", label: "Quilo (kg)" },
  { value: "litro", label: "Litro (l)" },
  { value: "mililitro", label: "Mililitro (ml)" }
];

// ===== MODAL TIPOS DE PRODUTO =====
function ModalNovoTipoProduto({ aberto, onClose, onAdd }) {
  const [novoTipo, setNovoTipo] = useState("");
  const [tiposExistentes, setTiposExistentes] = useState([
    { value: "industrializado", label: "Industrializado" },
    { value: "artesanal", label: "Artesanal" },
    { value: "cacaos", label: "cÁCa" },
  ]);

  if (!aberto) return null;

  function handleAddTipo(e) {
    e.preventDefault();
    const nome = (novoTipo || "").trim();
    if (nome) {
      const novoTipoObj = { value: nome.toLowerCase().replace(/ /g, "_"), label: nome };
      setTiposExistentes([...tiposExistentes, novoTipoObj]);
      onAdd(nome);
      setNovoTipo("");
    }
  }

  function handleEditTipo(tipo) {
    console.log("Editar tipo:", tipo);
  }

  function handleDeleteTipo(valueToDelete) {
    setTiposExistentes(tiposExistentes.filter(t => t.value !== valueToDelete));
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-marcas">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="modal-title">Tipos de Produto</h2>
        
        <div className="marcas-list">
          {tiposExistentes.map(tipo => (
            <div key={tipo.value} className="marca-item">
              <span className="marca-nome">{tipo.label}</span>
              <div className="marca-actions">
                <button
                  type="button"
                  className="marca-edit-btn"
                  onClick={() => handleEditTipo(tipo)}
                  title="Editar tipo"
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  className="marca-delete-btn"
                  onClick={() => handleDeleteTipo(tipo.value)}
                  title="Excluir tipo"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddTipo} className="add-marca-form">
          <input
            className="input-form-brabo"
            type="text"
            placeholder="Novo tipo"
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />
          <button type="submit" className="btn-adicionar-marca">
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}


// ===== COMPONENTE PRINCIPAL =====
export default function Cadastro() {
  // ===== STATES - IMAGEM E CROPPER =====
  const [imgPreview, setImgPreview] = useState(null);
  const inputImgRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  // ===== STATES - DADOS GERAIS =====
  const [nomeReceita, setNomeReceita] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tempFocusIndex, setTempFocusIndex] = useState(null);
  const [conservacaoData, setConservacaoData] = useState([
    { descricao: 'Congelado', temp: '-18', tempoNum: '6', tempoUnidade: 1 },
    { descricao: 'Refrigerado', temp: '4', tempoNum: '3', tempoUnidade: 0 },
    { descricao: 'Ambiente', temp: '20', tempoNum: '2', tempoUnidade: 2 }
  ]);
  const [subReceita, setSubReceita] = useState(false);

  // ===== STATES - TABELAS =====
  const [ingredientes, setIngredientes] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [embalagens, setEmbalagens] = useState([]);
  const [produtosEstoque, setProdutosEstoque] = useState([]);

  // ===== STATES - MÃO DE OBRA =====
  const [profissoesDiretas, setProfissoesDiretas] = useState([]);
  const [cargosComValorHora, setCargosComValorHora] = useState([]);
  const [tipoMaoObra, setTipoMaoObra] = useState("");
  const [quantidadeMaoObra, setQuantidadeMaoObra] = useState("");
  const [unidadeMaoObra, setUnidadeMaoObra] = useState("minutos");
  const [maoObras, setMaoObras] = useState([]);
  const [showFormMaoObra, setShowFormMaoObra] = useState(false);
  const [editandoMaoObra, setEditandoMaoObra] = useState(null);
  const [valorHoraMaoObraSelecionada, setValorHoraMaoObraSelecionada] = useState(0);
  const [valorTotalLinhaMaoObra, setValorTotalLinhaMaoObra] = useState(0);

  // ===== STATES - PRODUTO =====
  const [tiposProduto, setTiposProduto] = useState([
    { value: "industrializado", label: "Industrializado" },
    { value: "artesanal", label: "Artesanal" }
  ]);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [showModalTipo, setShowModalTipo] = useState(false);
  const [rendimentoNumero, setRendimentoNumero] = useState('');
  const [rendimentoUnidade, setRendimentoUnidade] = useState('unidade');
  const [tempoPreparoTotalNumero, setTempoPreparoTotalNumero] = useState('');
  const [tempoPreparoTotalUnidade, setTempoPreparoTotalUnidade] = useState('minutos');
  const [pesoUnitario, setPesoUnitario] = useState('');
  const [pesoUnitarioFocused, setPesoUnitarioFocused] = useState(false);
  const [precoVenda, setPrecoVenda] = useState("");

  // ===== STATES - MARKUP =====
  const [blocosMarkup, setBlocosMarkup] = useState([]);
  const [descontoReais, setDescontoReais] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState("");

    // Cria um objeto pra acessar o markupIdeal pelo nome do bloco
const blocosMarkupPorNome = React.useMemo(() => {
  const obj = {};
  blocosMarkup.forEach(bloco => {
    // Transforma "2,180" em 2.18
    let valor = bloco.markupIdeal;
    if (typeof valor === "string") valor = Number(valor.replace(",", "."));
    obj[bloco.nome?.trim()] = valor;
  });
  return obj;
}, [blocosMarkup]);

// Só pra testar, printa no console
console.log("MAPA DOS BLOCOS", blocosMarkupPorNome);
// TESTE: digite aqui o nome de um bloco que você tem lá no markup (exatamente igual ao nome do card)
const NOME_TESTE = "123"; // <-- coloque o nome EXATO de um dos blocos que está cadastrado

// Pega o valor do markup dessa categoria (se existir)
const valorTestado = blocosMarkupPorNome[NOME_TESTE];

console.log("Valor do markup do bloco '" + NOME_TESTE + "':", valorTestado);

  // ===== FUNÇÃO PARA CALCULAR PREÇO POR KG =====
  function calcularPrecoPorKg() {
    const precoVendaUn = Number(precoVenda) || 0;
    const peso = getPesoUnitarioNumber(pesoUnitario);
    if (precoVendaUn > 0 && peso > 0) {
      return (precoVendaUn / peso) * 1000;
    }
    return 0;
  }

  // ===== USEEFFECTS - FETCH DE DADOS =====
  useEffect(() => {
    fetchProdutosEstoque();
  }, []);

  useEffect(() => {
    fetchProfissoesDiretas();
  }, []);

  useEffect(() => {
    fetchCargosValorHora();
  }, []);

  useEffect(() => {
    fetchBlocosMarkup();
  }, []);

  // ===== USEEFFECTS - CÁLCULOS MÃO DE OBRA =====
  useEffect(() => {
    if (tipoMaoObra) {
      const cargoEncontrado = cargosComValorHora.find(
        item => item.cargo === tipoMaoObra
      );
      setValorHoraMaoObraSelecionada(cargoEncontrado ? cargoEncontrado.valorHora : 0);
    } else {
      setValorHoraMaoObraSelecionada(0);
    }
  }, [tipoMaoObra, cargosComValorHora]);

  useEffect(() => {
    if (valorHoraMaoObraSelecionada > 0 && quantidadeMaoObra) {
      const quantidade = Number(quantidadeMaoObra);
      const valorHora = valorHoraMaoObraSelecionada;
      
      let valorTotal = 0;
      if (unidadeMaoObra === "minutos") {
        valorTotal = (quantidade / 60) * valorHora;
      } else {
        valorTotal = quantidade * valorHora;
      }
      
      setValorTotalLinhaMaoObra(valorTotal);
    } else {
      setValorTotalLinhaMaoObra(0);
    }
  }, [valorHoraMaoObraSelecionada, quantidadeMaoObra, unidadeMaoObra]);

  // ===== FUNÇÕES DE FETCH =====
  async function fetchProdutosEstoque() {
    try {
      const res = await fetch("http://localhost:3000/api/produtos");
      const data = await res.json();
      setProdutosEstoque(Array.isArray(data) ? data : []);
    } catch {
      setProdutosEstoque([]);
    }
  }

  async function fetchProfissoesDiretas() {
    try {
      const res = await fetch("http://localhost:3000/api/folhapagamento/funcionarios/profissoes-diretas", {
        credentials: "include",
      });
      const data = await res.json();
      setProfissoesDiretas(
        Array.isArray(data) ? data.map(cargo => ({ value: cargo, label: cargo })) : []
      );
    } catch (err) {
      setProfissoesDiretas([]);
    }
  }

  async function fetchCargosValorHora() {
    try {
      const res = await fetch("http://localhost:3000/api/folhapagamento/funcionarios", { credentials: "include" });
      const data = await res.json();
      const cargos = Array.isArray(data)
        ? data.map(f => ({
            cargo: f.cargo,
            valorHora: calcularValorHoraFuncionario(f)
          }))
        : [];
      setCargosComValorHora(cargos);
    } catch {
      setCargosComValorHora([]);
    }
  }

  async function fetchBlocosMarkup() {
    try {
      const res = await fetch("http://localhost:3000/api/markup-ideal", { credentials: "include" });
      const data = await res.json();
      console.log("🔍 BLOCO DO BACKEND:", data);
      setBlocosMarkup(Array.isArray(data) ? data : []);
    } catch {
      setBlocosMarkup([]);
    }
  }
console.log("LISTA DE PORCENTAGENS:");
blocosMarkup.forEach((b) => {
  console.log(
    `[${b.nome}] Impostos: ${b.impostos} | Taxas: ${b.taxasPagamento} | Comissões: ${b.comissoes} | Outros: ${b.outros}`
  );
});

  // ===== FUNÇÕES DE MANIPULAÇÃO DE DADOS =====
  function handleAddTipoProduto(novoNome) {
    const novo = { value: novoNome.toLowerCase().replace(/ /g, "_"), label: novoNome };
    setTiposProduto((prev) => [...prev, novo]);
    setTipoSelecionado(novo);
  }

  function addIngrediente() {
    setIngredientes([...ingredientes, {
      produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "",
    }]);
  }

  function addReceita() {
    setReceitas([...receitas, { receitaId: null, tipo: "", qt: "", medida: "" }]);
  }

  function addEmbalagem() {
    setEmbalagens([...embalagens, {
      produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "",
    }]);
  }

  // ===== FUNÇÕES MÃO DE OBRA =====
  function salvarLinhaMaoObra() {
    if (tipoMaoObra && quantidadeMaoObra && valorTotalLinhaMaoObra > 0) {
      const novaLinha = {
        cargo: tipoMaoObra,
        valorHora: valorHoraMaoObraSelecionada,
        quantidade: quantidadeMaoObra,
        unidade: unidadeMaoObra,
        valorTotal: valorTotalLinhaMaoObra
      };
      
      if (editandoMaoObra !== null) {
        setMaoObras(prev => 
          prev.map((item, idx) => 
            idx === editandoMaoObra ? novaLinha : item
          )
        );
        setEditandoMaoObra(null);
      } else {
        setMaoObras(prev => [...prev, novaLinha]);
      }
      
      // Limpar campos
      setTipoMaoObra("");
      setQuantidadeMaoObra("");
      setUnidadeMaoObra("minutos");
      setValorHoraMaoObraSelecionada(0);
      setValorTotalLinhaMaoObra(0);
      setShowFormMaoObra(false);
    }
  }

  function editarMaoObra(idx) {
    const item = maoObras[idx];
    setTipoMaoObra(item.cargo);
    setQuantidadeMaoObra(item.quantidade);
    setUnidadeMaoObra(item.unidade);
    setValorHoraMaoObraSelecionada(item.valorHora);
    setValorTotalLinhaMaoObra(item.valorTotal);
    setEditandoMaoObra(idx);
  }

  function cancelarEdicaoMaoObra() {
    setEditandoMaoObra(null);
    setTipoMaoObra("");
    setQuantidadeMaoObra("");
    setUnidadeMaoObra("minutos");
    setValorHoraMaoObraSelecionada(0);
    setValorTotalLinhaMaoObra(0);
    setShowFormMaoObra(false);
  }

  // ===== FUNÇÕES PESO UNITÁRIO =====
  function getPesoUnitarioDisplay() {
    if (pesoUnitarioFocused) {
      return pesoUnitario.replace(/[^0-9.,]/g, '');
    } else {
      return pesoUnitario;
    }
  }

  function handlePesoUnitarioFocus(e) {
    setPesoUnitarioFocused(true);
    const numeroLimpo = pesoUnitario.replace(/[^0-9.,]/g, '');
    setPesoUnitario(numeroLimpo);
    setTimeout(() => e.target.select(), 0);
  }

  function handlePesoUnitarioBlur() {
    setPesoUnitarioFocused(false);
    if (pesoUnitario && /^\d+([,.]\d+)?$/.test(pesoUnitario)) {
      setPesoUnitario(pesoUnitario + 'g');
    }
  }

  function handlePesoUnitarioChange(e) {
    let valor = e.target.value;
    
    if (pesoUnitarioFocused) {
      valor = valor.replace(/[^0-9.,]/g, '');
    }
    
    setPesoUnitario(valor);
  }

  // ===== FUNÇÕES IMAGEM =====
  function handleImgChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImgPreview(ev.target.result);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleClickUpload() {
    inputImgRef.current && inputImgRef.current.click();
  }

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function showCroppedImage() {
    if (!imgPreview || !croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(imgPreview, croppedAreaPixels);
    setImgPreview(croppedImage);
    setShowCrop(false);
  }

  // ===== FUNÇÕES CONSERVAÇÃO =====
  function handleConservacaoChange(index, field, value) {
    const newData = [...conservacaoData];
    newData[index][field] = value;
    setConservacaoData(newData);
  }

  function getTempDisplay(item, index) {
    if (tempFocusIndex === index) return item.temp || "";
    if (item.temp && item.temp !== "") return `${item.temp}°C`;
    return "";
  }

  function getTempoLabel(num, unidadeIdx) {
    const n = parseInt(num, 10);
    if (isNaN(n)) return "";
    const idx = parseInt(unidadeIdx, 10);
    if (!unidades[idx]) return "";
    return (Math.abs(n) === 1)
      ? unidades[idx].singular
      : unidades[idx].plural;
  }

  // ===== CÁLCULOS AUTOMÁTICOS =====
  const calcularCustoIngredientes = () => {
    return ingredientes.reduce((total, item) => {
      if (item.precoEmb && item.qtEmb && item.qtUsada) {
        const custoUn = Number(item.precoEmb) / Number(item.qtEmb);
        return total + (custoUn * Number(item.qtUsada));
      }
      return total;
    }, 0);
  };

  const calcularCustoReceitas = () => {
    return receitas.reduce((total, item) => {
      return total;
    }, 0);
  };

  const calcularCustoEmbalagens = () => {
    return embalagens.reduce((total, item) => {
      if (item.precoEmb && item.qtEmb && item.qtUsada) {
        const custoUn = Number(item.precoEmb) / Number(item.qtEmb);
        return total + (custoUn * Number(item.qtUsada));
      }
      return total;
    }, 0);
  };

  const calcularCustoMaoObra = () => {
    return maoObras.reduce((total, item) => {
      return total + (item.valorTotal || 0);
    }, 0);
  };

  const custoIngredientes = calcularCustoIngredientes();
  const custoReceitas = calcularCustoReceitas();
  const custoEmbalagem = calcularCustoEmbalagens();
  const custoMaoObra = calcularCustoMaoObra();
  const custoTotal = custoIngredientes + custoReceitas + custoEmbalagem + custoMaoObra;

  // Cálculo do custo unitário
  const custoUnitario = rendimentoNumero && custoTotal > 0
    ? Number(custoTotal) / Number(rendimentoNumero)
    : custoTotal;

  // ===== OPÇÕES E CONFIGS =====
  const options = produtosEstoque.map(p => ({
    value: String(p.id),
    label: p.nome,
    produto: p
  }));

  const receitasOptions = [];

  const getSelectEstilo = (baseZIndex = 100) => ({
    control: (base, state) => ({
      ...base,
      background: "#2f2443",
      borderColor: state.isFocused ? "#ffe066" : "#b388ff",
      color: "#fff",
      minHeight: 43,
      borderRadius: 11,
      fontSize: "1.11rem",
      boxShadow: state.isFocused ? "0 0 0 2px #ffe06644" : "none",
      outline: "none",
      paddingLeft: 2,
      zIndex: baseZIndex + 1,
      flex: 1,
      width: "100%",
    }),
    singleValue: base => ({
      ...base,
      color: "#fff",
      fontWeight: 700,
      letterSpacing: "0.7px"
    }),
    placeholder: base => ({
      ...base,
      color: "#ffe066cc",
      fontWeight: 600
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "#20103b" : "#2f2443",
      color: "#fff",
      fontWeight: state.isSelected ? 900 : 600,
      fontSize: "1.07rem",
      cursor: "pointer"
    }),
    menu: base => ({
      ...base,
      background: "#2f2443",
      zIndex: baseZIndex + 10,
      borderRadius: 11,
      boxShadow: "0 8px 40px #0008"
    }),
    menuPortal: base => ({
      ...base,
      zIndex: baseZIndex + 10
    }),
    dropdownIndicator: base => ({
      ...base,
      color: "#ffe066"
    }),
    clearIndicator: base => ({
      ...base,
      color: "#ffe066cc"
    }),
    indicatorSeparator: base => ({
      ...base,
      background: "#ffe06644"
    }),
    input: base => ({
      ...base,
      color: "#fff",
    }),
  });

  // =================== CÁLCULO DO PREÇO COM DESCONTO ===================
  const valorVendaNumber = Number(String(precoVenda).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
  
  const [focoDesconto, setFocoDesconto] = useState("reais"); // "reais" ou "percentual"

  useEffect(() => {
    if (focoDesconto === "reais") {
      // Preenche % quando digitar R$
      const valReais = Number(descontoReais.replace(",", "."));
      if (valorVendaNumber > 0 && valReais >= 0 && descontoReais !== "") {
        const perc = ((valReais / valorVendaNumber) * 100).toFixed(2);
        setDescontoPercentual(isFinite(perc) ? perc : "");
      } else if (descontoReais === "") {
        setDescontoPercentual("");
      }
    }
    // eslint-disable-next-line
  }, [descontoReais, valorVendaNumber]);

  useEffect(() => {
    if (focoDesconto === "percentual") {
      // Preenche R$ quando digitar %
      const valPerc = Number(descontoPercentual.replace(",", "."));
      if (valorVendaNumber > 0 && valPerc >= 0 && descontoPercentual !== "") {
        const reais = ((valPerc / 100) * valorVendaNumber).toFixed(2);
        setDescontoReais(isFinite(reais) ? reais : "");
      } else if (descontoPercentual === "") {
        setDescontoReais("");
      }
    }
    // eslint-disable-next-line
  }, [descontoPercentual, valorVendaNumber]);

  let precoVendaComDesconto = valorVendaNumber;
  if (descontoReais && Number(descontoReais) > 0) {
    precoVendaComDesconto = valorVendaNumber - Number(descontoReais);
  } else if (descontoPercentual && Number(descontoPercentual) > 0) {
    precoVendaComDesconto = valorVendaNumber * (1 - Number(descontoPercentual) / 100);
  }
  if (precoVendaComDesconto < 0) precoVendaComDesconto = 0;
   
  // ===== RENDER =====
  return (
    <div className="bloco-receita-main">
      {/* ===== NOME DA RECEITA ===== */}
      <input
        type="text"
        className="nome-receita-input"
        placeholder="Adicionar Nome a Receita"
        value={nomeReceita}
        onChange={(e) => setNomeReceita(e.target.value)}
      />

      {/* ===== BLOCO HORIZONTAL - IMAGEM + CONSERVAÇÃO + OBSERVAÇÕES ===== */}
      <div className="bloco-receita-horizontal">
        {/* IMAGEM */}
        <div className="imagem-receita-upload">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={inputImgRef}
            onChange={handleImgChange}
          />
          
          {/* CROPPER MODAL */}
          {showCrop && (
            <div className="cropper-modal-bg">
              <div className="cropper-modal">
                <div className="cropper-area">
                  <Cropper
                    image={imgPreview}
                    crop={crop}
                    zoom={zoom}
                    aspect={3 / 4}
                    cropShape="rect"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                  <div className="cropper-buttons">
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                    />
                    <button onClick={showCroppedImage}>Salvar corte</button>
                    <button onClick={() => setShowCrop(false)}>Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div
            className="imagem-preview-box"
            onClick={handleClickUpload}
            title="Clique para selecionar uma imagem"
          >
            {imgPreview ? (
              <img
                src={imgPreview}
                alt="Imagem da Receita"
                className="imagem-preview"
              />
            ) : (
              <span className="imagem-preview-placeholder">
                Clique para adicionar uma imagem
              </span>
            )}
          </div>
        </div>

        {/* BLOCOS LATERAIS */}
        <div className="lateral-blocos">
          {/* CONSERVAÇÃO */}
          <div className="conservacao-bloco horizontal">
            <div className="conservacao-titulo">Conservação:</div>
            <div className="conservacao-tabela-container">
              <table className="conservacao-tabela">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Temp. °C</th>
                    <th>Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {conservacaoData.map((item, index) => (
                    <tr key={index}>
                      <td className="descricao-cell">{item.descricao}</td>
                      <td className="td-temp-aligned">
                        <input
                          type="text"
                          className="conservacao-input temp-input"
                          value={getTempDisplay(item, index)}
                          onChange={e =>
                            handleConservacaoChange(
                              index,
                              'temp',
                              e.target.value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
                            )
                          }
                          placeholder={tempFocusIndex === index ? "Ex: -18" : ""}
                          onFocus={e => {
                            setTempFocusIndex(index);
                            setTimeout(() => e.target.select(), 0);
                          }}
                          onBlur={() => setTempFocusIndex(null)}
                          style={{ width: "60px", minWidth: 0, textAlign: "right" }}
                          inputMode="numeric"
                          maxLength={4}
                        />
                      </td>
                      <td className="td-tempo-aligned">
                        <input
                          type="number"
                          className="conservacao-input tempo-num"
                          min="0"
                          value={item.tempoNum}
                          onChange={e =>
                            handleConservacaoChange(index, 'tempoNum', e.target.value)
                          }
                          style={{ width: 36, textAlign: 'right', marginRight: 4 }}
                        />
                        <select
                          className="conservacao-input tempo-select"
                          value={item.tempoUnidade}
                          onChange={e =>
                            handleConservacaoChange(index, 'tempoUnidade', Number(e.target.value))
                          }
                          style={{ marginRight: 4 }}
                        >
                          {unidades.map((u, i) => (
                            <option key={i} value={i}>
                              {parseInt(item.tempoNum, 10) === 1 ? u.singular : u.plural}
                            </option>
                          ))}
                        </select>
                        <span style={{ marginLeft: 2 }}>
                          {getTempoLabel(item.tempoNum, item.tempoUnidade)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="observacoes-bloco horizontal">
            <div className="observacoes-titulo">Observações:</div>
            <textarea
              className="observacoes-textarea"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações importantes sobre a receita, ingredientes especiais, dicas de preparo, etc..."
            />
          </div>
        </div>
      </div>

      {/* ===== TABELAS DE INGREDIENTES/RECEITAS/EMBALAGENS ===== */}
      <div className="bloco2-receita-tabelas">
        {/* INGREDIENTES */}
        <div className="tabela-bloco">
          <div className="tabela-bloco-titulo">Ingredientes</div>
          <table className="tabela-receita">
            <thead>
              <tr>
                <th>Ingredientes</th>
                <th>Marca</th>
                <th>Qt Emb.</th>
                <th>Un. Medida</th>
                <th>Preço Emb.</th>
                <th>Qt.</th>
                <th>Custo Un.</th>
                <th>Custo Total</th>
                <th>% Custo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', color: '#aaa' }}>
                    Nenhum ingrediente adicionado
                  </td>
                </tr>
              ) : (
                ingredientes.map((item, idx) => {
                  const optionSelecionada = options.find(o => o.value === String(item.produtoId));
                  let marca = item.marca, qtEmb = item.qtEmb, unMedida = item.unMedida, precoEmb = item.precoEmb;
                  
                  if (optionSelecionada && optionSelecionada.produto) {
                    const prod = optionSelecionada.produto;
                    marca = prod.marca;
                    qtEmb = prod.totalEmbalagem;
                    unMedida = prod.unidade;
                    precoEmb = prod.custoTotal;
                  }
                  
                  const custoUn = (precoEmb && qtEmb) ? (Number(precoEmb) / Number(qtEmb)) : null;
                  const custoTotalItem = (precoEmb && qtEmb && item.qtUsada) ? custoUn * Number(item.qtUsada) : null;
                  const zIndexBase = 1000 - idx;
                  
                  return (
                    <tr key={idx}>
                      <td style={{ minWidth: 190, maxWidth: 290 }}>
                        <Select
                          className="react-select-ingrediente"
                          placeholder="Selecione ou digite..."
                          value={optionSelecionada || null}
                          onChange={selected => {
                            if (!selected) {
                              setIngredientes(arr =>
                                arr.map((i, iidx) =>
                                  iidx === idx ? { ...i, produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "" } : i
                                )
                              );
                              return;
                            }
                            const produto = selected.produto;
                            setIngredientes(arr =>
                              arr.map((i, iidx) =>
                                iidx === idx ? {
                                  ...i,
                                  produtoId: String(produto.id),
                                  marca: produto.marca,
                                  qtEmb: produto.totalEmbalagem,
                                  unMedida: produto.unidade,
                                  precoEmb: produto.custoTotal,
                                  qtUsada: ""
                                } : i
                              )
                            );
                          }}
                          options={options}
                          isClearable
                          styles={getSelectEstilo(zIndexBase)}
                          menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                          menuPosition="fixed"
                        />
                      </td>
                      <td>{marca || "-"}</td>
                      <td>{qtEmb || "-"}</td>
                      <td>{unMedida || "-"}</td>
                      <td>{precoEmb ? formatarDinheiro(precoEmb) : "-"}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          style={{
                            width: "60px",
                            background: "transparent",
                            color: "#fff",
                            border: "none",
                            textAlign: "right",
                            fontWeight: "600",
                            fontSize: "1rem",
                            outline: "none"
                          }}
                          value={item.qtUsada || ""}
                          disabled={!item.produtoId}
                          onChange={e => {
                            const qt = e.target.value;
                            setIngredientes(arr =>
                              arr.map((i, iidx) =>
                                iidx === idx ? { ...i, qtUsada: qt } : i
                              )
                            );
                          }}
                        />
                      </td>
                      <td>{precoEmb && qtEmb ? formatarCustoUn(custoUn, unMedida) : "-"}</td>
                      <td>
                        {custoTotalItem != null && !isNaN(custoTotalItem)
                          ? formatarDinheiro(custoTotalItem, unMedida && [
                            "Grama (g)", "Miligrama (mg)", "Micrograma (mcg)",
                            "Mililitro (ml)", "Centímetro (cm)", "Milímetro (mm)"
                          ].includes(unMedida) ? 4 : 2)
                          : "-"}
                      </td>
                      <td>
                        {precoEmb && qtEmb && item.qtUsada
                          ? `${((100 * (Number(precoEmb) / Number(qtEmb)) * Number(item.qtUsada)) / 45).toFixed(1)}%`
                          : "-"}
                      </td>
                      <td style={{ textAlign: "center", width: 46 }}>
                        <button
                          type="button"
                          title="Remover ingrediente"
                          onClick={() => setIngredientes(arr => arr.filter((_, iidx) => iidx !== idx))}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ff5e5e",
                            fontSize: "1.16rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <button className="btn-add-linha" onClick={addIngrediente}>
            Adicionar Ingrediente
          </button>
        </div>

        {/* RECEITAS */}
        <div className="tabela-bloco">
          <div className="tabela-bloco-titulo">Receitas</div>
          <table className="tabela-receita">
            <thead>
              <tr>
                <th>Receitas</th>
                <th>Tipo</th>
                <th>Qt.</th>
                <th>Medida</th>
                <th>Custo Un.</th>
                <th>Custo Porção</th>
                <th>% Custo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {receitas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#aaa' }}>
                    Nenhuma receita adicionada
                  </td>
                </tr>
              ) : (
                receitas.map((item, idx) => {
                  const zIndexBase = 800 - idx;
                  const optionSelecionada = receitasOptions.find(o => o.value === item.receitaId);
                  
                  return (
                    <tr key={idx}>
                      <td style={{ minWidth: 190, maxWidth: 290 }}>
                        <Select
                          className="react-select-receita"
                          placeholder="Selecione ou digite..."
                          value={optionSelecionada || null}
                          onChange={selected => {
                            setReceitas(arr =>
                              arr.map((i, iidx) =>
                                iidx === idx ? { ...i, receitaId: selected ? selected.value : null } : i
                              )
                            );
                          }}
                          options={receitasOptions}
                          isClearable
                          styles={getSelectEstilo(zIndexBase)}
                          menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                          menuPosition="fixed"
                          isDisabled={receitasOptions.length === 0}
                        />
                      </td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td style={{ textAlign: "center", width: 46 }}>
                        <button
                          type="button"
                          title="Remover receita"
                          onClick={() => setReceitas(arr => arr.filter((_, iidx) => iidx !== idx))}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ff5e5e",
                            fontSize: "1.16rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <button className="btn-add-linha" onClick={addReceita}>Adicionar Receita</button>
        </div>

        {/* EMBALAGEM */}
        <div className="tabela-bloco">
          <div className="tabela-bloco-titulo">Embalagem</div>
          <table className="tabela-receita">
            <thead>
              <tr>
                <th>Embalagem</th>
                <th>Marca</th>
                <th>Qt. Emb.</th>
                <th>Medida</th>
                <th>Preço Emb.</th>
                <th>Qt.</th>
                <th>Custo Un.</th>
                <th>Custo Total</th>
                <th>% Custo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {embalagens.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', color: '#aaa' }}>
                    Nenhuma embalagem adicionada
                  </td>
                </tr>
              ) : (
                embalagens.map((item, idx) => {
                  const optionSelecionada = options.find(o => o.value === String(item.produtoId));
                  let marca = item.marca, qtEmb = item.qtEmb, unMedida = item.unMedida, precoEmb = item.precoEmb;
                  
                  if (optionSelecionada && optionSelecionada.produto) {
                    const prod = optionSelecionada.produto;
                    marca = prod.marca;
                    qtEmb = prod.totalEmbalagem;
                    unMedida = prod.unidade;
                    precoEmb = prod.custoTotal;
                  }
                  
                  const custoUn = (precoEmb && qtEmb) ? (Number(precoEmb) / Number(qtEmb)) : null;
                  const custoTotalItem = (precoEmb && qtEmb && item.qtUsada) ? custoUn * Number(item.qtUsada) : null;
                  const zIndexBase = 700 - idx;
                  
                  return (
                    <tr key={idx}>
                      <td style={{ minWidth: 190, maxWidth: 290 }}>
                        <Select
                          className="react-select-embalagem"
                          placeholder="Selecione ou digite..."
                          value={optionSelecionada || null}
                          onChange={selected => {
                            if (!selected) {
                              setEmbalagens(arr =>
                                arr.map((i, iidx) =>
                                  iidx === idx ? { ...i, produtoId: null, marca: "", qtEmb: "", unMedida: "", precoEmb: "", qtUsada: "" } : i
                                )
                              );
                              return;
                            }
                            const produto = selected.produto;
                            setEmbalagens(arr =>
                              arr.map((i, iidx) =>
                                iidx === idx ? {
                                  ...i,
                                  produtoId: String(produto.id),
                                  marca: produto.marca,
                                  qtEmb: produto.totalEmbalagem,
                                  unMedida: produto.unidade,
                                  precoEmb: produto.custoTotal,
                                  qtUsada: ""
                                } : i
                              )
                            );
                          }}
                          options={options}
                          isClearable
                          styles={getSelectEstilo(zIndexBase)}
                          menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                          menuPosition="fixed"
                        />
                      </td>
                      <td>{marca || "-"}</td>
                      <td>{qtEmb || "-"}</td>
                      <td>{unMedida || "-"}</td>
                      <td>{precoEmb ? formatarDinheiro(precoEmb) : "-"}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          style={{
                            width: "60px",
                            background: "transparent",
                            color: "#fff",
                            border: "none",
                            textAlign: "right",
                            fontWeight: "600",
                            fontSize: "1rem",
                            outline: "none"
                          }}
                          value={item.qtUsada || ""}
                          disabled={!item.produtoId}
                          onChange={e => {
                            const qt = e.target.value;
                            setEmbalagens(arr =>
                              arr.map((i, iidx) =>
                                iidx === idx ? { ...i, qtUsada: qt } : i
                              )
                            );
                          }}
                        />
                      </td>
                      <td>{precoEmb && qtEmb ? formatarCustoUn(custoUn, unMedida) : "-"}</td>
                      <td>
                        {custoTotalItem != null && !isNaN(custoTotalItem)
                          ? formatarDinheiro(custoTotalItem, unMedida && [
                            "Grama (g)", "Miligrama (mg)", "Micrograma (mcg)",
                            "Mililitro (ml)", "Centímetro (cm)", "Milímetro (mm)"
                          ].includes(unMedida) ? 4 : 2)
                          : "-"}
                      </td>
                      <td>
                        {precoEmb && qtEmb && item.qtUsada
                          ? `${((100 * (Number(precoEmb) / Number(qtEmb)) * Number(item.qtUsada)) / 45).toFixed(1)}%`
                          : "-"}
                      </td>
                      <td style={{ textAlign: "center", width: 46 }}>
                        <button
                          type="button"
                          title="Remover embalagem"
                          onClick={() => setEmbalagens(arr => arr.filter((_, iidx) => iidx !== idx))}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ff5e5e",
                            fontSize: "1.16rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <button className="btn-add-linha" onClick={addEmbalagem}>Adicionar Embalagem</button>
        </div>
      </div>

      {/* ===== PROJEÇÃO FINANCEIRA DA FICHA TÉCNICA ===== */}
      <div className="projecao-financeira-section">
        <div className="projecao-titulo-central">Projeção Financeira da Ficha Técnica</div>
        <div className="projecao-blocos-row">
          <div className="projecao-bloco projecao-bloco-form">
            {/* DADOS DO PRODUTO */}
            <div className="bloco-mini-produto">
              <div className="dados-produto-titulo">Dados do Produto</div>
              <div className="dp-grid-3col">
                {/* Tipo do Produto */}
                <div className="dp-label">Tipo do Produto</div>
                <div className="dp-colspan2 select-btn-grid">
                  <Select
                    className="react-select-tipo-produto"
                    placeholder="Selecione..."
                    options={tiposProduto}
                    value={tipoSelecionado}
                    onChange={setTipoSelecionado}
                    styles={getSelectEstilo(900)}
                    menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                    menuPosition="fixed"
                    isClearable
                  />
                  <button
                    type="button"
                    className="btn-add clean"
                    onClick={() => setShowModalTipo(true)}
                    title="Adicionar novo tipo"
                  >
                    <span className="plus-icon">+</span>
                  </button>
                </div>

                {/* Última Atualização */}
                <div className="dp-label">Última Atualização</div>
                <div className="dp-colspan2" style={{ gridColumn: "span 2" }}>
                  <input className="projecao-input" type="date" style={{ width: "100%" }} />
                </div>

                {/* Rendimento */}
                <div className="dp-label">Rendimento</div>
                <input
                  className="projecao-input"
                  type="number"
                  min="0"
                  placeholder="Ex: 1"
                  value={rendimentoNumero}
                  onChange={(e) => setRendimentoNumero(e.target.value)}
                />
                <Select
                  options={opcoesRendimento}
                  value={opcoesRendimento.find(opt => opt.value === rendimentoUnidade)}
                  onChange={opt => setRendimentoUnidade(opt.value)}
                  styles={{
                    ...getSelectEstilo(880),
                    control: (base, state) => ({
                      ...getSelectEstilo(880).control(base, state),
                      width: "180px",
                      minWidth: "140px",
                      maxWidth: "200px",
                    }),
                  }}
                  menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                  menuPosition="fixed"
                />
              </div>
            </div>

            {/* TEMPO DE PREPARO */}
            <div className="bloco-mini-produto">
              <div className="dados-produto-titulo">Tempo de Preparo</div>
              <div className="dp-grid-3col">
                {/* Tempo de Preparo (Total) */}
                <div className="dp-label">Tempo de Preparo (Total)</div>
                <input
                  className="projecao-input"
                  type="number"
                  min="0"
                  placeholder="Ex: 35"
                  value={tempoPreparoTotalNumero}
                  onChange={e => setTempoPreparoTotalNumero(e.target.value)}
                />
                <Select
                  options={opcoesTempo}
                  value={opcoesTempo.find(opt => opt.value === tempoPreparoTotalUnidade)}
                  onChange={opt => setTempoPreparoTotalUnidade(opt.value)}
                  styles={{
                    ...getSelectEstilo(870),
                    control: (base, state) => ({
                      ...getSelectEstilo(870).control(base, state),
                      width: "140px",
                      minWidth: "110px",
                      maxWidth: "160px",
                    }),
                  }}
                  menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                  menuPosition="fixed"
                />

                {/* Tempo de Preparo (Mão de Obra) */}
                <div className="dp-label">Tempo de Preparo (Mão de Obra)</div>
                <div style={{ gridColumn: "span 2" }}>
                  {!showFormMaoObra ? (
                    <button
                      className="btn-add-mao-obra"
                      onClick={() => setShowFormMaoObra(true)}
                      style={{ width: "100%", fontWeight: 800, fontSize: "1.08rem" }}
                    >
                      + Adicionar
                    </button>
                  ) : null}
                </div>

                {/* TABELA DE MÃO DE OBRA */}
                <div className="mao-obra-tabela-bloco" style={{
                  marginTop: 22,
                  background: "#231d3c",
                  borderRadius: 10,
                  padding: "10px 10px 0 10px",
                  minWidth: 430,
                  boxShadow: "0 1px 10px #0002",
                  gridColumn: "span 3"
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 15,
                    color: "#fff",
                    letterSpacing: "0.02em"
                  }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "6px 10px" }}>CARGO</th>
                        <th style={{ textAlign: "center", padding: "6px 10px" }}>HORA TOTAL</th>
                        <th style={{ textAlign: "center", padding: "6px 10px" }}>QUANTIDADE</th>
                        <th style={{ textAlign: "center", padding: "6px 10px" }}>TEMPO</th>
                        <th style={{ textAlign: "right", padding: "6px 10px" }}>VALOR TOTAL</th>
                        <th style={{ textAlign: "center", padding: "6px 10px" }}>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* LINHA EDITÁVEL */}
                      {showFormMaoObra ? (
                        <tr style={{ background: "#251e38" }}>
                          <td style={{ padding: "9px 6px" }}>
                            <Select
                              options={profissoesDiretas}
                              value={profissoesDiretas.find(opt => opt.value === tipoMaoObra) || null}
                              onChange={opt => setTipoMaoObra(opt ? opt.value : "")}
                              styles={{
                                control: base => ({
                                  ...base,
                                  minHeight: 32,
                                  background: "#2f2443",
                                  borderRadius: 6,
                                  borderColor: "#b388ff"
                                }),
                                singleValue: base => ({ ...base, color: "#ffe066", fontWeight: 700 }),
                                menu: base => ({ ...base, zIndex: 1000 }),
                                option: base => ({ ...base, color: "#fff" }),
                              }}
                              placeholder="Selecione"
                            />
                          </td>
                          <td style={{ padding: "9px 6px", textAlign: "center", fontWeight: 700, color: "#b088ff" }}>
                            {valorHoraMaoObraSelecionada > 0
                              ? valorHoraMaoObraSelecionada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                              : "--"}
                          </td>
                          <td style={{ padding: "9px 6px" }}>
                            <input
                              type="number"
                              min={1}
                              style={{
                                width: 55,
                                background: "transparent",
                                border: "1px solid #b388ff",
                                color: "#fff",
                                borderRadius: 5,
                                textAlign: "center"
                              }}
                              placeholder="Quantidade"
                              value={quantidadeMaoObra}
                              onChange={e => setQuantidadeMaoObra(e.target.value)}
                            />
                          </td>
                          <td style={{ padding: "9px 6px" }}>
                            <select
                              style={{
                                background: "#2f2443",
                                color: "#ffe066",
                                border: "1px solid #b388ff",
                                borderRadius: 5,
                                padding: "3px 7px"
                              }}
                              value={unidadeMaoObra}
                              onChange={e => setUnidadeMaoObra(e.target.value)}
                            >
                              <option value="minutos">minutos</option>
                              <option value="horas">horas</option>
                            </select>
                          </td>
                          <td style={{ 
                            padding: "9px 6px", 
                            textAlign: "right", 
                            fontWeight: 800,
                            verticalAlign: "middle" 
                          }}>
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "flex-end",
                              height: "100%" 
                            }}>
                              {valorTotalLinhaMaoObra > 0
                                ? valorTotalLinhaMaoObra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                : "--"}
                            </div>
                          </td>
                          <td style={{ padding: "9px 6px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              <button
                                onClick={salvarLinhaMaoObra}
                                style={{
                                  background: "#a780ff",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 7,
                                  fontWeight: 700,
                                  padding: "6px 10px",
                                  cursor: "pointer",
                                  fontSize: "1.2rem"
                                }}
                              >✓</button>
                              <button
                                onClick={cancelarEdicaoMaoObra}
                                style={{
                                  background: "#555",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 7,
                                  fontWeight: 700,
                                  padding: "6px 10px",
                                  cursor: "pointer",
                                  fontSize: "1.2rem"
                                }}
                              >✗</button>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                      
                      {/* LINHAS SALVAS */}
                      {maoObras.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "9px 6px" }}>
                            {editandoMaoObra === idx ? (
                              <Select
                                options={profissoesDiretas}
                                value={profissoesDiretas.find(opt => opt.value === tipoMaoObra) || null}
                                onChange={opt => setTipoMaoObra(opt ? opt.value : "")}
                                styles={{
                                  control: base => ({
                                    ...base,
                                    minHeight: 32,
                                    background: "#2f2443",
                                    borderRadius: 6,
                                    borderColor: "#b388ff"
                                  }),
                                  singleValue: base => ({ ...base, color: "#ffe066", fontWeight: 700 }),
                                  menu: base => ({ ...base, zIndex: 1000 }),
                                  option: base => ({ ...base, color: "#fff" }),
                                }}
                                placeholder="Selecione"
                              />
                            ) : (
                              item.cargo
                            )}
                          </td>
                          <td style={{ padding: "9px 6px", textAlign: "center", fontWeight: 700, color: "#b088ff" }}>
                            {editandoMaoObra === idx ? (
                              valorHoraMaoObraSelecionada > 0
                                ? valorHoraMaoObraSelecionada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                : "--"
                            ) : (
                                                            item.valorHora.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            )}
                          </td>
                          <td style={{ padding: "9px 6px", textAlign: "center" }}>
                            {editandoMaoObra === idx ? (
                              <input
                                type="number"
                                min={1}
                                style={{
                                  width: 55,
                                  background: "transparent",
                                  border: "1px solid #b388ff",
                                  color: "#fff",
                                  borderRadius: 5,
                                  textAlign: "center"
                                }}
                                value={quantidadeMaoObra}
                                onChange={e => setQuantidadeMaoObra(e.target.value)}
                              />
                            ) : (
                              item.quantidade
                            )}
                          </td>
                          <td style={{ padding: "9px 6px", textAlign: "center" }}>
                            {editandoMaoObra === idx ? (
                              <select
                                style={{
                                  background: "#2f2443",
                                  color: "#ffe066",
                                  border: "1px solid #b388ff",
                                  borderRadius: 5,
                                  padding: "3px 7px"
                                }}
                                value={unidadeMaoObra}
                                onChange={e => setUnidadeMaoObra(e.target.value)}
                              >
                                <option value="minutos">minutos</option>
                                <option value="horas">horas</option>
                              </select>
                            ) : (
                              item.unidade
                            )}
                          </td>
                          <td style={{ 
                            padding: "9px 6px", 
                            textAlign: "right", 
                            fontWeight: 800,
                            verticalAlign: "middle" 
                          }}>
                            {editandoMaoObra === idx ? (
                              <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "flex-end",
                                height: "100%" 
                              }}>
                                {valorTotalLinhaMaoObra > 0
                                  ? valorTotalLinhaMaoObra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                  : "--"}
                              </div>
                            ) : (
                              <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "flex-end",
                                height: "100%" 
                              }}>
                                {item.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "9px 6px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              {editandoMaoObra === idx ? (
                                <>
                                  <button
                                    onClick={salvarLinhaMaoObra}
                                    style={{
                                      background: "#a780ff",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: 7,
                                      fontWeight: 700,
                                      padding: "4px",
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      fontSize: "1.2rem"
                                    }}
                                  >✓</button>
                                  <button
                                    onClick={cancelarEdicaoMaoObra}
                                    style={{
                                      background: "#555",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: 7,
                                      fontWeight: 700,
                                      padding: "4px",
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      fontSize: "1.2rem"
                                    }}
                                  >✗</button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => editarMaoObra(idx)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "#FFD700",
                                      fontSize: "1.1rem",
                                      padding: "4px",
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "4px"
                                    }}
                                    title="Editar"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMaoObras(prev => prev.filter((_, i) => i !== idx));
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "#ff5e5e",
                                      fontSize: "1.16rem",
                                      padding: "4px",
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "4px"
                                    }}
                                    title="Excluir"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* MENSAGEM QUANDO VAZIO */}
                      {!showFormMaoObra && maoObras.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ color: "#aaa", textAlign: "center", padding: 16 }}>
                            Nenhuma mão de obra adicionada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* BLOCO RESUMO */}
          <div className="projecao-bloco">
            <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
              
              {/* DOIS BLOCOS ACIMA DA TABELA DE CUSTOS */}
              <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                {/* Bloco Peso Unitário | Preço/kg */}
                <div className="painel-bloco-resumo">
                  <div className="painel-bloco-titulo">Peso Unitário | Preço/kg</div>
                  <div className="painel-linha-dois-inputs">
                    <input
                      className="painel-input-unico"
                      type="text"
                      placeholder="Peso unitário (g)"
                      value={getPesoUnitarioDisplay()}
                      onChange={handlePesoUnitarioChange}
                      onFocus={handlePesoUnitarioFocus}
                      onBlur={handlePesoUnitarioBlur}
                    />
                    <input
                      className="painel-input-unico"
                      type="text"
                      placeholder="Preço por kg (R$)"
                      value={
                        calcularPrecoPorKg() > 0
                          ? formatarDinheiro(calcularPrecoPorKg())
                          : ""
                      }
                      readOnly
                    />
                  </div>
                </div>

                {/* Bloco Custo Unitário */}
                <div className="painel-bloco-resumo">
                  <div className="painel-bloco-titulo">Custo Unitário</div>
                  <input
                    className="painel-input-unico"
                    type="text"
                    placeholder="Custo unitário (R$)"
                    value={
                      rendimentoNumero && custoTotal > 0
                        ? formatarDinheiro(Number(custoTotal) / Number(rendimentoNumero))
                        : ""
                    }
                    readOnly
                  />
                </div>
              </div>

              {/* TABELA DE CUSTOS */}
              <div style={{ flex: 1 }}>
                <table className="tabela-resumo-projecao">
                  <thead>
                    <tr style={{ background: "#2d1b4e" }}>
                      <th style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        color: "#ffe066",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #b388ff"
                      }}>Custos</th>
                      <th style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        color: "#ffe066",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #b388ff"
                      }}>Valor</th>
                      <th style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        color: "#ffe066",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #b388ff"
                      }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #b388ff44" }}>
                      <td style={{
                        padding: "10px 16px",
                        color: "#fff",
                        fontWeight: 600
                      }}>Mão de Obra Direta</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{formatarDinheiro(custoMaoObra)}</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{custoTotal > 0 ? `${((custoMaoObra / custoTotal) * 100).toFixed(1)}%` : "0%"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #b388ff44" }}>
                      <td style={{
                        padding: "10px 16px",
                        color: "#fff",
                        fontWeight: 600
                      }}>Ingredientes</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{formatarDinheiro(custoIngredientes)}</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{custoTotal > 0 ? `${((custoIngredientes / custoTotal) * 100).toFixed(1)}%` : "0%"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #b388ff44" }}>
                      <td style={{
                        padding: "10px 16px",
                        color: "#fff",
                        fontWeight: 600
                      }}>Receitas</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{formatarDinheiro(custoReceitas)}</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{custoTotal > 0 ? `${((custoReceitas / custoTotal) * 100).toFixed(1)}%` : "0%"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #b388ff44" }}>
                      <td style={{
                        padding: "10px 16px",
                        color: "#fff",
                        fontWeight: 600
                      }}>Embalagem</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{formatarDinheiro(custoEmbalagem)}</td>
                      <td style={{
                        padding: "10px 16px",
                        textAlign: "right",
                        color: "#fff",
                        fontWeight: 600
                      }}>{custoTotal > 0 ? `${((custoEmbalagem / custoTotal) * 100).toFixed(1)}%` : "0%"}</td>
                    </tr>
                    <tr style={{ 
                      borderTop: "2px solid #b388ff",
                      background: "#2d1b4e"
                    }}>
                      <td style={{
                        padding: "12px 16px",
                        color: "#ffe066",
                        fontWeight: 700,
                        fontSize: "1.1rem"
                      }}>TOTAL</td>
                      <td style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        color: "#ffe066",
                        fontWeight: 700,
                        fontSize: "1.1rem"
                      }}>{formatarDinheiro(custoTotal)}</td>
                      <td style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        color: "#ffe066",
                        fontWeight: 700,
                        fontSize: "1.1rem"
                      }}>{custoTotal > 0 ? "100%" : "0%"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* ===== PAINEL PROJEÇÃO DE VALORES & MARKUP - LAYOUT HORIZONTAL CORRIGIDO ===== */}
      <div className="painel-projecao-valores-markup">
        {/* BLOCO PREÇO DE VENDA - FIXO À ESQUERDA */}
        <div className="preco-venda-bloco-fixo">
          <div className="painel-projecao-titulo">Projeção de Valores & Markup</div>
          
          <div className="preco-venda-container">
            <div className="preco-venda-label">Preço de Venda (R$/un.)</div>
            <input
              type="text"
              className="preco-venda-input"
              placeholder="R$ 30,00"
              value={precoVenda}
              onChange={e => setPrecoVenda(e.target.value)}
            />
          </div>
       
          {/* ===== SIMULADOR DE DESCONTO (apenas visual) ===== */}
          <div className="simulador-desconto-bloco" style={{
            background: "#271a41",
            borderRadius: 18,
            marginTop: 28,
            marginBottom: 14,
            boxShadow: "0 0 20px #00f5ff33, 0 2px 16px #14083244",
            padding: "24px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            minWidth: 0
          }}>
            <div style={{ fontWeight: 800, fontSize: "1.22rem", color: "#ffe066", marginBottom: 10, letterSpacing: 1 }}>
              Simulador de Desconto
            </div>
            <div style={{ display: "flex", gap: 16, width: "100%", justifyContent: "center" }}>
              <input
                type="text"
                className="input-desconto"
                placeholder="Valor (R$)"
                value={descontoReais}
                onChange={e => {
                  setDescontoReais(e.target.value);
                  setFocoDesconto("reais");
                }}
                onFocus={() => setFocoDesconto("reais")}
                style={{
                  fontSize: "1.08rem",
                  fontWeight: 700,
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "#1a1532",
                  color: "#fff",
                  border: "2px solid #73ffff44",
                  boxShadow: "0 0 8px #00f5ff66",
                  outline: "none",
                  width: 120,
                  textAlign: "center"
                }}
              />
              <input
                type="text"
                className="input-desconto"
                placeholder="%"
                value={descontoPercentual}
                onChange={e => {
                  setDescontoPercentual(e.target.value);
                  setFocoDesconto("percentual");
                }}
                onFocus={() => setFocoDesconto("percentual")}
                style={{
                  fontSize: "1.08rem",
                  fontWeight: 700,
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "#1a1532",
                  color: "#fff",
                  border: "2px solid #73ffff44",
                  boxShadow: "0 0 8px #00f5ff66",
                  outline: "none",
                  width: 100,
                  textAlign: "center"
                }}
              />
            </div>
          </div> 

          {/* Mostrar PREÇO FINAL COM DESCONTO logo abaixo */}
          {(descontoReais || descontoPercentual) && (
            <div style={{
              marginTop: 10,
              fontWeight: 700,
              color: "#20ffd0",
              fontSize: "1.12rem",
              textShadow: "0 1px 6px #0007",
              letterSpacing: 1,
              textAlign: "center",
            }}>
              Preço final com desconto: <span style={{ color: "#fff", fontSize: "1.18rem" }}>
                {precoVendaComDesconto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          )}

          <div style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <label style={{
              color: "#ffe066",
              fontWeight: 700,
              fontSize: "1.05rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              userSelect: "none"
            }}>
              <input
                type="checkbox"
                checked={subReceita}
                onChange={() => setSubReceita(!subReceita)}
                style={{
                  width: 22,
                  height: 22,
                  accentColor: "#8af3ff",
                  marginRight: 8,
                  cursor: "pointer"
                }}
              />
              Marcar como Sub Receita
            </label>
          </div>
        </div>

        {/* CONTAINER DOS BLOCOS DE MARKUP - À DIREITA */}
        <div className="markup-blocos-container">
          {blocosMarkup.map((bloco, idx) => (
            <BlocoResumoMarkup
              key={bloco.id || bloco.nome || idx}
              nome={bloco.nome}
              markup={bloco.markupIdeal}
              precoVenda={precoVendaComDesconto}
              custoUnitario={custoUnitario}
              rendimentoNumero={rendimentoNumero}
              blocosMarkupPorNome={blocosMarkupPorNome}
              gastosFaturamento={bloco.gastosFaturamento}
              impostos={bloco.impostos}
              taxas={bloco.taxasPagamento}
              comissoes={bloco.comissoes}
              outros={bloco.outros}
              totalEncargosReais={bloco.totalEncargosReais !== undefined && bloco.totalEncargosReais !== null ? bloco.totalEncargosReais : 0}
            />
          ))}
        </div>
      </div>
      
      {/* ===== MODAL TIPOS DE PRODUTO ===== */}
      <ModalNovoTipoProduto
        aberto={showModalTipo}
        onClose={() => setShowModalTipo(false)}
        onAdd={handleAddTipoProduto}
      />
    </div>
  );
}