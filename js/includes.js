// js/includes.js
document.addEventListener("DOMContentLoaded", async () => {

  const nodes = Array.from(document.querySelectorAll("[data-include]"));
  if (!nodes.length) {
    // если include нет — просто запустим инициализацию
    if (typeof window.initApp === "function") window.initApp();
    return;
  }

  try {
    await Promise.all(
      nodes.map(async (el) => {
        const file = el.getAttribute("data-include");
        const res = await fetch(file, { cache: "no-cache" });
        if (!res.ok) throw new Error(`Cannot load: ${file}`);
        const html = await res.text();
        el.outerHTML = html;
      })
    );

    // ✅ гарантированно после всех include
    document.dispatchEvent(new Event("includesLoaded"));

    // ✅ запускаем основной код проекта
    if (typeof window.initApp === "function") window.initApp();
  } catch (e) {
    console.error(e);
  }
});

