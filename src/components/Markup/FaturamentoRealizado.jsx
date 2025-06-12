import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FaTrashAlt, FaFilter } from "react-icons/fa";

const API_URL = "http://localhost:3000";
const corLinha = "#7E4FFF";
const corAmarelo = "#ffe156";

function maskMoneyBRL(v) {
  v = v.replace(/\D/g, "");
  if (v.length === 0) return "";
  while (v.length < 3) v = "0" + v;
  let reais = v.slice(0, -2);
  let centavos = v.slice(-2);
  reais = reais.replace(/^0+/, "") || "0";
  return "R$ " + reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + centavos;
}

function maskMonthYear(value) {
  value = value.replace(/\D/g, "");
  value = value.slice(0, 6);
  if (value.length > 2) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  }
  return value;
}

function formatarMes(mes) {
  if (!mes) return "";
  const partes = mes.includes("-") ? mes.split("-") : mes.split("/");
  if (partes.length === 2) return `${partes[1]}/${partes[0]}`;
  return mes;
}

function TooltipCustom({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#221b37",
          border: "1px solid #7E4FFF",
          borderRadius: 8,
          color: corAmarelo,
          padding: "10px 14px",
          fontWeight: 600,
          fontSize: 15,
          boxShadow: "0 2px 10px #2b18585f"
        }}
      >
        <div style={{ color: corAmarelo }}>{formatarMes(label)}</div>
        <div style={{ color: corAmarelo }}>
          Valor: R$ {payload[0].value.toLocaleString("pt-BR")}
        </div>
      </div>
    );
  }
  return null;
}

