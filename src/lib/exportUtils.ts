import { getQRCodeUrl, getPackingListQRDataStr } from "./utils";
import type { Bundle } from "@/modules/plant/load-planning.api";

export interface ExportLoadInfo {
  packingListNo: string;
  loadId: string;
  projectName: string;
  truck: string;
  driver?: string;
  destination?: string;
  dispatchDate?: string;
}

export interface ExportSummary {
  totalBundles: number;
  totalItems: number;
  totalWeight: number;
  maxLengthFeet?: number;
}

export interface ExportBundleItem {
  _id?: string;
  bundleNo: string;
  partNumber: string;
  qty: number;
  length: number;
  weight: number;
  status: string;
}

const formatWeight = (weight: number) => `${weight.toLocaleString()} LBS`;
const formatLength = (length: number) => `${length} FT`;

/**
 * PDF Export for a single Packing List (Load details + bundles)
 */
export const exportPackingListToPDF = (
  loadInfo: ExportLoadInfo,
  summary: ExportSummary,
  bundleList: ExportBundleItem[],
  showQr: boolean = true,
  planId?: string
) => {
  const standaloneBase = import.meta.env.VITE_STANDLONE_PAGE_BASE || "";
  const qrDataStr = getPackingListQRDataStr(planId);
  const qrCodeUrl = getQRCodeUrl(qrDataStr, "200x200");

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Packing List - ${loadInfo.packingListNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #111827;
            margin: 0;
            padding: 40px;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          
          .header-left h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #1E51A4;
          }
          
          .header-left p {
            font-size: 14px;
            color: #4B5563;
            margin: 0;
          }
          
          .qr-container {
            display: flex;
            align-items: center;
            gap: 16px;
            border: 1px solid #E5E7EB;
            padding: 12px;
            border-radius: 8px;
            background-color: #F9FAFB;
          }
          
          .qr-image {
            width: 100px;
            height: 100px;
          }
          
          .qr-data {
            font-size: 11px;
            color: #374151;
            line-height: 1.5;
          }
          
          .grid-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 35px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 8px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .info-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .info-table tr {
            border-bottom: 1px solid #F3F4F6;
          }
          
          .info-table tr:last-child {
            border-bottom: none;
          }
          
          .info-table td {
            padding: 8px 0;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: 500;
            color: #4B5563;
            width: 45%;
          }
          
          .info-value {
            font-weight: 600;
            color: #111827;
            text-align: right;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .items-table th {
            background-color: #212B36;
            color: #ffffff;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            padding: 12px 16px;
            text-align: left;
          }
          
          .items-table td {
            padding: 14px 16px;
            font-size: 13px;
            border-bottom: 1px solid #E5E7EB;
            color: #374151;
          }
          
          .items-table tr:hover {
            background-color: #F9FAFB;
          }
          
          .items-table tr:last-child td {
            border-bottom: 2px solid #E5E7EB;
          }
          
          .footer {
            margin-top: 60px;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            .header-left h1 {
              color: #111827 !important;
            }
            .items-table th {
              background-color: #111827 !important;
              color: #fff !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>PACKING LIST</h1>
            <p>Load ID: ${loadInfo.packingListNo}</p>
            <p>Project Name: ${loadInfo.projectName}</p>
            <p>Shipper Order: ${loadInfo.loadId}</p>
          </div>
          ${showQr ? `
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR" class="qr-image" />
              <div class="qr-data">
                <strong>Project:</strong> ${loadInfo.projectName}<br/>
                <strong>Load:</strong> ${loadInfo.packingListNo}<br/>
                <strong>Weight:</strong> ${formatWeight(summary.totalWeight)}<br/>
                <strong>Length:</strong> ${formatLength(summary.maxLengthFeet || 0)}${planId
        ? `<br/><strong>URL:</strong> ${standaloneBase.replace(/\/+$/, "")}/packing-list-plan/${planId}`
        : ""
      }
              </div>
            </div>
          ` : ''}
        </div>

        <div class="grid-container">
          <div>
            <div class="section-title">Load Information</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Packing List ID</td>
                <td class="info-value">${loadInfo.packingListNo}</td>
              </tr>
              <tr>
                <td class="info-label">Load ID</td>
                <td class="info-value">${loadInfo.loadId}</td>
              </tr>
              <tr>
                <td class="info-label">Project</td>
                <td class="info-value">${loadInfo.projectName}</td>
              </tr>
              <tr>
                <td class="info-label">Truck</td>
                <td class="info-value">${loadInfo.truck}</td>
              </tr>
              <tr>
                <td class="info-label">Driver</td>
                <td class="info-value">${loadInfo.driver || "-"}</td>
              </tr>
              <tr>
                <td class="info-label">Destination</td>
                <td class="info-value">${loadInfo.destination || "-"}</td>
              </tr>
              <tr>
                <td class="info-label">Dispatch Date</td>
                <td class="info-value">${loadInfo.dispatchDate || "-"}</td>
              </tr>
            </table>
          </div>

          <div>
            <div class="section-title">Packing Summary</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Total Bundles</td>
                <td class="info-value">${summary.totalBundles}</td>
              </tr>
              <tr>
                <td class="info-label">Total Items</td>
                <td class="info-value">${summary.totalItems}</td>
              </tr>
              <tr>
                <td class="info-label">Total Weight</td>
                <td class="info-value">${formatWeight(summary.totalWeight)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="section-title">Bundle List</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Bundle ID</th>
              <th>Part Number</th>
              <th>Quantity</th>
              <th>Length</th>
              <th>Weight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${bundleList.map((bundle, index) => `
              <tr>
                <td>${index + 1}</td>
                <td style="font-weight: 600;">${bundle.bundleNo}</td>
                <td>${bundle.partNumber}</td>
                <td>${bundle.qty}</td>
                <td>${formatLength(bundle.length)}</td>
                <td>${formatWeight(bundle.weight || 0)}</td>
                <td style="text-transform: capitalize;">${bundle.status || "Ready"}</td>
              </tr>
            `).join('')}
            ${bundleList.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; color: #6B7280; padding: 24px;">No bundles assigned to this packing list.</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="footer">
          <p>MR Storage Systems &bull; Packing List Document &bull; Confidential &copy; ${new Date().getFullYear()}</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Excel/CSV Export for a single Packing List (Load details + bundles)
 */
export const exportPackingListToCSV = (
  loadInfo: ExportLoadInfo,
  summary: ExportSummary,
  bundleList: ExportBundleItem[]
) => {
  const csvRows = [
    ["PACKING LIST PLAN REPORT"],
    ["Project Name", loadInfo.projectName],
    ["Plan Number / Shipper ID", loadInfo.loadId],
    ["Packing List ID", loadInfo.packingListNo],
    ["Load ID", loadInfo.packingListNo],
    ["Truck", loadInfo.truck],
    ["Total Weight", `${summary.totalWeight} LBS`],
    ["Total Bundles", summary.totalBundles],
    ["Total Items", summary.totalItems],
    [],
    ["#", "Bundle ID", "Part Number", "Quantity", "Length", "Weight (LBS)", "Status"],
    ...bundleList.map((b, idx) => [
      idx + 1,
      b.bundleNo,
      b.partNumber,
      b.qty,
      `${b.length}ft`,
      b.weight,
      b.status
    ])
  ];

  const csvContent = "\uFEFF" + csvRows
    .map(e => e.map(val => {
      const stringVal = val === undefined || val === null ? "" : String(val);
      if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `packing_list_${loadInfo.packingListNo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * PDF Export for a general List of Bundles
 */
export const exportBundleListToPDF = (
  bundles: Bundle[],
  projectName: string,
  planNumber: string
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const totalWeight = bundles.reduce((sum, b) => sum + (b.totalWeight || 0), 0);
  const totalItems = bundles.reduce((sum, b) => sum + (b.totalQty || b.itemCount || 0), 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bundle List - ${planNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #111827;
            margin: 0;
            padding: 40px;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .header {
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #1E51A4;
          }
          
          .header p {
            font-size: 14px;
            color: #4B5563;
            margin: 0;
          }
          
          .summary-card {
            background-color: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .summary-item {
            text-align: center;
          }
          
          .summary-label {
            font-size: 12px;
            color: #6B7280;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 6px;
          }
          
          .summary-value {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .items-table th {
            background-color: #212B36;
            color: #ffffff;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            padding: 12px 16px;
            text-align: left;
          }
          
          .items-table td {
            padding: 14px 16px;
            font-size: 13px;
            border-bottom: 1px solid #E5E7EB;
            color: #374151;
          }
          
          .items-table tr:last-child td {
            border-bottom: 2px solid #E5E7EB;
          }
          
          .footer {
            margin-top: 60px;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            .header h1 {
              color: #111827 !important;
            }
            .items-table th {
              background-color: #111827 !important;
              color: #fff !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MASTER BUNDLE LIST</h1>
          <p>Project Name: ${projectName}</p>
          <p>Plan Number / Shipper ID: ${planNumber}</p>
        </div>

        <div class="summary-card">
          <div class="summary-item">
            <div class="summary-label">Total Bundles</div>
            <div class="summary-value">${bundles.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Items</div>
            <div class="summary-value">${totalItems}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Weight</div>
            <div class="summary-value">${formatWeight(totalWeight)}</div>
          </div>
        </div>

        <div class="section-title">All Bundles</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Bundle ID</th>
              <th>Part Number</th>
              <th>Quantity</th>
              <th>Length</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            ${bundles.map((bundle, index) => `
              <tr>
                <td>${index + 1}</td>
                <td style="font-weight: 600;">${bundle.bundleNo}</td>
                <td>${bundle.bundleType || bundle.title || "N/A"}</td>
                <td>${bundle.totalQty || bundle.itemCount}</td>
                <td>${bundle.maxLengthFeet}ft</td>
                <td>${bundle.totalWeight.toLocaleString()} LBS</td>
              </tr>
            `).join('')}
            ${bundles.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; color: #6B7280; padding: 24px;">No bundles found.</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="footer">
          <p>Steel Building Depot &bull; Bundle List Document &bull; Confidential &copy; ${new Date().getFullYear()}</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Excel/CSV Export for a general List of Bundles
 */
export const exportBundleListToCSV = (
  bundles: Bundle[],
  projectName: string,
  planNumber: string
) => {
  const totalWeight = bundles.reduce((sum, b) => sum + (b.totalWeight || 0), 0);
  const totalItems = bundles.reduce((sum, b) => sum + (b.totalQty || b.itemCount || 0), 0);

  const csvRows = [
    ["MASTER BUNDLE PLAN REPORT"],
    ["Project Name", projectName],
    ["Plan Number / Shipper ID", planNumber],
    ["Total Bundles", bundles.length],
    ["Total Items", totalItems],
    ["Total Weight", `${totalWeight} LBS`],
    [],
    ["#", "Bundle ID", "Part Number", "Quantity", "Length", "Weight (LBS)"],
    ...bundles.map((b, idx) => [
      idx + 1,
      b.bundleNo,
      b.bundleType || b.title || "N/A",
      b.totalQty || b.itemCount,
      `${b.maxLengthFeet}ft`,
      b.totalWeight
    ])
  ];

  const csvContent = "\uFEFF" + csvRows
    .map(e => e.map(val => {
      const stringVal = val === undefined || val === null ? "" : String(val);
      if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `bundle_list_${planNumber}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
