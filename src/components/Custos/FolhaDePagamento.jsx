import { useEffect, useState } from "react";
import Modal from "react-modal";

// Funções utilitárias
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
function valorHoraFuncionario(f, calcularTotalFuncionarioObj) {
  const horas = Number(f.totalHorasMes || 220);
  if (!horas) return 0;
  const custo = calcularTotalFuncionarioObj ? calcularTotalFuncionarioObj(f) : f.custoTotal;
  return custo / horas;
}
function valorHoraMedio(funcionarios, calcularTotalFuncionarioObj) {
  if (!funcionarios.length) return 0;
  let totalCusto = 0, totalHoras = 0;
  funcionarios.forEach(f => {
    const h = Number(f.totalHorasMes || 220);
    totalCusto += calcularTotalFuncionarioObj ? calcularTotalFuncionarioObj(f) : (f.custoTotal || 0);
    totalHoras += h;
  });
  return totalHoras ? (totalCusto / totalHoras) : 0;
}

export default function FolhaDePagamento({
  categorias,
  handleAddFuncionario,
  handleEditarFuncionario,
  handleExcluirFuncionario,
  totalFolha,
  calcularTotalFuncionarioObj,
  funcionarioTemp,
  setFuncionarioTemp,
  editandoFuncionarioIdx,
  modalFuncionarioAberto,
  setModalFuncionarioAberto,
  handleSalvarFuncionario,
  inputRefs,
  handleTab,
  CAMPOS_PERCENTUAIS
}) {
  const [editingPercent, setEditingPercent] = useState({});
  const horasDefault = funcionarioTemp.totalHorasMes || "220";
  const [totalHorasMes, setTotalHorasMes] = useState(horasDefault);

  useEffect(() => {
    if (!funcionarioTemp.salario) return;
    setFuncionarioTemp(ft => {
      let salarioNum = parseBR(ft.salario);
      let novo = { ...ft };
      CAMPOS_PERCENTUAIS.forEach(item => {
        let percStr = ft[item.key] || "0";
        let percNum = parsePercentBR(percStr);
        let valorNum = salarioNum * (percNum / 100);
        novo[`${item.key}Valor`] = maskMoneyBR(String(Math.round(valorNum * 100)));
      });
      return novo;
    });
    // eslint-disable-next-line
  }, [funcionarioTemp.salario]);

  useEffect(() => {
    setFuncionarioTemp(ft => ({
      ...ft,
      totalHorasMes: totalHorasMes
    }));
    // eslint-disable-next-line
  }, [totalHorasMes]);

  const calcularTotalFuncionario = () => calcularTotalFuncionarioObj(funcionarioTemp);
  const custoTotalFuncionario = calcularTotalFuncionario();
  const horasMesNumber = Number(totalHorasMes.replace(/\D/g, "")) || 220;
  const valorHora = custoTotalFuncionario / horasMesNumber;

  // ---------------------------------------------
  // HEADER BONITO COM MÉDIA DA HORA (só se > 1 funcionário)
  // ---------------------------------------------
  const valorMedioHora = valorHoraMedio(categorias[1].funcionarios, calcularTotalFuncionarioObj);

  return (
    <>
      <style>
        {`
          .ReactModal__Content {
            max-height: 88vh;
            overflow-y: auto !important;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            scrollbar-color: #a780ff #221c3a;
          }
          .ReactModal__Content::-webkit-scrollbar {
            width: 9px;
            background: transparent;
          }
          .ReactModal__Content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #39206a 30%, #a780ff 90%);
            border-radius: 8px;
            min-height: 48px;
            border: 2.5px solid #221c3a;
            transition: background 0.2s;
          }
          .ReactModal__Content::-webkit-scrollbar-thumb:hover {
            background: #a780ff;
          }
          .ReactModal__Content::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 8px;
          }
        `}
      </style>
      <div
        style={{
          minWidth: 340,
          maxWidth: 900,
          background: "#1a1440",
          borderRadius: 24,
          padding: 36,
          color: "#fff",
          marginTop: 36,
          boxShadow: "0 4px 24px #0003",
          position: "relative",
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }}>
          <div style={{ fontWeight: 800, fontSize: 26, color: "#ffe060" }}>
            Folha de Pagamento
          </div>
          <div>
            <div style={{ color: "#ffe060", fontWeight: 800, fontSize: 19, letterSpacing: 0.2, textAlign: "right" }}>
              Total da Folha:
            </div>
            <div style={{ fontSize: 26, color: "#b088ff", fontWeight: 900, textAlign: "right" }}>
              {totalFolha.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            {categorias[1].funcionarios.length > 1 && (
              <div style={{
                fontSize: 16,
                color: "#ffe060",
                fontWeight: 700,
                background: "#2c2054",
                padding: "3px 16px",
                borderRadius: 12,
                marginTop: 7,
                letterSpacing: 0.5,
                boxShadow: "0 2px 8px #0002",
                textAlign: "right",
                minWidth: 180
              }}>
                Valor médio da hora:{" "}
                <span style={{ color: "#fff", fontWeight: 900 }}>
                  {valorMedioHora.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            )}
          </div>
        </div>
        <table
          style={{
            width: "100%",
            background: "transparent",
            color: "#fff",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 17,
            marginTop: 16
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 8px", fontWeight: 700, minWidth: 150 }}>Nome</th>
              <th style={{ textAlign: "left", padding: "8px 8px", fontWeight: 700, minWidth: 100 }}>Cargo</th>
              <th style={{ textAlign: "center", padding: "8px 8px", fontWeight: 700 }}>Tipo</th>
              <th style={{ textAlign: "right", padding: "8px 8px", fontWeight: 700, minWidth: 120 }}>Custo Total</th>
              <th style={{ textAlign: "right", padding: "8px 8px", fontWeight: 700, minWidth: 120 }}>Valor da Hora</th>
              <th style={{ textAlign: "center", padding: "8px 8px", fontWeight: 700 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias[1].funcionarios.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "#aaa", textAlign: "center", padding: 24 }}>
                  Nenhum funcionário cadastrado.<br />
                  Clique em <b>Adicionar Funcionário</b> para começar.
                </td>
              </tr>
            )}
            {categorias[1].funcionarios.map((f, idx) => {
              const valorHoraF = valorHoraFuncionario(f, calcularTotalFuncionarioObj);
              return (
                <tr
                  key={idx}
                  style={{
                    background: "#201d41",
                    borderRadius: 12,
                    marginBottom: 10,
                    boxShadow: "none",
                    verticalAlign: "middle",
                    height: "auto"
                  }}
                >
                  <td style={{
                    padding: "14px 10px",
                    maxWidth: 220,
                    verticalAlign: "top",
                    fontWeight: 500,
                    whiteSpace: "pre-line"
                  }}>
                    {f.nome}
                  </td>
                  <td style={{
                    padding: "14px 10px",
                    maxWidth: 130,
                    verticalAlign: "top",
                    fontWeight: 500,
                    whiteSpace: "pre-line"
                  }}>
                    {f.cargo}
                  </td>
                  <td style={{
                    padding: "14px 10px",
                    textAlign: "center",
                    minWidth: 80,
                    fontWeight: 500,
                    color: "#fff"
                  }}>
                    {f.tipoMaoDeObra || "Direta"}
                  </td>
                  <td style={{
                    padding: "14px 10px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    minWidth: 120,
                    fontWeight: 700,
                    color: "#b088ff",
                    fontSize: 16,
                  }}>
                    {calcularTotalFuncionarioObj(f).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td style={{
                    padding: "14px 10px",
                    textAlign: "right",
                    fontWeight: 800,
                    color: "#ffe060",
                    fontSize: 16,
                    whiteSpace: "nowrap",
                    background: "#2c2054",
                    borderRadius: 8,
                    letterSpacing: 0.2
                  }}>
                    {valorHoraF.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td style={{
                    padding: "12px 10px",
                    textAlign: "center",
                    minWidth: 140,
                    display: "flex",
                    gap: 12,
                    justifyContent: "center"
                  }}>
                    <button
                      onClick={() => handleEditarFuncionario(idx)}
                      style={{
                        color: "#222",
                        background: "#ffe060",
                        border: "none",
                        borderRadius: 6,
                        padding: "7px 20px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 15,
                        marginRight: 0,
                        outline: "none",
                        transition: "background .2s"
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = "#ffe7a0")}
                      onMouseOut={e => (e.currentTarget.style.background = "#ffe060")}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluirFuncionario(idx)}
                      style={{
                        color: "#fff",
                        background: "#6e5aac",
                        border: "none",
                        borderRadius: 6,
                        padding: "7px 20px",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        outline: "none",
                        transition: "background .2s"
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = "#a780ff")}
                      onMouseOut={e => (e.currentTarget.style.background = "#6e5aac")}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 34, textAlign: "left" }}>
          <button
            onClick={handleAddFuncionario}
            style={{
              background: "#b088ff",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "16px 44px",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
              transition: "background .2s"
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#d9c3ff")}
            onMouseOut={e => (e.currentTarget.style.background = "#b088ff")}
          >
            + Adicionar Funcionário
          </button>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalFuncionarioAberto}
        onRequestClose={() => setModalFuncionarioAberto(false)}
        contentLabel="Adicionar/Editar Funcionário"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000 },
          content: {
            zIndex: 1100,
            top: "50%", left: "50%", right: "auto", bottom: "auto",
            marginRight: "-50%", transform: "translate(-50%, -50%)",
            background: "#221c3a", color: "#fff", borderRadius: 18,
            padding: 38, minWidth: 360, maxWidth: 470, border: "1.5px solid #3e2464",
            boxShadow: "0 6px 32px #0005",
            display: "flex", flexDirection: "column", gap: 0,
            overflow: "visible"
          }
        }}
        shouldCloseOnOverlayClick={true}
      >
        <h2 style={{
          marginBottom: 18,
          fontWeight: 800,
          fontSize: 28,
          textAlign: "left"
        }}>
          {editandoFuncionarioIdx === "novo" ? "Adicionar Funcionário" : "Editar Funcionário"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label
            htmlFor="tipoMaoDeObra"
            style={{
              color: "#ffe060",
              fontWeight: 700,
              marginBottom: 6,
              display: "block",
              fontSize: 17
            }}
          >
            Tipo de Mão de Obra:
          </label>
          <select
            id="tipoMaoDeObra"
            ref={el => inputRefs.current[0] = el}
            value={funcionarioTemp.tipoMaoDeObra}
            onChange={e => setFuncionarioTemp({ ...funcionarioTemp, tipoMaoDeObra: e.target.value })}
            onKeyDown={e => handleTab(e, 0)}
            style={{
              display: "block",
              width: "100%",
              background: "#191730",
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 15,
              padding: "10px 12px",
              fontWeight: 600,
              outline: "none",
              height: "44px",
              lineHeight: "22px",
              margin: 0,
              boxSizing: "border-box",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none"
            }}
          >
            <option value="Direta">Direta</option>
            <option value="Indireta">Indireta</option>
          </select>
          <input
            ref={el => inputRefs.current[1] = el}
            value={funcionarioTemp.nome}
            onChange={e => setFuncionarioTemp({ ...funcionarioTemp, nome: e.target.value })}
            placeholder="Nome"
            style={{
              display: "block",
              width: "100%",
              background: "#191730",
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 15,
              padding: "10px 12px",
              fontWeight: 600,
              outline: "none",
              height: "44px",
              lineHeight: "22px",
              margin: 0,
              boxSizing: "border-box"
            }}
            onKeyDown={e => handleTab(e, 1)}
            maxLength={60}
          />
          <input
            ref={el => inputRefs.current[2] = el}
            value={funcionarioTemp.cargo}
            onChange={e => setFuncionarioTemp({ ...funcionarioTemp, cargo: e.target.value })}
            placeholder="Cargo"
            style={{
              display: "block",
              width: "100%",
              background: "#191730",
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 15,
              padding: "10px 12px",
              fontWeight: 600,
              outline: "none",
              height: "44px",
              lineHeight: "22px",
              margin: 0,
              boxSizing: "border-box"
            }}
            onKeyDown={e => handleTab(e, 2)}
            maxLength={40}
          />
          <div style={{ position: "relative" }}>
            <input
              ref={el => inputRefs.current[3] = el}
              value={funcionarioTemp.salario}
              type="text"
              onChange={e => setFuncionarioTemp(ft => {
                let value = e.target.value;
                let onlyNumbers = value.replace(/[^\d]/g, "");
                if (!onlyNumbers) return { ...ft, salario: "" };
                if (onlyNumbers.length > 9) onlyNumbers = onlyNumbers.slice(0, 9);
                let number = parseFloat(onlyNumbers) / 100;
                let formatted = number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                return { ...ft, salario: formatted };
              })}
              placeholder="Salário Bruto"
              style={{
                display: "block",
                width: "100%",
                background: "#191730",
                border: "none",
                borderRadius: 7,
                color: "#fff",
                fontSize: 15,
                padding: "10px 12px 10px 42px",
                fontWeight: 600,
                outline: "none",
                letterSpacing: "0.5px",
                height: "44px",
                lineHeight: "22px",
                margin: 0,
                boxSizing: "border-box"
              }}
              min={0}
              inputMode="numeric"
              onKeyDown={e => handleTab(e, 3)}
              maxLength={15}
              autoComplete="off"
            />
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#bbb",
              fontSize: 16,
              pointerEvents: "none",
              fontWeight: 600,
              letterSpacing: "0.5px"
            }}>R$</span>
          </div>
          {CAMPOS_PERCENTUAIS.map((item, idx) => {
            const perc = funcionarioTemp[item.key] || "";
            const valorStr = funcionarioTemp[`${item.key}Valor`] || "";
            const valorExibido = valorStr === "" ? "0,00" : valorStr;
            const inputPercIdx = 4 + idx * 2;
            const inputValorIdx = 4 + idx * 2 + 1;
            return (
              <div key={item.key} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 0
              }}>
                <span style={{
                  minWidth: 120,
                  fontWeight: 700,
                  color: "#ffe060",
                  fontSize: 15
                }}>
                  {item.label}
                </span>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#28244a",
                  borderRadius: 8,
                  boxShadow: "0 1px 3px #00000018",
                  padding: "3px 10px",
                  gap: 6,
                  border: "1.5px solid #4b3ca0",
                  minWidth: 105,
                  maxWidth: 130
                }}>
                  <input
                    ref={el => inputRefs.current[inputPercIdx] = el}
                    type="text"
                    value={formatPercentForDisplay(perc, editingPercent[item.key])}
                    onFocus={() => setEditingPercent(ep => ({ ...ep, [item.key]: true }))}
                    onBlur={() => setEditingPercent(ep => ({ ...ep, [item.key]: false }))}
                    onChange={e => {
                      let raw = e.target.value.replace(/\D/g, "");
                      while (raw.length < 3) raw = "0" + raw;
                      let percStr = raw.slice(0, raw.length - 2) + "," + raw.slice(-2);
                      setFuncionarioTemp(ft => {
                        const salarioNum = parseBR(ft.salario);
                        const percNum = parsePercentBR(percStr);
                        const valorNum = salarioNum * (percNum / 100);
                        let valorStr = maskMoneyBR(String(Math.round(valorNum * 100)));
                        return {
                          ...ft,
                          [item.key]: percStr,
                          [`${item.key}Valor`]: valorStr
                        };
                      });
                    }}
                    onKeyDown={e => handleTab(e, inputPercIdx)}
                    style={{
                      width: 90,
                      fontSize: 15,
                      background: "transparent",
                      color: "#fff",
                      border: "none",
                      outline: "none",
                      textAlign: "right"
                    }}
                    placeholder="0"
                  />
                  <span style={{
                    color: "#b189ff",
                    fontWeight: 700,
                    fontSize: 14
                  }}>%</span>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#23213a",
                  borderRadius: 8,
                  padding: "3px 10px",
                  gap: 4,
                  border: "1.5px solid #4b3ca0",
                  minWidth: 110
                }}>
                  <span style={{
                    color: "#bbb",
                    marginRight: 2,
                    fontWeight: 600,
                    fontSize: 15
                  }}>R$</span>
                  <input
                    ref={el => inputRefs.current[inputValorIdx] = el}
                    type="text"
                    value={valorExibido}
                    onChange={e => {
                      let onlyNumbers = e.target.value.replace(/[^\d]/g, "");
                      if (!onlyNumbers) onlyNumbers = "0";
                      if (onlyNumbers.length > 9) onlyNumbers = onlyNumbers.slice(0, 9);
                      let number = parseFloat(onlyNumbers) / 100;
                      let formatted = number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      setFuncionarioTemp(ft => {
                        const salarioNum = parseBR(ft.salario);
                        const valorNum = parseBR(formatted);
                        const perc = salarioNum ? ((valorNum / salarioNum) * 100) : 0;
                        let percStr = perc
                          .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        return {
                          ...ft,
                          [item.key]: percStr,
                          [`${item.key}Valor`]: formatted
                        };
                      });
                    }}
                    style={{
                      width: 80,
                      fontSize: 15,
                      background: "transparent",
                      color: "#fff",
                      border: "none",
                      outline: "none",
                      textAlign: "right"
                    }}
                    placeholder="0,00"
                    onKeyDown={e => handleTab(e, inputValorIdx)}
                  />
                </div>
              </div>
            );
          })}
          <div style={{
            fontWeight: 700,
            color: "#ffe060",
            textAlign: "center",
            margin: "20px 0 10px 0",
            fontSize: 18
          }}>
            Custo Total deste Funcionário:&nbsp;
            {calcularTotalFuncionario().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>

          <div
            style={{
              margin: "14px 0 8px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              background: "#231d3c",
              borderRadius: "10px",
              padding: "17px 18px 10px 18px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#ffe060", fontWeight: 700, fontSize: 16 }}>
                Total de horas mensais:
              </span>
              <input
                type="text"
                value={totalHorasMes}
                onChange={e => {
                  const onlyNum = e.target.value.replace(/\D/g, "");
                  setTotalHorasMes(onlyNum);
                  setFuncionarioTemp(ft => ({ ...ft, totalHorasMes: onlyNum }));
                }}
                style={{
                  width: 60,
                  background: "#191730",
                  color: "#fff",
                  border: "1.5px solid #4b3ca0",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 16,
                  textAlign: "center",
                  padding: "4px 6px",
                }}
                min="1"
                maxLength={4}
                placeholder="220"
              />
              <span style={{ color: "#ffe060", fontWeight: 700, fontSize: 16 }}>
                h/mês
              </span>
            </div>
            <div style={{
              color: "#ffe060",
              fontWeight: 800,
              fontSize: 20,
              marginTop: 8,
              letterSpacing: 0.3,
              background: "#18132a",
              borderRadius: 7,
              padding: "6px 18px"
            }}>
              Valor da hora (custo total):&nbsp;
              <span style={{ color: "#b088ff" }}>
                {isFinite(valorHora) && valorHora > 0
                  ? valorHora.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "R$ 0,00"}
              </span>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: 12,
            marginTop: 6,
            justifyContent: "center"
          }}>
            <button
              ref={el => inputRefs.current[46] = el}
              onClick={() => {
                if (editandoFuncionarioIdx === "novo") {
                  handleSalvarFuncionario();
                } else {
                  handleSalvarFuncionario(editandoFuncionarioIdx);
                }
                setModalFuncionarioAberto(false);
              }}
              style={{
                background: "#a780ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 36px",
                fontWeight: 700,
                fontSize: 17,
                cursor: "pointer",
                marginRight: 8
              }}
              onKeyDown={e => handleTab(e, 46)}
            >Salvar</button>
            <button
              ref={el => inputRefs.current[47] = el}
              onClick={() => setModalFuncionarioAberto(false)}
              style={{
                background: "#bbb",
                color: "#222",
                border: "none",
                borderRadius: 8,
                padding: "12px 36px",
                fontSize: 17,
                fontWeight: 700
              }}
              onKeyDown={e => handleTab(e, 47)}
            >Cancelar</button>
          </div>
        </div>
      </Modal>
    </>
  );
}