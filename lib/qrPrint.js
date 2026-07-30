// lib/qrPrint.js
//
// Abre una ventana nueva con una "tarjetita" imprimible: nombre de la
// inmobiliaria + código QR a tamaño físico real (6x6 cm) + nombre de la
// propiedad. Pensado para pegar en la puerta de cada unidad.
//
// El tamaño del QR se fija en centímetros (CSS) para que, al imprimir con
// la opción "Tamaño real / 100%" (sin "Ajustar a la página"), quede
// exactamente en 6x6 cm sobre el papel.

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

export function openQrPrintWindow({ agencyName, propertyName, link, qrSizeCm = 6 }) {
  if (typeof window === "undefined" || !link) return;

  // Pedimos el QR en alta resolución (600x600 px) para que no se vea
  // pixelado al imprimirse en 6x6 cm físicos.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(link)}`;

  const win = window.open("", "_blank", "width=480,height=620");
  if (!win) {
    alert("Tu navegador bloqueó la ventana de impresión. Habilitá los pop-ups para este sitio y probá de nuevo. / Seu navegador bloqueou a janela de impressão. Habilite pop-ups para este site e tente novamente.");
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>QR — ${escapeHtml(propertyName)}</title>
<style>
  @page { margin: 10mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    text-align: center;
    padding: 24px 16px;
    color: #1F2D2B;
  }
  .instructions {
    max-width: 380px;
    margin: 0 auto 22px;
    font-size: 12.5px;
    line-height: 1.5;
    color: #5B7065;
    background: #F3EDE2;
    border-radius: 10px;
    padding: 12px 14px;
  }
  .instructions b { color: #C4622A; }
  .card {
    display: inline-block;
    border: 1px dashed #B9AF97;
    border-radius: 10px;
    padding: 18px 22px;
  }
  .agency {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #8A7A5C;
    margin-bottom: 10px;
  }
  .qr {
    width: ${qrSizeCm}cm;
    height: ${qrSizeCm}cm;
    display: block;
    margin: 0 auto;
  }
  .property {
    font-size: 16px;
    font-weight: 700;
    margin-top: 12px;
    color: #1F2D2B;
  }
  .print-btn {
    margin-top: 22px;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #1F2D2B;
    color: #F3EDE2;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  @media print {
    .instructions, .print-btn { display: none; }
    .card { border: none; padding: 0; }
    body { padding: 0; }
  }
</style>
</head>
<body>
  <p class="instructions">
    Antes de imprimir: en el cuadro de diálogo, elegí escala <b>"Tamaño real / 100%"</b> (no "Ajustar a la página"), así el QR queda exactamente en ${qrSizeCm}x${qrSizeCm} cm.
    <br /><br />
    Antes de imprimir: na caixa de diálogo, escolha a escala <b>"Tamanho real / 100%"</b> (não "Ajustar à página"), assim o QR fica exatamente em ${qrSizeCm}x${qrSizeCm} cm.
  </p>
  <div class="card">
    <div class="agency">${escapeHtml(agencyName)}</div>
    <img class="qr" src="${qrUrl}" alt="QR" />
    <div class="property">${escapeHtml(propertyName)}</div>
  </div>
  <br />
  <button class="print-btn" onclick="window.print()">Imprimir / Imprimir</button>
  <script>
    window.onload = function () {
      setTimeout(function () { window.focus(); }, 200);
    };
  </script>
</body>
</html>`);
  win.document.close();
}
