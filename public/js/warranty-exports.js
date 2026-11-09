(function (root) {
  "use strict";

  const formats = [
    ["pdf", "PDF", "ti-file-type-pdf"],
    ["xlsx", "XLSX", "ti-file-spreadsheet"],
    ["ods", "ODS", "ti-file-spreadsheet"],
    ["csv", "CSV", "ti-file-type-csv"]
  ];

  const nativeSuffix = "/front/report.dynamic.php";
  const pluginSuffix = "/plugins/warrantycolors/ExportPreview";

  function buildExportUrl(nativeHref, format, scope, baseHref) {
    if (!formats.some((f) => f[0] === format)) return null;
    if (scope !== "page" && scope !== "all") return null;

    let source;
    let base;

    try {
      base = new URL(baseHref);
      source = new URL(nativeHref, base);
    } catch (_) {
      return null;
    }

    if (source.origin !== base.origin) return null;
    if (!source.pathname.endsWith(nativeSuffix)) return null;
    if (source.searchParams.get("item_type") !== "Computer") {
      return null;
    }

    const url = new URL(source.href);
    const prefix = source.pathname.slice(0, -nativeSuffix.length);

    url.pathname = prefix + pluginSuffix;

    // Keep GLPI's criteria, sort, order and page offset.
    // Only replace native export-specific parameters.
    for (const key of [
      "item_type",
      "display_type",
      "export_all",
      "format",
      "scope"
    ]) {
      url.searchParams.delete(key);
    }

    url.searchParams.set("format", format);
    url.searchParams.set("scope", scope);

    return url.href;
  }

  function findNativeComputerExport(menu, baseHref) {
    for (const anchor of menu.querySelectorAll("a[href]")) {
      const href = anchor.getAttribute("href");
      const url = buildExportUrl(href, "xlsx", "page", baseHref);

      if (url !== null) return href;
    }

    return null;
  }

  function addSection(doc, block, nativeHref) {
    const heading = doc.createElement("h6");
    heading.className = "dropdown-header";
    heading.textContent = "Warranty Colors";
    block.appendChild(heading);

    const wrapper = doc.createElement("div");
    wrapper.className = "px-3 pb-2";

    const select = doc.createElement("select");
    select.className = "form-select form-select-sm";
    select.setAttribute(
      "aria-label",
      "Résultats à exporter avec Warranty Colors"
    );

    for (const [value, label] of [
      ["page", "Page courante"],
      ["all", "Toutes les pages"]
    ]) {
      const option = doc.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    }

    // Keep Bootstrap from closing the menu while selecting.
    select.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    wrapper.appendChild(select);
    block.appendChild(wrapper);

    const links = [];

    for (const [format, title, iconName] of formats) {
      const href = buildExportUrl(
        nativeHref, format, "page", doc.baseURI
      );

      if (!href) return false;

      const anchor = doc.createElement("a");
      anchor.className = "dropdown-item wc-export-link";
      anchor.href = href;
      anchor.setAttribute("role", "menuitem");

      const icon = doc.createElement("i");
      icon.className = "ti " + iconName;
      icon.setAttribute("aria-hidden", "true");

      anchor.appendChild(icon);
      anchor.appendChild(doc.createTextNode(" " + title));

      block.appendChild(anchor);
      links.push([anchor, format]);
    }

    select.addEventListener("change", () => {
      for (const [anchor, format] of links) {
        const href = buildExportUrl(
          nativeHref, format, select.value, doc.baseURI
        );

        if (href) anchor.href = href;
      }
    });

    return true;
  }

  function fitMenuToViewport(doc, menu) {
    const view = doc.defaultView;
    const viewportHeight = view?.innerHeight;

    if (Number.isFinite(viewportHeight)) {
      const top = Math.max(
        0,
        menu.getBoundingClientRect().top
      );

      const available = Math.max(
        160,
        Math.floor(viewportHeight - top - 12)
      );

      menu.style.maxHeight = available + "px";
    } else {
      menu.style.maxHeight = "calc(100vh - 2rem)";
    }

    menu.style.overflowY = "auto";
    menu.style.overflowX = "hidden";
    menu.style.overscrollBehavior = "contain";
  }

  function enhanceMenus(doc) {
    let added = 0;

    const menus = doc.querySelectorAll(
      '.dropdown-menu[aria-labelledby^="dropdown-export-"]'
    );

    for (const menu of menus) {
      if (menu.querySelector("[data-wc-export-block]")) {
        fitMenuToViewport(doc, menu);
        continue;
      }

      const nativeHref = findNativeComputerExport(
        menu,
        doc.baseURI
      );

      if (!nativeHref) continue;

      const block = doc.createElement("div");
      block.setAttribute("data-wc-export-block", "true");

      const separator = doc.createElement("hr");
      separator.className = "dropdown-divider";
      block.appendChild(separator);

      if (!addSection(doc, block, nativeHref)) continue;

      menu.appendChild(block);
      fitMenuToViewport(doc, menu);
      added++;
    }

    return added;
  }

  // Expose pure functions for isolated Node tests.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      buildExportUrl,
      findNativeComputerExport,
      enhanceMenus
    };
  }

  const doc = root && root.document;
  if (!doc) return;

  let scheduled = false;

  function refresh() {
    if (scheduled) return;
    scheduled = true;

    root.requestAnimationFrame(() => {
      scheduled = false;
      enhanceMenus(doc);
    });
  }

  function init() {
    refresh();

    doc.addEventListener("shown.bs.dropdown", (event) => {
      const id = event.target?.id;

      if (!id || !id.startsWith("dropdown-export-")) {
        return;
      }

      for (const menu of doc.querySelectorAll(
        '.dropdown-menu[aria-labelledby^="dropdown-export-"]'
      )) {
        if (menu.getAttribute("aria-labelledby") === id) {
          fitMenuToViewport(doc, menu);
        }
      }
    });

    if (typeof root.MutationObserver !== "undefined") {
      new root.MutationObserver(refresh).observe(doc.body, {
        childList: true,
        subtree: true
      });
    }
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
