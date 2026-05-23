import { useEffect, useMemo, useState } from "react";

const categories = [
  "Фильтр",
  "Очиститель воздуха",
  "Пылесос",
  "Душевой фильтр",
  "Фильтр для стиралки",
  "Картриджи",
  "Увлажнитель",
  "Пароочиститель",
  "Аэрогриль",
  "Массажер",
  "Сервис",
];

const emptyDeal = {
  clientName: "",
  phone: "",
  product: "",
  category: "Фильтр",
  source: "Instagram",
  status: "Рассрочка",
  salePrice: "",
  costPrice: "",
  masterCost: "",
  adsCost: "",
  deliveryCost: "",
  otherCost: "",
  firstPayment: "",
  monthlyPayment: "",
  nextPaymentDate: "",
  paidTotal: "",
  comment: "",
};

export default function OwnerPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [deals, setDeals] = useState(() => JSON.parse(localStorage.getItem("ph_deals")) || []);
  const [form, setForm] = useState(emptyDeal);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("ph_deals", JSON.stringify(deals));
  }, [deals]);

  const n = (v) => Number(v || 0);
  const expenses = (d) => n(d.costPrice) + n(d.masterCost) + n(d.adsCost) + n(d.deliveryCost) + n(d.otherCost);
  const profit = (d) => n(d.salePrice) - expenses(d);
  const paid = (d) => n(d.paidTotal || d.firstPayment);
  const debt = (d) => Math.max(n(d.salePrice) - paid(d), 0);

  function saveDeal(e) {
    e.preventDefault();
    if (!form.clientName || !form.product || !form.salePrice) {
      alert("Введите клиента, товар и цену продажи");
      return;
    }

    const dealData = {
      ...form,
      paidTotal: form.paidTotal || form.firstPayment,
    };

    if (editingId) {
      setDeals((prev) => prev.map((d) => d.id === editingId ? { ...d, ...dealData } : d));
      setEditingId(null);
    } else {
      setDeals([{ ...dealData, id: Date.now(), createdAt: new Date().toLocaleDateString("ru-RU"), payments: [] }, ...deals]);
    }

    setForm(emptyDeal);
  }

  function editDeal(deal) {
    setEditingId(deal.id);
    setForm({ ...emptyDeal, ...deal });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteDeal(id) {
    if (confirm("Удалить сделку?")) {
      setDeals(deals.filter((d) => d.id !== id));
    }
  }

  function addPayment(id) {
    const amount = prompt("Сколько оплатил клиент?");
    if (!amount) return;

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;

        const newPaid = paid(d) + n(amount);
        return {
          ...d,
          paidTotal: String(newPaid),
          status: newPaid >= n(d.salePrice) ? "Оплачено" : d.status,
          payments: [
            ...(d.payments || []),
            {
              amount: n(amount),
              date: new Date().toLocaleDateString("ru-RU"),
            },
          ],
        };
      })
    );
  }

  const stats = useMemo(() => {
    return {
      revenue: deals.reduce((s, d) => s + n(d.salePrice), 0),
      expenses: deals.reduce((s, d) => s + expenses(d), 0),
      profit: deals.reduce((s, d) => s + profit(d), 0),
      debt: deals.reduce((s, d) => s + debt(d), 0),
    };
  }, [deals]);

  if (!unlocked) {
    return (
      <div className="lock">
        <h1>OWNER PANEL 🔒</h1>
        <p className="muted">Себестоимость, маржа, расходы и чистая прибыль</p>

        <input
          type="password"
          placeholder="Пароль владельца"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="green"
          style={{ marginTop: 12 }}
          onClick={() => password === "7777" ? setUnlocked(true) : alert("Неверный пароль")}
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="stats">
        <div className="stat"><span>Оборот</span><h2>{stats.revenue.toLocaleString()} ₸</h2></div>
        <div className="stat"><span>Расходы</span><h2 className="redText">{stats.expenses.toLocaleString()} ₸</h2></div>
        <div className="stat"><span>Чистая прибыль</span><h2 className="greenText">{stats.profit.toLocaleString()} ₸</h2></div>
        <div className="stat"><span>Долг клиентов</span><h2 className="yellowText">{stats.debt.toLocaleString()} ₸</h2></div>
      </div>

      <section className="panel">
        <h2>{editingId ? "Редактировать сделку" : "Добавить сделку"}</h2>

        <form className="form" onSubmit={saveDeal}>
          <input placeholder="Клиент" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          <input placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Товар / услуга" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />

          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>

          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            <option>Instagram</option>
            <option>Знакомые</option>
            <option>Сервис</option>
            <option>Кафе / кофейня</option>
            <option>Обход</option>
            <option>Рекомендация</option>
            <option>Другое</option>
          </select>

          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Активная</option>
            <option>Оплачено</option>
            <option>Рассрочка</option>
            <option>Просрочка</option>
          </select>

          <input placeholder="Цена продажи ₸" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
          <input placeholder="Себестоимость ₸" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          <input placeholder="Расход мастера ₸" value={form.masterCost} onChange={(e) => setForm({ ...form, masterCost: e.target.value })} />

          <input placeholder="Реклама ₸" value={form.adsCost} onChange={(e) => setForm({ ...form, adsCost: e.target.value })} />
          <input placeholder="Доставка / бензин ₸" value={form.deliveryCost} onChange={(e) => setForm({ ...form, deliveryCost: e.target.value })} />
          <input placeholder="Другие расходы ₸" value={form.otherCost} onChange={(e) => setForm({ ...form, otherCost: e.target.value })} />

          <input placeholder="Первый взнос ₸" value={form.firstPayment} onChange={(e) => setForm({ ...form, firstPayment: e.target.value })} />
          <input placeholder="Оплачено всего ₸" value={form.paidTotal} onChange={(e) => setForm({ ...form, paidTotal: e.target.value })} />
          <input placeholder="Ежемесячный платёж ₸" value={form.monthlyPayment} onChange={(e) => setForm({ ...form, monthlyPayment: e.target.value })} />

          <input type="date" value={form.nextPaymentDate} onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })} />

          <textarea placeholder="Комментарий" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />

          <button className="green">{editingId ? "Сохранить сделку" : "Добавить сделку"}</button>

          {editingId && (
            <button type="button" className="orange" onClick={() => { setEditingId(null); setForm(emptyDeal); }}>
              Отмена
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>Сделки</h2>

        {deals.length === 0 && (
          <div className="muted" style={{ padding: 24, textAlign: "center" }}>
            Сделок пока нет
          </div>
        )}

        {deals.map((d) => (
          <div className="deal" key={d.id}>
            <div className="dealTop">
              <div>
                <b>{d.clientName} — {d.product}</b>
                <div className="meta">
                  📞 {d.phone || "—"}
                  <br />
                  🧾 {d.category}
                  <br />
                  Источник: {d.source}
                  <br />
                  Статус: {d.status}
                </div>
              </div>
              <span className="badge">{d.status}</span>
            </div>

            <div className="moneyGrid">
              <div className="moneyBox"><span>Продажа</span><b>{n(d.salePrice).toLocaleString()} ₸</b></div>
              <div className="moneyBox"><span>Себестоимость</span><b>{n(d.costPrice).toLocaleString()} ₸</b></div>
              <div className="moneyBox"><span>Все расходы</span><b className="redText">{expenses(d).toLocaleString()} ₸</b></div>
              <div className="moneyBox"><span>Чистая прибыль</span><b className="greenText">{profit(d).toLocaleString()} ₸</b></div>
              <div className="moneyBox"><span>Оплачено</span><b>{paid(d).toLocaleString()} ₸</b></div>
              <div className="moneyBox"><span>Остаток</span><b className="yellowText">{debt(d).toLocaleString()} ₸</b></div>
              <div className="moneyBox"><span>Ежемесячно</span><b>{n(d.monthlyPayment).toLocaleString()} ₸</b></div>
              <div className="moneyBox"><span>След. оплата</span><b>{d.nextPaymentDate || "—"}</b></div>
            </div>

            {d.payments?.length > 0 && (
              <div className="meta" style={{ marginTop: 12 }}>
                <b>Платежи:</b>
                {d.payments.slice(-5).map((p, i) => (
                  <div key={i}>{p.date} — {Number(p.amount).toLocaleString()} ₸</div>
                ))}
              </div>
            )}

            <div className="clientActions">
              <button className="green" onClick={() => addPayment(d.id)}>Отметить платёж</button>
              <button className="orange" onClick={() => editDeal(d)}>Редактировать</button>
              <button className="red" onClick={() => deleteDeal(d.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}