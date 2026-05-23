import { useEffect, useMemo, useState } from "react";

const emptyExpense = {
  title: "",
  category: "Реклама",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  comment: "",
};

const categories = [
  "Реклама",
  "ЗП мастер",
  "ЗП оператор",
  "Бензин",
  "Аренда",
  "Доставка",
  "Инструменты",
  "Склад",
  "Сервис",
  "Другое",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem("ph_expenses")) || [];
  });

  const [form, setForm] = useState(emptyExpense);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Все");

  useEffect(() => {
    localStorage.setItem("ph_expenses", JSON.stringify(expenses));
  }, [expenses]);

  const n = (v) => Number(v || 0);

  function saveExpense(e) {
    e.preventDefault();

    if (!form.title || !form.amount) {
      alert("Введите название и сумму расхода");
      return;
    }

    if (editingId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...form } : item
        )
      );
      setEditingId(null);
    } else {
      setExpenses([
        {
          id: Date.now(),
          ...form,
          createdAt: new Date().toLocaleString("ru-RU"),
        },
        ...expenses,
      ]);
    }

    setForm(emptyExpense);
  }

  function editExpense(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "Реклама",
      amount: item.amount || "",
      date: item.date || new Date().toISOString().slice(0, 10),
      comment: item.comment || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteExpense(id) {
    if (confirm("Удалить расход?")) {
      setExpenses(expenses.filter((item) => item.id !== id));
    }
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      return filter === "Все" || item.category === filter;
    });
  }, [expenses, filter]);

  const stats = useMemo(() => {
    const total = expenses.reduce((s, item) => s + n(item.amount), 0);

    const today = new Date().toISOString().slice(0, 10);

    const todayTotal = expenses
      .filter((item) => item.date === today)
      .reduce((s, item) => s + n(item.amount), 0);

    const filteredTotal = filteredExpenses.reduce(
      (s, item) => s + n(item.amount),
      0
    );

    return {
      total,
      todayTotal,
      filteredTotal,
      count: expenses.length,
    };
  }, [expenses, filteredExpenses]);

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Всего расходов</span>
          <h2 className="redText">{stats.total.toLocaleString()} ₸</h2>
        </div>

        <div className="stat">
          <span>Сегодня</span>
          <h2>{stats.todayTotal.toLocaleString()} ₸</h2>
        </div>

        <div className="stat">
          <span>Кол-во расходов</span>
          <h2>{stats.count}</h2>
        </div>

        <div className="stat">
          <span>По фильтру</span>
          <h2>{stats.filteredTotal.toLocaleString()} ₸</h2>
        </div>
      </div>

      <section className="panel">
        <h2>{editingId ? "Редактировать расход" : "Добавить расход"}</h2>

        <form className="form" onSubmit={saveExpense}>
          <input
            placeholder="Название расхода"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <input
            placeholder="Сумма ₸"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <textarea
            placeholder="Комментарий"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />

          <button className="green">
            {editingId ? "Сохранить расход" : "Добавить расход"}
          </button>

          {editingId && (
            <button
              type="button"
              className="orange"
              onClick={() => {
                setEditingId(null);
                setForm(emptyExpense);
              }}
            >
              Отмена
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>Список расходов</h2>

        <div className="toolbar">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Все</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="muted" style={{ padding: 24, textAlign: "center" }}>
            Расходов пока нет
          </div>
        )}

        {filteredExpenses.map((item) => (
          <div className="deal" key={item.id}>
            <div className="dealTop">
              <div>
                <b>{item.title}</b>

                <div className="meta">
                  Категория: {item.category}
                  <br />
                  Дата: {item.date}
                  <br />
                  💬 {item.comment || "—"}
                </div>
              </div>

              <span className="badge red">
                {n(item.amount).toLocaleString()} ₸
              </span>
            </div>

            <div className="clientActions">
              <button className="orange" onClick={() => editExpense(item)}>
                Редактировать
              </button>

              <button className="red" onClick={() => deleteExpense(item.id)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}