export default function Sidebar({ section, setSection }) {
  const items = [
    ["clients", "👥 Клиенты"],
    ["objects", "🏢 Объекты"],
    ["processes", "🛠 Процессы"],
    ["employees", "🚗 Сотрудники"],
    ["owner", "💰 Owner Panel"],
    ["accounting", "🗓 Бухгалтерия"],
    ["expenses", "💸 Расходы"],
    ["warehouse", "📦 Склад"],
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        PURE<span>HOME</span>
      </div>

      <div className="side">
        PURE-HOME OS
        <br />
        Business Operating System
      </div>

      {items.map(([key, label]) => (
        <div
          key={key}
          className={`nav ${section === key ? "active" : ""}`}
          onClick={() => setSection(key)}
        >
          {label}
        </div>
      ))}
    </aside>
  );
}