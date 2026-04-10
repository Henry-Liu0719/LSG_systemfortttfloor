(function () {
  var SHEET_JSON_URL =
    "https://opensheet.elk.sh/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/Tab";
  var MODEL_SHEET_JSON_URL =
    "https://opensheet.elk.sh/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/External";

  var fallbackStores = [
    {
      branchName: "說事實總部",
      alias: "台北店",
      address: "台北市信義區松隆路205之一號",
      phone: "02-8509-1579",
      customerCode: "A054",
      taxId: "53981220",
      fax: "02-27672310"
    },
    {
      branchName: "說事實竹北店",
      alias: "竹北店",
      address: "竹北市新瀧一街8號",
      phone: "0936-247-132",
      customerCode: "B112",
      taxId: "24876543",
      fax: "03-6678123"
    },
    {
      branchName: "說事實嘉義店",
      alias: "嘉義店",
      address: "嘉義市西區南京東街360號",
      phone: "0921-468-576",
      customerCode: "C205",
      taxId: "66554433",
      fax: "05-2865001"
    },
    {
      branchName: "說事實台南店",
      alias: "臺南店",
      address: "台南市永康區永大路二段358號",
      phone: "0983-267-115",
      customerCode: "D018",
      taxId: "70998811",
      fax: "06-3021199"
    },
    {
      branchName: "說事實高雄店",
      alias: "高雄店",
      address: "高雄鳳山區錦田路138號",
      phone: "0968-613766",
      customerCode: "E301",
      taxId: "82828811",
      fax: "07-7402255"
    }
  ];
  var fallbackModels = [
    { model: "KS-801", productName: "極致大師系列", brand: "KronoSwiss", unitArea: "0.55" },
    { model: "QS-203", productName: "至臻系列", brand: "QuickStep", unitArea: "0.48" },
    { model: "PG-502", productName: "森系列", brand: "Pergo", unitArea: "0.62" },
    { model: "DK-110", productName: "和風實木皮", brand: "Daiken", unitArea: "0.5" },
    { model: "UA-772", productName: "能量系列", brand: "Ua Floors", unitArea: "0.72" }
  ];
  var state = {
    stores: [],
    models: []
  };

  var form = document.getElementById("order-form");
  var dateInput = document.getElementById("order-date");
  var storeSelect = document.getElementById("store-select");
  var addressInput = document.getElementById("delivery-address");
  var contactInput = document.getElementById("contact-person");
  var contactPhoneInput = document.getElementById("contact-phone");
  var modelSelect = document.getElementById("model-select");
  var areaInput = document.getElementById("area");
  var errorBox = document.getElementById("form-error");
  var preview = document.getElementById("sales-order-preview");
  var printBtn = document.getElementById("print-btn");
  var orderCounter = 1;

  function setDefaultDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1);
    var day = String(today.getDate());
    if (month.length < 2) {
      month = "0" + month;
    }
    if (day.length < 2) {
      day = "0" + day;
    }
    dateInput.value = year + "-" + month + "-" + day;
  }

  function formatDateForDoc(value) {
    if (!value) {
      return "";
    }
    return value.replace(/-/g, "/");
  }

  function nextOrderNo(dateValue) {
    var dateKey = (dateValue || "").replace(/-/g, "");
    if (!dateKey) {
      dateKey = "20260417";
    }
    var seq = String(orderCounter);
    while (seq.length < 3) {
      seq = "0" + seq;
    }
    orderCounter += 1;
    return dateKey + seq;
  }

  function sanitize(text) {
    if (text === null || text === undefined) {
      return "";
    }
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeStores(rows) {
    var normalized = [];
    var i;
    for (i = 0; i < rows.length; i += 1) {
      var row = rows[i] || {};
      var branchName = row["分店名稱"] || row.branchName || "";
      var alias = row["分店暱稱"] || row.alias || branchName;
      var address = row["地址"] || row.address || "";
      var phone = row["電話"] || row.phone || "";
      var customerCode = row["客戶編號"] || row.customerCode || "";
      var taxId = row["統編"] || row["客戶統編"] || row.taxId || "";
      var fax = row["傳真"] || row.fax || "";
      if (!branchName && !alias) {
        continue;
      }
      normalized.push({
        id: String(i),
        branchName: branchName,
        alias: alias,
        address: address,
        phone: phone,
        customerCode: customerCode,
        taxId: taxId,
        fax: fax
      });
    }
    return normalized;
  }

  function normalizeModels(rows) {
    var normalized = [];
    var i;
    for (i = 0; i < rows.length; i += 1) {
      var row = rows[i] || {};
      var model = row["型號"] || row.model || "";
      var productName = row["品名"] || row.productName || "";
      var brand = row["品牌"] || row.brand || "";
      var unitArea = row["一箱坪數"] || row.unitArea || "";
      if (!model) {
        continue;
      }
      normalized.push({
        id: String(i),
        model: model,
        productName: productName,
        brand: brand,
        unitArea: unitArea
      });
    }
    return normalized;
  }

  function renderStoreOptions(stores) {
    var html = '<option value="">請選擇店名</option>';
    var i;
    for (i = 0; i < stores.length; i += 1) {
      var s = stores[i];
      var label = s.alias;
      if (s.branchName && s.branchName !== s.alias) {
        label = s.alias + " (" + s.branchName + ")";
      }
      html +=
        '<option value="' +
        sanitize(s.id) +
        '">' +
        sanitize(label) +
        "</option>";
    }
    storeSelect.innerHTML = html;
  }

  function renderModelOptions(models) {
    var html = '<option value="">請選擇型號</option>';
    var i;
    for (i = 0; i < models.length; i += 1) {
      var m = models[i];
      var label = m.model;
      if (m.productName) {
        label = m.model + " - " + m.productName;
      }
      html +=
        '<option value="' +
        sanitize(m.id) +
        '">' +
        sanitize(label) +
        "</option>";
    }
    modelSelect.innerHTML = html;
  }

  function loadStores() {
    return fetch(SHEET_JSON_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("資料來源讀取失敗");
        }
        return res.json();
      })
      .then(function (rows) {
        var parsed = normalizeStores(rows);
        if (!parsed.length) {
          throw new Error("資料來源無有效門市資料");
        }
        return parsed;
      })
      .catch(function () {
        return normalizeStores(fallbackStores);
      });
  }

  function loadModels() {
    return fetch(MODEL_SHEET_JSON_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("型號資料來源讀取失敗");
        }
        return res.json();
      })
      .then(function (rows) {
        var parsed = normalizeModels(rows);
        if (!parsed.length) {
          throw new Error("型號資料來源無有效資料");
        }
        return parsed;
      })
      .catch(function () {
        return normalizeModels(fallbackModels);
      });
  }

  function applyStoreInfo() {
    var selectedId = storeSelect.value;
    var i;
    for (i = 0; i < state.stores.length; i += 1) {
      if (state.stores[i].id === selectedId) {
        addressInput.value = state.stores[i].address;
        return;
      }
    }
  }

  function validate() {
    if (
      !dateInput.value ||
      !storeSelect.value ||
      !addressInput.value ||
      !contactInput.value ||
      !contactPhoneInput.value ||
      !modelSelect.value ||
      !areaInput.value
    ) {
      return "請完整填寫所有欄位";
    }

    var area = Number(areaInput.value);
    if (isNaN(area) || area <= 0) {
      return "坪數必須大於 0";
    }
    return "";
  }

  function buildRuntimeDoc() {
    var selectedStore = null;
    var selectedModel = null;
    var i;
    for (i = 0; i < state.stores.length; i += 1) {
      if (state.stores[i].id === storeSelect.value) {
        selectedStore = state.stores[i];
        break;
      }
    }
    for (i = 0; i < state.models.length; i += 1) {
      if (state.models[i].id === modelSelect.value) {
        selectedModel = state.models[i];
        break;
      }
    }

    var doc = {
      customerName: selectedStore ? selectedStore.branchName || selectedStore.alias || "" : "",
      customerCode: selectedStore ? selectedStore.customerCode || "" : "",
      taxId: selectedStore ? selectedStore.taxId || "" : "",
      contactPerson: contactInput.value || "",
      contactPhone: contactPhoneInput.value || "",
      tel: selectedStore ? selectedStore.phone || "" : "",
      fax: selectedStore ? selectedStore.fax || "" : "",
      deliveryAddress: addressInput.value || "",
      orderDate: formatDateForDoc(dateInput.value),
      orderNo: nextOrderNo(dateInput.value),
      invoiceCode: "",
      pageText: "第 1 頁,共 1 頁",
      items: []
    };

    if (selectedModel) {
      doc.items.push({
        no: "1",
        nameSpec:
          selectedModel.model +
          (selectedModel.productName ? " / " + selectedModel.productName : ""),
        qty: areaInput.value || "",
        unit: "坪",
        unitPrice: "",
        subtotal: "",
        remark: ""
      });
    }
    return doc;
  }

  function buildPreview() {
    var doc = buildRuntimeDoc();
    var rowsHtml = "";
    var i;
    for (i = 0; i < doc.items.length; i += 1) {
      var item = doc.items[i];
      rowsHtml += "<tr>";
      rowsHtml += "<td>" + sanitize(item.no) + "</td>";
      rowsHtml += "<td>" + sanitize(item.nameSpec) + "</td>";
      rowsHtml += "<td>" + sanitize(item.qty) + "</td>";
      rowsHtml += "<td>" + sanitize(item.unit) + "</td>";
      rowsHtml += "<td>" + sanitize(item.unitPrice) + "</td>";
      rowsHtml += "<td>" + sanitize(item.subtotal) + "</td>";
      rowsHtml += "<td>" + sanitize(item.remark) + "</td>";
      rowsHtml += "</tr>";
    }

    var html = "";
    html += '<div class="so-head-row">';
    html += '<div class="so-plate">車號:</div>';
    html += '<h3 class="so-title">銷　貨　單</h3>';
    html += '<div class="so-page">' + sanitize(doc.pageText) + "</div>";
    html += "</div>";
    html += '<div class="so-meta-box">';
    html += '<div class="so-meta-left">';
    html += '<div class="so-line"><span class="so-k">客戶名稱：</span><span class="so-v">' + sanitize(doc.customerName) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">客戶統編：</span><span class="so-v">' + sanitize(doc.taxId) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">電話號碼：</span><span class="so-v">' + sanitize(doc.tel) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">送貨地址：</span><span class="so-v">' + sanitize(doc.deliveryAddress) + "</span></div>";
    html += "</div>";
    html += '<div class="so-meta-right">';
    html += '<div class="so-line"><span class="so-k">客戶編號：</span><span class="so-v">' + sanitize(doc.customerCode) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">聯絡人：</span><span class="so-v">' + sanitize(doc.contactPerson) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">聯絡人電話：</span><span class="so-v">' + sanitize(doc.contactPhone) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">傳　真：</span><span class="so-v">' + sanitize(doc.fax) + "</span></div>";
    html += "</div>";
    html += '<div class="so-meta-right-2">';
    html += '<div class="so-line"><span class="so-k">單據日期：</span><span class="so-v">' + sanitize(doc.orderDate) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">單據編號：</span><span class="so-v">' + sanitize(doc.orderNo) + "</span></div>";
    html += '<div class="so-line"><span class="so-k">發票號碼：</span><span class="so-v">' + sanitize(doc.invoiceCode) + "</span></div>";
    html += "</div>";
    html += "</div>";
    html += '<table class="so-table so-detail">';
    html += "<thead><tr>";
    html += "<th>序</th><th>品　名 / 規　格</th><th>數量</th><th>單位</th><th>單價</th><th>銷貨小計</th><th>附註</th>";
    html += "</tr></thead>";
    html += "<tbody>" + rowsHtml + "</tbody>";
    html += "</table>";
    html += '<div class="so-note-line">單據備註</div>';
    html += '<div class="so-sign-line">';
    html += "<span>司機：</span>";
    html += "<span>跟車：</span>";
    html += "<span>倉庫趨數：</span>";
    html += "<span>倉管：</span>";
    html += "<span>製單：</span>";
    html += "<span>簽收：</span>";
    html += "</div>";

    preview.classList.remove("empty");
    preview.innerHTML = html;
  }

  function bootstrap() {
    setDefaultDate();
    loadStores().then(function (stores) {
      state.stores = stores;
      renderStoreOptions(stores);
    });
    loadModels().then(function (models) {
      state.models = models;
      renderModelOptions(models);
    });

    storeSelect.addEventListener("change", applyStoreInfo);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var error = validate();
      if (error) {
        errorBox.textContent = error;
        errorBox.classList.remove("hidden");
        return;
      }
      errorBox.classList.add("hidden");
      buildPreview();
    });

    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  bootstrap();
})();
