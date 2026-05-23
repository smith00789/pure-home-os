import { useEffect, useMemo, useState } from "react";

export default function AccountingPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  const [deals, setDeals] = useState(() => {
    return JSON.parse(localStorage.getItem("ph_deals")) || [];
  });

  useEffect(() => {
    localStorage.setItem("ph_deals", JSON.stringify(deals));
  }, [deals]);

  const n = (v) => Number(v || 0);

  function paid(d) {
    return n(d.paidTotal || d.firstPayment);
  }

  function debt(d) {
    return Math.max(n(d.salePrice) - paid(d), 0);
  }

  function paymentStatus(date) {
    if (!date) return "Нет даты";

    const today = new Date().toISOString().slice(0, 10);

    if (date < today) return "Просрочка";
    if (date === today) return "Сегодня";

    return "Ожидается";
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
          status:
            newPaid >= n(d.salePrice)
              ? "Оплачено"
              : d.status,
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

  const installmentDeals = deals.filter(
    (d) => debt(d) > 0 || d.status === "Рассрочка"
  );

  const stats = useMemo(() => {
    return {
      clients: installmentDeals.length,

      debt: installmentDeals.reduce(
        (s, d) => s + debt(d),
        0
      ),

      overdue: installmentDeals.filter(
        (d) =>
          paymentStatus(d.nextPaymentDate) ===
          "Просрочка"
      ).length,

      today: installmentDeals.filter(
        (d) =>
          paymentStatus(d.nextPaymentDate) ===
          "Сегодня"
      ).length,
    };
  }, [installmentDeals]);

  if (!unlocked) {
    return (
      <div className="lock">
        <h1>БУХГАЛТЕРИЯ 🔒</h1>

        <p className="muted">
          Рассрочки, долги и платежи
        </p>

        <input
          type="password"
          placeholder="Пароль бухгалтерии"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="green"
          style={{ marginTop: 12 }}
          onClick={() =>
            password === "5555"
              ? setUnlocked(true)
              : alert("Неверный пароль")
          }
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Клиентов</span>
          <h2>{stats.clients}</h2>
        </div>

        <div className="stat">
          <span>Общий долг</span>
          <h2 className="yellowText">
            {stats.debt.toLocaleString()} ₸
          </h2>
        </div>

        <div className="stat">
          <span>Просрочки</span>
          <h2 className="redText">
            {stats.overdue}
          </h2>
        </div>

        <div className="stat">
          <span>Сегодня оплатить</span>
          <h2>{stats.today}</h2>
        </div>
      </div>

      <section className="panel">
        <h2>Рассрочки</h2>

        {installmentDeals.length === 0 && (
          <div
            className="muted"
            style={{
              padding: 24,
              textAlign: "center",
            }}
          >
            Рассрочек пока нет
          </div>
        )}

        {installmentDeals.map((d) => {
          const ps = paymentStatus(
            d.nextPaymentDate
          );

          return (
            <div className="deal" key={d.id}>
              <div className="dealTop">
                <div>
                  <b>
                    {d.clientName} — {d.product}
                  </b>

                  <div className="meta">
                    📞 {d.phone || "—"}
                    <br />
                    Следующая оплата:{" "}
                    {d.nextPaymentDate || "—"}
                    <br />
                    Статус: {ps}
                  </div>
                </div>

                <span className="badge">
                  {ps}
                </span>
              </div>

              <div className="moneyGrid">
                <div className="moneyBox">
                  <span>Сумма</span>
                  <b>
                    {n(d.salePrice).toLocaleString()} ₸
                  </b>
                </div>

                <div className="moneyBox">
                  <span>Оплачено</span>
                  <b>
                    {paid(d).toLocaleString()} ₸
                  </b>
                </div>

                <div className="moneyBox">
                  <span>Остаток</span>
                  <b className="yellowText">
                    {debt(d).toLocaleString()} ₸
                  </b>
                </div>

                <div className="moneyBox">
                  <span>Ежемесячно</span>
                  <b>
                    {n(d.monthlyPayment).toLocaleString()} ₸
                  </b>
                </div>
              </div>

              {d.payments?.length > 0 && (
                <div
                  className="meta"
                  style={{ marginTop: 12 }}
                >
                  <b>История платежей:</b>

                  {d.payments
                    .slice(-5)
                    .map((p, i) => (
                      <div key={i}>
                        {p.date} —{" "}
                        {Number(
                          p.amount
                        ).toLocaleString()}{" "}
                        ₸
                      </div>
                    ))}
                </div>
              )}

              <div className="clientActions">
                <button
                  className="green"
                  onClick={() => addPayment(d.id)}
                >
                  Отметить оплату
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}