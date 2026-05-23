import { useEffect, useState } from "react";

const emptyObject = {
  name: "",
  type: "Санаторий",
  contact: "",
  phone: "",
  address: "",
  systems: "",
  installDate: "",
  nextServiceDate: "",
  servicePeriod: "6 месяцев",
  comment: "",
};

export default function ObjectsPage() {
  const [objects, setObjects] = useState(() => {
    return JSON.parse(localStorage.getItem("ph_objects")) || [];
  });

  const [form, setForm] = useState(emptyObject);

  useEffect(() => {
    localStorage.setItem("ph_objects", JSON.stringify(objects));
  }, [objects]);

  function addObject(e) {
    e.preventDefault();

    if (!form.name) {
      alert("Введите название объекта");
      return;
    }

    setObjects([
      {
        id: Date.now(),
        ...form,
        createdAt: new Date().toLocaleDateString("ru-RU"),
      },
      ...objects,
    ]);

    setForm(emptyObject);
  }

  function deleteObject(id) {
    if (confirm("Удалить объект?")) {
      setObjects(objects.filter((item) => item.id !== id));
    }
  }

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Всего объектов</span>
          <h2>{objects.length}</h2>
        </div>

        <div className="stat">
          <span>Санатории</span>
          <h2>{objects.filter((o) => o.type === "Санаторий").length}</h2>
        </div>

        <div className="stat">
          <span>Кафе / кофейни</span>
          <h2>
            {
              objects.filter(
                (o) => o.type === "Кафе" || o.type === "Кофейня"
              ).length
            }
          </h2>
        </div>

        <div className="stat">
          <span>Сервисные объекты</span>
          <h2>{objects.filter((o) => o.nextServiceDate).length}</h2>
        </div>
      </div>

      <section className="panel">
        <h2>Добавить объект</h2>

        <form className="form" onSubmit={addObject}>
          <input
            placeholder="Название объекта"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Санаторий</option>
            <option>Кафе</option>
            <option>Кофейня</option>
            <option>ЖК</option>
            <option>Школа</option>
            <option>Садик</option>
            <option>Производство</option>
            <option>Офис</option>
            <option>Медцентр</option>
            <option>Другое</option>
          </select>

          <input
            placeholder="Контактное лицо"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />

          <input
            placeholder="Телефон"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            placeholder="Адрес"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <input
            placeholder="Какие фильтры / системы стоят"
            value={form.systems}
            onChange={(e) => setForm({ ...form, systems: e.target.value })}
          />

          <input
            type="date"
            value={form.installDate}
            onChange={(e) => setForm({ ...form, installDate: e.target.value })}
          />

          <input
            type="date"
            value={form.nextServiceDate}
            onChange={(e) =>
              setForm({ ...form, nextServiceDate: e.target.value })
            }
          />

          <select
            value={form.servicePeriod}
            onChange={(e) =>
              setForm({ ...form, servicePeriod: e.target.value })
            }
          >
            <option>1 месяц</option>
            <option>3 месяца</option>
            <option>6 месяцев</option>
            <option>12 месяцев</option>
            <option>По договору</option>
          </select>

          <textarea
            placeholder="Комментарий / история объекта"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />

          <button className="green">Добавить объект</button>
        </form>
      </section>

      <section className="panel">
        <h2>Объекты / Санатории / B2B</h2>

        {objects.length === 0 && (
          <div className="muted" style={{ padding: 24, textAlign: "center" }}>
            Объектов пока нет
          </div>
        )}

        {objects.map((item) => (
          <div className="client" key={item.id}>
            <div className="clientTop">
              <div>
                <b>{item.name}</b>

                <div className="meta">
                  Тип: {item.type}
                  <br />
                  👤 {item.contact || "Контакт не указан"}
                  <br />
                  📞 {item.phone || "Телефон не указан"}
                  <br />
                  📍 {item.address || "Адрес не указан"}
                  <br />
                  💧 Системы: {item.systems || "—"}
                  <br />
                  Дата установки: {item.installDate || "—"}
                  <br />
                  Следующий сервис: {item.nextServiceDate || "—"}
                  <br />
                  Период сервиса: {item.servicePeriod}
                  <br />
                  💬 {item.comment || "—"}
                </div>
              </div>

              <span className="badge">{item.type}</span>
            </div>

            <div className="clientActions">
              <button className="blue">Создать сервис</button>
              <button className="green">Создать сделку</button>
              <button className="red" onClick={() => deleteObject(item.id)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}