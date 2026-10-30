import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  CreditCard,
  Download,
  FileBarChart2,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Role = "dosen" | "mahasiswa" | "wali";
type NavKey = "overview" | "akademik" | "mahasiswa" | "presensi" | "keuangan" | "jadwal" | "kalender" | "pengumuman" | "profil" | "layanan";
type NavItem = { key: NavKey; label: string; icon: LucideIcon };

type RoleProfile = {
  role: Role;
  label: string;
  eyebrow: string;
  name: string;
  shortName: string;
  identifier: string;
  avatar: string;
};

const profiles: Record<Role, RoleProfile> = {
  dosen: { role: "dosen", label: "Dosen", eyebrow: "Ruang kerja pengajar", name: "Dr. Raka Pratama, M.Kom.", shortName: "Dr. Raka", identifier: "NIDN 0312088401", avatar: "RP" },
  mahasiswa: { role: "mahasiswa", label: "Mahasiswa", eyebrow: "Ruang belajar personal", name: "Nadia Aulia Putri", shortName: "Nadia", identifier: "NIM 20240876", avatar: "NA" },
  wali: { role: "wali", label: "Orang Tua / Wali", eyebrow: "Pantau progres anak", name: "Ibu Sari Wulandari", shortName: "Ibu Sari", identifier: "Akun wali terverifikasi", avatar: "SW" },
};

