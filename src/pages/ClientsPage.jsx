import { useEffect, useMemo, useState } from "react";

const statuses = [
  "Новый",
  "В работе",
  "Перезвонить",
  "Назначен выезд",
  "Купил",
  "Сервис",
  "Отказ",
];

const sources = [
  "Instagram",
  "Знакомые",
  "Сервис",
  "Кафе / кофейня",
  "Обход",
  "Рекомендация",
  "Другое",
];

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  source: "Instagram",
  interest: "",
  status: "Новый",
  nextContact: "",
  comment: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState(() => {
    return JSON.parse(localStorage.getItem("ph_clients")) || [];
  });

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все");

  useEffect(() => {
    localStorage.setItem("ph_clients", JSON.stringify(clients));
  }, [clients]);

  function saveClient(e) {
    e.preventDefault();

    if (!form.name || !form.phone) {
      alert("Введите имя и телефон");
      return;
    }

    if (editingId) {
      setClients((prev) =>
        prev.map((client) =>
          client.id === editingId ? { ...client, ...form } : client
        )
      );
      setEditingId(null);
    } else {
      setClients([
        {
          id: Date.now(),
          ...form,
          createdAt: new Date().toLocaleDateString("ru-RU"),
          history: [
            {
              date: new Date().toLocaleString("ru-RU"),
              text: "Клиент добавлен в базу",
            },
          ],
        },
        ...clients,
      ]);
    }

    setForm(emptyForm);
  }

  function editClient(client) {
    setEditingId(client.id);
    setForm({
      name: client.name || "",
      phone: client.phone || "",
      address: client.address || "",
      source: client.source || "Instagram",
      interest: client.interest || "",
      status: client.status || "Новый",
      nextContact: client.nextContact || "",
      comment: client.comment || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteClient(id) {
    if (confirm("Удалить клиента?")) {
      setClients(clients.filter((c) => c.id !== id));
    }
  }

  function updateStatus(id, status) {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id
          ? {
              ...client,
              status,
              history: [
                ...(client.history || []),
                {
                  date: new Date().toLocaleString("ru-RU"),
                  text: `Статус изменён на: ${status}`,
                },
              ],
            }
          : client
      )
    );
  }

  function openWhatsApp(phone) {
    const clean = String(phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  }

  function callClient(phone) {
    window.location.href = `tel:${phone}`;
  }

  function createTask(client) {
    alert(
      `Следующий шаг: создадим задание мастеру для клиента ${client.name}.`
    );
  }

  function createDeal(client) {
    alert(
      `Следующий шаг: создадим сделку в Owner Panel для клиента ${client.name}.`
    );
  }

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const text = `${client.name} ${client.phone} ${client.address} ${client.source} ${client.interest} ${client.comment}`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Все" || client.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [clients, search, statusFilter]);

  const today = new Date().toISOString().slice(0, 10);

  const todayContacts = clients.filter(
    (client) => client.nextContact === today
  );

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Всего клиентов</span>
          <h2>{clients.length}</h2>
        </div>

        <div className="stat">
          <span>Новые</span>
          <h2>{clients.filter((c) => c.status === "Новый").length}</h2>
        </div>

        <div className="stat">
          <span>Сегодня связаться</span>
          <h2>{todayContacts.length}</h2>
        </div>

        <div className="stat">
          <span>Купили</span>
          <h2>{clients.filter((c) => c.status === "Купил").length}</h2>
        </div>
      </div>

      {todayContacts.length > 0 && (
        <section className="panel">
          <h2>Сегодня нужно связаться</h2>

          {todayContacts.map((client) => (
            <div className="client" key={client.id}>
              <div className="clientTop">
                <div>
                  <b>{client.name}</b>
                  <div className="meta">
                    📞 {client.phone}
                    <br />
                    Интерес: {client.interest || "—"}
                    <br />
                    💬 {client.comment || "—"}
                  </div>
                </div>

                <span className="badge">{client.status}</span>
              </div>

              <div className="clientActions">
                <button className="green" onClick={() => callClient(client.phone)}>
                  Позвонить
                </button>

                <button className="blue" onClick={() => openWhatsApp(client.phone)}>
                  WhatsApp
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="panel">
        <h2>{editingId ? "Редактировать клиента" : "Добавить клиента"}</h2>

        <form className="form" onSubmit={saveClient}>
          <input
            placeholder="Имя клиента"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Телефон"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            placeholder="Адрес / район"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          >
            {sources.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>

          <input
            placeholder="Интересующий товар"
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
          />

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <input
            type="date"
            value={form.nextContact}
            onChange={(e) =>
              setForm({ ...form, nextContact: e.target.value })
            }
          />

          <textarea
            placeholder="Комментарий"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />

          <button className="green">
            {editingId ? "Сохранить клиента" : "Добавить клиента"}
          </button>

          {editingId && (
            <button
              type="button"
              className="orange"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Отмена
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>Клиентская база ULTRA</h2>

        <div className="toolbar">
          <input
            placeholder="Поиск клиента..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Все</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        {filteredClients.length === 0 && (
          <div className="muted" style={{ padding: 24, textAlign: "center" }}>
            Клиентов пока нет
          </div>
        )}

        {filteredClients.map((client) => (
          <div className="client" key={client.id}>
            <div className="clientTop">
              <div>
                <b>{client.name}</b>

                <div className="meta">
                  📞 {client.phone}
                  <br />
                  📍 {client.address || "Адрес не указан"}
                  <br />
                  Источник: {client.source}
                  <br />
                  Интерес: {client.interest || "—"}
                  <br />
                  Следующий контакт: {client.nextContact || "—"}
                  <br />
                  💬 {client.comment || "—"}
                </div>
              </div>

              <select
                value={client.status}
                onChange={(e) => updateStatus(client.id, e.target.value)}
                style={{ maxWidth: 220 }}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="clientActions">
              <button className="green" onClick={() => callClient(client.phone)}>
                Позвонить
              </button>

              <button className="blue" onClick={() => openWhatsApp(client.phone)}>
                WhatsApp
              </button>

              <button className="cyan" onClick={() => createTask(client)}>
                Создать задание
              </button>

              <button className="green" onClick={() => createDeal(client)}>
                Создать сделку
              </button>

              <button className="orange" onClick={() => editClient(client)}>
                Редактировать
              </button>

              <button className="red" onClick={() => deleteClient(client.id)}>
                Удалить
              </button>
            </div>

            {client.history?.length > 0 && (
              <div className="meta" style={{ marginTop: 12 }}>
                <b>История:</b>
                {client.history.slice(-3).map((h, index) => (
                  <div key={index}>
                    {h.date} — {h.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}