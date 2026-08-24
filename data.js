// ============================================================
// Mo-Sweep — Data Layer
// Prototipe Gamifikasi Pelaporan Jentik DBD untuk Kader Bandung
// ============================================================

const MOCK_KADER = [
  { id: 1, nama: "Rina Wulandari",   rw: "RW 03", points: 1250, level: 5, avatar: "👩" },
  { id: 2, nama: "Asep Sunarya",     rw: "RW 01", points: 1100, level: 4, avatar: "👨" },
  { id: 3, nama: "Siti Nurhaliza",   rw: "RW 05", points: 980,  level: 4, avatar: "👩" },
  { id: 4, nama: "Dedi Kuswanto",    rw: "RW 02", points: 870,  level: 3, avatar: "👨" },
  { id: 5, nama: "Yanti Sumarni",    rw: "RW 04", points: 750,  level: 3, avatar: "👩" },
  { id: 6, nama: "Rudi Hartono",     rw: "RW 06", points: 620,  level: 2, avatar: "👨" },
  { id: 7, nama: "Wati Susilawati",  rw: "RW 07", points: 510,  level: 2, avatar: "👩" },
  { id: 8, nama: "Indra Gunawan",    rw: "RW 08", points: 400,  level: 2, avatar: "👨" },
  { id: 9, nama: "Maya Anggraeni",   rw: "RW 09", points: 280,  level: 1, avatar: "👩" },
  { id: 10,nama: "Hendra Wijaya",    rw: "RW 10", points: 150,  level: 1, avatar: "👨" },
];

const BADGES = [
  { id: "first_report",  icon: "🎯", nama: "Laporan Pertama",      deskripsi: "Mengirim laporan jentik pertama",         syarat: "Kirim 1 laporan" },
  { id: "report_5",      icon: "📋", nama: "Pemula Aktif",          deskripsi: "Mengirim 5 laporan",                     syarat: "Kirim 5 laporan" },
  { id: "report_10",     icon: "📝", nama: "Pelapor Rajin",         deskripsi: "Mengirim 10 laporan",                    syarat: "Kirim 10 laporan" },
  { id: "report_25",     icon: "🏆", nama: "Pelapor Ulung",         deskripsi: "Mengirim 25 laporan",                    syarat: "Kirim 25 laporan" },
  { id: "report_50",     icon: "👑", nama: "Kader Legendaris",      deskripsi: "Mengirim 50 laporan",                    syarat: "Kirim 50 laporan" },
  { id: "streak_3",      icon: "🔥", nama: "Api Semangat",          deskripsi: "Melapor 3 hari berturut-turut",          syarat: "Streak 3 hari" },
  { id: "streak_7",      icon: "⚡", nama: "Semangat Berkobar",     deskripsi: "Melapor 7 hari berturut-turut",          syarat: "Streak 7 hari" },
  { id: "photo_5",       icon: "📸", nama: "Dokumentator",          deskripsi: "Mengirim 5 laporan dengan foto",         syarat: "5 laporan + foto" },
  { id: "challenge_1",   icon: "🏅", nama: "Penantang Pertama",     deskripsi: "Menyelesaikan tantangan pertama",        syarat: "Selesaikan 1 tantangan" },
  { id: "challenge_5",   icon: "🎖️", nama: "Pejuang Tantangan",     deskripsi: "Menyelesaikan 5 tantangan",              syarat: "Selesaikan 5 tantangan" },
  { id: "week_perfect",  icon: "🌟", nama: "Minggu Sempurna",       deskripsi: "Melapor setiap hari selama 1 minggu",   syarat: "7 hari berturut tanpa skip" },
  { id: "early_bird",    icon: "🌅", nama: "Burung Pagi",            deskripsi: "Melapor sebelum jam 8 pagi",             syarat: "Laporan sebelum jam 08:00" },
];

const JENIS_TEMPAT = [
  { id: "bak_mandi",      icon: "🛁", nama: "Bak Mandi" },
  { id: "ember",          icon: "🪣", nama: "Ember" },
  { id: "tong_air",       icon: "🛢️", nama: "Tong Air" },
  { id: "kolam_ikan",     icon: "🐟", nama: "Kolam Ikan" },
  { id: "pot_bunga",      icon: "🌸", nama: "Pot Bunga" },
  { id: "ountain",        icon: "⛲", nama: "Pemandian" },
  { id: "genangan_lain",  icon: "💧", nama: "Genangan Lainnya" },
];

