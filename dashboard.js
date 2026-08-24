// ============================================================
// Mo-Sweep Dashboard — Application Logic
// Dinas Kesehatan Kota Bandung
// ============================================================

const Dashboard = {
  currentPage: "ringkasan",
  sortField: "tanggal",
  sortDir: "desc",
  kaderSortField: "totalLaporan",
  kaderSortDir: "desc",
  currentPageNum: 1,
  perPage: 10,
  filteredData: [],
  charts: {},

  // ========================
  // MOCK DATA — Simulated reports from all kader
  // ========================
  MOCK_LAPORAN: [],

  initMockData() {
    const kaderNames = [
      { nama: "Rina Wulandari", rw: "RW 03", avatar: "👩" },
      { nama: "Asep Sunarya", rw: "RW 01", avatar: "👨" },
      { nama: "Siti Nurhaliza", rw: "RW 05", avatar: "👩" },
      { nama: "Dedi Kuswanto", rw: "RW 02", avatar: "👨" },
      { nama: "Yanti Sumarni", rw: "RW 04", avatar: "👩" },
      { nama: "Rudi Hartono", rw: "RW 06", avatar: "👨" },
      { nama: "Wati Susilawati", rw: "RW 07", avatar: "👩" },
      { nama: "Indra Gunawan", rw: "RW 08", avatar: "👨" },
      { nama: "Maya Anggraeni", rw: "RW 09", avatar: "👩" },
      { nama: "Hendra Wijaya", rw: "RW 10", avatar: "👨" },
    ];

    const jalan = [
      "Jl. Merdeka", "Jl. Asia Afrika", "Jl. Buah Batu", "Jl. Gatot Subroto",
      "Jl. Dago", "Jl. Riau", "Jl. Cihampelas", "Jl. Sumatera",
      "Jl. Tamblong", "Jl. Aceh", "Jl. Braga", "Jl. Pahlawan",
      "Jl. Veteran", "Jl. Dewi Sartika", "Jl. Kartini", "Jl. Cendana",
      "Jl. Mawar", "Jl. Melati", "Jl. Anggrek", "Jl. Kenanga",
    ];
    const tempat = ["bak_mandi", "ember", "tong_air", "kolam_ikan", "pot_bunga", "pemandian", "genangan_lain"];
    const statusList = ["ditemukan", "tidak"];

    const laporan = [];
    let id = 1;

    // Generate 150 reports over 30 days
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const tanggal = date.toISOString().split("T")[0];

      // 3-7 reports per day
      const count = 3 + Math.floor(Math.random() * 5);
      for (let j = 0; j < count; j++) {
        const kader = kaderNames[Math.floor(Math.random() * kaderNames.length)];
        const status = statusList[Math.random() < 0.4 ? 0 : 1]; // 40% found
        laporan.push({
          id: id++,
          tanggal,
          kader: kader.nama,
          avatar: kader.avatar,
          rw: kader.rw,
          lokasi: jalan[Math.floor(Math.random() * jalan.length)] + " No. " + (Math.floor(Math.random() * 100) + 1),
          tempat: tempat[Math.floor(Math.random() * tempat.length)],
          status,
          foto: Math.random() < 0.5,
        });
      }
    }
    this.MOCK_LAPORAN = laporan;
  },

  // ========================
  // INIT
  // ========================
  init() {
    this.initMockData();
    this.populateFilters();
    this.filteredData = [...this.MOCK_LAPORAN];
    this.renderKPI();
    this.renderChartsRingkasan();
    this.renderTopKader();
    this.renderTable();
    this.renderHotspot();
    this.renderKader();
  },

  // ========================
  // NAVIGATION
  // ========================
  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".sidebar-nav-item").forEach((n) => n.classList.remove("active"));
    const target = document.getElementById(`page-${page}`);
    const navBtn = document.querySelector(`.sidebar-nav-item[data-page="${page}"]`);
    if (target) target.classList.add("active");
    if (navBtn) navBtn.classList.add("active");

    // Close sidebar on mobile
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
  },

  toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
  },

  // ========================
  // POPULATE FILTERS
  // ========================
  populateFilters() {
    const rwSet = [...new Set(this.MOCK_LAPORAN.map((l) => l.rw))].sort();
    const tempatSet = [...new Set(this.MOCK_LAPORAN.map((l) => l.tempat))];
    const rwSelect = document.getElementById("filterRW");
    const tempatSelect = document.getElementById("filterTempat");
    rwSet.forEach((rw) => { const o = document.createElement("option"); o.value = rw; o.textContent = rw; rwSelect.appendChild(o); });
    tempatSet.forEach((t) => {
      const j = JENIS_TEMPAT.find((j) => j.id === t);
      const o = document.createElement("option");
      o.value = t;
      o.textContent = j ? `${j.icon} ${j.nama}` : t;
      tempatSelect.appendChild(o);
    });

    // Auto-filter on change
    ["filterTanggal", "filterRW", "filterStatus", "filterTempat", "filterCari"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        this.currentPageNum = 1;
        this.applyFilters();
      });
    });
  },

  applyFilters() {
    const tanggal = document.getElementById("filterTanggal").value;
    const rw = document.getElementById("filterRW").value;
    const status = document.getElementById("filterStatus").value;
    const tempat = document.getElementById("filterTempat").value;
    const cari = document.getElementById("filterCari").value.toLowerCase();

    this.filteredData = this.MOCK_LAPORAN.filter((l) => {
      if (tanggal && l.tanggal !== tanggal) return false;
      if (rw && l.rw !== rw) return false;
      if (status && l.status !== status) return false;
      if (tempat && l.tempat !== tempat) return false;
      if (cari && !l.lokasi.toLowerCase().includes(cari) && !l.kader.toLowerCase().includes(cari)) return false;
      return true;
    });

    this.renderTable();
  },

  resetFilters() {
    document.getElementById("filterTanggal").value = "";
    document.getElementById("filterRW").value = "";
    document.getElementById("filterStatus").value = "";
    document.getElementById("filterTempat").value = "";
    document.getElementById("filterCari").value = "";
    this.filteredData = [...this.MOCK_LAPORAN];
    this.currentPageNum = 1;
    this.renderTable();
  },

  // ========================
  // KPI CARDS
  // ========================
  renderKPI() {
    const data = this.MOCK_LAPORAN;
    const total = data.length;
    const ditemukan = data.filter((l) => l.status === "ditemukan").length;
    const tidak = total - ditemukan;
    const kaderAktif = new Set(data.map((l) => l.kader)).size;
    const today = new Date().toISOString().split("T")[0];
    const hariIni = data.filter((l) => l.tanggal === today).length;
    const mingguIni = data.filter((l) => {
      const d = new Date(l.tanggal);
      const now = new Date();
      return (now - d) / (1000 * 60 * 60 * 24) <= 7;
    }).length;

    const pctDitemukan = total > 0 ? ((ditemukan / total) * 100).toFixed(1) : 0;

    document.getElementById("kpiGrid").innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon teal">📋</div>
        <div class="kpi-info">
          <div class="kpi-label">Total Laporan</div>
          <div class="kpi-value">${total}</div>
          <div class="kpi-change up">${hariIni} hari ini</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon red">🦟</div>
        <div class="kpi-info">
          <div class="kpi-label">Jentik Ditemukan</div>
          <div class="kpi-value">${ditemukan}</div>
          <div class="kpi-change down">${pctDitemukan}% dari total</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green">✅</div>
        <div class="kpi-info">
          <div class="kpi-label">Tidak Ditemukan</div>
          <div class="kpi-value">${tidak}</div>
          <div class="kpi-change up">${(100 - pctDitemukan).toFixed(1)}% dari total</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon blue">👥</div>
        <div class="kpi-info">
          <div class="kpi-label">Kader Aktif</div>
          <div class="kpi-value">${kaderAktif}</div>
          <div class="kpi-change">${mingguIni} laporan minggu ini</div>
        </div>
      </div>
    `;
  },

  // ========================
  // CHARTS — Ringkasan
  // ========================
  renderChartsRingkasan() {
    this.renderChartTren();
    this.renderChartStatus();
    this.renderChartTempat();
  },

  renderChartTren() {
    const days = 30;
    const dateMap = {};
    const foundMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dateMap[key] = 0;
      foundMap[key] = 0;
    }
    this.MOCK_LAPORAN.forEach((l) => {
      if (dateMap[l.tanggal] !== undefined) {
        dateMap[l.tanggal]++;
        if (l.status === "ditemukan") foundMap[l.tanggal]++;
      }
    });

    const labels = Object.keys(dateMap).map((d) => {
      const dt = new Date(d);
      return `${dt.getDate()}/${dt.getMonth() + 1}`;
    });

    const ctx = document.getElementById("chartTren").getContext("2d");
    if (this.charts.tren) this.charts.tren.destroy();
    this.charts.tren = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Total Laporan",
            data: Object.values(dateMap),
            borderColor: "#0D9488",
            backgroundColor: "rgba(13,148,136,0.1)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            label: "Ditemukan",
            data: Object.values(foundMap),
            borderColor: "#EF4444",
            backgroundColor: "rgba(239,68,68,0.05)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 16 } } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 11 } } },
          y: { beginAtZero: true, ticks: { stepSize: 2, font: { size: 11 } } },
        },
      },
    });
  },

  renderChartStatus() {
    const ditemukan = this.MOCK_LAPORAN.filter((l) => l.status === "ditemukan").length;
    const tidak = this.MOCK_LAPORAN.length - ditemukan;

    const ctx = document.getElementById("chartStatus").getContext("2d");
    if (this.charts.status) this.charts.status.destroy();
    this.charts.status = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Ditemukan", "Tidak Ditemukan"],
        datasets: [{
          data: [ditemukan, tidak],
          backgroundColor: ["#EF4444", "#22C55E"],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 16 } } },
      },
    });
  },

  renderChartTempat() {
    const tempatCount = {};
    this.MOCK_LAPORAN.forEach((l) => {
      if (!tempatCount[l.tempat]) tempatCount[l.tempat] = { total: 0, ditemukan: 0 };
      tempatCount[l.tempat].total++;
      if (l.status === "ditemukan") tempatCount[l.tempat].ditemukan++;
    });

    const sorted = Object.entries(tempatCount).sort((a, b) => b[1].total - a[1].total);
    const labels = sorted.map(([id]) => {
      const j = JENIS_TEMPAT.find((j) => j.id === id);
      return j ? `${j.icon} ${j.nama}` : id;
    });

    const ctx = document.getElementById("chartTempat").getContext("2d");
    if (this.charts.tempat) this.charts.tempat.destroy();
    this.charts.tempat = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Ditemukan",
            data: sorted.map(([, v]) => v.ditemukan),
            backgroundColor: "#EF4444",
            borderRadius: 4,
          },
          {
            label: "Tidak Ditemukan",
            data: sorted.map(([, v]) => v.total - v.ditemukan),
            backgroundColor: "#22C55E",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 16 } } },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true },
        },
      },
    });
  },

  renderTopKader() {
    const kaderMap = {};
    this.MOCK_LAPORAN.forEach((l) => {
      if (!kaderMap[l.kader]) kaderMap[l.kader] = { nama: l.kader, avatar: l.avatar, rw: l.rw, total: 0, ditemukan: 0 };
      kaderMap[l.kader].total++;
      if (l.status === "ditemukan") kaderMap[l.kader].ditemukan++;
    });
    const sorted = Object.values(kaderMap).sort((a, b) => b.total - a.total).slice(0, 5);

    const container = document.getElementById("topKaderList");
    container.innerHTML = sorted.map((k, i) => `
      <div class="kader-mini-item">
        <div class="kader-mini-rank ${i < 3 ? "r" + (i + 1) : ""}">${i + 1}</div>
        <span style="font-size:24px;">${k.avatar}</span>
        <div class="kader-mini-info">
          <div class="kader-mini-name">${k.nama}</div>
          <div class="kader-mini-rw">${k.rw}</div>
        </div>
        <div class="kader-mini-stat">
          <div class="kader-mini-laporan">${k.total} laporan</div>
          <div class="kader-mini-poin">${k.ditemukan} ditemukan</div>
        </div>
      </div>
    `).join("");
  },

  // ========================
  // TABLE — Laporan
  // ========================
  renderTable() {
    const data = this.filteredData;
    const sorted = this.sortData([...data], this.sortField, this.sortDir);
    const totalPages = Math.ceil(sorted.length / this.perPage);
    const start = (this.currentPageNum - 1) * this.perPage;
    const pageData = sorted.slice(start, start + this.perPage);

    document.getElementById("tableCount").textContent = `${sorted.length} laporan ditemukan`;

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = pageData.map((l) => {
      const tempat = JENIS_TEMPAT.find((j) => j.id === l.tempat);
      return `
        <tr>
          <td style="text-align:center;color:var(--text-light);font-size:12px;">${l.id}</td>
          <td>${this.formatDate(l.tanggal)}</td>
          <td><span style="margin-right:4px;">${l.avatar}</span>${l.kader}</td>
          <td>${l.rw}</td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${l.lokasi}">${l.lokasi}</td>
          <td>${tempat ? tempat.icon + " " + tempat.nama : l.tempat}</td>
          <td><span class="status-badge ${l.status}">${l.status === "ditemukan" ? "🦟 Ditemukan" : "✅ Tidak"}</span></td>
          <td><span class="foto-badge ${l.foto ? "" : "none"}">${l.foto ? "📷 Ada" : "—"}</span></td>
        </tr>
      `;
    }).join("");

    this.renderPagination(totalPages);
  },

  sortData(data, field, dir) {
    return data.sort((a, b) => {
      let va = a[field], vb = b[field];
      if (field === "tanggal") { va = new Date(va); vb = new Date(vb); }
      if (field === "kader") { va = a.kader; vb = b.kader; }
      if (field === "rw") { va = a.rw; vb = b.rw; }
      if (field === "status") { va = a.status; vb = b.status; }
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
  },

  sortTable(field) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDir = "desc";
    }
    this.renderTable();
  },

  renderPagination(totalPages) {
    const container = document.getElementById("tablePagination");
    if (totalPages <= 1) { container.innerHTML = ""; return; }

    let html = `<button class="page-btn" onclick="Dashboard.goPage(${this.currentPageNum - 1})" ${this.currentPageNum === 1 ? "disabled" : ""}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - this.currentPageNum) <= 2) {
        html += `<button class="page-btn ${i === this.currentPageNum ? "active" : ""}" onclick="Dashboard.goPage(${i})">${i}</button>`;
      } else if (Math.abs(i - this.currentPageNum) === 3) {
        html += `<span style="color:var(--text-light);">…</span>`;
      }
    }
    html += `<button class="page-btn" onclick="Dashboard.goPage(${this.currentPageNum + 1})" ${this.currentPageNum === totalPages ? "disabled" : ""}>›</button>`;
    container.innerHTML = html;
  },

  goPage(page) {
    const totalPages = Math.ceil(this.filteredData.length / this.perPage);
    if (page < 1 || page > totalPages) return;
    this.currentPageNum = page;
    this.renderTable();
  },

  exportCSV() {
    const data = this.filteredData;
    const headers = ["#", "Tanggal", "Kader", "RW", "Lokasi", "Jenis Tempat", "Status", "Foto"];
    const rows = data.map((l, i) => {
      const tempat = JENIS_TEMPAT.find((j) => j.id === l.tempat);
      return [i + 1, l.tanggal, l.kader, l.rw, `"${l.lokasi}"`, tempat ? tempat.nama : l.tempat, l.status, l.foto ? "Ya" : "Tidak"];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mosweep_laporan_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  },

  // ========================
  // HOTSPOT
  // ========================
  renderHotspot() {
    const rwMap = {};
    this.MOCK_LAPORAN.forEach((l) => {
      if (!rwMap[l.rw]) rwMap[l.rw] = { total: 0, ditemukan: 0 };
      rwMap[l.rw].total++;
      if (l.status === "ditemukan") rwMap[l.rw].ditemukan++;
    });

    const sorted = Object.entries(rwMap).sort((a, b) => b[1].ditemukan - a[1].ditemukan);
    const maxTotal = Math.max(...sorted.map(([, v]) => v.total), 1);

    // Cards
    const grid = document.getElementById("hotspotGrid");
    grid.innerHTML = sorted.map(([rw, v]) => {
      const pct = (v.ditemukan / v.total * 100).toFixed(0);
      const severity = pct >= 50 ? "high" : pct >= 30 ? "medium" : "low";
      const barColor = severity === "high" ? "var(--danger)" : severity === "medium" ? "var(--accent)" : "var(--success)";
      return `
        <div class="hotspot-card">
          <div class="hotspot-card-rw">${rw}</div>
          <div class="hotspot-card-total ${severity}">${v.ditemukan}</div>
          <div class="hotspot-card-label">ditemukan dari ${v.total} laporan (${pct}%)</div>
          <div class="hotspot-card-bar">
            <div class="hotspot-card-bar-fill" style="width:${pct}%;background:${barColor};"></div>
          </div>
        </div>
      `;
    }).join("");

    // Charts
    this.renderChartRW(sorted);
    this.renderChartHotspot(sorted);
  },

  renderChartRW(sorted) {
    const labels = sorted.map(([rw]) => rw);
    const ctx = document.getElementById("chartRW").getContext("2d");
    if (this.charts.rw) this.charts.rw.destroy();
    this.charts.rw = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Ditemukan", data: sorted.map(([, v]) => v.ditemukan), backgroundColor: "#EF4444", borderRadius: 4 },
          { label: "Tidak Ditemukan", data: sorted.map(([, v]) => v.total - v.ditemukan), backgroundColor: "#22C55E", borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 16 } } },
        scales: {
          x: { stacked: true, beginAtZero: true },
          y: { stacked: true, grid: { display: false } },
        },
      },
    });
  },

  renderChartHotspot(sorted) {
    const labels = sorted.map(([rw]) => rw);
    const pctData = sorted.map(([, v]) => v.total > 0 ? ((v.ditemukan / v.total) * 100).toFixed(1) : 0);
    const ctx = document.getElementById("chartHotspot").getContext("2d");
    if (this.charts.hotspot) this.charts.hotspot.destroy();
    this.charts.hotspot = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "% Jentik Ditemukan",
          data: pctData,
          backgroundColor: pctData.map((p) => p >= 50 ? "#EF4444" : p >= 30 ? "#F97316" : "#22C55E"),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + "%" } },
          y: { grid: { display: false } },
        },
      },
    });
  },

  // ========================
  // KADER PERFORMANCE
  // ========================
  renderKader() {
    const kaderMap = {};
    this.MOCK_LAPORAN.forEach((l) => {
      if (!kaderMap[l.kader]) kaderMap[l.kader] = { nama: l.kader, avatar: l.avatar, rw: l.rw, totalLaporan: 0, laporanDitemukan: 0, poin: 0 };
      kaderMap[l.kader].totalLaporan++;
      if (l.status === "ditemukan") {
        kaderMap[l.kader].laporanDitemukan++;
        kaderMap[l.kader].poin += 25;
      } else {
        kaderMap[l.kader].poin += 15;
      }
    });

    // KPI
    const kaderList = Object.values(kaderMap);
    const avgLaporan = kaderList.length > 0 ? (kaderList.reduce((s, k) => s + k.totalLaporan, 0) / kaderList.length).toFixed(1) : 0;
    const topKader = kaderList.length > 0 ? kaderList.reduce((a, b) => a.totalLaporan > b.totalLaporan ? a : b) : null;
    const mostActiveRW = this.getMostActiveRW();

    document.getElementById("kaderKpi").innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon blue">👥</div>
        <div class="kpi-info">
          <div class="kpi-label">Total Kader</div>
          <div class="kpi-value">${kaderList.length}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon teal">📊</div>
        <div class="kpi-info">
          <div class="kpi-label">Rata-rata Laporan</div>
          <div class="kpi-value">${avgLaporan}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon orange">⭐</div>
        <div class="kpi-info">
          <div class="kpi-label">Kader Teraktif</div>
          <div class="kpi-value">${topKader ? topKader.avatar + " " + topKader.nama.split(" ")[0] : "—"}</div>
          <div class="kpi-change">${topKader ? topKader.totalLaporan + " laporan" : ""}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon red">🔥</div>
        <div class="kpi-info">
          <div class="kpi-label">RW Teraktif</div>
          <div class="kpi-value">${mostActiveRW.rw}</div>
          <div class="kpi-change">${mostActiveRW.total} laporan</div>
        </div>
      </div>
    `;

    // Level distribution chart
    this.renderChartKaderLevel(kaderList);

    // Table
    this.renderKaderTable(kaderList);
  },

  getMostActiveRW() {
    const rwMap = {};
    this.MOCK_LAPORAN.forEach((l) => { rwMap[l.rw] = (rwMap[l.rw] || 0) + 1; });
    const sorted = Object.entries(rwMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { rw: sorted[0][0], total: sorted[0][1] } : { rw: "—", total: 0 };
  },

  renderChartKaderLevel(kaderList) {
    const levelMap = {};
    LEVELS.forEach((l) => { levelMap[l.level] = { nama: l.nama, icon: l.icon, count: 0 }; });
    kaderList.forEach((k) => {
      const level = this.getKaderLevel(k.poin);
      levelMap[level].count++;
    });

    const ctx = document.getElementById("chartKaderLevel").getContext("2d");
    if (this.charts.kaderLevel) this.charts.kaderLevel.destroy();
    this.charts.kaderLevel = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.values(levelMap).map((l) => `${l.icon} ${l.nama}`),
        datasets: [{
          label: "Jumlah Kader",
          data: Object.values(levelMap).map((l) => l.count),
          backgroundColor: ["#94A3B8", "#22C55E", "#3B82F6", "#F97316", "#8B5CF6"],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  },

  getKaderLevel(poin) {
    let current = 1;
    for (const l of LEVELS) { if (poin >= l.minPoints) current = l.level; }
    return current;
  },

  renderKaderTable(kaderList) {
    const sorted = kaderList.sort((a, b) => {
      let va = a[this.kaderSortField], vb = b[this.kaderSortField];
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      return this.kaderSortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

    const tbody = document.getElementById("kaderTableBody");
    tbody.innerHTML = sorted.map((k, i) => {
      const level = this.getKaderLevel(k.poin);
      const levelData = LEVELS.find((l) => l.level === level);
      return `
        <tr>
          <td style="text-align:center;color:var(--text-light);font-size:12px;">${i + 1}</td>
          <td><span style="margin-right:4px;">${k.avatar}</span><span class="fw-700">${k.nama}</span></td>
          <td>${k.rw}</td>
          <td>${levelData ? levelData.icon + " " + levelData.nama : "Lv." + level}</td>
          <td class="fw-700">${k.totalLaporan}</td>
          <td>${k.laporanDitemukan} <span class="text-muted">(${k.totalLaporan > 0 ? ((k.laporanDitemukan / k.totalLaporan) * 100).toFixed(0) : 0}%)</span></td>
          <td class="text-accent fw-700">${k.poin}</td>
          <td><button class="filter-btn" onclick="Dashboard.showKaderDetail('${k.nama}')">Detail</button></td>
        </tr>
      `;
    }).join("");
  },

  sortKader(field) {
    if (this.kaderSortField === field) {
      this.kaderSortDir = this.kaderSortDir === "asc" ? "desc" : "asc";
    } else {
      this.kaderSortField = field;
      this.kaderSortDir = "desc";
    }
    this.renderKader();
  },

  showKaderDetail(nama) {
    const kaderLaporan = this.MOCK_LAPORAN.filter((l) => l.kader === nama);
    const ditemukan = kaderLaporan.filter((l) => l.status === "ditemukan").length;
    const poin = kaderLaporan.reduce((s, l) => s + (l.status === "ditemukan" ? 25 : 15), 0);
    const level = this.getKaderLevel(poin);
    const levelData = LEVELS.find((l) => l.level === level);

    // Tempat distribution
    const tempatMap = {};
    kaderLaporan.forEach((l) => {
      if (!tempatMap[l.tempat]) tempatMap[l.tempat] = 0;
      tempatMap[l.tempat]++;
    });

    const overlay = document.getElementById("modal-overlay") || this.createModal();
    const modal = document.getElementById("modalContent");
    modal.innerHTML = `
      <div class="modal-header">
        <h2>${kaderLaporan[0]?.avatar || "👤"} ${nama}</h2>
        <button class="modal-close" onclick="Dashboard.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-kader-stat">
          <div class="modal-stat">
            <div class="modal-stat-val" style="color:var(--primary);">${kaderLaporan.length}</div>
            <div class="modal-stat-label">Total Laporan</div>
          </div>
          <div class="modal-stat">
            <div class="modal-stat-val" style="color:var(--danger);">${ditemukan}</div>
            <div class="modal-stat-label">Ditemukan</div>
          </div>
          <div class="modal-stat">
            <div class="modal-stat-val" style="color:var(--accent);">${poin}</div>
            <div class="modal-stat-label">Poin</div>
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Level: ${levelData ? levelData.icon + " " + levelData.nama : "Lv." + level}</p>
        <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">Riwayat Laporan</h4>
        <div style="max-height:300px;overflow-y:auto;">
          ${kaderLaporan.slice(0, 20).map((l) => {
            const t = JENIS_TEMPAT.find((j) => j.id === l.tempat);
            return `
              <div class="modal-history-item">
                <span class="status-badge ${l.status}" style="font-size:11px;">${l.status === "ditemukan" ? "🦟" : "✅"}</span>
                <span style="flex:1;">${l.lokasi}</span>
                <span class="text-muted" style="font-size:11px;">${t ? t.icon : ""} ${this.formatDate(l.tanggal)}</span>
                <span class="text-accent fw-700" style="font-size:12px;">+${l.status === "ditemukan" ? 25 : 15}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
    document.getElementById("modalOverlay").classList.add("active");
  },

  createModal() {
    const overlay = document.createElement("div");
    overlay.id = "modalOverlay";
    overlay.className = "modal-overlay";
    overlay.onclick = (e) => { if (e.target === overlay) this.closeModal(); };
    overlay.innerHTML = `<div class="modal" id="modalContent"></div>`;
    document.body.appendChild(overlay);
    return overlay;
  },

  closeModal() {
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.classList.remove("active");
  },

  // ========================
  // UTILITIES
  // ========================
  formatDate(dateStr) {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },
};

// Init on load
document.addEventListener("DOMContentLoaded", () => Dashboard.init());