const navByRole: Record<Role, NavItem[]> = {
  dosen: [
    { key: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { key: "mahasiswa", label: "Mahasiswa", icon: UsersRound },
    { key: "akademik", label: "Nilai & Kelas", icon: FileBarChart2 },
    { key: "presensi", label: "Presensi", icon: Check },
    { key: "jadwal", label: "Jadwal Mengajar", icon: CalendarDays },
    { key: "kalender", label: "Kalender", icon: CalendarDays },
    { key: "pengumuman", label: "Pengumuman", icon: Bell },
    { key: "layanan", label: "Pusat Layanan", icon: LayoutDashboard },
  ],
  mahasiswa: [
    { key: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { key: "akademik", label: "KRS & KHS", icon: BookOpen },
    { key: "jadwal", label: "Jadwal Kuliah", icon: CalendarDays },
    { key: "keuangan", label: "Keuangan", icon: CreditCard },
    { key: "kalender", label: "Kalender", icon: CalendarDays },
    { key: "pengumuman", label: "Pengumuman", icon: Bell },
    { key: "layanan", label: "Pusat Layanan", icon: LayoutDashboard },
  ],
  wali: [
    { key: "overview", label: "Ringkasan Anak", icon: LayoutDashboard },
    { key: "akademik", label: "Akademik Anak", icon: GraduationCap },
    { key: "presensi", label: "Presensi", icon: Check },
    { key: "keuangan", label: "Keuangan", icon: WalletCards },
    { key: "jadwal", label: "Jadwal Kuliah", icon: CalendarDays },
    { key: "pengumuman", label: "Informasi Kampus", icon: Bell },
    { key: "layanan", label: "Pusat Layanan", icon: LayoutDashboard },
  ],
};

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum"];

function Mark({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand-mark ${small ? "brand-mark-small" : ""}`} aria-label="SIAKAD Kampus">
      <span>S</span>
    </div>
  );
}

function CountUp({ value, decimals = 0, suffix = "", duration = 1200 }: { value: number; decimals?: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);

  return <span className="count-up">{display.toFixed(decimals)}{suffix}</span>;
}

function RoleChip({ role, active, onClick }: { role: Role; active: boolean; onClick: () => void }) {
  const profile = profiles[role];
  return (
    <button className={`role-chip ${active ? "role-chip-active" : ""}`} onClick={onClick} type="button">
      <span className="role-avatar">{profile.avatar}</span>
      <span className="role-chip-copy"><strong>{profile.label}</strong><small>{role === "wali" ? "Pantau anak" : role === "dosen" ? "Kelola kelas" : "Kelola studi"}</small></span>
      {active && <Check size={15} strokeWidth={2.4} />}
    </button>
  );
}

function LoginLoadingOverlay({ role }: { role: Role }) {
  const profile = profiles[role];
  return <div className="login-loading-overlay" role="status" aria-live="polite"><div className="login-loading-card"><div className="loading-mark"><Mark small /><Loader2 className="loading-spinner" size={19} /></div><div className="eyebrow">Menyiapkan workspace</div><h2>Memuat dashboard<br /><em>{profile.label}</em></h2><p>Memeriksa akses dan menyusun ringkasan akademik Anda.</p><div className="loading-progress"><span /></div><div className="loading-meta"><span>Masuk sebagai {profile.shortName}</span><span>Harap tunggu</span></div></div></div>;
}

function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("mahasiswa");
  const [identifier, setIdentifier] = useState("20240876");
  const [password, setPassword] = useState("siakad123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockSeconds, setLockSeconds] = useState(0);

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = window.setInterval(() => setLockSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [lockSeconds]);

  const fillForRole = (nextRole: Role) => {
    setRole(nextRole);
    setError("");
    setIdentifier(nextRole === "dosen" ? "0312088401" : nextRole === "wali" ? "sari.wulandari" : "20240876");
    setPassword("siakad123");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (lockSeconds > 0) return;
    setError("");
    const valid = password === "siakad123" && identifier.trim().length >= 5;
    if (!valid) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        setLockSeconds(10);
        setError("Terlalu banyak percobaan gagal. Login dikunci sementara selama 10 detik.");
      } else {
        setError(`Identifier atau password belum sesuai. Sisa percobaan: ${3 - nextAttempts}.`);
      }
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setFailedAttempts(0);
      onLogin(role);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="login-page">
      <div className="login-orbit login-orbit-one" />
      <div className="login-orbit login-orbit-two" />
      <header className="login-topbar">
        <div className="brand-lockup"><Mark /><div><strong>SIAKAD</strong><span>KAMPUS</span></div></div>
        <div className="login-help"><CircleHelp size={16} /> <span>Butuh bantuan?</span> <b>Hubungi helpdesk</b></div>
      </header>
      <main className="login-grid">
        <section className="login-intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> Portal akademik terpadu</div>
          <h1>Ritme kampus,<br /><em>lebih tertata.</em></h1>
          <p className="login-lede">Satu ruang untuk mengelola kelas, melihat progres studi, dan tetap terhubung dengan perjalanan akademik anak.</p>
          <div className="login-note"><Sparkles size={16} /><span>Versi preview · Tahun akademik 2025/2026</span></div>
          <div className="login-stats"><div><strong>3.82</strong><span>IPK rata-rata</span></div><div><strong>92%</strong><span>Kehadiran aktif</span></div><div><strong>24/7</strong><span>Akses informasi</span></div></div>
        </section>
        <section className="login-card-wrap">
          <div className="login-card">
            <div className="card-heading"><div><div className="eyebrow">Masuk ke portal</div><h2>Selamat datang kembali</h2><p>Pilih akses Anda untuk melanjutkan.</p></div><ShieldCheck className="heading-icon" size={25} /></div>
            <div className="role-list">{(["mahasiswa", "dosen", "wali"] as Role[]).map((item) => <RoleChip key={item} role={item} active={role === item} onClick={() => fillForRole(item)} />)}</div>
            <form onSubmit={submit} className="login-form">
              <label>Identifier<span>{role === "dosen" ? "NIP / NIDN" : role === "wali" ? "Username / email wali" : "NIM"}</span><input value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" /></label>
              <label>Password<span><button type="button" className="forgot-link">Lupa password?</button></span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" /></label>
              {error && <div className="form-error"><X size={15} />{error}</div>}
              <button className="primary-button login-submit" disabled={loading || lockSeconds > 0} type="submit">{loading ? "Memverifikasi..." : lockSeconds > 0 ? `Coba lagi dalam ${lockSeconds} detik` : "Masuk ke SIAKAD"}<ArrowUpRight size={17} /></button>
            </form>
            <div className="demo-hint"><span>Akun demo aktif</span><code>Password: siakad123</code></div>
          </div>
          <p className="login-footer">Dengan masuk, Anda menyetujui <u>ketentuan penggunaan</u> dan <u>kebijakan privasi</u> kampus.</p>
        </section>
      </main>
      {loading && <LoginLoadingOverlay role={role} />}
    </div>
  );
}

function StatCard({ label, value, detail, accent, icon: Icon }: { label: string; value: ReactNode; detail: string; accent?: string; icon: LucideIcon }) {
  return <article className={`stat-card ${accent ?? ""}`}><div className="stat-icon"><Icon size={18} /></div><div className="eyebrow stat-label">{label}</div><strong>{value}</strong><span>{detail}</span></article>;
}

function ProgressBar({ value, tone = "coral" }: { value: number; tone?: "coral" | "blue" | "sage" }) {
  return <div className={`progress-track progress-${tone}`}><span style={{ width: `${value}%` }} /></div>;
}

function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-title"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action && <button className="text-button" onClick={onAction} type="button">{action}<ArrowUpRight size={15} /></button>}</div>;
}

function ScheduleList({ role }: { role: Role }) {
  const rows = role === "dosen" ? [
    ["08:00", "Pemrograman Web Lanjut", "Lab Komputer 2", "TI-5A", "Aktif", "Dr. Raka Pratama, M.Kom.", "NIDN 0312088401"],
    ["10:30", "Konsultasi skripsi", "Ruang Dosen 3.12", "4 agenda", "Agenda", "Dr. Raka Pratama, M.Kom.", "NIDN 0312088401"],
    ["13:00", "Interaksi Manusia & Komputer", "Ruang 4.08", "SI-4B", "Aktif", "Dr. Raka Pratama, M.Kom.", "NIDN 0312088401"],
  ] : [
    ["08:00", "Pemrograman Web Lanjut", "Lab Komputer 2", "3 SKS", "Berlangsung", "Dr. Raka Pratama, M.Kom.", "NIDN 0312088401"],
    ["13:00", "Interaksi Manusia & Komputer", "Ruang 4.08", "3 SKS", "Mendatang", "Siti Maharani, M.Kom.", "NIDN 0321058702"],
    ["15:30", "Kewirausahaan Digital", "Ruang 2.03", "2 SKS", "Mendatang", "Andi Kurniawan, M.M.", "NIDN 0307068203"],
  ];
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const selectedRow = rows.find((row) => row[1] === selectedTitle) ?? null;
  return <div className="schedule-list">{rows.map(([time, title, room, meta, state, lecturer, lecturerId]) => <div className={`schedule-row schedule-row-clickable ${selectedTitle === title ? "schedule-row-selected" : ""}`} key={`${time}-${title}`} role="button" tabIndex={0} onClick={() => setSelectedTitle(title)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedTitle(title); }} aria-expanded={selectedTitle === title}><div className="schedule-time">{time}<span>{time === "08:00" ? "Senin" : time === "10:30" ? "Selasa" : "Rabu"}</span></div><div className="schedule-dot" /><div className="schedule-info"><strong>{title}</strong><span>{room} · {meta}</span></div><span className={`status-pill ${state === "Berlangsung" || state === "Aktif" ? "status-live" : "status-soft"}`}>{state}</span><ArrowUpRight size={15} className="schedule-open-icon" /></div>)}{selectedRow && <div className="schedule-detail-card"><div className="schedule-detail-heading"><div><div className="eyebrow">Detail jadwal terpilih</div><h4>{selectedRow[1]}</h4></div><button type="button" className="schedule-detail-close" onClick={() => setSelectedTitle(null)}><X size={15} /></button></div><div className="schedule-state-badges"><span className="detail-badge detail-badge-coral">{selectedRow[4]}</span><span className="detail-badge detail-badge-blue">{selectedRow[3]}</span><span className="detail-badge detail-badge-sage">{selectedRow[2]}</span></div><div className="schedule-detail-meta"><div><span>Dosen pengampu</span><strong>{selectedRow[5]}</strong></div><div><span>Nomor induk dosen</span><strong>{selectedRow[6]}</strong></div></div></div>}</div>;
}

function Overview({ role, onNavigate }: { role: Role; onNavigate: (key: NavKey) => void }) {
  if (role === "dosen") return <DosenOverview onNavigate={onNavigate} />;
  if (role === "wali") return <WaliOverview onNavigate={onNavigate} />;
  return <MahasiswaOverview onNavigate={onNavigate} />;
}

function DosenOverview({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  return <>
    <div className="stats-grid"><StatCard label="Kelas diampu" value="6" detail="+1 dari semester lalu" accent="stat-coral" icon={BookOpen} /><StatCard label="Mahasiswa aktif" value="184" detail="Di 6 kelas berjalan" icon={UsersRound} /><StatCard label="Kehadiran kelas" value={<CountUp value={92.4} decimals={1} suffix="%" />} detail="+4.2% bulan ini" accent="stat-sage" icon={Check} /><StatCard label="Perlu ditinjau" value="3" detail="Nilai & presensi" accent="stat-amber" icon={Clock3} /></div>
    <div className="content-grid content-grid-main"><section className="panel agenda-panel"><SectionTitle eyebrow="Agenda hari ini · Senin, 20 Oktober" title="Jadwal mengajar" action="Lihat semua" /><ScheduleList role="dosen" /></section><section className="panel focus-panel"><div className="focus-top"><div><div className="eyebrow">Fokus minggu ini</div><h3>Nilai UTS<br /><em>menunggu review.</em></h3></div><div className="focus-badge">3 kelas</div></div><div className="focus-chart"><div className="chart-bars"><span style={{ height: "42%" }} /><span style={{ height: "62%" }} /><span style={{ height: "55%" }} /><span style={{ height: "82%" }} /><span style={{ height: "72%" }} /><span style={{ height: "95%" }} /><span style={{ height: "80%" }} /></div><div className="chart-labels"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div></div><button className="outline-button" onClick={() => onNavigate("akademik")}>Buka pusat penilaian <ArrowUpRight size={16} /></button></section></div>
    <div className="content-grid content-grid-bottom"><section className="panel"><SectionTitle eyebrow="Kelas aktif" title="Ringkasan perkuliahan" action="Kelola kelas" /><div className="course-list"><CourseRow code="IF-402" title="Pemrograman Web Lanjut" meta="TI-5A · 32 mahasiswa" progress={78} tone="coral" /><CourseRow code="SI-318" title="Interaksi Manusia & Komputer" meta="SI-4B · 28 mahasiswa" progress={64} tone="blue" /><CourseRow code="IF-215" title="Struktur Data" meta="TI-2C · 35 mahasiswa" progress={86} tone="sage" /></div></section><section className="panel notice-panel"><SectionTitle eyebrow="Papan informasi" title="Kabar kampus" action="Semua kabar" onAction={() => onNavigate("pengumuman")} /><div className="notice-list"><div className="notice-item"><span className="notice-date">18<br /><small>OKT</small></span><div><strong>Pengisian BKD semester ganjil</strong><p>Batas pengumpulan 31 Oktober 2025.</p></div><ArrowUpRight size={16} /></div><div className="notice-item"><span className="notice-date notice-date-coral">22<br /><small>OKT</small></span><div><strong>Rapat koordinasi dosen</strong><p>Ruang Senat · 13.30 WIB.</p></div><ArrowUpRight size={16} /></div></div></section></div>
  </>;
}

function MahasiswaOverview({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  return <>
    <div className="stats-grid"><StatCard label="Indeks prestasi kumulatif" value="3.82" detail="Naik 0.18 semester ini" accent="stat-coral" icon={GraduationCap} /><StatCard label="SKS lulus" value="92 / 144" detail="52 SKS tersisa" icon={BookOpen} /><StatCard label="Status akademik" value="Aktif" detail="Semester 5 · 2025/2026" accent="stat-sage" icon={ShieldCheck} /><StatCard label="Tagihan aktif" value="Rp 1,25 jt" detail="Jatuh tempo 31 Okt" accent="stat-amber" icon={CreditCard} /></div>
    <div className="content-grid content-grid-main"><section className="panel agenda-panel"><SectionTitle eyebrow="Minggu ini · 20–25 Oktober" title="Jadwal kuliah" action="Lihat kalender" /><ScheduleList role="mahasiswa" /></section><section className="panel progress-panel"><div className="eyebrow">Progress perjalanan studi</div><h3>Lebih dari setengah<br /><em>jalan sudah dilalui.</em></h3><div className="progress-summary"><strong><CountUp value={64} suffix="%" /></strong><span>92 dari 144 SKS</span></div><ProgressBar value={64} /><div className="progress-meta"><span>Semester 5</span><span>Target lulus 2028</span></div><button className="outline-button" onClick={() => onNavigate("akademik")}>Lihat transkrip <ArrowUpRight size={16} /></button></section></div>
    <div className="content-grid content-grid-bottom"><section className="panel"><SectionTitle eyebrow="Tindakan cepat" title="Yang perlu kamu selesaikan" /><div className="task-list"><TaskRow tone="coral" icon={BookOpen} title="Ajukan KRS semester ini" detail="Batas pengajuan 24 Oktober 2025" action="Buka KRS" onClick={() => onNavigate("akademik")} /><TaskRow tone="amber" icon={CreditCard} title="Selesaikan tagihan kuliah" detail="VA 8808 1200 2408 76" action="Tinjau" onClick={() => onNavigate("keuangan")} /><TaskRow tone="blue" icon={CalendarDays} title="Cek jadwal UTS" detail="Jadwal diumumkan 27 Oktober 2025" action="Lihat" onClick={() => onNavigate("kalender")} /></div></section><section className="panel notice-panel"><SectionTitle eyebrow="Kabar kampus" title="Untukmu" action="Semua kabar" onAction={() => onNavigate("pengumuman")} /><div className="notice-list"><NoticeRow date="25" month="OKT" title="Workshop portfolio digital" detail="Terbuka untuk mahasiswa tingkat akhir." onOpen={() => onNavigate("pengumuman")} /><NoticeRow date="28" month="OKT" title="Beasiswa prestasi dibuka" detail="Daftar sebelum 28 Oktober." tone="coral" onOpen={() => onNavigate("pengumuman")} /><NoticeRow date="31" month="OKT" title="Tagihan kuliah aktif" detail="Lihat detail dan metode pembayaran." tone="amber" onOpen={() => onNavigate("keuangan")} /></div></section></div>
  </>;
}

function WaliOverview({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const sendMessage = (event: FormEvent) => { event.preventDefault(); setMessageSent(true); window.setTimeout(() => { setMessageSent(false); setContactOpen(false); }, 1800); };
  return <>
    <div className="child-banner"><div className="child-avatar">NA</div><div><div className="eyebrow">Anak yang dipantau</div><h3>Nadia Aulia Putri</h3><p>NIM 20240876 · Sistem Informasi · Angkatan 2024</p></div><span className="active-badge"><i /> Aktif kuliah</span><button className="select-child">Nadia <ChevronDown size={15} /></button></div>
    <div className="stats-grid"><StatCard label="Indeks prestasi kumulatif" value="3.82" detail="Semester terakhir · Sangat baik" accent="stat-coral" icon={GraduationCap} /><StatCard label="SKS lulus" value="92 SKS" detail="64% dari total kurikulum" icon={BookOpen} /><StatCard label="Kehadiran" value={<CountUp value={94.6} decimals={1} suffix="%" />} detail="Naik 2.8% bulan ini" accent="stat-sage" icon={Check} /><StatCard label="Tagihan aktif" value="Rp 1,25 jt" detail="Jatuh tempo 31 Oktober" accent="stat-amber" icon={CreditCard} /></div>
    <div className="content-grid content-grid-main"><section className="panel agenda-panel"><SectionTitle eyebrow="Aktivitas terdekat" title="Jadwal Nadia" action="Lihat semua" onAction={() => onNavigate("jadwal")} /><ScheduleList role="mahasiswa" /></section><section className="panel attendance-panel"><div className="eyebrow">Rekap kehadiran</div><h3>Konsisten hadir<br /><em>di setiap pekan.</em></h3><div className="attendance-ring"><div><strong><CountUp value={94.6} decimals={1} suffix="%" /></strong><span>hadir</span></div></div><div className="attendance-legend"><span><i className="legend-dot legend-present" /> Hadir <b>35</b></span><span><i className="legend-dot legend-permit" /> Izin <b>2</b></span><span><i className="legend-dot legend-absent" /> Alpha <b>0</b></span></div><button className="outline-button" onClick={() => onNavigate("presensi")}>Lihat detail presensi <ArrowUpRight size={16} /></button></section></div>
    <div className="content-grid content-grid-bottom"><section className="panel"><SectionTitle eyebrow="Perkembangan akademik" title="Ringkasan semester" action="Buka transkrip" onAction={() => onNavigate("akademik")} /><div className="semester-row"><div className="semester-title"><span className="semester-dot" /><div><strong>Semester 5 · 2025/2026</strong><small>18 SKS · IP Semester 3.91</small></div></div><span className="grade-chip">Sangat baik</span></div><ProgressBar value={77} tone="blue" /><div className="progress-meta"><span>14 mata kuliah ditempuh</span><span>3.91 IPS</span></div><div className="semester-row semester-row-muted"><div className="semester-title"><span className="semester-dot" /><div><strong>Semester 4 · 2024/2025</strong><small>21 SKS · IP Semester 3.73</small></div></div><span className="grade-chip grade-chip-muted">Selesai</span></div></section><section className="panel contact-panel"><div className="eyebrow">Kontak pendamping</div><h3>Dosen pembimbing<br /><em>siap membantu.</em></h3><div className="contact-person"><div className="contact-avatar">RP</div><div><strong>Dr. Raka Pratama</strong><span>Pembimbing akademik</span></div><button className="icon-button"><MessageSquareText size={17} /></button></div><button className="outline-button" onClick={() => setContactOpen(true)}>Hubungi dosen pembimbing <ArrowUpRight size={16} /></button></section></div>
    {contactOpen && <div className="contact-modal-backdrop"><form className="contact-modal" onSubmit={sendMessage}><div className="contact-modal-head"><div><div className="eyebrow">Komunikasi akademik</div><h3>Hubungi dosen pembimbing</h3></div><button type="button" className="schedule-detail-close" onClick={() => setContactOpen(false)}><X size={16} /></button></div><div className="contact-recipient"><div className="contact-avatar">RP</div><div><strong>Dr. Raka Pratama</strong><span>Pembimbing akademik · NIDN 0312088401</span></div></div><label>Topik<select defaultValue="Konsultasi akademik"><option>Konsultasi akademik</option><option>KRS dan rencana studi</option><option>Presensi</option><option>Permohonan administrasi</option></select></label><label>Prioritas<select defaultValue="Normal"><option>Normal</option><option>Perlu perhatian</option><option>Urgent</option></select></label><label>Pesan<textarea required minLength={10} placeholder="Tuliskan pesan untuk dosen pembimbing..." rows={4} /></label><div className="contact-modal-actions"><span>{messageSent ? "Pesan tersimpan sebagai draft terkirim." : "Balasan akan masuk ke pusat komunikasi."}</span><button className="primary-button" type="submit">Kirim pesan <ArrowUpRight size={15} /></button></div></form></div>}
  </>;
}

function CourseRow({ code, title, meta, progress, tone }: { code: string; title: string; meta: string; progress: number; tone: "coral" | "blue" | "sage" }) {
  return <div className="course-row"><div className={`course-code course-${tone}`}>{code}</div><div className="course-copy"><strong>{title}</strong><span>{meta}</span><ProgressBar value={progress} tone={tone} /></div><span className="course-percent"><CountUp value={progress} suffix="%" /></span><MoreHorizontal size={17} className="muted-icon" /></div>;
}

function TaskRow({ tone, icon: Icon, title, detail, action, onClick }: { tone: string; icon: LucideIcon; title: string; detail: string; action: string; onClick: () => void }) {
  return <div className="task-row"><div className={`task-icon task-${tone}`}><Icon size={17} /></div><div><strong>{title}</strong><span>{detail}</span></div><button onClick={onClick}>{action}<ArrowUpRight size={14} /></button></div>;
}

function NoticeRow({ date, month, title, detail, tone, onOpen }: { date: string; month: string; title: string; detail: string; tone?: string; onOpen: () => void }) {
  return <button className="notice-item notice-item-action" onClick={onOpen} type="button"><span className={`notice-date ${tone ? `notice-date-${tone}` : ""}`}>{date}<br /><small>{month}</small></span><div><strong>{title}</strong><p>{detail}</p></div><ArrowUpRight size={16} /></button>;
}

function AnnouncementsView({ role }: { role: Role }) {
  const items = role === "dosen" ? [{ title: "Rapat koordinasi dosen", detail: "Agenda dan bahan rapat tersedia untuk ditinjau.", date: "22 Okt 2025", tone: "blue" }, { title: "Pengumpulan nilai UTS", detail: "Pastikan nilai seluruh kelas tersimpan sebelum tenggat.", date: "27 Okt 2025", tone: "coral" }, { title: "Pembaruan kalender akademik", detail: "Kalender ujian semester telah diperbarui.", date: "18 Okt 2025", tone: "amber" }] : [{ title: "Batas pengajuan KRS", detail: "Ajukan KRS semester ini sebelum 24 Oktober 2025.", date: "Hari ini", tone: "coral" }, { title: "Workshop portfolio digital", detail: "Terbuka untuk mahasiswa tingkat akhir dan wali.", date: "25 Okt 2025", tone: "blue" }, { title: "Tagihan kuliah aktif", detail: "Tagihan berikutnya jatuh tempo 31 Oktober 2025.", date: "28 Okt 2025", tone: "amber" }];
  return <div className="module-layout"><section className="panel wide-panel announcements-panel"><div className="module-toolbar"><div><div className="eyebrow">Pusat informasi</div><h2>Pengumuman kampus</h2></div><span className="notification-count">3 baru</span></div><div className="announcement-list">{items.map((item) => <article className="announcement-card" key={item.title}><span className={`announcement-icon announcement-icon-${item.tone}`}><Bell size={16} /></span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.date}</small></div><ArrowUpRight size={16} /></article>)}</div></section></div>;
}

function ServicesView({ role }: { role: Role }) {
  const [activeAction, setActiveAction] = useState("");
  const isStudent = role === "mahasiswa";
  const isLecturer = role === "dosen";
  const cards = [
    { group: "Keamanan & Akun", tone: "coral", title: "Lindungi akun Anda", body: "Ganti password, lihat perangkat aktif, atur timeout sesi, dan aktifkan notifikasi login baru.", actions: ["Ganti password", "Perangkat aktif"] },
    { group: isStudent ? "Akademik Mahasiswa" : isLecturer ? "Akademik Dosen" : "Akademik Anak", tone: "blue", title: isStudent ? "KRS menunggu persetujuan PA" : isLecturer ? "Nilai & materi perkuliahan" : "Pantau proses akademik", body: isStudent ? "Ajukan KRS lalu pantau status draft, menunggu persetujuan PA, disetujui, atau ditolak." : isLecturer ? "Input nilai per mahasiswa, import Excel, kirim nilai final, unggah RPS, dan atur ujian." : "Lihat status KRS, transkrip, evaluasi dosen, cuti akademik, dan pengajuan administrasi.", actions: isStudent ? ["Ajukan KRS", "Unduh transkrip PDF"] : isLecturer ? ["Input nilai", "Upload RPS"] : ["Lihat transkrip", "Status pengajuan"] },
    { group: "Keuangan", tone: "amber", title: "Tagihan & pengingat", body: "Unduh invoice/kuitansi, pilih metode pembayaran, dan terima pengingat otomatis H-3 atau H-1.", actions: ["Riwayat invoice", "Atur pengingat"] },
    { group: "Komunikasi", tone: "sage", title: "Tetap terhubung", body: "Kirim pesan ke dosen pembimbing/wali akademik dan buat pengaduan dengan nomor tiket.", actions: ["Pesan baru", "Buat pengaduan"] },
    { group: "Pengalaman & Aksesibilitas", tone: "blue", title: "Atur pengalaman Anda", body: "Gunakan pencarian global, atur kategori notifikasi, aktifkan dark mode, dan navigasi dengan keyboard.", actions: ["Preferensi notifikasi", "Tema & tampilan"] },
    { group: "Integrasi Kampus", tone: "coral", title: "Layanan terhubung", body: "Ekspor kalender ke Google Calendar/ICS, akses perpustakaan, surat aktif kuliah, dan SKPI.", actions: ["Ekspor kalender", "Layanan administrasi"] },
  ];
  return <div className="module-layout"><section className="panel services-hero"><div><div className="eyebrow">Pusat Layanan · {profiles[role].label}</div><h2>Semua kebutuhan kampus,<br /><em>lebih dekat.</em></h2><p>Kelola keamanan akun, proses akademik, pembayaran, komunikasi, dan integrasi administrasi dari satu ruang.</p></div><div className="service-status"><Check size={16} /><span><strong>Sistem aktif</strong><small>Semua layanan tersedia</small></span></div></section><div className="services-grid">{cards.map((card) => <article className="panel service-card" key={card.group}><div className={`service-icon service-icon-${card.tone}`}><ShieldCheck size={17} /></div><div className="eyebrow">{card.group}</div><h3>{card.title}</h3><p>{card.body}</p><div className="service-actions">{card.actions.map((action) => <button key={action} onClick={() => setActiveAction(action)}>{action}<ArrowUpRight size={14} /></button>)}</div></article>)}</div>{activeAction && <div className="toast"><Check size={16} /><span>{activeAction} siap dibuka pada MVP.</span></div>}</div>;
}

function ModuleView({ role, navKey, onNavigate }: { role: Role; navKey: NavKey; onNavigate: (key: NavKey) => void }) {
  if (navKey === "overview") return <Overview role={role} onNavigate={onNavigate} />;
  if (navKey === "profil") return <ProfileSettingsView role={role} />;
  if (navKey === "pengumuman") return <AnnouncementsView role={role} />;
  if (navKey === "layanan") return <ServicesView role={role} />;
  if (navKey === "jadwal") return <div className="module-layout"><section className="panel wide-panel"><SectionTitle eyebrow={role === "dosen" ? "Agenda pengajar" : "Agenda kuliah"} title={role === "dosen" ? "Jadwal mengajar" : "Jadwal kuliah"} action="Tambah ke kalender" onAction={() => onNavigate("kalender")} /><div className="week-strip">{weekDays.map((day, index) => <div className={index === 0 ? "week-day week-day-active" : "week-day"} key={day}><span>{day}</span><strong>{20 + index}</strong></div>)}</div><ScheduleList role={role === "dosen" ? "dosen" : "mahasiswa"} /><div className="empty-note"><Clock3 size={17} /><span>Semua jadwal sudah tersinkron dengan kalender akademik.</span></div></section></div>;
  if (navKey === "keuangan") return <FinanceView role={role} onNavigate={onNavigate} />;
  if (navKey === "presensi") return <AttendanceView role={role} />;
  if (navKey === "akademik" || navKey === "mahasiswa") return <AcademicView role={role} navKey={navKey} />;
  if (navKey === "kalender" || navKey === "pengumuman") return <CalendarView role={role} />;
  return null;
}

function AcademicView({ role, navKey }: { role: Role; navKey: NavKey }) {
  const [semester, setSemester] = useState("2025/2026 Ganjil");
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<string[]>(["IF-402", "SI-318"]);
  const isDosen = role === "dosen";
  const courses = isDosen ? [{ code: "IF-402", title: "Pemrograman Web Lanjut", students: "32 mahasiswa", grade: "Menunggu" }, { code: "SI-318", title: "Interaksi Manusia & Komputer", students: "28 mahasiswa", grade: "Draft" }, { code: "IF-215", title: "Struktur Data", students: "35 mahasiswa", grade: "Selesai" }] : [{ code: "IF-402", title: "Pemrograman Web Lanjut", students: "3 SKS · Kelas A", grade: "A-" }, { code: "SI-318", title: "Interaksi Manusia & Komputer", students: "3 SKS · Kelas B", grade: "A" }, { code: "DKV-208", title: "Kewirausahaan Digital", students: "2 SKS · Kelas A", grade: "B+" }, { code: "IF-305", title: "Basis Data Lanjut", students: "3 SKS · Kelas A", grade: "A" }];
  return <div className="module-layout"><section className="panel wide-panel"><div className="module-toolbar"><div><div className="eyebrow">{isDosen ? "Pusat penilaian" : navKey === "akademik" ? "Rencana studi & hasil belajar" : "Kelas saya"}</div><h2>{isDosen ? "Nilai dan kelas" : navKey === "akademik" ? "KRS & KHS" : "Daftar mata kuliah"}</h2></div><select value={semester} onChange={(event) => setSemester(event.target.value)}><option>2025/2026 Ganjil</option><option>2024/2025 Genap</option></select></div>{!isDosen && navKey === "akademik" && <div className="krs-banner"><div><strong>KRS semester ini belum diajukan</strong><span>Pilih mata kuliah lalu ajukan sebelum 24 Oktober 2025.</span></div><button className="primary-button" onClick={() => setSubmitted(true)}>{submitted ? "KRS diajukan" : "Ajukan KRS"}<ArrowUpRight size={15} /></button></div>}<div className="data-table"><div className="table-head"><span>Kode / Mata kuliah</span><span>{isDosen ? "Komposisi kelas" : "Beban studi"}</span><span>Status</span><span /></div>{courses.map((course) => <div className="table-row" key={course.code}><div className="course-cell"><span className="table-code">{course.code}</span><strong>{course.title}</strong></div><span className="table-muted">{course.students}</span><span className={`table-status ${course.grade === "A" || course.grade === "A-" ? "table-status-good" : ""}`}>{course.grade}</span>{!isDosen && navKey === "akademik" ? <button className={`check-toggle ${selected.includes(course.code) ? "check-toggle-on" : ""}`} onClick={() => setSelected((items) => items.includes(course.code) ? items.filter((item) => item !== course.code) : [...items, course.code])}>{selected.includes(course.code) && <Check size={14} />}</button> : <MoreHorizontal size={17} className="muted-icon" />}</div>)}</div>{!isDosen && navKey === "akademik" && <div className="table-foot"><span>{selected.length} mata kuliah dipilih · {selected.length * 3} SKS</span><span className="table-foot-note"><Check size={14} /> Tidak ada bentrok jadwal</span></div>}</section></div>;
}

function AttendanceView({ role }: { role: Role }) {
  const [filter, setFilter] = useState("Semua");
  const [marked, setMarked] = useState<Record<string, string>>({ "Nadia Aulia": "Hadir" });
  const isWali = role === "wali";
  const students = [{ name: "Nadia Aulia", id: "20240876", status: marked["Nadia Aulia"] ?? "Hadir", total: "14 / 15" }, { name: "Rafi Akbar", id: "20240831", status: marked["Rafi Akbar"] ?? "Hadir", total: "15 / 15" }, { name: "Maya Lestari", id: "20240812", status: marked["Maya Lestari"] ?? "Izin", total: "13 / 15" }, { name: "Farhan Yusuf", id: "20240802", status: marked["Farhan Yusuf"] ?? "Hadir", total: "12 / 15" }];
  return <div className="module-layout"><section className="panel wide-panel"><div className="module-toolbar"><div><div className="eyebrow">{isWali ? "Rekap kehadiran anak" : "Pertemuan ke-12 · 20 Oktober 2025"}</div><h2>{isWali ? "Presensi Nadia" : "Presensi mahasiswa"}</h2></div>{!isWali && <select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Semua mahasiswa</option><option>Hadir</option><option>Belum diisi</option></select>}</div><div className="attendance-summary"><div><strong><CountUp value={94.6} decimals={1} suffix="%" /></strong><span>Rata-rata kehadiran</span></div><div><strong>35</strong><span>Hadir bulan ini</span></div><div><strong>0</strong><span>Alpha tercatat</span></div></div><div className="data-table"><div className="table-head"><span>Mahasiswa</span><span>Total hadir</span><span>Status hari ini</span><span /></div>{students.map((student) => <div className="table-row" key={student.id}><div className="student-cell"><div className="mini-avatar">{student.name.split(" ").map((part) => part[0]).join("")}</div><div><strong>{student.name}</strong><span>{student.id}</span></div></div><span className="table-muted">{student.total}</span><span className={`attendance-status attendance-${student.status.toLowerCase()}`}>{student.status}</span>{!isWali && <div className="attendance-actions"><button onClick={() => setMarked((items) => ({ ...items, [student.name]: "Hadir" }))}>Hadir</button><button onClick={() => setMarked((items) => ({ ...items, [student.name]: "Izin" }))}>Izin</button></div>}</div>)}</div></section></div>;
}

function FinanceView({ role, onNavigate }: { role: Role; onNavigate: (key: NavKey) => void }) {
  const [paid, setPaid] = useState(false);
  return <div className="module-layout"><section className="panel wide-panel"><div className="module-toolbar"><div><div className="eyebrow">Keuangan akademik</div><h2>{role === "wali" ? "Tagihan Nadia" : "Tagihan & pembayaran"}</h2></div><button className="outline-button compact-button" onClick={() => onNavigate("overview")}>Kembali ke ringkasan</button></div><div className="finance-highlight"><div><span className="eyebrow">Total tagihan aktif</span><strong>Rp 1.250.000</strong><span className="finance-deadline">Jatuh tempo 31 Oktober 2025</span></div><div className="va-box"><span>Virtual Account</span><strong>8808 1200 2408 76</strong><button onClick={() => navigator.clipboard?.writeText("88081200240876")}>Salin VA</button></div><button className="primary-button" onClick={() => setPaid(true)}>{paid ? "Pembayaran diproses" : "Bayar sekarang"}<ArrowUpRight size={16} /></button></div><SectionTitle eyebrow="Riwayat transaksi" title="Pembayaran terakhir" action="Unduh riwayat" /><div className="transaction-list"><div className="transaction-row"><div className="transaction-icon"><Check size={16} /></div><div><strong>SPP Semester 5</strong><span>12 September 2025 · Bank Mandiri</span></div><b>Rp 3.750.000</b><span className="status-pill status-live">Berhasil</span></div><div className="transaction-row"><div className="transaction-icon transaction-icon-soft"><Clock3 size={16} /></div><div><strong>Biaya SKS Semester 5</strong><span>Tagihan baru · 31 Oktober 2025</span></div><b>Rp 1.250.000</b><span className="status-pill status-pending">Belum bayar</span></div></div></section></div>;
}

function CalendarView({ role }: { role: Role }) {
  const [month, setMonth] = useState("Oktober 2025");
  const events = role === "dosen" ? [["20", "Mengajar · Pemrograman Web", "08:00–10:15", "coral"], ["22", "Rapat koordinasi dosen", "13:30–15:00", "blue"], ["27", "Ujian Tengah Semester", "Semua kelas", "amber"]] : [["20", "Pemrograman Web Lanjut", "08:00–10:15", "coral"], ["24", "Batas pengajuan KRS", "Portal akademik", "blue"], ["27", "Ujian Tengah Semester", "Lihat jadwal", "amber"]];
  return <div className="module-layout"><section className="panel wide-panel"><div className="module-toolbar"><div><div className="eyebrow">Kalender akademik</div><h2>Agenda kampus</h2></div><select value={month} onChange={(event) => setMonth(event.target.value)}><option>Oktober 2025</option><option>November 2025</option></select></div><div className="calendar-layout"><div className="calendar-grid"><div className="calendar-week-labels">{["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((item) => <span key={item}>{item}</span>)}</div><div className="calendar-days">{Array.from({ length: 31 }, (_, index) => <span key={index} className={index + 1 === 20 ? "calendar-day calendar-day-active" : [24, 27].includes(index + 1) ? "calendar-day calendar-day-event" : "calendar-day"}>{index + 1}</span>)}</div></div><div className="event-list"><div className="eyebrow">Agenda penting · {month}</div>{events.map(([date, title, time, tone]) => <div className="event-row" key={title}><span className={`event-date event-${tone}`}>{date}</span><div><strong>{title}</strong><span>{time}</span></div><ArrowUpRight size={15} /></div>)}</div></div></section></div>;
}

function ProfileSettingsView({ role }: { role: Role }) {
  const profile = profiles[role];
  const [saved, setSaved] = useState(false);
  const [motorCount, setMotorCount] = useState("1");
  const [carCount, setCarCount] = useState("0");
  const [consent, setConsent] = useState(false);
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!consent) return;
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2800);
  };
  return <div className="module-layout"><form className="profile-settings-grid" onSubmit={save}><section className="panel settings-panel"><div className="module-toolbar"><div><div className="eyebrow">Pengaturan profil</div><h2>Data diri & akademik</h2></div><span className="settings-lock"><ShieldCheck size={14} /> Nama & ID terkunci</span></div><div className="settings-notice"><ShieldCheck size={16} /><span>Data identitas utama tidak dapat diubah dari sini. Gunakan layanan akademik resmi jika ada koreksi nama, NIM, atau NIDN.</span></div><div className="settings-fields"><label>Nama lengkap<input value={profile.name} readOnly /></label><label>{role === "mahasiswa" ? "NIM" : role === "dosen" ? "NIDN / NIP" : "ID akun wali"}<input value={profile.identifier} readOnly /></label><label>Peran<select defaultValue={profile.label}><option>{profile.label}</option></select></label><label>Asal sekolah / institusi<input defaultValue={role === "mahasiswa" ? "SMK Negeri 2 Bandung" : "Universitas Teknologi Nusantara"} placeholder="Nama SMA / SMK" /></label><label>Jenis sekolah<select defaultValue={role === "mahasiswa" ? "SMK" : "Perguruan tinggi"}><option>SMA</option><option>SMK</option><option>MA</option><option>Perguruan tinggi</option></select></label><label>Akreditasi sekolah asal<select defaultValue="A"><option>A</option><option>B</option><option>C</option><option>Baik</option><option>Belum terakreditasi</option></select></label><label>Tahun lulus<input type="number" defaultValue="2024" min="1950" max="2035" /></label><label>Kota sekolah asal<input defaultValue="Bandung" /></label></div></section><section className="panel settings-panel"><div className="section-title"><div><div className="eyebrow">Data keluarga & kondisi ekonomi</div><h2>Informasi pendukung</h2></div><span className="optional-label">Opsional · dapat diperbarui</span></div><div className="settings-fields"><label>Nama ayah<input defaultValue="Budi Aulia" placeholder="Nama lengkap ayah" /></label><label>Nama ibu<input defaultValue="Siti Rahma" placeholder="Nama lengkap ibu" /></label><label>Nama wali (jika ada)<input placeholder="Nama wali" /></label><label>Relasi wali<select defaultValue="Tidak ada"><option>Tidak ada</option><option>Ayah</option><option>Ibu</option><option>Wali keluarga</option><option>Wali lainnya</option></select></label><label>Gaji ayah / bulan<select defaultValue="Rp 5–10 juta"><option>Di bawah Rp 3 juta</option><option>Rp 3–5 juta</option><option>Rp 5–10 juta</option><option>Rp 10–20 juta</option><option>Di atas Rp 20 juta</option><option>Tidak ingin mengisi</option></select></label><label>Gaji ibu / bulan<select defaultValue="Rp 3–5 juta"><option>Di bawah Rp 3 juta</option><option>Rp 3–5 juta</option><option>Rp 5–10 juta</option><option>Rp 10–20 juta</option><option>Di atas Rp 20 juta</option><option>Tidak ingin mengisi</option></select></label><label>Jumlah motor<select value={motorCount} onChange={(event) => setMotorCount(event.target.value)}><option>0</option><option>1</option><option>2</option><option>3 atau lebih</option></select></label><label>Jumlah mobil<select value={carCount} onChange={(event) => setCarCount(event.target.value)}><option>0</option><option>1</option><option>2</option><option>3 atau lebih</option></select></label></div><div className="privacy-note"><ShieldCheck size={15} /><span>Informasi keluarga digunakan untuk pemetaan bantuan pendidikan dan disimpan secara terbatas.</span></div><label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Saya menyetujui penggunaan data keluarga dan kondisi ekonomi untuk keperluan layanan pendidikan, bantuan, dan administrasi kampus.</span></label><div className="settings-actions"><span>{saved ? <><Check size={15} /> Perubahan tersimpan sebagai draft</> : "Terakhir diperbarui: belum pernah"}</span><button className="primary-button" disabled={!consent} type="submit">Simpan data profil <ArrowUpRight size={16} /></button></div></section></form></div>;
}

function Dashboard({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const profile = profiles[role];
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");
  const navItems = navByRole[role];
  const greeting = role === "wali" ? "Pantau yang berarti." : role === "dosen" ? "Ruang kelas Anda, hari ini." : "Hari ini, kuliahmu sudah tersusun.";
  const dateLabel = useMemo(() => "Senin, 20 Oktober 2025", []);
  const activeLabel = activeNav === "profil" ? "Pengaturan Profil" : navItems.find((item) => item.key === activeNav)?.label;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (key: NavKey) => {
    setActiveNav(key);
    setSidebarOpen(false);
  };

  return <div className={`app-shell ${darkMode ? "theme-dark" : ""}`}><aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}><div className="sidebar-top"><div className="brand-lockup brand-lockup-sidebar"><Mark small /><div><strong>SIAKAD</strong><span>KAMPUS</span></div></div><button className="sidebar-collapse" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label={sidebarCollapsed ? "Perbesar sidebar" : "Perkecil sidebar"} title={sidebarCollapsed ? "Perbesar sidebar" : "Perkecil sidebar"}>{sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button><button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div><div className="sidebar-context"><span className="context-kicker">Anda masuk sebagai</span><strong>{profile.label}</strong><span className="context-id">{profile.identifier}</span></div><nav className="sidebar-nav"><span className="nav-label">Workspace</span>{navItems.map((item) => { const Icon = item.icon; return <button key={item.key} title={sidebarCollapsed ? item.label : undefined} className={activeNav === item.key ? "nav-item nav-item-active" : "nav-item"} onClick={() => navigate(item.key)}><Icon size={17} /><span>{item.label}</span>{item.key === "pengumuman" && <i className="nav-notification" />}</button>; })}</nav><div className="sidebar-bottom"><button className="help-card" onClick={() => setToast("Helpdesk kampus akan menghubungi Anda.")}><CircleHelp size={17} /><div><strong>Butuh bantuan?</strong><span>Hubungi helpdesk</span></div><ArrowUpRight size={15} /></button><button className="profile-mini" onClick={() => setToast("Profil demo siap disambungkan ke pengaturan akun.")}><span className="profile-avatar">{profile.avatar}</span><span><strong>{profile.shortName}</strong><small>{profile.label}</small></span><MoreHorizontal size={17} /></button></div></aside><div className="main-area"><header className="app-header"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div className="header-title"><span>{dateLabel}</span><strong>{greeting}</strong></div><div className="header-actions"><div className="notification-menu-wrap"><button className={`header-icon-button ${notificationsOpen ? "header-icon-active" : ""}`} onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }} aria-label="Buka notifikasi"><Bell size={18} /><i /></button>{notificationsOpen && <div className="notification-stack"><div className="notification-stack-header"><div><span className="eyebrow">Pusat notifikasi</span><strong>Yang perlu kamu tahu</strong></div><span className="notification-count">3 baru</span></div>{[{ title: "Batas pengajuan KRS", detail: "Ajukan sebelum 24 Oktober 2025.", tone: "coral" }, { title: "Workshop portfolio digital", detail: "Terbuka untuk mahasiswa tingkat akhir.", tone: "blue" }, { title: "Tagihan kuliah aktif", detail: "Jatuh tempo 31 Oktober 2025.", tone: "amber" }].map((item) => <button className="notification-item" key={item.title} onClick={() => { setNotificationsOpen(false); setActiveNav("pengumuman"); setToast(`Membuka pengumuman: ${item.title}`); }}><span className={`notification-dot notification-dot-${item.tone}`} /><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowUpRight size={15} /></button>)}<button className="notification-footer" onClick={() => { setNotificationsOpen(false); setActiveNav("pengumuman"); }}>Lihat semua pengumuman <ArrowUpRight size={14} /></button></div>}</div><div className="header-divider" /><div className="profile-menu-wrap"><button className="header-profile header-profile-trigger" onClick={() => setProfileOpen((open) => !open)}><span className="profile-avatar">{profile.avatar}</span><div><strong>{profile.shortName}</strong><span>{profile.label}</span></div><ChevronDown size={15} className={profileOpen ? "chevron-open" : ""} /></button>{profileOpen && <div className="profile-dropdown"><div className="profile-dropdown-head"><span className="profile-avatar">{profile.avatar}</span><div><strong>{profile.name}</strong><span>{profile.identifier}</span></div></div><button onClick={() => { setActiveNav("profil"); setProfileOpen(false); }}><UserRound size={15} /> Pengaturan profil</button><button onClick={() => { setDarkMode((mode) => !mode); setProfileOpen(false); }}>{darkMode ? "Gunakan tema terang" : "Gunakan tema gelap"}</button><button onClick={() => setToast("Pusat bantuan kampus terbuka.")}><CircleHelp size={15} /> Pusat bantuan</button><div className="dropdown-divider" /><button className="dropdown-logout" onClick={onLogout}><LogOut size={15} /> Keluar dari SIAKAD</button></div>}</div><button className="header-logout" onClick={onLogout}><LogOut size={16} /></button></div></header><main className="dashboard-content"><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeLabel}</strong></div><div key={activeNav} className="module-transition"><ModuleView role={role} navKey={activeNav} onNavigate={navigate} /></div></main></div>{toast && <div className="toast"><Check size={16} /><span>{toast}</span></div>}</div>;
}

export default function Home() {
  const [role, setRole] = useState<Role | null>(() => {
    const stored = window.localStorage.getItem("siakad-role") as Role | null;
    return stored && profiles[stored] ? stored : null;
  });

  const login = (nextRole: Role) => {
    window.localStorage.setItem("siakad-role", nextRole);
    setRole(nextRole);
    window.history.pushState({}, "", `/${nextRole}`);
  };
  const logout = () => {
    window.localStorage.removeItem("siakad-role");
    setRole(null);
    window.history.pushState({}, "", "/login");
  };

  return role ? <Dashboard role={role} onLogout={logout} /> : <LoginPage onLogin={login} />;
}
