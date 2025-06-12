import React, { useState } from "react";
import { FaUser, FaCog, FaMoneyBill, FaPercent, FaBoxes, FaChartLine, FaPowerOff } from "react-icons/fa";
import { GiChefToque } from "react-icons/gi";
import "./SidebarMenu.css";

export default function SidebarMenu({
  selected,
  onSelect,
  onLogout,
  subCategoriasPrincipais = [],
  subCategoriasMarkup = [],
  sidebarExpanded,
  setSidebarExpanded
}) {
  const [custosOpen, setCustosOpen] = useState(false);
  const [markupOpen, setMarkupOpen] = useState(false);

  const menuItems = [
    { label: "Perfil", icon: <FaUser /> },
    { label: "Configurações", icon: <FaCog /> },
    {
      label: "Custos",
      icon: <FaMoneyBill />,
      subItems: subCategoriasPrincipais.map((cat) => ({
        label: cat.label,
      })),
    },
    {
      label: "Markup",
      icon: <FaPercent />,
      subItems: subCategoriasMarkup.map((cat) => ({
        label: cat.label,
      })),
    },
    { label: "Estoque", icon: <FaBoxes /> },
    { label: "Quadro de Receitas", icon: <GiChefToque size={22} /> },
    {
      label: "Planejamento de Vendas",
      icon: <FaChartLine />,
      // sem subItems
    },
  ];

  function handleMenuClick(item) {
    if (item.label === "Custos") {
      setCustosOpen((open) => !open);
      setMarkupOpen(false);
    } else if (item.label === "Markup") {
      setMarkupOpen((open) => !open);
      setCustosOpen(false);
    } else {
      onSelect(item.label);
      setCustosOpen(false);
      setMarkupOpen(false);
    }
  }

  function handleSubItemClick(parentLabel, subItem) {
    onSelect(`${parentLabel}:${subItem.label}`);
  }

  return (
    <nav
      className={`sidebar${sidebarExpanded ? " expanded" : ""}`}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => {
        setSidebarExpanded(false);
        setCustosOpen(false);
        setMarkupOpen(false);
      }}
    >
      <div className="sidebar-logo" />
      <ul className="sidebar-list">
        {menuItems.map((item) => (
          <li key={item.label}>
            <div
              className={
                "sidebar-list-item"
                + (selected && (selected === item.label || (item.subItems && selected.startsWith(item.label + ":"))) ? " selected" : "")
                + (item.subItems ? " has-submenu" : "")
              }
              onClick={() => handleMenuClick(item)}
              tabIndex={0}
              style={item.subItems ? { cursor: "pointer" } : {}}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">
                <span className="label-text">{item.label}</span>
                {item.label === "Custos" && item.subItems && (
                  <span
                    className="submenu-arrow"
                    style={{
                      transition: "transform 0.2s",
                      display: "inline-block",
                      transform: custosOpen ? "rotate(180deg)" : "rotate(0deg)",
                      marginLeft: 22,
                      verticalAlign: "middle",
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <polygon points="12,17 6,10 18,10" fill="#b388ff" />
                    </svg>
                  </span>
                )}
                {item.label === "Markup" && item.subItems && (
                  <span
                    className="submenu-arrow"
                    style={{
                      transition: "transform 0.2s",
                      display: "inline-block",
                      transform: markupOpen ? "rotate(180deg)" : "rotate(0deg)",
                      marginLeft: 22,
                      verticalAlign: "middle",
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <polygon points="12,17 6,10 18,10" fill="#b388ff" />
                    </svg>
                  </span>
                )}
              </span>
            </div>
            {item.label === "Custos" && item.subItems && custosOpen && (
              <ul className="sidebar-submenu">
                {item.subItems.map((sub) => (
                  <li
                    key={sub.label}
                    className={
                      "sidebar-subitem"
                      + (selected === `Custos:${sub.label}` ? " selected" : "")
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubItemClick("Custos", sub);
                    }}
                    tabIndex={0}
                  >
                    <span className="label-text">{sub.label}</span>
                  </li>
                ))}
              </ul>
            )}
            {item.label === "Markup" && item.subItems && markupOpen && (
              <ul className="sidebar-submenu">
                {item.subItems.map((sub) => (
                  <li
                    key={sub.label}
                    className={
                      "sidebar-subitem"
                      + (selected === `Markup:${sub.label}` ? " selected" : "")
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubItemClick("Markup", sub);
                    }}
                    tabIndex={0}
                  >
                    <span className="label-text">{sub.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <hr className="sidebar-divider" />
      <div className="sidebar-list-item logout" onClick={onLogout} tabIndex={0}>
        <span className="icon"><FaPowerOff /></span>
        <span className="label">
          <span className="label-text">Sair</span>
        </span>
      </div>
    </nav>
  );
}