const LEVELS = [
  { level: 1, nama: "Pemula",          minPoints: 0,    icon: "🌱" },
  { level: 2, nama: "Pejuang Jentik",  minPoints: 200,  icon: "🌿" },
  { level: 3, nama: "Kader Aktif",     minPoints: 500,  icon: "🌳" },
  { level: 4, nama: "Kader Andalan",   minPoints: 800,  icon: "⭐" },
  { level: 5, nama: "Kader Utama",     minPoints: 1200, icon: "👑" },
];

const CHALLENGES = [
  {
    id: "daily_1",
    tipe: "harian",
    icon: "📋",
    judul: "Lapor 2 Titik Hari Ini",
    deskripsi: "Kirim minimal 2 laporan jentik hari ini",
    target: 2,
    bonusPoin: 50,
    berakhir: "hari ini",
  },
  {
    id: "weekly_1",
    tipe: "mingguan",
    icon: "🎯",
    judul: "Rajin Seminggu",
    deskripsi: "Kirim minimal 5 laporan dalam minggu ini",
    target: 5,
    bonusPoin: 200,
    berakhir: "5 hari lagi",
  },
  {
    id: "weekly_2",
    tipe: "mingguan",
    icon: "📸",
    judul: "Dokumentator Handal",
    deskripsi: "Kirim 3 laporan dengan foto minggu ini",
    target: 3,
    bonusPoin: 150,
    berakhir: "5 hari lagi",
  },
  {
    id: "streak_3",
    tipe: "khusus",
    icon: "🔥",
    judul: "Streak 3 Hari",
    deskripsi: "Melapor 3 hari berturut-turut",
    target: 3,
    bonusPoin: 100,
    berakhir: "3 hari lagi",
  },
];

const NOTIFIKASI_CONTOH = [
  { id: 1, judul: "Laporan Berhasil!",   pesan: "Laporan jentik Anda telah dikirim. +25 poin!",  waktu: "Baru saja",  icon: "✅", tipe: "sukses" },
  { id: 2, judul: "Tantangan Baru!",     pesan: "Tantangan harian baru: Lapor 2 Titik Hari Ini", waktu: "1 jam lalu", icon: "🎯", tipe: "tantangan" },
  { id: 3, judul: "Lencana Baru!",       pesan: "Anda mendapatkan lencana 🔥 Api Semangat!",      waktu: "Kemarin",   icon: "🏅", tipe: "lencana" },
  { id: 4, judul: "Pengingat",           pesan: "Jangan lupa lapor jentik hari ini, Kader!",     waktu: "2 jam lalu",icon: "⏰", tipe: "pengingat" },
];

const INITIAL_STATE = {
  nama: "Kader Rina",
  rw: "RW 03",
  points: 350,
  level: 2,
  avatar: "👩",
  totalLaporan: 7,
  streak: 2,
  laporanHariIni: 1,
  badges: ["first_report", "report_5", "photo_5"],
  riwayat: [
    { id: 1, tanggal: "2026-08-22", lokasi: "Jl. Merdeka No. 12",  tempat: "bak_mandi",  status: "ditemukan",  poin: 25, foto: true },
    { id: 2, tanggal: "2026-08-22", lokasi: "Jl. Merdeka No. 15",  tempat: "ember",      status: "tidak",      poin: 15, foto: false },
    { id: 3, tanggal: "2026-08-21", lokasi: "Jl. Asia Afrika No. 8",tempat: "tong_air",  status: "ditemukan",  poin: 25, foto: true },
    { id: 4, tanggal: "2026-08-21", lokasi: "Jl. Asia Afrika No. 10",tempat: "pot_bunga", status: "tidak",      poin: 15, foto: false },
    { id: 5, tanggal: "2026-08-20", lokasi: "Jl. Buah Batu No. 22", tempat: "kolam_ikan", status: "ditemukan",  poin: 25, foto: true },
    { id: 6, tanggal: "2026-08-20", lokasi: "Jl. Buah Batu No. 25", tempat: "bak_mandi",  status: "tidak",      poin: 15, foto: false },
    { id: 7, tanggal: "2026-08-19", lokasi: "Jl. Gatot Subroto No. 5",tempat: "ember",    status: "ditemukan",  poin: 25, foto: true },
  ],
  challengesAktif: {
    daily_1: { progress: 1, selesai: false },
    weekly_1: { progress: 3, selesai: false },
    weekly_2: { progress: 2, selesai: false },
    streak_3: { progress: 2, selesai: false },
  },
};
