/**
 * Utility Export Data ke PDF dan Excel (.csv)
 * CORECULTURE Admin Reporting Tool
 */

/**
 * Export data array ke format Excel (.csv) dengan UTF-8 BOM
 * kompatibel dengan Microsoft Excel dan Google Sheets.
 */
export function exportToExcel<T extends Record<string, any>>(
  filename: string,
  headers: { key: keyof T; label: string }[],
  data: T[]
) {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport!");
    return;
  }

  // Header CSV
  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(",");

  // Data Rows CSV
  const dataRows = data.map((item) => {
    return headers
      .map((h) => {
        const val = item[h.key] ?? "";
        const cleanVal = String(val).replace(/"/g, '""');
        return `"${cleanVal}"`;
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data array ke format PDF melalui printable report view
 * dengan tata letak laporan CORECULTURE yang rapi dan profesional.
 */
export function exportToPDF<T extends Record<string, any>>(
  title: string,
  subtitle: string,
  headers: { key: keyof T; label: string }[],
  data: T[]
) {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport!");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Gagal membuka jendela cetak PDF. Pastikan pop-up dibolehkan di browser Anda.");
    return;
  }

  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableHeadersHtml = headers
    .map((h) => `<th style="padding:10px 12px; border:1px solid #e4e4e7; background:#002D72; color:#ffffff; font-size:11px; text-transform:uppercase; text-align:left;">${h.label}</th>`)
    .join("");

  const tableRowsHtml = data
    .map(
      (item, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#ffffff" : "#f9fafb"};">
        ${headers
          .map(
            (h) => `
          <td style="padding:8px 12px; border:1px solid #e4e4e7; font-size:12px; color:#18181b;">
            ${item[h.key] ?? "-"}
          </td>
        `
          )
          .join("")}
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - CORECULTURE Report</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #18181b; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #002D72; padding-bottom: 12px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: 900; color: #002D72; letter-spacing: -1px; text-transform: uppercase; }
          .title { font-size: 16px; font-weight: 700; color: #27272a; margin-top: 4px; }
          .subtitle { font-size: 12px; color: #71717a; }
          .meta { font-size: 11px; color: #71717a; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .footer { margin-top: 30px; font-size: 10px; color: #a1a1aa; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">CORECULTURE</div>
            <div class="title">${title}</div>
            <div class="subtitle">${subtitle} • Total Data: ${data.length} item</div>
          </div>
          <div class="meta">
            <div>Dicetak pada:</div>
            <strong>${dateStr}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>${tableHeadersHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          CORECULTURE Official Data Report • Rahasia & Khusus Penggunaan Internal Manajemen
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
