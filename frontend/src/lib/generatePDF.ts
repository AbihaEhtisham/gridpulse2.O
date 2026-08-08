export function generateRepairPDF(report: any) {
  const { repairPlan, totalBrokenLines, tierSummary, priorityLogic, generatedAt } = report

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>GridPulse — Repair Priority Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
    .header { text-align: center; border-bottom: 3px solid #FF6B2C; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #FF6B2C; font-size: 24px; }
    .header p { color: #666; margin-top: 5px; }
    .summary-cards { display: flex; gap: 15px; margin-bottom: 30px; }
    .card { flex: 1; background: #f8f8f8; padding: 15px; border-radius: 10px; border-left: 4px solid #FF6B2C; text-align: center; }
    .card .number { font-size: 28px; font-weight: bold; color: #FF6B2C; }
    .card .label { font-size: 12px; color: #666; margin-top: 3px; }
    h2 { color: #333; margin: 25px 0 15px 0; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
    th { background: #FF6B2C; color: white; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #fafafa; }
    .tier-CRITICAL { background: #ffe0e0; font-weight: bold; }
    .tier-HIGH { background: #fff3e0; font-weight: bold; }
    .tier-MEDIUM { background: #fffde0; }
    .tier-STANDARD { background: #f5f5f5; }
    .tier-LOW { background: #fafafa; color: #999; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .badge-CRITICAL { background: #EF4444; color: white; }
    .badge-HIGH { background: #F97316; color: white; }
    .badge-MEDIUM { background: #F59E0B; color: white; }
    .badge-STANDARD { background: #3B82F6; color: white; }
    .badge-LOW { background: #9CA3AF; color: white; }
    .logic-box { background: #f0f7ff; border: 1px solid #b8d8ff; border-radius: 10px; padding: 15px; margin: 20px 0; }
    .logic-box h3 { color: #0066cc; margin-bottom: 8px; }
    .logic-box p { font-size: 13px; color: #444; margin: 4px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>GridPulse — Repair Priority Report</h1>
    <p>Generated: ${new Date(generatedAt).toLocaleString()}</p>
    <p>SafeX Solutions — Power Grid Resilience Platform</p>
  </div>

  <div class="summary-cards">
    <div class="card">
      <div class="number">${totalBrokenLines}</div>
      <div class="label">Total Broken Lines</div>
    </div>
    <div class="card">
      <div class="number">${tierSummary['CRITICAL'] || 0}</div>
      <div class="label">Critical Priority</div>
    </div>
    <div class="card">
      <div class="number">${tierSummary['HIGH'] || 0}</div>
      <div class="label">High Priority</div>
    </div>
    <div class="card">
      <div class="number">${(tierSummary['MEDIUM'] || 0) + (tierSummary['STANDARD'] || 0) + (tierSummary['LOW'] || 0)}</div>
      <div class="label">Other</div>
    </div>
  </div>

  <h2>Priority Logic</h2>
  <div class="logic-box">
    <h3>How repairs are prioritized</h3>
    <p><strong>Primary Factor:</strong> ${priorityLogic.primaryFactor}</p>
    <p><strong>Tiebreaker:</strong> ${priorityLogic.tiebreaker}</p>
    <p><strong>Method:</strong> ${priorityLogic.method}</p>
  </div>

  <h2>Repair Sequence (${repairPlan.length} lines)</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Source</th>
        <th>Destination</th>
        <th>Type</th>
        <th>Priority</th>
        <th>Tier</th>
        <th>Resistance</th>
        <th>Est. Time</th>
      </tr>
    </thead>
    <tbody>
      ${repairPlan.map((item: any) => `
        <tr class="tier-${item.tier}">
          <td>${item.sequence}</td>
          <td>${item.sourceName}</td>
          <td>${item.destName}</td>
          <td>${item.destType}</td>
          <td>${item.maxPriority}</td>
          <td><span class="badge badge-${item.tier}">${item.tier}</span></td>
          <td>${item.resistance} Ω</td>
          <td>${item.repairTime}s</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>GridPulse — SafeX Solutions | Generated ${new Date(generatedAt).toLocaleString()}</p>
    <p>This report shows the optimal repair sequence based on building priority and line resistance.</p>
  </div>
</body>
</html>`

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank', 'width=1000,height=800')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }
}