export default function FaturamentoRealizado({ user, setGastoSobreFaturamento }) {
  const USER_ID = user?.id;

  const [month, setMonth] = useState("");
  const [value, setValue] = useState("");
  const [lista, setLista] = useState([]);

  // Filtro de média salvo
  const [mediaTipo, setMediaTipo] = useState(() =>
    localStorage.getItem("faturamento-media-tipo") || "6"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef();
  const opcoes = [
    { label: "Último mês", value: "1" },
    { label: "Últimos 3 meses", value: "3" },
    { label: "Últimos 6 meses", value: "6" },
    { label: "Últimos 12 meses", value: "12" },
    { label: "Considerar todos", value: "all" }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    }
    if (modalOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  function handleSelect(tipo) {
    setMediaTipo(tipo);
    localStorage.setItem("faturamento-media-tipo", tipo); // salva!
    setModalOpen(false);
  }

  useEffect(() => {
    if (USER_ID) buscar();
    // eslint-disable-next-line
  }, [USER_ID]);

  async function buscar() {
    try {
      const res = await axios.get(`${API_URL}/sales-results/${USER_ID}`);
      setLista(res.data || []);
    } catch {}
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      const [mm, yyyy] = month.split("/");
      const mesConvertido = yyyy && mm ? `${yyyy}-${mm}` : month;
      const valorNumerico = Number(value.replace(/\D/g, "")) / 100;

      await axios.post(`${API_URL}/sales-results`, {
        userId: USER_ID,
        month: mesConvertido,
        value: valorNumerico
      });
      setMonth("");
      setValue("");
      buscar();
    } catch {}
  }

  async function apagar(id) {
    if (!window.confirm("Tem certeza que deseja apagar este lançamento?")) return;
    try {
      await axios.delete(`${API_URL}/sales-results/${id}`);
      buscar();
    } catch {
      alert("Erro ao apagar lançamento!");
    }
  }

  // ----------- MÉDIA FILTRÁVEL
  let listaMedia;
  if (mediaTipo === "all") listaMedia = lista;
  else listaMedia = lista.slice(-Number(mediaTipo));
  const mediaCustom = listaMedia.length > 0
    ? listaMedia.reduce((acc, cur) => acc + cur.value, 0) / listaMedia.length
    : 0;

  // Só últimos 6 meses para o gráfico!
  const ultimos6 = lista.slice(-6);

  // ====== RESUMO DE GASTOS SOBRE FATURAMENTO ======
  const categorias = JSON.parse(localStorage.getItem("categoriasCustos2") || "[]");

  const totalDespesasFixas = categorias[0]?.subcategorias?.reduce(
    (acc, sub) => acc + (sub.despesas?.reduce((soma, d) => soma + (Number(String(d.valor).replace(/\./g, "").replace(",", ".")) || 0), 0) || 0)
    , 0) || 0;

  const totalFolha = categorias[1]?.funcionarios?.reduce(
    (acc, f) => acc + (
      (Number(String(f.salario).replace(/\./g, "").replace(",", ".")) || 0) +
      [
        "fgts", "inss", "rat", "provisao", "valeTransporte",
        "valeAlimentacao", "valeRefeicao", "planoSaude", "outros"
      ].reduce((soma, key) => {
        const perc = Number(String(f[key]).replace(/\./g, "").replace(",", ".")) || 0;
        return soma + ((Number(String(f.salario).replace(/\./g, "").replace(",", ".")) || 0) * (perc / 100));
      }, 0)
    ), 0
  ) || 0;

  const percentualGastos = mediaCustom > 0
    ? ((totalDespesasFixas + totalFolha) / mediaCustom) * 100
    : 0;

  const percentualGastosFormatado =
    percentualGastos % 1 === 0
      ? percentualGastos.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
      : percentualGastos.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // 🔥 Aqui salva sempre a % para o MarkupIdeal puxar!
  useEffect(() => {
    if (setGastoSobreFaturamento) {
      setGastoSobreFaturamento(percentualGastosFormatado);
    }
    localStorage.setItem("percentualGastosFaturamento", percentualGastosFormatado);
  }, [percentualGastosFormatado, setGastoSobreFaturamento]);

  return (
    <>
      <h2
        className="titulo-sub"
        style={{
          color: "#ffe156",
          fontWeight: 800,
          fontSize: 26,
          marginLeft: 8,
          marginBottom: 14,
          marginTop: 0,
          letterSpacing: ".1px"
        }}
      >
        Faturamentos Realizados
      </h2>
      <div
        style={{
          maxWidth: 700,
          marginLeft: 0,
          marginRight: "auto",
          marginTop: "2rem",
          marginBottom: "2rem",
          background: "linear-gradient(135deg, #282040 60%, #312657 100%)",
          borderRadius: 18,
          boxShadow: "0 6px 28px #1d172a",
          padding: 32,
          transition: "margin .3s, width .3s",
          width: "100%",
        }}
      >
        {/* 1. FORMULÁRIO DE LANÇAMENTO */}
        <form
          onSubmit={salvar}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <input
            type="text"
            placeholder="MM/YYYY"
            value={month}
            onChange={e => setMonth(maskMonthYear(e.target.value))}
            required
            pattern="^(0[1-9]|1[0-2])\/\d{4}$"
            maxLength={7}
            title="Ex: 06/2024"
            style={{
              width: 110,
              background: "#2c2546",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "11px 10px",
              fontSize: 16,
              textAlign: "center",
              fontWeight: 500,
              letterSpacing: "1px",
              height: 44
            }}
          />
          <input
            type="text"
            placeholder="Valor (R$)"
            value={value}
            onChange={e => setValue(maskMoneyBRL(e.target.value))}
            required
            inputMode="numeric"
            pattern="^R\$ (\d{1,3}(\.\d{3})*|\d+),\d{2}$"
            style={{
              flex: 1,
              background: "#2c2546",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "11px 10px",
              fontSize: 16,
              height: 44
            }}
          />
          <button
            type="submit"
            style={{
              flex: "none",
              background: corLinha,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 22px",
              fontWeight: "bold",
              fontSize: 17,
              boxShadow: "0 2px 8px #4e3d94",
              transition: "filter .1s",
              cursor: "pointer",
              height: 44
            }}
          >
            Lançar
          </button>
        </form>
        {/* 2. RESUMO DE FATURAMENTO */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          margin: "0 0 28px 0",
        }}>
          {/* Bloco com filtro */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                MÉDIA DE FATURAMENTO
              </div>
              <FaFilter
                size={16}
                color="#ffe156"
                title="Configurar média"
                style={{ cursor: "pointer", marginTop: 1, transition: "filter .2s" }}
                onClick={() => setModalOpen(!modalOpen)}
                tabIndex={0}
              />
            </div>
            <div style={{ color: corAmarelo, fontWeight: 800, fontSize: 28 }}>
              R$ {mediaCustom ? mediaCustom.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : ""}
            </div>
            {/* Mini Modal */}
            {modalOpen && (
              <div
                ref={modalRef}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 38,
                  background: "#2c2546",
                  color: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 6px 28px #19131f80",
                  padding: "14px 18px 10px",
                  minWidth: 180,
                  zIndex: 10,
                  border: "1px solid #7E4FFF",
                  animation: "fadein .18s",
                }}
              >
                <div style={{ fontWeight: 700, color: corAmarelo, marginBottom: 10, fontSize: 14, letterSpacing: ".2px" }}>
                  Considerar quantos meses?
                </div>
                {opcoes.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      padding: "7px 0 7px 3px",
                      borderRadius: 6,
                      color: opt.value === mediaTipo ? corAmarelo : "#fff",
                      background: opt.value === mediaTipo ? "#392f5f" : "transparent",
                      fontWeight: opt.value === mediaTipo ? 700 : 500,
                      cursor: "pointer",
                      transition: "background .2s, color .2s"
                    }}
                    tabIndex={0}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>% GASTOS SOBRE FATURAMENTO</div>
            <div style={{ color: corAmarelo, fontWeight: 800, fontSize: 28 }}>
              {percentualGastosFormatado}%
            </div>
          </div>
        </div>
        {/* 3. GRÁFICO */}
        <div style={{ marginBottom: 10, position: "relative" }}>
          <div
            style={{
              height: 290,
              background: "rgba(66, 43, 122, 0.17)",
              borderRadius: 10,
              padding: 26,
              boxShadow: "0 2px 8px #251c3c1a",
              position: "relative"
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 18,
                transform: "translateX(-50%)",
                color: "#ffe156",
                fontWeight: 500,
                fontSize: 19,
                letterSpacing: ".2px",
                textTransform: "uppercase",
                zIndex: 2,
                opacity: 0.88,
                whiteSpace: "nowrap",
                maxWidth: "98%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center",
                pointerEvents: "none"
              }}
              title="Relação Gráfica dos Últimos 6 Meses"
            >
              Relação Gráfica dos Últimos 6 Meses
            </div>
            <ResponsiveContainer width="99%" height="100%">
              <LineChart
                data={ultimos6}
                margin={{ top: 52, right: 32, left: 32, bottom: 32 }}
              >
                <CartesianGrid stroke="#37265d" strokeDasharray="4 6" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatarMes}
                  stroke="#d5c8ff"
                  tick={{ fontSize: 15 }}
                  tickMargin={18}
                />
                <Tooltip content={<TooltipCustom />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a37cff"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#180c37" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* 4. HISTÓRICO */}
        <h4 style={{ margin: "22px 0 8px", color: corAmarelo, fontWeight: 700 }}>
          Histórico lançado:
        </h4>
        <ul
          style={{
            padding: 0,
            listStyle: "none",
            maxHeight: lista.length > 12 ? 432 : "none",
            overflowY: lista.length > 12 ? "auto" : "visible",
            marginRight: 4,
            scrollbarWidth: "thin",
            scrollbarColor: "#ad6fff #2c2546"
          }}
        >
          {lista.slice().reverse().map(x => (
            <li
              key={x.id}
              style={{
                fontSize: 15,
                padding: "4px 0",
                borderBottom: "1px solid #3a3450",
                color: "#eee",
                display: "flex",
                alignItems: "center",
                height: 36
              }}
            >
              <span style={{ flex: 1 }}>
                <b>{formatarMes(x.month)}</b>: R$ {x.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <FaTrashAlt
                onClick={() => apagar(x.id)}
                style={{
                  color: "#bc6af7",
                  cursor: "pointer",
                  marginLeft: 18,
                  transition: "color 0.2s"
                }}
                size={18}
                title="Apagar lançamento"
                onMouseOver={e => (e.currentTarget.style.color = "#ff6363")}
                onMouseOut={e => (e.currentTarget.style.color = "#bc6af7")}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
