// ============================================================
// Mo-Sweep — Application Logic
// Prototipe Gamifikasi Pelaporan Jentik DBD untuk Kader Bandung
// ============================================================

const App = {
  state: null,
  currentView: "home",
  reportForm: { tempat: null, status: null, foto: null },

  // --- Init ---
  init() {
    this.state = this.loadState();
    this.render();
    this.bindNav();
    setTimeout(() => document.querySelector(".splash").classList.add("hidden"), 1500);
  },

  // --- Persistence ---
  loadState() {
    const saved = localStorage.getItem("mosweep_state");
    if (saved) return JSON.parse(saved);
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  },
  saveState() {
    localStorage.setItem("mosweep_state", JSON.stringify(this.state));
  },
  resetState() {
    localStorage.removeItem("mosweep_state");
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.render();
    this.showToast("Data direset ke default", "warning");
  },

  // --- Navigation ---
  bindNav() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        this.navigate(view);
      });
    });
  },
  navigate(view) {
    this.currentView = view;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    const targetView = document.getElementById(`view-${view}`);
    const targetNav = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (targetView) targetView.classList.add("active");
    if (targetNav) targetNav.classList.add("active");
    document.querySelector(".content").scrollTop = 0;
    this.renderView(view);
  },

  // --- Main Render ---
  render() {
    this.renderView(this.currentView);
  },
  renderView(view) {
    const renderers = {
      home: () => this.renderHome(),
      lapor: () => this.renderLapor(),
      leaderboard: () => this.renderLeaderboard(),
      profil: () => this.renderProfil(),
    };
    if (renderers[view]) renderers[view]();
  },

  // --- HOME VIEW ---
  renderHome() {
    const el = document.getElementById("view-home");
    const { nama, rw, points, level, avatar, totalLaporan, streak, badges, challengesAktif } = this.state;
    const levelData = this.getLevel(points);
    const nextLevel = LEVELS.find((l) => l.level === levelData.level + 1);
    const progressPct = nextLevel
      ? ((points - levelData.minPoints) / (nextLevel.minPoints - levelData.minPoints)) * 100
      : 100;

    el.innerHTML = `
      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="profile-hero-top">
          <div class="profile-avatar">${avatar}</div>
          <div class="profile-info">
            <h2>${nama}</h2>
            <p>${rw} • ${levelData.icon} ${levelData.nama}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value" id="home-points">${points}</span>
            <span class="stat-label">Poin</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${totalLaporan}</span>
            <span class="stat-label">Laporan</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${streak} 🔥</span>
            <span class="stat-label">Streak</span>
          </div>
        </div>
        <div class="level-bar-wrap">
          <div class="level-bar-header">
            <span>${levelData.icon} Lv.${levelData.level}</span>
            <span>${nextLevel ? nextLevel.icon + " Lv." + nextLevel.level : "MAX"}</span>
          </div>
          <div class="level-bar">
            <div class="level-bar-fill" style="width: ${progressPct}%"></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="quick-btn" onclick="App.navigate('lapor')">
          <span class="quick-btn-icon">🦟</span>
          <span class="quick-btn-label">Lapor Jentik</span>
          <span class="quick-btn-sub">Kirim laporan baru</span>
        </button>
        <button class="quick-btn" onclick="App.navigate('leaderboard')">
          <span class="quick-btn-icon">🏆</span>
          <span class="quick-btn-label">Peringkat</span>
          <span class="quick-btn-sub">Lihat leaderboard</span>
        </button>
      </div>

      <!-- Challenges -->
      <div class="section-header">
        <span class="section-title">Tantangan Aktif</span>
      </div>
      <div class="challenge-scroll" id="challenge-scroll"></div>

      <!-- Mini Leaderboard -->
      <div class="section-header">
        <span class="section-title">Peringkat Teratas</span>
        <button class="section-more" onclick="App.navigate('leaderboard')">Lihat Semua</button>
      </div>
      <div class="card" id="mini-leaderboard"></div>

      <!-- Badges Preview -->
      <div class="section-header">
        <span class="section-title">Lencana Saya</span>
        <button class="section-more" onclick="App.navigate('profil')">Lihat Semua</button>
      </div>
      <div class="badge-grid" id="home-badges"></div>
    `;

    this.renderChallenges();
    this.renderMiniLeaderboard();
    this.renderHomeBadges();
  },

  renderChallenges() {
    const container = document.getElementById("challenge-scroll");
    container.innerHTML = CHALLENGES.map((c) => {
      const progress = this.state.challengesAktif[c.id];
      const pct = progress ? (progress.progress / c.target) * 100 : 0;
      const selesai = progress && progress.selesai;
      return `
        <div class="challenge-card" onclick="App.showChallengeDetail('${c.id}')">
          <div class="challenge-card-icon">${c.icon}</div>
          <div class="challenge-card-title">${c.judul}</div>
          <div class="challenge-card-desc">${c.deskripsi}</div>
          <div class="challenge-progress-bar">
            <div class="challenge-progress-fill" style="width: ${Math.min(pct, 100)}%; ${selesai ? "background: var(--accent)" : ""}"></div>
          </div>
          <div class="challenge-card-meta" style="margin-top: 8px;">
            <span class="challenge-card-points">+${c.bonusPoin} poin</span>
            <span class="challenge-card-time">${selesai ? "✅ Selesai" : c.berakhir}</span>
          </div>
        </div>
      `;
    }).join("");
  },

  renderMiniLeaderboard() {
    const sorted = [...MOCK_KADER].sort((a, b) => b.points - a.points).slice(0, 5);
    const container = document.getElementById("mini-leaderboard");
    container.innerHTML = sorted.map((k, i) => {
      const isMe = k.nama === this.state.nama;
      return `
        <div class="lb-item ${isMe ? "lb-you" : ""}">
          <div class="lb-rank ${i < 3 ? "rank-" + (i + 1) : ""}">${i + 1}</div>
          <span class="lb-avatar">${k.avatar}</span>
          <div class="lb-info">
            <div class="lb-name">${k.nama} ${isMe ? "(Anda)" : ""}</div>
            <div class="lb-rw">${k.rw}</div>
          </div>
          <span class="lb-points">${k.points}</span>
        </div>
      `;
    }).join("");
  },

  renderHomeBadges() {
    const container = document.getElementById("home-badges");
    const earned = this.state.badges;
    container.innerHTML = BADGES.filter((b) => earned.includes(b.id))
      .slice(0, 6)
      .map((b) => `
        <div class="badge-item">
          <span class="badge-item-icon">${b.icon}</span>
          <span class="badge-item-name">${b.nama}</span>
        </div>
      `).join("") + (earned.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🏅</div><p class="empty-state-text">Mulai lapor untuk dapatkan lencana!</p></div>' : "");
  },

  // --- LAPOR VIEW ---
  renderLapor() {
    const el = document.getElementById("view-lapor");
    this.reportForm = { tempat: null, status: null, foto: null };

    el.innerHTML = `
      <h1 class="view-title">🦟 Lapor Jentik</h1>
      <p class="view-subtitle">Isi form di bawah untuk mengirim laporan temuan jentik</p>

      <div class="card">
        <!-- Lokasi -->
        <div class="form-group">
          <label class="form-label">📍 Lokasi / Alamat</label>
          <input type="text" class="form-input" id="input-lokasi" placeholder="Contoh: Jl. Merdeka No. 12">
        </div>

        <!-- Jenis Tempat -->
        <div class="form-group">
          <label class="form-label">🏠 Jenis Tempat Penampungan Air</label>
          <div class="tempat-grid" id="tempat-grid"></div>
        </div>

        <!-- Status Jentik -->
        <div class="form-group">
          <label class="form-label">🔍 Status Jentik</label>
          <div class="radio-group">
            <div class="radio-option danger" data-status="ditemukan" onclick="App.selectStatus('ditemukan')">
              🦟 Ditemukan
            </div>
            <div class="radio-option success" data-status="tidak" onclick="App.selectStatus('tidak')">
              ✅ Tidak Ditemukan
            </div>
          </div>
        </div>

        <!-- Foto -->
        <div class="form-group">
          <label class="form-label">📷 Foto Dokumentasi <span style="font-weight:400;color:var(--text-secondary)">(opsional)</span></label>
          <div class="photo-upload" id="photo-upload" onclick="App.triggerPhoto()">
            <div class="photo-upload-icon">📸</div>
            <div class="photo-upload-text">Ketuk untuk ambil foto</div>
            <div class="photo-upload-hint">Maks. 5MB • Format: JPG/PNG</div>
          </div>
          <div class="photo-preview" id="photo-preview">
            <img id="photo-preview-img" src="" alt="Preview">
            <button class="photo-preview-remove" onclick="App.removePhoto()">✕</button>
          </div>
        </div>

        <!-- Catatan -->
        <div class="form-group">
          <label class="form-label">📝 Catatan <span style="font-weight:400;color:var(--text-secondary)">(opsional)</span></label>
          <textarea class="form-textarea" id="input-catatan" placeholder="Tambahkan catatan jika diperlukan..."></textarea>
        </div>

        <!-- Submit -->
        <button class="btn btn-primary" id="btn-submit-laporan" onclick="App.submitLaporan()">
          📤 Kirim Laporan
        </button>
      </div>
    `;

    this.renderTempatGrid();
  },

  renderTempatGrid() {
    const grid = document.getElementById("tempat-grid");
    grid.innerHTML = JENIS_TEMPAT.map((j) => `
      <div class="tempat-item" data-tempat="${j.id}" onclick="App.selectTempat('${j.id}')">
        <span class="tempat-item-icon">${j.icon}</span>
        <span class="tempat-item-label">${j.nama}</span>
      </div>
    `).join("");
  },

  selectTempat(id) {
    this.reportForm.tempat = id;
    document.querySelectorAll(".tempat-item").forEach((el) => el.classList.remove("selected"));
    document.querySelector(`.tempat-item[data-tempat="${id}"]`).classList.add("selected");
  },

  selectStatus(status) {
    this.reportForm.status = status;
    document.querySelectorAll(".radio-option").forEach((el) => el.classList.remove("selected"));
    document.querySelector(`.radio-option[data-status="${status}"]`).classList.add("selected");
  },

  triggerPhoto() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.reportForm.foto = ev.target.result;
        document.getElementById("photo-preview-img").src = ev.target.result;
        document.getElementById("photo-preview").classList.add("active");
        document.getElementById("photo-upload").style.display = "none";
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  removePhoto() {
    this.reportForm.foto = null;
    document.getElementById("photo-preview").classList.remove("active");
    document.getElementById("photo-upload").style.display = "";
  },

  submitLaporan() {
    const lokasi = document.getElementById("input-lokasi").value.trim();
    if (!lokasi) { this.showToast("⚠️ Isi lokasi terlebih dahulu", "warning"); return; }
    if (!this.reportForm.tempat) { this.showToast("⚠️ Pilih jenis tempat penampungan air", "warning"); return; }
    if (!this.reportForm.status) { this.showToast("⚠️ Pilih status jentik", "warning"); return; }

    const poin = this.reportForm.foto ? 25 : 15;
    const now = new Date();
    const tanggal = now.toISOString().split("T")[0];

    // Add report
    const laporan = {
      id: this.state.riwayat.length + 1,
      tanggal,
      lokasi,
      tempat: this.reportForm.tempat,
      status: this.reportForm.status,
      poin,
      foto: !!this.reportForm.foto,
    };
    this.state.riwayat.unshift(laporan);

    // Update stats
    this.state.points += poin;
    this.state.totalLaporan++;
    this.state.laporanHariIni++;

    // Check streak
    if (this.state.laporanHariIni === 1) {
      this.state.streak++;
    }

    // Update level
    const newLevel = this.getLevel(this.state.points);
    const levelUp = newLevel.level > this.state.level;
    this.state.level = newLevel.level;

    // Check challenge progress
    this.updateChallengeProgress();

    // Check badges
    const newBadges = this.checkBadges();
    this.saveState();

    // Show celebration
    this.showPointsAnimation(poin);

    // Show modal after animation
    setTimeout(() => {
      let badgeMsg = "";
      if (newBadges.length > 0) {
        const badge = BADGES.find((b) => b.id === newBadges[0]);
        badgeMsg = `<div style="margin-top:8px;font-size:14px;color:var(--text-secondary)">🏅 Lencana baru: ${badge.icon} ${badge.nama}</div>`;
      }
      let levelMsg = levelUp ? `<div style="margin-top:8px;font-size:16px;font-weight:700;color:var(--accent)">🎉 Level Up! ${newLevel.icon} ${newLevel.nama}</div>` : "";
      let challengeMsg = "";
      const dailyChallenge = this.state.challengesAktif["daily_1"];
      if (dailyChallenge && dailyChallenge.selesai && !dailyChallenge._justFinished) {
        dailyChallenge._justFinished = true;
        challengeMsg = `<div style="margin-top:8px;font-size:14px;color:var(--text-secondary)">🎯 Tantangan harian selesai! +50 poin bonus</div>`;
      }

      this.showModal({
        icon: "✅",
        title: "Laporan Berhasil!",
        desc: `Laporan jentik telah dikirim ke sistem.`,
        points: poin,
        pointsLabel: "poin diperoleh",
        extra: badgeMsg + levelMsg + challengeMsg,
      });
    }, 800);

    // Reset form
    setTimeout(() => {
      this.renderLapor();
      this.renderHome();
    }, 100);
  },

  updateChallengeProgress() {
    const total = this.state.totalLaporan;
    const challenges = this.state.challengesAktif;

    // Daily: 2 reports today
    if (challenges.daily_1 && !challenges.daily_1.selesai) {
      challenges.daily_1.progress = this.state.laporanHariIni;
      if (challenges.daily_1.progress >= 2) {
        challenges.daily_1.selesai = true;
        this.state.points += 50;
      }
    }

    // Weekly: 5 reports
    if (challenges.weekly_1 && !challenges.weekly_1.selesai) {
      challenges.weekly_1.progress = Math.min(total, 5);
      if (challenges.weekly_1.progress >= 5) {
        challenges.weekly_1.selesai = true;
        this.state.points += 200;
      }
    }

    // Weekly photo: 3 reports with photo
    if (challenges.weekly_2 && !challenges.weekly_2.selesai) {
      const photoReports = this.state.riwayat.filter((r) => r.foto).length;
      challenges.weekly_2.progress = Math.min(photoReports, 3);
      if (challenges.weekly_2.progress >= 3) {
        challenges.weekly_2.selesai = true;
        this.state.points += 150;
      }
    }

    // Streak 3
    if (challenges.streak_3 && !challenges.streak_3.selesai) {
      challenges.streak_3.progress = this.state.streak;
      if (challenges.streak_3.progress >= 3) {
        challenges.streak_3.selesai = true;
        this.state.points += 100;
      }
    }
  },

  checkBadges() {
    const newBadges = [];
    const total = this.state.totalLaporan;
    const streak = this.state.streak;
    const photoCount = this.state.riwayat.filter((r) => r.foto).length;
    const challengesSelesai = Object.values(this.state.challengesAktif).filter((c) => c.selesai).length;

    const checks = [
      { id: "first_report", cond: total >= 1 },
      { id: "report_5", cond: total >= 5 },
      { id: "report_10", cond: total >= 10 },
      { id: "report_25", cond: total >= 25 },
      { id: "report_50", cond: total >= 50 },
      { id: "streak_3", cond: streak >= 3 },
      { id: "streak_7", cond: streak >= 7 },
      { id: "photo_5", cond: photoCount >= 5 },
      { id: "challenge_1", cond: challengesSelesai >= 1 },
      { id: "challenge_5", cond: challengesSelesai >= 5 },
    ];

    checks.forEach(({ id, cond }) => {
      if (cond && !this.state.badges.includes(id)) {
        this.state.badges.push(id);
        newBadges.push(id);
      }
    });

    return newBadges;
  },

  showChallengeDetail(id) {
    const c = CHALLENGES.find((ch) => ch.id === id);
    const progress = this.state.challengesAktif[id];
    const pct = progress ? Math.min((progress.progress / c.target) * 100, 100) : 0;
    const selesai = progress && progress.selesai;

    this.showModal({
      icon: c.icon,
      title: c.judul,
      desc: c.deskripsi,
      points: c.bonusPoin,
      pointsLabel: "bonus poin",
      extra: `
        <div style="margin-top:12px;">
          <div class="challenge-progress-bar" style="height:10px;">
            <div class="challenge-progress-fill" style="width:${pct}%;${selesai ? "background:var(--accent)" : ""}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:13px;color:var(--text-secondary)">
            <span>${progress ? progress.progress : 0} / ${c.target}</span>
            <span>${selesai ? "✅ Selesai" : c.berakhir}</span>
          </div>
        </div>
      `,
    });
  },

  // --- LEADERBOARD VIEW ---
  renderLeaderboard() {
    const el = document.getElementById("view-leaderboard");
    const sorted = [...MOCK_KADER].sort((a, b) => b.points - a.points);

    el.innerHTML = `
      <h1 class="view-title">🏆 Papan Peringkat</h1>
      <p class="view-subtitle">Peringkat kader berdasarkan total poin kontribusi</p>

      <div class="card">
        <!-- Top 3 Podium -->
        <div style="display:flex;justify-content:center;align-items:flex-end;gap:12px;margin-bottom:20px;padding-top:10px;">
          ${this.renderPodium(sorted[1], 2)}
          ${this.renderPodium(sorted[0], 1)}
          ${this.renderPodium(sorted[2], 3)}
        </div>

        <!-- Full List -->
        <div id="lb-full-list"></div>
      </div>
    `;

    this.renderFullLeaderboard(sorted);
  },

  renderPodium(kader, rank) {
    const heights = { 1: "100px", 2: "80px", 3: "65px" };
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
    const isMe = kader.nama === this.state.nama;
    return `
      <div style="text-align:center;flex:1;">
        <div style="font-size:${rank === 1 ? "40px" : "32px"};margin-bottom:4px;">${kader.avatar}</div>
        <div style="font-size:12px;font-weight:700;${isMe ? "color:var(--primary);" : ""}">${kader.nama.split(" ")[0]}</div>
        <div style="font-size:11px;color:var(--text-secondary)">${kader.points} poin</div>
        <div style="height:${heights[rank]};background:${rank === 1 ? "linear-gradient(180deg, #FEF3C7, #FDE68A)" : rank === 2 ? "linear-gradient(180deg, #E2E8F0, #CBD5E1)" : "linear-gradient(180deg, #FED7AA, #FDBA74)"};border-radius:12px 12px 0 0;margin-top:8px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;">${medals[rank]}</span>
        </div>
      </div>
    `;
  },

  renderFullLeaderboard(sorted) {
    const container = document.getElementById("lb-full-list");
    container.innerHTML = sorted.map((k, i) => {
      const isMe = k.nama === this.state.nama;
      return `
        <div class="lb-item ${isMe ? "lb-you" : ""}">
          <div class="lb-rank ${i < 3 ? "rank-" + (i + 1) : ""}">${i + 1}</div>
          <span class="lb-avatar">${k.avatar}</span>
          <div class="lb-info">
            <div class="lb-name">${k.nama} ${isMe ? "⭐ Anda" : ""}</div>
            <div class="lb-rw">${k.rw} • Lv.${k.level}</div>
          </div>
          <span class="lb-points">${k.points}</span>
        </div>
      `;
    }).join("");
  },

  // --- PROFIL VIEW ---
  renderProfil() {
    const el = document.getElementById("view-profil");
    const { nama, rw, points, level, avatar, totalLaporan, streak, badges, riwayat } = this.state;
    const levelData = this.getLevel(points);

    el.innerHTML = `
      <h1 class="view-title">👤 Profil Saya</h1>

      <!-- Profile Card -->
      <div class="card" style="text-align:center;padding:24px 16px;">
        <div style="font-size:56px;margin-bottom:8px;">${avatar}</div>
        <h2 style="font-size:18px;font-weight:700;">${nama}</h2>
        <p style="font-size:13px;color:var(--text-secondary);">${rw} • ${levelData.icon} ${levelData.nama}</p>
        <div style="display:flex;justify-content:center;gap:24px;margin-top:16px;">
          <div style="text-align:center;">
            <div style="font-size:22px;font-weight:800;color:var(--primary);">${points}</div>
            <div style="font-size:11px;color:var(--text-secondary);">Poin</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:22px;font-weight:800;color:var(--accent);">${totalLaporan}</div>
            <div style="font-size:11px;color:var(--text-secondary);">Laporan</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:22px;font-weight:800;color:var(--danger);">${streak}🔥</div>
            <div style="font-size:11px;color:var(--text-secondary);">Streak</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button class="tab-item active" onclick="App.switchTab('badges')">🏅 Lencana (${badges.length})</button>
        <button class="tab-item" onclick="App.switchTab('riwayat')">📋 Riwayat (${riwayat.length})</button>
        <button class="tab-item" onclick="App.switchTab('pengaturan')">⚙️ Pengaturan</button>
      </div>

      <!-- Tab: Badges -->
      <div class="tab-content active" id="tab-badges">
        <div class="badge-grid" id="profile-badges"></div>
      </div>

      <!-- Tab: Riwayat -->
      <div class="tab-content" id="tab-riwayat">
        <div class="card" id="profile-history"></div>
      </div>

      <!-- Tab: Pengaturan -->
      <div class="tab-content" id="tab-pengaturan">
        <div class="card">
          <div class="toggle-wrap">
            <div class="toggle-info">
              <h4>Notifikasi</h4>
              <p>Terima pengingat pelaporan</p>
            </div>
            <div class="toggle active" onclick="this.classList.toggle('active')"></div>
          </div>
          <div class="toggle-wrap">
            <div class="toggle-info">
              <h4>Tantangan Harian</h4>
              <p>Aktifkan tantangan otomatis</p>
            </div>
            <div class="toggle active" onclick="this.classList.toggle('active')"></div>
          </div>
          <div class="toggle-wrap">
            <div class="toggle-info">
              <h4>Leaderboard Publik</h4>
              <p>Tampilkan nama di papan peringkat</p>
            </div>
            <div class="toggle active" onclick="this.classList.toggle('active')"></div>
          </div>
          <div class="toggle-wrap" style="border-bottom:none;">
            <div class="toggle-info">
              <h4>Tentang Mo-Sweep</h4>
              <p>Versi 1.0.0 — Prototipe Riset</p>
            </div>
            <span style="color:var(--text-light);">ℹ️</span>
          </div>
        </div>
        <button class="btn btn-outline" style="margin-top:12px;" onclick="App.resetState()">🔄 Reset Data</button>
      </div>
    `;

    this.renderProfileBadges();
    this.renderProfileHistory();
  },

  switchTab(tab) {
    document.querySelectorAll(".tab-item").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((t) => t.classList.remove("active"));
    event.currentTarget.classList.add("active");
    document.getElementById(`tab-${tab}`).classList.add("active");
  },

  renderProfileBadges() {
    const container = document.getElementById("profile-badges");
    const earned = this.state.badges;
    container.innerHTML = BADGES.map((b) => {
      const has = earned.includes(b.id);
      return `
        <div class="badge-item ${has ? "" : "locked"}" title="${b.deskripsi}">
          <span class="badge-item-icon">${b.icon}</span>
          <span class="badge-item-name">${b.nama}</span>
          <span class="badge-item-desc">${has ? "Tercapai ✓" : b.syarat}</span>
        </div>
      `;
    }).join("");
  },

  renderProfileHistory() {
    const container = document.getElementById("profile-history");
    if (this.state.riwayat.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p class="empty-state-text">Belum ada riwayat laporan</p></div>';
      return;
    }
    const tempatMap = {};
    JENIS_TEMPAT.forEach((j) => { tempatMap[j.id] = j; });
    container.innerHTML = this.state.riwayat.map((r) => {
      const t = tempatMap[r.tempat] || { icon: "💧", nama: "Lainnya" };
      return `
        <div class="history-item">
          <div class="history-icon ${r.status}">
            ${r.status === "ditemukan" ? "🦟" : "✅"}
          </div>
          <div class="history-info">
            <div class="history-loc">${r.lokasi}</div>
            <div class="history-meta">
              <span>${t.icon} ${t.nama}</span>
              <span>•</span>
              <span>${this.formatDate(r.tanggal)}</span>
              ${r.foto ? '<span class="history-foto">📷</span>' : ""}
            </div>
          </div>
          <span class="history-poin">+${r.poin}</span>
        </div>
      `;
    }).join("");
  },

  // --- Utilities ---
  getLevel(points) {
    let current = LEVELS[0];
    for (const l of LEVELS) {
      if (points >= l.minPoints) current = l;
    }
    return current;
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  // --- UI Feedback ---
  showToast(msg, type = "") {
    const container = document.querySelector(".toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  showModal({ icon, title, desc, points, pointsLabel, extra = "" }) {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("modal");
    modal.innerHTML = `
      <div class="modal-icon">${icon}</div>
      <div class="modal-title">${title}</div>
      <div class="modal-desc">${desc}</div>
      <div class="modal-points">+${points} <span>${pointsLabel}</span></div>
      ${extra}
      <div class="modal-btn">
        <button class="btn btn-primary" onclick="App.closeModal()">Mantap! 👍</button>
      </div>
    `;
    overlay.classList.add("active");
  },

  closeModal() {
    document.getElementById("modal-overlay").classList.remove("active");
  },

  showPointsAnimation(poin) {
    const container = document.querySelector(".confetti-container");
    container.innerHTML = "";

    // Create floating points text
    const float = document.createElement("div");
    float.style.cssText = `
      position: fixed; top: 40%; left: 50%; transform: translateX(-50%);
      font-size: 48px; font-weight: 900; color: var(--accent);
      z-index: 301; pointer-events: none;
      animation: floatUp 1.2s ease forwards;
      text-shadow: 0 2px 10px rgba(249,115,22,0.3);
    `;
    float.textContent = `+${poin} ✨`;
    container.appendChild(float);

    // Add float animation
    if (!document.getElementById("float-style")) {
      const style = document.createElement("style");
      style.id = "float-style";
      style.textContent = `
        @keyframes floatUp {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-120px) scale(1.3); }
        }
      `;
      document.head.appendChild(style);
    }

    // Confetti
    const colors = ["#0D9488", "#F97316", "#22C55E", "#EAB308", "#EF4444", "#8B5CF6"];
    for (let i = 0; i < 30; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDelay = Math.random() * 0.5 + "s";
      c.style.animationDuration = 1 + Math.random() * 1 + "s";
      c.style.width = 6 + Math.random() * 8 + "px";
      c.style.height = 6 + Math.random() * 8 + "px";
      container.appendChild(c);
    }

    setTimeout(() => { container.innerHTML = ""; }, 2500);
  },
};

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => App.init());
