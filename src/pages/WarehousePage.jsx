import { useEffect, useMemo, useState } from "react";

const emptyItem = {
  name: "",
  category: "Фильтр",
  sku: "",
  quantity: "",
  costPrice: "",
  salePrice: "",
  minStock: "",
  supplier: "",
  comment: "",
};

const categories = [
  "Фильтр",
  "Очиститель воздуха",
  "Пылесос",
  "Душевой фильтр",
  "Фильтр для стиралки",
  "Картриджи",
  "Мембраны",
  "Увлажнитель",
  "Пароочиститель",
  "Аэрогриль",
  "Массажер",
  "Запчасти",
  "Другое",
];

export default function WarehousePage() {
  const [items, setItems] = useState(() => {
    return JSON.parse(localStorage.getItem("ph_warehouse")) || [];
  });

  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Все");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("ph_warehouse", JSON.stringify(items));
  }, [items]);

  const n = (v) => Number(v || 0);

  function saveItem(e) {
    e.preventDefault();

    if (!form.name || !form.quantity) {
      alert("Введите название и количество товара");
      return;
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...form } : item
        )
      );
      setEditingId(null);
    } else {
      setItems([
        {
          id: Date.now(),
          ...form,
          createdAt: new Date().toLocaleString("ru-RU"),
          history: [
            {
              date: new Date().toLocaleString("ru-RU"),
              text: `Товар добавлен: ${form.quantity} шт`,
            },
          ],
        },
        ...items,
      ]);
    }

    setForm(emptyItem);
  }

  function editItem(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      category: item.category || "Фильтр",
      sku: item.sku || "",
      quantity: item.quantity || "",
      costPrice: item.costPrice || "",
      salePrice: item.salePrice || "",
      minStock: item.minStock || "",
      supplier: item.supplier || "",
      comment: item.comment || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteItem(id) {
    if (confirm("Удалить товар со склада?")) {
      setItems(items.filter((item) => item.id !== id));
    }
  }

  function addStock(id) {
    const amount = prompt("Сколько добавить на склад?");
    if (!amount) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const newQuantity = n(item.quantity) + n(amount);

        return {
          ...item,
          quantity: String(newQuantity),
          history: [
            ...(item.history || []),
            {
              date: new Date().toLocaleString("ru-RU"),
              text: `Приход: +${amount} шт`,
            },
          ],
        };
      })
    );
  }

  function removeStock(id) {
    const amount = prompt("Сколько списать со склада?");
    if (!amount) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const newQuantity = Math.max(n(item.quantity) - n(amount), 0);

        return {
          ...item,
          quantity: String(newQuantity),
          history: [
            ...(item.history || []),
            {
              date: new Date().toLocaleString("ru-RU"),
              text: `Списание: -${amount} шт`,
            },
          ],
        };
      })
    );
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.name} ${item.category} ${item.sku} ${item.supplier}`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchFilter = filter === "Все" || item.category === filter;

      return matchSearch && matchFilter;
    });
  }, [items, search, filter]);

  const stats = useMemo(() => {
    const totalCost = items.reduce(
      (s, item) => s + n(item.quantity) * n(item.costPrice),
      0
    );

    const totalSale = items.reduce(
      (s, item) => s + n(item.quantity) * n(item.salePrice),
      0
    );

    const lowStock = items.filter(
      (item) => n(item.minStock) > 0 && n(item.quantity) <= n(item.minStock)
    ).length;

    return {
      totalItems: items.length,
      totalQuantity: items.reduce((s, item) => s + n(item.quantity), 0),
      totalCost,
      totalSale,
      lowStock,
    };
  }, [items]);

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Позиций</span>
          <h2>{stats.totalItems}</h2>
        </div>

        <div className="stat">
          <span>Всего штук</span>
          <h2>{stats.totalQuantity}</h2>
        </div>

        <div className="stat">
          <span>Себестоимость склада</span>
          <h2>{stats.totalCost.toLocaleString()} ₸</h2>
        </div>

        <div className="stat">
          <span>Низкий остаток</span>
          <h2 className="redText">{stats.lowStock}</h2>
        </div>
      </div>

      <section className="panel">
        <h2>{editingId ? "Редактировать товар" : "Добавить товар на склад"}</h2>

        <form className="form" onSubmit={saveItem}>
          <input
            placeholder="Название товара"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            placeholder="Артикул / SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />

          <input
            placeholder="Количество"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <input
            placeholder="Себестоимость за шт ₸"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
          />

          <input
            placeholder="Цена продажи за шт ₸"
            value={form.salePrice}
            onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
          />

          <input
            placeholder="Минимальный остаток"
            value={form.minStock}
            onChange={(e) => setForm({ ...form, minStock: e.target.value })}
          />

          <input
            placeholder="Поставщик"
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
          />

          <textarea
            placeholder="Комментарий"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />

          <button className="green">
            {editingId ? "Сохранить товар" : "Добавить товар"}
          </button>

          {editingId && (
            <button
              type="button"
              className="orange"
              onClick={() => {
                setEditingId(null);
                setForm(emptyItem);
              }}
            >
              Отмена
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>Склад</h2>

        <div className="toolbar">
          <input
            placeholder="Поиск товара..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Все</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        {filteredItems.length === 0 && (
          <div className="muted" style={{ padding: 24, textAlign: "center" }}>
            На складе пока нет товаров
          </div>
        )}

        {filteredItems.map((item) => {
          const isLow =
            n(item.minStock) > 0 && n(item.quantity) <= n(item.minStock);

          return (
            <div className="deal" key={item.id}>
              <div className="dealTop">
                <div>
                  <b>{item.name}</b>

                  <div className="meta">
                    Категория: {item.category}
                    <br />
                    SKU: {item.sku || "—"}
                    <br />
                    Поставщик: {item.supplier || "—"}
                    <br />
                    💬 {item.comment || "—"}
                  </div>
                </div>

                <span className={`badge ${isLow ? "red" : ""}`}>
                  {n(item.quantity)} шт
                </span>
              </div>

              <div className="moneyGrid">
                <div className="moneyBox">
                  <span>Себестоимость / шт</span>
                  <b>{n(item.costPrice).toLocaleString()} ₸</b>
                </div>

                <div className="moneyBox">
                  <span>Цена продажи / шт</span>
                  <b>{n(item.salePrice).toLocaleString()} ₸</b>
                </div>

                <div className="moneyBox">
                  <span>Сумма склада</span>
                  <b>{(n(item.quantity) * n(item.costPrice)).toLocaleString()} ₸</b>
                </div>

                <div className="moneyBox">
                  <span>Потенц. выручка</span>
                  <b className="greenText">
                    {(n(item.quantity) * n(item.salePrice)).toLocaleString()} ₸
                  </b>
                </div>
              </div>

              {item.history?.length > 0 && (
                <div className="meta" style={{ marginTop: 12 }}>
                  <b>История движения:</b>

                  {item.history.slice(-5).map((h, i) => (
                    <div key={i}>
                      {h.date} — {h.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="clientActions">
                <button className="green" onClick={() => addStock(item.id)}>
                  Приход
                </button>

                <button className="orange" onClick={() => removeStock(item.id)}>
                  Списание
                </button>

                <button className="blue" onClick={() => editItem(item)}>
                  Редактировать
                </button>

                <button className="red" onClick={() => deleteItem(item.id)}>
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}