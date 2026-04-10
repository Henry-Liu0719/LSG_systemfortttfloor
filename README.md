# 銷貨單產生器（JavaScript）

此專案為純前端 JavaScript 起始版，提供：

- 主頁面輸入欄位：日期、店名、送貨地址、聯絡人、型號、坪數
- 門市資料來源：Google Sheets（失敗時使用內建備援資料）
- 生成銷貨單預覽
- 可直接列印

## 執行方式

此專案為靜態頁面，直接用瀏覽器開啟 `index.html` 即可。

若要避免部分瀏覽器的本機限制，建議用簡單 HTTP Server：

```bash
# 例如在專案目錄執行（需先安裝 Node.js）
npx http-server .
```

開啟終端顯示的網址（通常是 `http://127.0.0.1:8080`）。

## 結構

- `index.html`：主頁面
- `styles.css`：樣式與列印樣式
- `app.js`：資料載入、表單驗證、銷貨單渲染

## 資料來源

目前預設嘗試讀取：

`https://opensheet.elk.sh/1bOtavx_UW_vM_bRKBiFlw-G0eioDGoSmukIJntH2-Bw/Tab`

若你後續要改成正式 API（例如公司內部服務或 Apps Script Web App），可在 `app.js` 調整 `SHEET_JSON_URL`。
