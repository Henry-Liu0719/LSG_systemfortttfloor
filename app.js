(function () {
  var SHEET_JSON_URL =
    "https://opensheet.elk.sh/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/Tab";
  var STORE_GVIZ_URL =
    "https://docs.google.com/spreadsheets/d/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/gviz/tq?gid=1653715763&tqx=out:json";
  var MODEL_SHEET_JSON_URL =
    "https://opensheet.elk.sh/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/External";
  var MODEL_GVIZ_URL =
    "https://docs.google.com/spreadsheets/d/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/gviz/tq?gid=1666483658&tqx=out:json";
  var ACCESSORY_GVIZ_URL =
    "https://docs.google.com/spreadsheets/d/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/gviz/tq?gid=1816861047&tqx=out:json";

  var fallbackStores = [
    // {
    //   branchName: "說事實總部",
    //   alias: "台北店",
    //   address: "台北市信義區松隆路205之一號",
    //   phone: "02-8509-1579",
    //   customerCode: "A054",
    //   taxId: "53981220",
    //   fax: "02-27672310",
    //   contactPerson: "王小明"
    // },
    // {
    //   branchName: "說事實竹北店",
    //   alias: "竹北店",
    //   address: "竹北市新瀧一街8號",
    //   phone: "0936-247-132",
    //   customerCode: "B112",
    //   taxId: "24876543",
    //   fax: "03-6678123",
    //   contactPerson: "李小華"
    // },
    // {
    //   branchName: "說事實嘉義店",
    //   alias: "嘉義店",
    //   address: "嘉義市西區南京東街360號",
    //   phone: "0921-468-576",
    //   customerCode: "C205",
    //   taxId: "66554433",
    //   fax: "05-2865001",
    //   contactPerson: "陳志明"
    // },
    // {
    //   branchName: "說事實台南店",
    //   alias: "臺南店",
    //   address: "台南市永康區永大路二段358號",
    //   phone: "0983-267-115",
    //   customerCode: "D018",
    //   taxId: "70998811",
    //   fax: "06-3021199",
    //   contactPerson: "黃怡君"
    // },
    {
      branchName: "說事實高雄店",
      alias: "高雄店",
      address: "高雄鳳山區錦田路138號",
      phone: "0968-613766",
      customerCode: "E301",
      taxId: "82828811",
      fax: "07-7402255",
      contactPerson: "張雅婷"
    }
  ];
  var fallbackModels = [
    { model: "KS-801", productName: "極致大師系列", brand: "KronoSwiss", unitArea: "0.55", unit: "箱", unitPrice: "3500" },
    // { model: "QS-203", productName: "至臻系列", brand: "QuickStep", unitArea: "0.48", unit: "箱", unitPrice: "3200" },
    // { model: "PG-502", productName: "森系列", brand: "Pergo", unitArea: "0.62", unit: "箱", unitPrice: "3000" },
    // { model: "DK-110", productName: "和風實木皮", brand: "Daiken", unitArea: "0.5", unit: "箱", unitPrice: "2800" },
    // { model: "UA-772", productName: "能量系列", brand: "Ua Floors", unitArea: "0.72", unit: "箱", unitPrice: "2600" }
  ];
  var fallbackAccessories = [
    { name: "底襯（卷）", spec: "2mm", rollArea: "15", unitPrice: "10" },
    { name: "底襯（卷）", spec: "1mm", rollArea: "15", unitPrice: "20" },
    { name: "壓條", spec: "240cm", rollArea: "30", unitPrice: "" }
  ];
  var state = {
    stores: [],
    models: [],
    accessories: [],
    draftItems: []
  };

  var form = document.getElementById("order-form");
  var dateInput = document.getElementById("order-date");
  var storeSelect = document.getElementById("store-select");
  var addressInput = document.getElementById("delivery-address");
  var taxIdInput = document.getElementById("tax-id");
  var contactInput = document.getElementById("contact-person");
  var contactPhoneInput = document.getElementById("contact-phone");
  var modelSelect = document.getElementById("model-select");
  var accessorySelect = document.getElementById("accessory-select");
  var areaInput = document.getElementById("area");
  var quantityInput = document.getElementById("quantity");
  var previewTotalPackages = document.getElementById("preview-total-packages");
  var previewActualArea = document.getElementById("preview-actual-area");
  var previewTotalPrice = document.getElementById("preview-total-price");
  var addItemBtn = document.getElementById("add-item-btn");
  var draftItemsBody = document.getElementById("draft-items-body");
  var errorBox = document.getElementById("form-error");
  var preview = document.getElementById("sales-order-preview");
  var printBtn = document.getElementById("print-btn");
  var printGuideBtn = document.getElementById("print-guide-btn");
  var printGuideModal = document.getElementById("print-guide-modal");
  var closePrintGuideBtn = document.getElementById("close-print-guide-btn");
  var orderCounter = 1;
  var originalDocumentTitle = document.title;
  var lastEditedMeasureField = "";

  function storeLabel(store) {
    var label = store.alias;
    if (store.branchName && store.branchName !== store.alias) {
      label = store.alias + " (" + store.branchName + ")";
    }
    return label;
  }

  function modelLabel(model) {
    var nameLabel = model.name || model.productName || model.model;
    var packageAreaLabel = model.packageArea || model.unitArea || "-";
    return nameLabel + "(" + packageAreaLabel + ")";
  }

  function accessoryLabel(accessory) {
    var rollArea = accessory.rollArea ? accessory.rollArea : "-";
    var unitPrice = accessory.unitPrice ? accessory.unitPrice : "-";
    return accessory.name + " | " + accessory.spec + " | " + rollArea + " | " + unitPrice;
  }

  function getJquery() {
    if (window.jQuery) {
      return window.jQuery;
    }
    return null;
  }

  function hasSelect2() {
    var $ = getJquery();
    return !!($ && $.fn && $.fn.select2);
  }

  function initSelect2() {
    var $ = getJquery();
    if (!hasSelect2()) {
      return;
    }
    $(storeSelect).select2({
      width: "100%",
      placeholder: "請選擇店名",
      allowClear: true
    });
    $(modelSelect).select2({
      width: "100%",
      placeholder: "請選擇型號",
      allowClear: true
    });
    $(accessorySelect).select2({
      width: "100%",
      placeholder: "請選擇配件",
      allowClear: true
    });

    // Ensure store auto-fill works consistently under Select2 interactions.
    $(storeSelect).on("change select2:select select2:clear", applyStoreInfo);
    // Ensure model preview updates consistently under Select2 interactions.
    $(modelSelect).on("change select2:select select2:clear", handleModelChange);
    // Ensure accessory preview updates consistently under Select2 interactions.
    $(accessorySelect).on("change select2:select select2:clear", handleAccessoryChange);
  }

  function refreshSelect2(selectElement) {
    var $ = getJquery();
    if (!hasSelect2()) {
      return;
    }
    $(selectElement).trigger("change.select2");
  }

  function setSelectValue(selectElement, value) {
    var $ = getJquery();
    selectElement.value = value;
    if (hasSelect2()) {
      $(selectElement).trigger("change");
    }
  }

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
      var alias = row["分店暱稱"] || row["別名"] || row.alias || branchName;
      var address = row["地址"] || row.address || "";
      var phone = row["電話"] || row.phone || "";
      var customerCode = row["客戶編號"] || row["客戶代碼"] || row.customerCode || "";
      var taxId = row["統編"] || row["客戶統編"] || row["統一編號"] || row.taxId || "";
      var fax = row["傳真"] || row.fax || "";
      var contactPerson = row["聯絡人"] || row.contactPerson || "";
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
        fax: fax,
        contactPerson: contactPerson
      });
    }
    return normalized;
  }

  function normalizeModels(rows) {
    var normalized = [];
    var i;
    for (i = 0; i < rows.length; i += 1) {
      var row = rows[i] || {};
      var model = row["型號"] || row.model || row["名稱"] || "";
      var productName = row["品名"] || row["產品名稱"] || row.productName || row["名稱"] || "";
      var brand = row["品牌"] || row.brand || "";
      var unitArea = row["一箱坪數"] || row["單位面積(坪)"] || row.unitArea || "";
      var unit = row["單位"] || row.unit || "坪";
      var unitPrice = row["單價"] || row["單價(TWD)"] || row.unitPrice || "";
      var name = row["名稱"] || row["品名"] || row["產品名稱"] || row.productName || model;
      var series = row["系列"] || row.series || "";
      var style = row["款式"] || row["樣式"] || row.style || "";
      var thickness = row["厚度(mm)"] || row["厚度"] || row.thickness || "";
      var length = row["長(mm)"] || row["長度(mm)"] || row["長度"] || row.length || "";
      var width = row["寬(mm)"] || row["寬度(mm)"] || row["寬度"] || row.width || "";
      var packageArea = row["每包坪數"] || row["每包/坪數"] || row.packageArea || unitArea;
      var piecesPerPackage = row["每包片數"] || row["每包/片數"] || row.piecesPerPackage || "";
      if (!model && !name) {
        continue;
      }
      normalized.push({
        id: String(i),
        model: model,
        productName: productName,
        brand: brand,
        unitArea: unitArea,
        unit: unit,
        unitPrice: unitPrice,
        name: name,
        series: series,
        style: style,
        thickness: thickness,
        length: length,
        width: width,
        packageArea: packageArea,
        piecesPerPackage: piecesPerPackage
      });
    }
    return normalized;
  }

  function normalizeAccessories(rows) {
    var normalized = [];
    var i;
    for (i = 0; i < rows.length; i += 1) {
      var row = rows[i] || {};
      var name = row["名稱"] || row.name || "";
      var spec = row["規格"] || row.spec || "";
      var rollArea = row["每卷坪數"] || row.rollArea || "";
      var unitPrice = row["單價"] || row.unitPrice || "";
      if (!name && !spec) {
        continue;
      }
      normalized.push({
        id: String(i),
        name: name,
        spec: spec,
        rollArea: rollArea,
        unitPrice: unitPrice
      });
    }
    return normalized;
  }

  function renderStoreOptions(stores) {
    var html = '<option value="">請選擇店名</option>';
    var i;
    for (i = 0; i < stores.length; i += 1) {
      var s = stores[i];
      var label = storeLabel(s);
      html +=
        '<option value="' +
        sanitize(s.id) +
        '">' +
        sanitize(label) +
        "</option>";
    }
    storeSelect.innerHTML = html;
    refreshSelect2(storeSelect);
  }

  function renderModelOptions(models) {
    var html = '<option value="">請選擇型號</option>';
    var i;
    for (i = 0; i < models.length; i += 1) {
      var m = models[i];
      var label = modelLabel(m);
      html +=
        '<option value="' +
        sanitize(m.id) +
        '">' +
        sanitize(label) +
        "</option>";
    }
    modelSelect.innerHTML = html;
    refreshSelect2(modelSelect);
  }

  function renderAccessoryOptions(accessories) {
    var html = '<option value="">請選擇配件</option>';
    var i;
    for (i = 0; i < accessories.length; i += 1) {
      var a = accessories[i];
      var label = accessoryLabel(a);
      html +=
        '<option value="' +
        sanitize(a.id) +
        '">' +
        sanitize(label) +
        "</option>";
    }
    accessorySelect.innerHTML = html;
    refreshSelect2(accessorySelect);
  }

  function loadStores() {
    return fetch(STORE_GVIZ_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("GViz 讀取失敗，HTTP " + String(res.status));
        }
        return res.text();
      })
      .then(function (raw) {
        var rows = parseGvizRows(raw);
        var parsed = normalizeStores(rows);
        if (!parsed.length) {
          throw new Error("GViz 門市資料為空");
        }
        return parsed;
      })
      .catch(function (gvizError) {
        return fetch(SHEET_JSON_URL)
          .then(function (res) {
            if (!res.ok) {
              throw new Error("OpenSheet 讀取失敗，HTTP " + String(res.status));
            }
            return res.json();
          })
          .then(function (rows) {
            var parsed = normalizeStores(rows);
            if (!parsed.length) {
              throw new Error("OpenSheet 門市資料為空");
            }
            return parsed;
          })
          .catch(function (openSheetError) {
            if (window.console && typeof window.console.warn === "function") {
              window.console.warn("loadStores: 線上資料讀取失敗，改用 fallbackStores", {
                gvizError: gvizError ? gvizError.message : "",
                openSheetError: openSheetError ? openSheetError.message : ""
              });
            }
            return normalizeStores(fallbackStores);
          });
      });
  }

  function loadModels() {
    return fetch(MODEL_GVIZ_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("GViz 讀取失敗，HTTP " + String(res.status));
        }
        return res.text();
      })
      .then(function (raw) {
        var rows = parseGvizRows(raw);
        var parsed = normalizeModels(rows);
        if (!parsed.length) {
          throw new Error("GViz 型號資料為空");
        }
        return parsed;
      })
      .catch(function (gvizError) {
        return fetch(MODEL_SHEET_JSON_URL)
          .then(function (res) {
            if (!res.ok) {
              throw new Error("OpenSheet 讀取失敗，HTTP " + String(res.status));
            }
            return res.json();
          })
          .then(function (rows) {
            var parsed = normalizeModels(rows);
            if (!parsed.length) {
              throw new Error("OpenSheet 型號資料為空");
            }
            return parsed;
          })
          .catch(function (openSheetError) {
            if (window.console && typeof window.console.warn === "function") {
              window.console.warn("loadModels: 線上資料讀取失敗，改用 fallbackModels", {
                gvizError: gvizError ? gvizError.message : "",
                openSheetError: openSheetError ? openSheetError.message : ""
              });
            }
            return normalizeModels(fallbackModels);
          });
      });
  }

  function loadAccessories() {
    return fetch(ACCESSORY_GVIZ_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("GViz 讀取失敗，HTTP " + String(res.status));
        }
        return res.text();
      })
      .then(function (raw) {
        var rows = parseGvizRows(raw);
        var parsed = normalizeAccessories(rows);
        if (!parsed.length) {
          throw new Error("GViz 配件資料為空");
        }
        return parsed;
      })
      .catch(function () {
        return normalizeAccessories(fallbackAccessories);
      });
  }

  function parseGvizRows(raw) {
    var prefix = "google.visualization.Query.setResponse(";
    var start = raw.indexOf(prefix);
    var jsonText = raw;
    var payload;
    var table;
    var cols;
    var rows;
    var result = [];
    var i;
    if (start > -1) {
      jsonText = raw.substring(start + prefix.length);
      if (jsonText.lastIndexOf(");") === jsonText.length - 2) {
        jsonText = jsonText.substring(0, jsonText.length - 2);
      }
    }
    payload = JSON.parse(jsonText);
    table = payload && payload.table ? payload.table : null;
    cols = table && table.cols ? table.cols : [];
    rows = table && table.rows ? table.rows : [];

    for (i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var cells = row && row.c ? row.c : [];
      var item = {};
      var j;
      for (j = 0; j < cols.length; j += 1) {
        var col = cols[j] || {};
        var key = col.label || col.id || ("col" + String(j));
        var cell = cells[j];
        item[key] = cell && cell.v !== undefined && cell.v !== null ? cell.v : "";
      }
      result.push(item);
    }
    return result;
  }

  function applyStoreInfo() {
    var selectedStore = getSelectedStore();
    if (!selectedStore) {
      taxIdInput.value = "";
      contactInput.value = "";
      contactPhoneInput.value = "";
      return;
    }
    taxIdInput.value = selectedStore.taxId || "";
    contactInput.value = selectedStore.contactPerson || "";
    contactPhoneInput.value = selectedStore.phone || "";
  }

  function validate() {
    var taxIdValue = String(taxIdInput.value || "").replace(/\s/g, "");
    if (
      !dateInput.value ||
      !storeSelect.value ||
      !addressInput.value ||
      !taxIdValue ||
      !contactInput.value ||
      !contactPhoneInput.value
    ) {
      return "請完整填寫所有欄位";
    }
    if (!/^\d{8}$/.test(taxIdValue)) {
      return "統編格式錯誤，請輸入 8 碼數字";
    }
    taxIdInput.value = taxIdValue;

    if (!state.draftItems.length) {
      return "請先添加至少一筆明細";
    }
    return "";
  }

  function getSelectedStore() {
    var selectedStore = null;
    var i;
    for (i = 0; i < state.stores.length; i += 1) {
      if (state.stores[i].id === storeSelect.value) {
        selectedStore = state.stores[i];
        break;
      }
    }
    return selectedStore;
  }

  function getSelectedModel() {
    var selectedModel = null;
    var i;
    for (i = 0; i < state.models.length; i += 1) {
      if (state.models[i].id === modelSelect.value) {
        selectedModel = state.models[i];
        break;
      }
    }
    return selectedModel;
  }

  function getSelectedAccessory() {
    var selectedAccessory = null;
    var i;
    for (i = 0; i < state.accessories.length; i += 1) {
      if (state.accessories[i].id === accessorySelect.value) {
        selectedAccessory = state.accessories[i];
        break;
      }
    }
    return selectedAccessory;
  }

  function getSelectedProduct() {
    var model = getSelectedModel();
    if (model) {
      return {
        type: "model",
        data: model
      };
    }
    var accessory = getSelectedAccessory();
    if (accessory) {
      return {
        type: "accessory",
        data: accessory
      };
    }
    return null;
  }

  function toFixedTrimmed(value, digits) {
    if (isNaN(value)) {
      return "";
    }
    var text = Number(value).toFixed(digits);
    text = text.replace(/\.?0+$/, "");
    return text;
  }

  function clearAreaPreview() {
    previewTotalPackages.textContent = "--";
    previewActualArea.textContent = "--";
    previewTotalPrice.textContent = "--";
  }

  function getSelectedModelPackageArea(selectedModel) {
    return Number(selectedModel ? (selectedModel.packageArea || selectedModel.unitArea) : 0);
  }

  function getSelectedAccessoryRollArea(selectedAccessory) {
    return Number(selectedAccessory ? selectedAccessory.rollArea : 0);
  }

  function calcItemMetrics(selectedModel, area) {
    var packageArea = Number(selectedModel ? (selectedModel.packageArea || selectedModel.unitArea) : 0);
    var unitPrice = Number(selectedModel ? selectedModel.unitPrice : 0);
    var packageCount = 0;
    var actualArea = area;
    var hasRemainder = false;
    var totalPrice = 0;

    if (!isNaN(packageArea) && packageArea > 0 && !isNaN(area) && area > 0) {
      var rawPackageCount = area / packageArea;
      packageCount = Math.ceil(rawPackageCount);
      hasRemainder = Math.abs(rawPackageCount - Math.round(rawPackageCount)) > 0.000001;
      actualArea = packageCount * packageArea;
    }

    if (!isNaN(unitPrice) && unitPrice > 0) {
      if (packageCount > 0) {
        totalPrice = packageCount * unitPrice;
      } else if (!isNaN(area) && area > 0) {
        totalPrice = area * unitPrice;
      }
    }

    return {
      packageArea: packageArea,
      packageCount: packageCount,
      actualArea: actualArea,
      hasRemainder: hasRemainder,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };
  }

  function calcItemMetricsByQuantity(selectedModel, quantity) {
    var packageArea = getSelectedModelPackageArea(selectedModel);
    var unitPrice = Number(selectedModel ? selectedModel.unitPrice : 0);
    var actualArea = 0;
    var totalPrice = 0;
    if (!isNaN(packageArea) && packageArea > 0 && !isNaN(quantity) && quantity > 0) {
      actualArea = quantity * packageArea;
    }
    if (!isNaN(unitPrice) && unitPrice > 0 && !isNaN(quantity) && quantity > 0) {
      totalPrice = quantity * unitPrice;
    }
    return {
      packageArea: packageArea,
      packageCount: quantity,
      actualArea: actualArea,
      hasRemainder: false,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };
  }

  function calcAccessoryMetrics(selectedAccessory, area) {
    var rollArea = getSelectedAccessoryRollArea(selectedAccessory);
    var unitPrice = Number(selectedAccessory ? selectedAccessory.unitPrice : 0);
    var packageCount = 0;
    var actualArea = area;
    var totalPrice = 0;

    if (!isNaN(rollArea) && rollArea > 0 && !isNaN(area) && area > 0) {
      packageCount = Math.ceil(area / rollArea);
      actualArea = packageCount * rollArea;
    }

    if (!isNaN(unitPrice) && unitPrice > 0 && packageCount > 0) {
      totalPrice = packageCount * unitPrice;
    }

    return {
      packageArea: rollArea,
      packageCount: packageCount,
      actualArea: actualArea,
      hasRemainder: false,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };
  }

  function calcAccessoryMetricsByQuantity(selectedAccessory, quantity) {
    var rollArea = getSelectedAccessoryRollArea(selectedAccessory);
    var unitPrice = Number(selectedAccessory ? selectedAccessory.unitPrice : 0);
    var actualArea = 0;
    var totalPrice = 0;
    if (!isNaN(rollArea) && rollArea > 0 && !isNaN(quantity) && quantity > 0) {
      actualArea = quantity * rollArea;
    }
    if (!isNaN(unitPrice) && unitPrice > 0 && !isNaN(quantity) && quantity > 0) {
      totalPrice = quantity * unitPrice;
    }
    return {
      packageArea: rollArea,
      packageCount: quantity,
      actualArea: actualArea,
      hasRemainder: false,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };
  }

  function syncFromAreaInput() {
    var selectedProduct = getSelectedProduct();
    var area = Number(areaInput.value);
    var packageArea = 0;
    if (selectedProduct && selectedProduct.type === "model") {
      packageArea = getSelectedModelPackageArea(selectedProduct.data);
    } else if (selectedProduct && selectedProduct.type === "accessory") {
      packageArea = getSelectedAccessoryRollArea(selectedProduct.data);
    }
    if (!selectedProduct || isNaN(area) || area <= 0 || isNaN(packageArea) || packageArea <= 0) {
      if (lastEditedMeasureField === "area" || !areaInput.value) {
        quantityInput.value = "";
      }
      return;
    }
    quantityInput.value = String(Math.ceil(area / packageArea));
  }

  function syncFromQuantityInput() {
    var selectedProduct = getSelectedProduct();
    var quantity = Number(quantityInput.value);
    var packageArea = 0;
    if (selectedProduct && selectedProduct.type === "model") {
      packageArea = getSelectedModelPackageArea(selectedProduct.data);
    } else if (selectedProduct && selectedProduct.type === "accessory") {
      packageArea = getSelectedAccessoryRollArea(selectedProduct.data);
    }
    if (!selectedProduct || isNaN(quantity) || quantity <= 0 || isNaN(packageArea) || packageArea <= 0) {
      if (lastEditedMeasureField === "quantity" || !quantityInput.value) {
        areaInput.value = "";
      }
      return;
    }
    areaInput.value = toFixedTrimmed(quantity * packageArea, 2);
  }

  function handleModelChange() {
    if (modelSelect.value) {
      setSelectValue(accessorySelect, "");
    }
    if (lastEditedMeasureField === "quantity" && quantityInput.value) {
      syncFromQuantityInput();
    } else {
      syncFromAreaInput();
    }
    updateAreaPreview();
  }

  function handleAccessoryChange() {
    if (accessorySelect.value) {
      setSelectValue(modelSelect, "");
    }
    if (lastEditedMeasureField === "quantity" && quantityInput.value) {
      syncFromQuantityInput();
    } else {
      syncFromAreaInput();
    }
    updateAreaPreview();
  }

  function updateAreaPreview() {
    var selectedProduct = getSelectedProduct();
    var area = Number(areaInput.value);
    if (!selectedProduct) {
      clearAreaPreview();
      return;
    }
    var quantity = Number(quantityInput.value);
    var metrics;

    if (selectedProduct.type === "model") {
      if (!isNaN(quantity) && quantity > 0 && lastEditedMeasureField === "quantity") {
        metrics = calcItemMetricsByQuantity(selectedProduct.data, quantity);
      } else if (!isNaN(area) && area > 0) {
        metrics = calcItemMetrics(selectedProduct.data, area);
      } else if (!isNaN(quantity) && quantity > 0) {
        metrics = calcItemMetricsByQuantity(selectedProduct.data, quantity);
      } else {
        clearAreaPreview();
        return;
      }
    } else {
      if (!isNaN(quantity) && quantity > 0 && lastEditedMeasureField === "quantity") {
        metrics = calcAccessoryMetricsByQuantity(selectedProduct.data, quantity);
      } else if (!isNaN(area) && area > 0) {
        metrics = calcAccessoryMetrics(selectedProduct.data, area);
      } else if (!isNaN(quantity) && quantity > 0) {
        metrics = calcAccessoryMetricsByQuantity(selectedProduct.data, quantity);
      } else {
        clearAreaPreview();
        return;
      }
    }

    if (metrics.packageCount > 0) {
      previewTotalPackages.textContent = String(metrics.packageCount);
      previewActualArea.textContent = toFixedTrimmed(metrics.actualArea, 2);
      if (metrics.unitPrice > 0) {
        previewTotalPrice.textContent = toFixedTrimmed(metrics.totalPrice, 2);
      } else {
        previewTotalPrice.textContent = "--";
      }
      return;
    }

    previewTotalPackages.textContent = "-";
    previewActualArea.textContent = toFixedTrimmed(metrics.actualArea, 2);
    if (metrics.unitPrice > 0) {
      previewTotalPrice.textContent = toFixedTrimmed(metrics.totalPrice, 2);
    } else {
      previewTotalPrice.textContent = "--";
    }
  }

  function renderDraftItems() {
    var html = "";
    var i;
    if (!state.draftItems.length) {
      draftItemsBody.innerHTML = '<tr><td colspan="8">尚未添加明細</td></tr>';
      return;
    }
    for (i = 0; i < state.draftItems.length; i += 1) {
      var item = state.draftItems[i];
      html += "<tr>";
      html +=
        '<td><button type="button" class="toggle-item-info-btn" data-index="' +
        sanitize(String(i)) +
        '">查看</button></td>';
      html +=
        '<td><button type="button" class="remove-item-btn" data-index="' +
        sanitize(String(i)) +
        '">刪除</button></td>';
      html += "<td>" + sanitize(item.name) + "</td>";
      html += "<td>" + sanitize(item.series) + "</td>";
      html += "<td>" + sanitize(item.style) + "</td>";
      html += "<td>" + sanitize(item.unitPrice) + "</td>";
      html += "<td>" + sanitize(item.totalPackages) + "</td>";
      html += "<td>" + sanitize(item.totalPrice) + "</td>";
      html += "</tr>";
      html += '<tr class="item-info-row hidden" data-index="' + sanitize(String(i)) + '">';
      html += '<td colspan="8">';
      html += '<div class="item-info-card">';
      html += '<div class="item-info-entry"><span class="item-info-key">厚度(mm)：</span><span class="item-info-value">' + sanitize(item.thickness) + "</span></div>";
      html += '<div class="item-info-entry"><span class="item-info-key">長(mm)：</span><span class="item-info-value">' + sanitize(item.length) + "</span></div>";
      html += '<div class="item-info-entry"><span class="item-info-key">寬(mm)：</span><span class="item-info-value">' + sanitize(item.width) + "</span></div>";
      html += '<div class="item-info-entry"><span class="item-info-key">實際坪數：</span><span class="item-info-value">' + sanitize(item.actualArea) + "</span></div>";
      html += '<div class="item-info-entry"><span class="item-info-key">每包坪數：</span><span class="item-info-value">' + sanitize(item.packageArea) + "</span></div>";
      html += '<div class="item-info-entry"><span class="item-info-key">每包片數：</span><span class="item-info-value">' + sanitize(item.piecesPerPackage) + "</span></div>";
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
    draftItemsBody.innerHTML = html;
  }

  function toggleDraftItemInfo(index) {
    var infoRow = draftItemsBody.querySelector('.item-info-row[data-index="' + String(index) + '"]');
    var toggleBtn = draftItemsBody.querySelector('.toggle-item-info-btn[data-index="' + String(index) + '"]');
    if (!infoRow || !toggleBtn) {
      return;
    }
    if (infoRow.classList.contains("hidden")) {
      infoRow.classList.remove("hidden");
      toggleBtn.textContent = "收合";
    } else {
      infoRow.classList.add("hidden");
      toggleBtn.textContent = "查看";
    }
  }

  function addDraftItem() {
    var selectedModel = getSelectedModel();
    var selectedAccessory = getSelectedAccessory();
    var area = Number(areaInput.value);
    var quantity = Number(quantityInput.value);
    var quantityDisplay = "";
    var actualAreaDisplay = "";
    var totalPriceDisplay = "";
    var totalPackagesDisplay = "";
    if (!selectedModel && !selectedAccessory) {
      errorBox.textContent = "請先選擇型號或配件";
      errorBox.classList.remove("hidden");
      return;
    }
    if ((isNaN(area) || area <= 0) && (isNaN(quantity) || quantity <= 0)) {
      errorBox.textContent = "請輸入坪數或數量，且必須大於 0";
      errorBox.classList.remove("hidden");
      return;
    }

    var metrics;
    var isModelItem = !!selectedModel;
    if (isModelItem) {
      if (!isNaN(quantity) && quantity > 0 && lastEditedMeasureField === "quantity") {
        metrics = calcItemMetricsByQuantity(selectedModel, quantity);
      } else if (!isNaN(area) && area > 0) {
        metrics = calcItemMetrics(selectedModel, area);
      } else {
        metrics = calcItemMetricsByQuantity(selectedModel, quantity);
      }
    } else {
      if (!isNaN(quantity) && quantity > 0 && lastEditedMeasureField === "quantity") {
        metrics = calcAccessoryMetricsByQuantity(selectedAccessory, quantity);
      } else if (!isNaN(area) && area > 0) {
        metrics = calcAccessoryMetrics(selectedAccessory, area);
      } else {
        metrics = calcAccessoryMetricsByQuantity(selectedAccessory, quantity);
      }
    }

    if (metrics.packageCount <= 0 && metrics.actualArea <= 0) {
      errorBox.textContent = "無法依目前型號換算數量或坪數";
      errorBox.classList.remove("hidden");
      return;
    }

    if (metrics.packageCount > 0) {
      quantityDisplay = String(metrics.packageCount);
      totalPackagesDisplay = String(metrics.packageCount);
      actualAreaDisplay = toFixedTrimmed(metrics.actualArea, 2);
      if (metrics.unitPrice > 0) {
        totalPriceDisplay = toFixedTrimmed(metrics.totalPrice, 2);
      }
      errorBox.classList.add("hidden");
    } else {
      quantityDisplay = toFixedTrimmed(area, 2);
      totalPackagesDisplay = "-";
      actualAreaDisplay = toFixedTrimmed(area, 2);
      if (metrics.unitPrice > 0) {
        totalPriceDisplay = toFixedTrimmed(metrics.totalPrice, 2);
      }
      errorBox.classList.add("hidden");
    }

    state.draftItems.push({
      no: String(state.draftItems.length + 1),
      name: isModelItem
        ? selectedModel.name || selectedModel.productName || selectedModel.model || ""
        : selectedAccessory.name || "",
      series: isModelItem ? selectedModel.series || selectedModel.brand || "" : "配件",
      style: isModelItem ? selectedModel.style || "" : selectedAccessory.spec || "",
      thickness: isModelItem ? selectedModel.thickness || "" : "",
      length: isModelItem ? selectedModel.length || "" : "",
      width: isModelItem ? selectedModel.width || "" : "",
      packageArea: isModelItem
        ? selectedModel.packageArea || selectedModel.unitArea || ""
        : selectedAccessory.rollArea || "",
      piecesPerPackage: isModelItem ? selectedModel.piecesPerPackage || "" : "",
      totalPackages: totalPackagesDisplay,
      actualArea: actualAreaDisplay,
      totalPrice: totalPriceDisplay,
      nameSpec: isModelItem
        ? selectedModel.model + (selectedModel.productName ? " / " + selectedModel.productName : "")
        : selectedAccessory.name + (selectedAccessory.spec ? " / " + selectedAccessory.spec : ""),
      qty: quantityDisplay,
      unit: isModelItem ? selectedModel.unit || "坪" : "卷",
      unitPrice: isModelItem ? selectedModel.unitPrice || "" : selectedAccessory.unitPrice || "",
      subtotal: totalPriceDisplay,
      remark: ""
    });
    areaInput.value = "";
    quantityInput.value = "";
    lastEditedMeasureField = "";
    setSelectValue(modelSelect, "");
    setSelectValue(accessorySelect, "");
    renderDraftItems();
    clearAreaPreview();
  }

  function removeDraftItem(index) {
    state.draftItems.splice(index, 1);
    var i;
    for (i = 0; i < state.draftItems.length; i += 1) {
      state.draftItems[i].no = String(i + 1);
    }
    renderDraftItems();
  }

  function buildRuntimeDoc() {
    var selectedStore = getSelectedStore();

    var doc = {
      customerName: selectedStore ? selectedStore.branchName || selectedStore.alias || "" : "",
      customerCode: selectedStore ? selectedStore.customerCode || "" : "",
      taxId: taxIdInput.value || "",
      contactPerson: contactInput.value || "",
      contactPhone: contactPhoneInput.value || "",
      tel: selectedStore ? selectedStore.phone || "" : "",
      fax: selectedStore ? selectedStore.fax || "" : "",
      deliveryAddress: addressInput.value || "",
      orderDate: formatDateForDoc(dateInput.value),
      orderNo: "",
      invoiceCode: "",
      pageText: "第 1 頁,共 1 頁",
      items: state.draftItems.slice(0)
    };
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
    html += '<h3 class="so-title">銷貨單</h3>';
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
    html += "<span>倉庫趟數：</span>";
    html += "<span>倉管：</span>";
    html += "<span>製單：</span>";
    html += "<span>簽收：</span>";
    html += "</div>";

    preview.classList.remove("empty");
    preview.innerHTML = html;
  }

  function sanitizeFileNamePart(text) {
    return String(text || "")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "")
      .replace(/_+/g, "_");
  }

  function buildPrintFileName() {
    var selectedStore = getSelectedStore();
    var datePart = String(dateInput.value || "").replace(/-/g, "");
    var customerName = "";

    if (selectedStore) {
      customerName = selectedStore.branchName || selectedStore.alias || "";
    }
    if (!customerName) {
      customerName = contactInput.value || "";
    }
    if (!datePart) {
      var today = new Date();
      var month = String(today.getMonth() + 1);
      var day = String(today.getDate());
      if (month.length < 2) {
        month = "0" + month;
      }
      if (day.length < 2) {
        day = "0" + day;
      }
      datePart = String(today.getFullYear()) + month + day;
    }

    customerName = sanitizeFileNamePart(customerName);
    if (!customerName) {
      customerName = "客戶";
    }
    return datePart + "_" + customerName;
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
    loadAccessories().then(function (accessories) {
      state.accessories = accessories;
      renderAccessoryOptions(accessories);
    });

    initSelect2();
    storeSelect.addEventListener("change", applyStoreInfo);
    modelSelect.addEventListener("change", handleModelChange);
    accessorySelect.addEventListener("change", handleAccessoryChange);
    areaInput.addEventListener("input", function () {
      lastEditedMeasureField = "area";
      syncFromAreaInput();
      updateAreaPreview();
    });
    areaInput.addEventListener("change", function () {
      lastEditedMeasureField = "area";
      syncFromAreaInput();
      updateAreaPreview();
    });
    quantityInput.addEventListener("input", function () {
      lastEditedMeasureField = "quantity";
      syncFromQuantityInput();
      updateAreaPreview();
    });
    quantityInput.addEventListener("change", function () {
      lastEditedMeasureField = "quantity";
      syncFromQuantityInput();
      updateAreaPreview();
    });
    addItemBtn.addEventListener("click", addDraftItem);
    draftItemsBody.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.className.indexOf("toggle-item-info-btn") > -1) {
        toggleDraftItemInfo(Number(target.getAttribute("data-index")));
        return;
      }
      if (target && target.className.indexOf("remove-item-btn") > -1) {
        removeDraftItem(Number(target.getAttribute("data-index")));
      }
    });

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
      document.title = buildPrintFileName();
      window.print();
    });
    printGuideBtn.addEventListener("click", function () {
      printGuideModal.classList.remove("hidden");
    });
    closePrintGuideBtn.addEventListener("click", function () {
      printGuideModal.classList.add("hidden");
    });
    printGuideModal.addEventListener("click", function (event) {
      if (event.target === printGuideModal) {
        printGuideModal.classList.add("hidden");
      }
    });

    renderDraftItems();
  }

  window.addEventListener("afterprint", function () {
    document.title = originalDocumentTitle;
  });

  bootstrap();
})();
