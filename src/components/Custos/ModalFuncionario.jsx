import React from "react";
import Modal from "react-modal";
import "./ModalFuncionario.css";

const CAMPOS_PERCENTUAIS = [
  { key: "fgts", label: "FGTS" },
  { key: "inss", label: "INSS" },
  { key: "rat", label: "RAT" },
  { key: "ferias13", label: "Férias + 13º" },
  { key: "valeTransporte", label: "Vale Transporte" },
  { key: "valeAlimentacao", label: "Vale Alimentação" },
  { key: "valeRefeicao", label: "Vale Refeição" },
  { key: "planoSaude", label: "Plano de Saúde" },
  { key: "outros", label: "Outros" }
];

// Função utilitária para calcular o total de horas no mês
function getTotalHorasMes(funcionarioTemp) {
  const horasPorDia = Number(funcionarioTemp.horasPorDia || 0);
  const diasPorSemana = Number(funcionarioTemp.diasPorSemana || 0);
  if (!horasPorDia || !diasPorSemana) return 0;
  return Math.round(horasPorDia * diasPorSemana * 4.345);
}

export default function ModalFuncionario({
  isOpen,
  onRequestClose,
  funcionarioTemp,
  setFuncionarioTemp,
  editingPercent,
  setEditingPercent,
  editando,
  handleTab,
  inputRefs,
  calcularTotalFuncionarioObj,
  formatPercentForDisplay,
  salvarFuncionario
}) {
  // Calcula o valor em R$ a partir da % e do salário
  function calcularValorPercentual(percentualStr, salarioStr) {
    const salario = parseFloat((salarioStr || "0").replace(/\./g, '').replace(',', '.')) || 0;
    const percentual = parseFloat((percentualStr || "0").replace(',', '.')) || 0;
    return ((salario * percentual) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Calcula o percentual a partir do valor em R$ e do salário
  function calcularPercentualPorValor(valorStr, salarioStr) {
    const salario = parseFloat((salarioStr || "0").replace(/\./g, '').replace(',', '.')) || 0;
    const valor = parseFloat((valorStr || "0").replace(/\./g, '').replace(',', '.')) || 0;
    if (!salario) return "0,00";
    const percentual = (valor / salario) * 100;
    return percentual.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Calcula o valor da hora baseado no total de horas do mês
  function valorHoraFuncionario(funcionarioTemp) {
    const totalCusto = calcularTotalFuncionarioObj(funcionarioTemp);
    const totalHoras = getTotalHorasMes(funcionarioTemp);
    if (!totalCusto || !totalHoras) return 0;
    return totalCusto / totalHoras;
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Adicionar/Editar Funcionário"
      overlayClassName="ReactModal__Overlay"
      className="ReactModal__Content"
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <h2 className="modal-func-title">
        {editando === null ? "Adicionar Funcionário" : "Editar Funcionário"}
      </h2>
      <form className="modal-func-form" onSubmit={e => { e.preventDefault(); salvarFuncionario(); }}>
        <label htmlFor="tipoMaoDeObra" className="modal-func-label">
          Tipo de Mão de Obra
        </label>
        <select
          id="tipoMaoDeObra"
          ref={el => inputRefs.current[0] = el}
          value={funcionarioTemp.tipoMaoDeObra}
          onChange={e => setFuncionarioTemp({ ...funcionarioTemp, tipoMaoDeObra: e.target.value })}
          onKeyDown={e => handleTab(e, 0)}
          className="folha-input"
        >
          <option value="Direta">Direta</option>
          <option value="Indireta">Indireta</option>
        </select>

        <input
          ref={el => inputRefs.current[1] = el}
          value={funcionarioTemp.nome}
          onChange={e => setFuncionarioTemp({ ...funcionarioTemp, nome: e.target.value })}
          placeholder="Nome"
          className="folha-input"
          onKeyDown={e => handleTab(e, 1)}
          maxLength={60}
        />

        <input
          ref={el => inputRefs.current[2] = el}
          value={funcionarioTemp.cargo}
          onChange={e => setFuncionarioTemp({ ...funcionarioTemp, cargo: e.target.value })}
          placeholder="Cargo"
          className="folha-input"
          onKeyDown={e => handleTab(e, 2)}
          maxLength={40}
        />

        <div className="folha-salario-group" style={{ position: "relative" }}>
          <span className="folha-input-prefix">R$</span>
          <input
            ref={el => inputRefs.current[3] = el}
            value={funcionarioTemp.salario}
            type="text"
            onChange={e => {
              let value = e.target.value;
              let onlyNumbers = value.replace(/[^\d]/g, "");
              if (!onlyNumbers) {
                setFuncionarioTemp(ft => ({ ...ft, salario: "" }));
                return;
              }
              if (onlyNumbers.length > 9) onlyNumbers = onlyNumbers.slice(0, 9);
              let number = parseFloat(onlyNumbers) / 100;
              let formatted = number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

              // Ao mudar salário, recalcula todos os campos percentuais
              setFuncionarioTemp(ft => {
                const atualizado = { ...ft, salario: formatted };
                CAMPOS_PERCENTUAIS.forEach(({ key }) => {
                  if (atualizado[key]) {
                    atualizado[`${key}Valor`] = calcularValorPercentual(atualizado[key], formatted);
                  } else if (atualizado[`${key}Valor`]) {
                    atualizado[key] = calcularPercentualPorValor(atualizado[`${key}Valor`], formatted);
                  }
                });
                return atualizado;
              });
            }}
            placeholder="Salário Bruto"
            className="folha-input folha-input-salario"
            min={0}
            inputMode="numeric"
            onKeyDown={e => handleTab(e, 3)}
            maxLength={15}
            autoComplete="off"
          />
        </div>

        {/* CAMPOS PERCENTUAIS */}
        <div className="folha-campos-percentuais">
          {CAMPOS_PERCENTUAIS.map((item, idx) => {
            const perc = funcionarioTemp[item.key] || "";
            const valorStr = funcionarioTemp[`${item.key}Valor`] || "";
            const valorExibido = valorStr === "" ? "0,00" : valorStr;
            const inputPercIdx = 4 + idx * 2;
            const inputValorIdx = 4 + idx * 2 + 1;
            return (
              <div key={item.key} className="folha-percent-row">
                <span className="folha-percent-label">{item.label}</span>
                <div className="folha-percent-inputbox">
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

                      // Atualiza o percentual E recalcula o valor na hora!
                      setFuncionarioTemp(ft => {
                        const atualizado = { ...ft, [item.key]: percStr };
                        atualizado[`${item.key}Valor`] = calcularValorPercentual(percStr, ft.salario);
                        return atualizado;
                      });
                    }}
                    onKeyDown={e => handleTab(e, inputPercIdx)}
                    className="folha-percent-input"
                    placeholder="0"
                  />
                  <span className="folha-percent-sufix">%</span>
                </div>
                <div className="folha-valor-inputbox">
                  <span className="folha-valor-prefix">R$</span>
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

                      // Atualiza valor e recalcula a %
                      setFuncionarioTemp(ft => {
                        const atualizado = { ...ft, [`${item.key}Valor`]: formatted };
                        atualizado[item.key] = calcularPercentualPorValor(formatted, ft.salario);
                        return atualizado;
                      });
                    }}
                    className="folha-valor-input"
                    placeholder="0,00"
                    onKeyDown={e => handleTab(e, inputValorIdx)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="folha-modal-total">
          Custo Total deste Funcionário:&nbsp;
          {calcularTotalFuncionarioObj(funcionarioTemp).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>

        {/* NOVA LÓGICA DE HORAS + INFO */}
        <div className="folha-horas-bloco">
          <div className="folha-horas-input-row">
            <span className="folha-horas-label">Horas por dia:</span>
            <input
              type="number"
              min="1"
              max="24"
              value={funcionarioTemp.horasPorDia || ""}
              onChange={e => {
                let valor = e.target.value.replace(/\D/g, "");
                setFuncionarioTemp(ft => ({
                  ...ft,
                  horasPorDia: valor
                }));
              }}
              className="folha-horas-input"
              placeholder="8"
            />

            <span className="folha-horas-label" style={{ marginLeft: 14 }}>Dias por semana:</span>
            <input
              type="number"
              min="1"
              max="7"
              value={funcionarioTemp.diasPorSemana || ""}
              onChange={e => {
                let valor = e.target.value.replace(/\D/g, "");
                setFuncionarioTemp(ft => ({
                  ...ft,
                  diasPorSemana: valor
                }));
              }}
              className="folha-horas-input"
              placeholder="5"
            />

            {/* Ícone de informação */}
            <span className="horas-info-icon" tabIndex={0}>
              i
              <span className="horas-tooltip">
                O cálculo é:<br />
                <b>Horas por dia × Dias por semana × 4,345</b><br />
                <span style={{ fontSize: "0.97em" }}>
                  4,345 é a média de semanas por mês<br />(52 semanas ÷ 12 meses).
                </span>
              </span>
            </span>
          </div>
          <div className="folha-horas-valor">
            Valor da hora (custo total):&nbsp;
            <span className="folha-horas-valor-num">
              {isFinite(valorHoraFuncionario(funcionarioTemp)) && valorHoraFuncionario(funcionarioTemp) > 0
                ? valorHoraFuncionario(funcionarioTemp).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "R$ 0,00"}
            </span>
          </div>
        </div>

        <div className="folha-modal-btns">
          <button
            ref={el => inputRefs.current[46] = el}
            type="submit"
            className="folha-btn-salvar"
            onKeyDown={e => handleTab(e, 46)}
          >Salvar</button>
          <button
            ref={el => inputRefs.current[47] = el}
            type="button"
            onClick={onRequestClose}
            className="folha-btn-cancelar"
            onKeyDown={e => handleTab(e, 47)}
          >Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}
