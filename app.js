(() => {
  "use strict";

  const STORAGE_KEY = "edziennik-rp-state-v3";
  const OLD_KEYS = ["edziennik-rp-state-v2", "edziennik-rp-state-v1"];
  const SESSION_KEY = "edziennik-rp-session-v3";
  const OAUTH_STATE_KEY = "edziennik-rp-oauth-state";
  const statusOptions = ["Aktywna", "Zawieszona", "Urlop od RP"];
  const roles = ["Administrator", "Dyrektor", "Wicedyrektor", "Nauczyciel", "Praktykant", "Pracownik szkoły", "Prefekt", "Uczeń"];
  const schoolDays = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
  const lessonTimes = ["18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];
  const gradeValues = ["6", "5+", "5", "4+", "4", "3+", "3", "2+", "2", "1"];
  const fullRoles = new Set(["Administrator", "Dyrektor", "Wicedyrektor"]);
  const teacherRoles = new Set(["Nauczyciel", "Praktykant"]);
  const pointsRoles = new Set(["Nauczyciel", "Praktykant", "Pracownik szkoły", "Prefekt"]);
  const sectionsByKind = {
    full: ["dashboard", "accounts", "students", "teachers", "workers", "prefects", "houses", "grades", "attendance", "schedule", "clubs", "announcements", "points", "data"],
    teacher: ["dashboard", "students", "grades", "attendance", "schedule", "clubs", "announcements", "points"],
    points: ["dashboard", "students", "schedule", "clubs", "announcements", "points"],
    student: ["dashboard", "grades", "attendance", "schedule", "clubs", "announcements", "points"],
  };
  const sectionTitles = {
    dashboard: "Panel",
    accounts: "Konta Discord",
    students: "Uczniowie",
    teachers: "Nauczyciele",
    workers: "Pracownicy szkoły",
    prefects: "Prefekci",
    houses: "Domy",
    grades: "Oceny",
    attendance: "Frekwencja",
    schedule: "Plan lekcji",
    clubs: "Kluby",
    announcements: "Ogłoszenia",
    points: "Punkty i uwagi",
    data: "Dane",
  };

  const seedState = {
    settings: {
      schoolName: "Akademia Northwood RP",
      semester: "Semestr I",
      discordChannel: "#sekretariat-rp",
      logoDataUrl: "",
      discordClientId: "",
      discordRedirectUri: "",
      allowLocalLogin: true,
      activeWeekStart: startOfWeekIso(new Date()),
    },
    years: ["I", "II", "III", "IV"],
    requiredSubjects: ["Eliksiry", "Zaklęcia", "Historia magii", "Obrona"],
    optionalSubjects: ["Astronomia", "Zielarstwo", "Runy"],
    houses: [
      { id: "house-ember", name: "Emberfall", color: "#a23e48", description: "Odwaga, ambicja i szybkie decyzje.", crestDataUrl: "" },
      { id: "house-moon", name: "Moonvale", color: "#3d67a3", description: "Spokój, intuicja i lojalność wobec drużyny.", crestDataUrl: "" },
      { id: "house-ivy", name: "Ivythorn", color: "#2f7d57", description: "Ciekawość, wiedza i cierpliwa praca.", crestDataUrl: "" },
    ],
    accounts: [
      { id: "acc-admin", discordId: "local-admin", displayName: "Administrator lokalny", avatarUrl: "", role: "Administrator", characterType: "none", characterId: "", status: "Aktywna" },
      { id: "acc-lena", discordId: "100000000000000001", displayName: "LenaRP", avatarUrl: "", role: "Uczeń", characterType: "student", characterId: "stu-lena", status: "Aktywna" },
      { id: "acc-rossa", discordId: "100000000000000010", displayName: "Mira Rossa", avatarUrl: "", role: "Nauczyciel", characterType: "teacher", characterId: "tea-rossa", status: "Aktywna" },
    ],
    students: [
      { id: "stu-lena", name: "Lena Kowalska", accountId: "acc-lena", className: "II", houseId: "house-ivy", status: "Aktywna" },
      { id: "stu-maks", name: "Maks Nowicki", accountId: "", className: "II", houseId: "house-ember", status: "Aktywna" },
      { id: "stu-amelia", name: "Amelia Wrona", accountId: "", className: "I", houseId: "house-moon", status: "Urlop od RP" },
      { id: "stu-kacper", name: "Kacper Zieliński", accountId: "", className: "III", houseId: "house-ember", status: "Aktywna" },
    ],
    teachers: [
      { id: "tea-rossa", name: "prof. Mira Rossa", accountId: "acc-rossa", position: "Profesor eliksirów", subjects: ["Eliksiry", "Zielarstwo"], status: "Aktywna" },
      { id: "tea-novak", name: "prof. Leon Novak", accountId: "", position: "Profesor zaklęć", subjects: ["Zaklęcia", "Obrona"], status: "Aktywna" },
      { id: "tea-ida", name: "prof. Ida Kamińska", accountId: "", position: "Historyczka", subjects: ["Historia magii"], status: "Aktywna" },
    ],
    workers: [
      { id: "wrk-ola", name: "Ola Varen", accountId: "", position: "Bibliotekarka", status: "Aktywna" },
    ],
    prefects: [
      { id: "pref-lena", name: "Lena Kowalska", accountId: "acc-lena", studentId: "stu-lena", houseId: "house-ivy", isHead: true, status: "Aktywna" },
    ],
    grades: [
      { id: "gr-1", studentId: "stu-lena", subject: "Eliksiry", teacherId: "tea-rossa", value: "5", weight: 2, description: "Odpowiedź ustna", date: "2026-07-01", isFinalYear: false },
      { id: "gr-2", studentId: "stu-lena", subject: "Eliksiry", teacherId: "tea-rossa", value: "5+", weight: 4, description: "Ocena końcoworoczna", date: "2026-07-05", isFinalYear: true },
      { id: "gr-3", studentId: "stu-maks", subject: "Zaklęcia", teacherId: "tea-novak", value: "4+", weight: 3, description: "Sprawdzian końcowy", date: "2026-07-02", isFinalYear: true },
    ],
    attendance: [
      { id: "att-1", sessionId: "sess-1", studentId: "stu-lena", subject: "Eliksiry", teacherId: "tea-rossa", status: "Obecny", date: todayIso(), time: "18:00-19:00", years: ["II"] },
      { id: "att-2", sessionId: "sess-1", studentId: "stu-maks", subject: "Eliksiry", teacherId: "tea-rossa", status: "Nieobecny", date: todayIso(), time: "18:00-19:00", years: ["II"] },
    ],
    schedule: [
      { id: "sch-1", date: todayIso(), weekStart: startOfWeekIso(new Date()), time: "18:00-19:00", years: ["II"], itemType: "subject", itemId: "Eliksiry", teacherId: "tea-rossa", room: "Pracownia eliksirów", title: "Wywar uspokajający" },
      { id: "sch-2", date: addDaysIso(todayIso(), 2), weekStart: startOfWeekIso(new Date()), time: "19:00-20:00", years: ["I", "II"], itemType: "subject", itemId: "Zaklęcia", teacherId: "tea-novak", room: "Sala run", title: "Tarcze podstawowe" },
    ],
    announcements: [
      { id: "ann-1", title: "Ceremonia przydziału", body: "Nowe postacie zostaną przydzielone do domów po lekcjach organizacyjnych.", audience: "Wszyscy", date: todayIso(), pinned: true },
    ],
    points: [
      { id: "pt-1", studentId: "stu-lena", type: "plus", value: 10, authorId: "tea-rossa", authorType: "teacher", category: "Pomoc", body: "Pomoc nowym uczniom podczas oprowadzania po zamku.", date: todayIso() },
      { id: "pt-2", studentId: "stu-maks", type: "minus", value: 5, authorId: "tea-novak", authorType: "teacher", category: "Regulamin", body: "Spóźnienie na lekcję bez zgłoszenia.", date: todayIso() },
    ],
    clubs: [
      { id: "club-duel", name: "Klub Pojedynków", color: "#3d67a3", crestDataUrl: "", fields: [
        { id: "cf-1", label: "Opiekun", type: "teacher", value: "tea-novak" },
        { id: "cf-2", label: "Członkowie", type: "students", value: ["stu-lena", "stu-maks"] },
        { id: "cf-3", label: "Regulamin", type: "details", value: "Szanuj przeciwnika, nie używaj zaklęć zakazanych i zgłaszaj pojedynki kadrze." },
      ] },
    ],
  };

  let state = loadState();
  let session = loadSession();
  let activeSection = "dashboard";
  let toastTimer = null;
  let pendingHouseCrest = "";
  let pendingClubCrest = "";
  let clubDraftFields = [];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function todayIso() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function addDaysIso(value, days) {
    const date = new Date(`${value}T12:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function startOfWeekIso(input) {
    const date = input instanceof Date ? new Date(input) : new Date(`${input || todayIso()}T12:00:00`);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function dayName(value) {
    const index = new Date(`${value || todayIso()}T12:00:00`).getDay();
    return schoolDays[index === 0 ? 6 : index - 1] || "Poniedziałek";
  }

  function formatDate(value) {
    if (!value) return "Brak daty";
    return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T12:00:00`));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY) || OLD_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!raw) return clone(seedState);
    try {
      return normalizeState(JSON.parse(raw));
    } catch {
      return clone(seedState);
    }
  }

  function loadSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function saveSession() {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function normalizeState(nextState) {
    const fallback = clone(seedState);
    const merged = { ...fallback, ...nextState, settings: { ...fallback.settings, ...(nextState.settings || {}) } };
    merged.years = normalizeYears(Array.isArray(nextState.years) ? nextState.years : nextState.classes || fallback.years);
    merged.requiredSubjects = Array.isArray(nextState.requiredSubjects) ? nextState.requiredSubjects : (Array.isArray(nextState.subjects) ? nextState.subjects : fallback.requiredSubjects);
    merged.optionalSubjects = Array.isArray(nextState.optionalSubjects) ? nextState.optionalSubjects : fallback.optionalSubjects;
    for (const key of ["houses", "students", "teachers", "grades", "attendance", "schedule", "announcements", "points", "clubs", "workers", "prefects"]) {
      if (!Array.isArray(merged[key])) merged[key] = fallback[key];
    }
    merged.accounts = Array.isArray(nextState.accounts) ? nextState.accounts : createAccountsFromLegacy(nextState);
    if (!merged.accounts.length) merged.accounts = fallback.accounts;
    merged.settings.allowLocalLogin = merged.settings.allowLocalLogin !== false;
    merged.settings.activeWeekStart = startOfWeekIso(todayIso());
    merged.students = merged.students.map((student) => ({ ...student, className: normalizeYear(student.className), accountId: student.accountId || accountFromLegacy(student.discord, merged.accounts), houseId: student.houseId || merged.houses[0]?.id || "", status: normalizeStatus(student.status) })).sort(compareStudents);
    merged.teachers = merged.teachers.map((teacher) => ({ ...teacher, accountId: teacher.accountId || accountFromLegacy(teacher.userId || teacher.discord, merged.accounts), subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [], position: teacher.position || "Nauczyciel", status: normalizeStatus(teacher.status) })).sort(compareByName);
    merged.workers = merged.workers.map((worker) => ({ ...worker, accountId: worker.accountId || "", position: worker.position || "Pracownik szkoły", status: normalizeStatus(worker.status) })).sort(compareByName);
    merged.prefects = merged.prefects.map((prefect) => ({ ...prefect, accountId: prefect.accountId || "", studentId: prefect.studentId || "", houseId: prefect.houseId || merged.houses[0]?.id || "", isHead: Boolean(prefect.isHead), status: normalizeStatus(prefect.status) })).sort(compareByName);
    merged.houses = merged.houses.map((house) => ({ ...house, crestDataUrl: house.crestDataUrl || "" }));
    merged.grades = merged.grades.map((grade) => ({ ...grade, teacherId: grade.teacherId || "", description: grade.description || grade.title || grade.category || "", isFinalYear: Boolean(grade.isFinalYear || grade.kind === "finalYear") }));
    merged.attendance = merged.attendance.map((entry) => ({ ...entry, sessionId: entry.sessionId || uid("sess"), status: entry.status || "Nieobecny", date: entry.date || todayIso(), time: entry.time || "18:00-19:00", years: Array.isArray(entry.years) ? normalizeYears(entry.years) : [normalizeYear(entry.className || merged.students.find((student) => student.id === entry.studentId)?.className || merged.years[0])] }));
    merged.schedule = merged.schedule.map((lesson) => normalizeLesson(lesson, merged));
    merged.points = (Array.isArray(nextState.points) ? nextState.points : migrateNotes(nextState.notes || [])).map((point) => ({ ...point, authorId: point.authorId || point.teacherId || "", authorType: point.authorType || "teacher" }));
    merged.clubs = merged.clubs.map((club) => ({ ...club, crestDataUrl: club.crestDataUrl || "", fields: Array.isArray(club.fields) ? club.fields : [] }));
    merged.accounts = merged.accounts.map((account) => ({ ...account, role: roles.includes(account.role) ? account.role : roleFromOld(account.role), characterType: account.characterType || "none", characterId: account.characterId || "", avatarUrl: account.avatarUrl || "", status: normalizeStatus(account.status) }));
    return merged;
  }

  function normalizeLesson(lesson, fullState) {
    const date = lesson.date || dateFromWeekDay(lesson.weekStart || fullState.settings.activeWeekStart, lesson.day || "Poniedziałek");
    const itemType = lesson.itemType || "subject";
    const itemId = lesson.itemId || lesson.subject || "";
    return { ...lesson, date, weekStart: startOfWeekIso(date), time: lesson.time || "18:00-19:00", years: Array.isArray(lesson.years) ? normalizeYears(lesson.years) : [normalizeYear(lesson.className || fullState.years[0])], itemType, itemId, teacherId: lesson.teacherId || "", room: lesson.room || "", title: lesson.title || "" };
  }

  function dateFromWeekDay(weekStart, day) {
    const offset = Math.max(0, schoolDays.indexOf(day));
    return addDaysIso(weekStart || todayIso(), offset);
  }

  function migrateNotes(notes) {
    return notes.map((note) => ({ id: note.id || uid("pt"), studentId: note.studentId, type: note.type === "Uwaga" ? "minus" : note.type === "Pochwała" ? "plus" : "note", value: note.type === "Informacja RP" ? 0 : 5, category: note.type || "Wpis", body: note.body || "", date: note.date || todayIso(), authorId: note.teacherId || "", authorType: "teacher" }));
  }

  function createAccountsFromLegacy(nextState) {
    const accounts = clone(seedState.accounts);
    for (const student of nextState.students || []) addLegacyAccount(accounts, student.discord, student.name, "Uczeń", "student", student.id);
    for (const teacher of nextState.teachers || []) addLegacyAccount(accounts, teacher.userId || teacher.discord, teacher.name, "Nauczyciel", "teacher", teacher.id);
    return accounts;
  }

  function addLegacyAccount(accounts, discordValue, displayName, role, characterType, characterId) {
    if (!discordValue) return;
    const id = `acc-${String(characterId || uid("legacy")).replace(/[^a-z0-9-]/gi, "")}`;
    if (accounts.some((account) => account.id === id)) return;
    accounts.push({ id, discordId: String(discordValue), displayName: String(discordValue).replace(/^@/, "") || displayName, avatarUrl: "", role, characterType, characterId, status: "Aktywna" });
  }

  function accountFromLegacy(discordValue, accounts) {
    if (!discordValue) return "";
    return accounts.find((account) => account.discordId === String(discordValue) || account.displayName === String(discordValue).replace(/^@/, ""))?.id || "";
  }

  function normalizeStatus(status) {
    if (status === "Aktywny") return "Aktywna";
    if (status === "Urlop RP") return "Urlop od RP";
    if (status === "Zawieszony") return "Zawieszona";
    return statusOptions.includes(status) ? status : "Aktywna";
  }

  function roleFromOld(role) {
    if (role === "Dyrekcja") return "Dyrektor";
    if (roles.includes(role)) return role;
    return "Uczeń";
  }

  function normalizeYear(value) {
    const clean = String(value || "I").replace(/^Rok\s+/i, "").replace(/^Rocznik\s+/i, "").trim();
    return clean || "I";
  }

  function normalizeYears(values) {
    return Array.from(new Set((values || []).map(normalizeYear).filter(Boolean)));
  }

  function displayYear(value) {
    return `Rocznik ${normalizeYear(value)}`;
  }

  function compareByName(a, b) {
    return String(a.name || "").localeCompare(String(b.name || ""), "pl");
  }

  function compareStudents(a, b) {
    return normalizeYear(a.className).localeCompare(normalizeYear(b.className), "pl", { numeric: true }) || compareByName(a, b);
  }

  function currentAccount() {
    return state.accounts.find((account) => account.id === session.currentAccountId) || null;
  }

  function roleKind(role = currentAccount()?.role) {
    if (fullRoles.has(role)) return "full";
    if (teacherRoles.has(role)) return "teacher";
    if (pointsRoles.has(role)) return "points";
    return "student";
  }

  function allowedSections() {
    return sectionsByKind[roleKind()] || sectionsByKind.student;
  }

  function canEditScope(scope) {
    const account = currentAccount();
    if (!account || account.status !== "Aktywna") return false;
    if (scope === "clubs") return account.role === "Administrator";
    if (scope === "points") return roleKind(account.role) === "full" || pointsRoles.has(account.role);
    if (["grades", "attendance"].includes(scope)) return roleKind(account.role) === "full" || teacherRoles.has(account.role);
    return roleKind(account.role) === "full";
  }

  function canDeleteScope(scope) {
    return canEditScope(scope) && roleKind() === "full";
  }

  function allSubjects() {
    return Array.from(new Set([...(state.requiredSubjects || []), ...(state.optionalSubjects || [])].filter(Boolean))).sort((a, b) => a.localeCompare(b, "pl"));
  }

  function teachersForSubject(subject) {
    if (!subject) return [];
    return state.teachers.filter((teacher) => teacher.status === "Aktywna" && (teacher.subjects || []).includes(subject)).sort(compareByName);
  }

  function getAccount(id) {
    return state.accounts.find((account) => account.id === id);
  }

  function getStudent(id) {
    return state.students.find((student) => student.id === id);
  }

  function getTeacher(id) {
    return state.teachers.find((teacher) => teacher.id === id);
  }

  function getWorker(id) {
    return state.workers.find((worker) => worker.id === id);
  }

  function getPrefect(id) {
    return state.prefects.find((prefect) => prefect.id === id);
  }

  function getHouse(id) {
    return state.houses.find((house) => house.id === id);
  }

  function getClub(id) {
    return state.clubs.find((club) => club.id === id);
  }

  function option(value, label = value) {
    return { value, label };
  }

  function fillSelect(select, options, selectedValue) {
    if (!select) return;
    const safeOptions = options.length ? options : [option("", "Brak danych")];
    const current = selectedValue ?? select.value;
    select.innerHTML = safeOptions.map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join("");
    if (safeOptions.some((item) => String(item.value) === String(current))) select.value = current;
  }

  function fillMultiSelect(select, options, selectedValues = []) {
    if (!select) return;
    const selected = new Set(selectedValues.map(String));
    select.innerHTML = options.map((item) => `<option value="${escapeHtml(item.value)}" ${selected.has(String(item.value)) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
  }

  function selectedValues(select) {
    return Array.from(select?.selectedOptions || []).map((item) => item.value).filter(Boolean);
  }

  function parseCommaList(value) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  function accountOptions(includeEmpty = true) {
    const items = state.accounts.slice().sort((a, b) => a.displayName.localeCompare(b.displayName, "pl")).map((account) => option(account.id, `${account.displayName} · ${account.role}`));
    return includeEmpty ? [option("", "Nie przypisano")].concat(items) : items;
  }

  function yearOptions(includeAll = false) {
    const items = state.years.map((year) => option(year, displayYear(year)));
    return includeAll ? [option("Wszystkie", "Wszystkie roczniki")].concat(items) : items;
  }

  function houseOptions(includeAll = false) {
    const items = state.houses.map((house) => option(house.id, house.name));
    return includeAll ? [option("Wszystkie", "Wszystkie domy")].concat(items) : items;
  }

  function subjectOptions(includeAll = false, includeEmpty = false) {
    let items = allSubjects().map((subject) => option(subject));
    if (includeEmpty) items = [option("", "Wybierz przedmiot")].concat(items);
    return includeAll ? [option("Wszystkie", "Wszystkie przedmioty")].concat(items) : items;
  }

  function teacherOptions(teachers, includeEmpty = true) {
    const items = teachers.map((teacher) => option(teacher.id, teacher.name));
    return includeEmpty ? [option("", teachers.length ? "Wybierz nauczyciela" : "Najpierw wybierz przedmiot")].concat(items) : items;
  }

  function studentOptions(includeEmpty = false) {
    const items = state.students.slice().sort(compareStudents).map((student) => option(student.id, `${student.name} · ${displayYear(student.className)}`));
    return includeEmpty ? [option("", "Nie wybrano")].concat(items) : items;
  }

  function statusOptionsList() {
    return statusOptions.map((status) => option(status));
  }

  function characterTypeOptions() {
    return [option("none", "Brak"), option("student", "Uczeń"), option("teacher", "Nauczyciel"), option("worker", "Pracownik szkoły"), option("prefect", "Prefekt")];
  }

  function characterOptions(type) {
    if (type === "student") return studentOptions(true);
    if (type === "teacher") return [option("", "Nie wybrano")].concat(state.teachers.slice().sort(compareByName).map((item) => option(item.id, item.name)));
    if (type === "worker") return [option("", "Nie wybrano")].concat(state.workers.slice().sort(compareByName).map((item) => option(item.id, item.name)));
    if (type === "prefect") return [option("", "Nie wybrano")].concat(state.prefects.slice().sort(compareByName).map((item) => option(item.id, item.name)));
    return [option("", "Brak postaci")];
  }

  function accountAvatar(account) {
    if (!account) return `<span class="avatar avatar-empty">?</span>`;
    if (account.avatarUrl) return `<img class="avatar" src="${escapeHtml(account.avatarUrl)}" alt="" />`;
    const initial = (account.displayName || account.discordId || "?").slice(0, 1).toUpperCase();
    return `<span class="avatar avatar-empty">${escapeHtml(initial)}</span>`;
  }

  function accountCard(accountId) {
    const account = getAccount(accountId);
    if (!account) return `<span class="muted-text">Nie przypisano</span>`;
    return `<div class="account-mini">${accountAvatar(account)}<div><strong>${escapeHtml(account.displayName)}</strong><span>${escapeHtml(account.role)}</span></div></div>`;
  }

  function statusBadge(status) {
    if (status === "Aktywna") return `<span class="badge good">Aktywna</span>`;
    if (status === "Urlop od RP") return `<span class="badge warn">Urlop od RP</span>`;
    return `<span class="badge bad">${escapeHtml(status || "Zawieszona")}</span>`;
  }

  function houseChip(house) {
    if (!house) return `<span class="pill muted">Bez domu</span>`;
    const crest = house.crestDataUrl ? `<img src="${house.crestDataUrl}" alt="" />` : "";
    return `<span class="house-chip" style="background:${escapeHtml(house.color)}">${crest}${escapeHtml(house.name)}</span>`;
  }

  function pointsForStudent(studentId) {
    return state.points.filter((point) => point.studentId === studentId).reduce((sum, point) => point.type === "plus" ? sum + Number(point.value || 0) : point.type === "minus" ? sum - Number(point.value || 0) : sum, 0);
  }

  function pointsForHouse(houseId) {
    const ids = new Set(state.students.filter((student) => student.houseId === houseId).map((student) => student.id));
    return state.points.filter((point) => ids.has(point.studentId)).reduce((sum, point) => point.type === "plus" ? sum + Number(point.value || 0) : point.type === "minus" ? sum - Number(point.value || 0) : sum, 0);
  }

  function pointsMarkup(value) {
    const className = value > 0 ? "points-plus" : value < 0 ? "points-minus" : "points-zero";
    return `<span class="${className}">${value > 0 ? "+" : ""}${value}</span>`;
  }

  function gradeToNumber(value) {
    const match = String(value).match(/^([1-6])([+-])?$/);
    if (!match) return null;
    let number = Number(match[1]);
    if (match[2] === "+") number += 0.5;
    if (match[2] === "-") number -= 0.25;
    return Math.max(1, Math.min(6, number));
  }

  function weightedAverage(grades) {
    const counted = grades.map((grade) => ({ value: gradeToNumber(grade.value), weight: Number(grade.weight) || 1 })).filter((grade) => grade.value !== null);
    if (!counted.length) return null;
    const totalWeight = counted.reduce((sum, grade) => sum + grade.weight, 0);
    const total = counted.reduce((sum, grade) => sum + grade.value * grade.weight, 0);
    return total / totalWeight;
  }

  function finalYearAverage(studentId) {
    return weightedAverage(state.grades.filter((grade) => grade.studentId === studentId && grade.isFinalYear));
  }

  function filteredStudents(year, houseId) {
    return state.students.filter((student) => (year === "Wszystkie" || student.className === year) && (houseId === "Wszystkie" || student.houseId === houseId)).sort(compareStudents);
  }

  function currentWeekStart() {
    return state.settings.activeWeekStart || startOfWeekIso(todayIso());
  }

  function setWeek(weekStart) {
    state.settings.activeWeekStart = startOfWeekIso(weekStart);
    saveState();
    render();
  }

  function discordRedirectUri() {
    return state.settings.discordRedirectUri || location.href.split("#")[0];
  }

  function beginDiscordLogin() {
    const clientId = state.settings.discordClientId?.trim();
    if (!clientId) {
      showToast("Najpierw wpisz Discord Client ID w zakładce Dane.");
      return;
    }
    const oauthState = uid("oauth");
    localStorage.setItem(OAUTH_STATE_KEY, oauthState);
    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("response_type", "token");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("scope", "identify");
    url.searchParams.set("state", oauthState);
    url.searchParams.set("redirect_uri", discordRedirectUri());
    location.href = url.toString();
  }

  async function handleOAuthReturn() {
    if (!location.hash.includes("access_token")) return;
    const params = new URLSearchParams(location.hash.slice(1));
    const token = params.get("access_token");
    const returnedState = params.get("state");
    const expectedState = localStorage.getItem(OAUTH_STATE_KEY);
    history.replaceState(null, document.title, location.pathname + location.search);
    if (!token || !returnedState || returnedState !== expectedState) {
      showToast("Nie udało się potwierdzić logowania Discord.");
      return;
    }
    localStorage.removeItem(OAUTH_STATE_KEY);
    try {
      const response = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Discord API error");
      const profile = await response.json();
      const account = upsertDiscordAccount(profile);
      session.currentAccountId = account.id;
      session.lastTokenLoginAt = new Date().toISOString();
      saveState();
      saveSession();
      showToast("Zalogowano przez Discord.");
      render();
    } catch {
      showToast("Discord zwrócił błąd. Sprawdź Client ID i Redirect URI.");
    }
  }

  function upsertDiscordAccount(profile) {
    const avatarUrl = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128` : "";
    const displayName = profile.global_name || profile.username || profile.id;
    let account = state.accounts.find((item) => item.discordId === profile.id);
    if (!account) {
      account = { id: uid("acc"), discordId: profile.id, displayName, avatarUrl, role: "Uczeń", characterType: "none", characterId: "", status: "Aktywna" };
      state.accounts.push(account);
    } else {
      account.displayName = displayName;
      account.avatarUrl = avatarUrl || account.avatarUrl;
    }
    return account;
  }

  function renderAuthShell() {
    const account = currentAccount();
    const loggedIn = Boolean(account);
    $("#loginScreen").classList.toggle("app-hidden", loggedIn);
    $("#appShell").classList.toggle("app-hidden", !loggedIn);
    $("#loginSchoolName").textContent = state.settings.schoolName;
    $("#loginBrandMark").innerHTML = state.settings.logoDataUrl ? `<img class="logo-image" src="${state.settings.logoDataUrl}" alt="" />` : "ED";
    fillSelect($("#quickAccountSelect"), state.accounts.map((item) => option(item.id, `${item.displayName} · ${item.role}`)), session.currentAccountId || state.accounts[0]?.id);
    $("#quickAccountSelect").closest("label").classList.toggle("permission-hidden", !state.settings.allowLocalLogin);
    $("#localLoginButton").classList.toggle("permission-hidden", !state.settings.allowLocalLogin);
    const hint = state.settings.discordClientId ? `Redirect URI: ${discordRedirectUri()}` : "Wpisz Client ID aplikacji Discord w zakładce Dane. Do konfiguracji użyj konta lokalnego administratora.";
    $("#discordLoginHint").textContent = hint;
    if (loggedIn) {
      $("#currentAccountPill").innerHTML = accountCard(account.id);
    }
  }

  function renderLogoTargets() {
    const logo = state.settings.logoDataUrl;
    $("#brandName").textContent = state.settings.schoolName;
    $("#dashboardSchool").textContent = state.settings.schoolName;
    $("#semesterLabel").textContent = state.settings.semester;
    $("#discordLabel").textContent = state.settings.discordChannel;
    $("#brandMark").innerHTML = logo ? `<img class="logo-image" src="${logo}" alt="" />` : "ED";
    $("#schoolCrest").innerHTML = logo ? `<img class="logo-image" src="${logo}" alt="" />` : "<span>RP</span>";
    $("#logoPreview").innerHTML = logo ? `<img class="logo-image" src="${logo}" alt="" />` : "";
  }

  function syncControls() {
    renderAuthShell();
    if (!currentAccount()) return;
    renderLogoTargets();
    $("#sectionTitle").textContent = sectionTitles[activeSection] || "Panel";

    fillSelect($("#accountRole"), roles.map((role) => option(role)), $("#accountRole")?.value || "Uczeń");
    fillSelect($("#accountCharacterType"), characterTypeOptions(), $("#accountCharacterType")?.value || "none");
    fillSelect($("#accountCharacterId"), characterOptions($("#accountCharacterType")?.value || "none"), $("#accountCharacterId")?.value || "");
    fillSelect($("#accountStatus"), statusOptionsList(), $("#accountStatus")?.value || "Aktywna");

    for (const id of ["studentAccountId", "teacherAccountId", "workerAccountId", "prefectAccountId"]) fillSelect($(`#${id}`), accountOptions(true), $(`#${id}`)?.value || "");
    for (const id of ["studentStatus", "teacherStatus", "workerStatus", "prefectStatus"]) fillSelect($(`#${id}`), statusOptionsList(), $(`#${id}`)?.value || "Aktywna");
    for (const id of ["studentYear", "studentYearFilter", "gradeYearFilter", "attendanceYearFilter", "scheduleYearFilter"]) fillSelect($(`#${id}`), yearOptions(id.endsWith("Filter")), $(`#${id}`)?.value || (id.endsWith("Filter") ? "Wszystkie" : state.years[0]));
    for (const id of ["studentHouse", "prefectHouse", "studentHouseFilter", "gradeHouseFilter"]) fillSelect($(`#${id}`), houseOptions(id.endsWith("Filter")), $(`#${id}`)?.value || (id.endsWith("Filter") ? "Wszystkie" : state.houses[0]?.id));
    fillSelect($("#prefectStudentId"), studentOptions(true), $("#prefectStudentId")?.value || "");
    fillMultiSelect($("#teacherSubjects"), allSubjects().map((subject) => option(subject)), selectedValues($("#teacherSubjects")));

    fillSelect($("#gradeSubjectFilter"), subjectOptions(true), $("#gradeSubjectFilter")?.value || "Wszystkie");
    fillSelect($("#gradeSubject"), subjectOptions(false, true), $("#gradeSubject")?.value || "");
    syncTeacherSelectForSubject("#gradeSubject", "#gradeTeacher");
    fillSelect($("#gradeKind"), [option("regular", "Cząstkowa"), option("finalYear", "Końcoworoczna")], $("#gradeKind")?.value || "regular");

    fillMultiSelect($("#attendanceYears"), yearOptions(false), selectedValues($("#attendanceYears")).length ? selectedValues($("#attendanceYears")) : [state.years[0]]);
    updateAutoDayLabels();
    syncAttendanceSubjects();
    syncTeacherSelectForSubject("#attendanceSubject", "#attendanceTeacher");
    fillSelect($("#attendanceSubjectFilter"), subjectOptions(true), $("#attendanceSubjectFilter")?.value || "Wszystkie");

    fillSelect($("#scheduleTime"), lessonTimes.map((time) => option(time)), $("#scheduleTime")?.value || lessonTimes[0]);
    fillMultiSelect($("#scheduleYears"), yearOptions(false), selectedValues($("#scheduleYears")).length ? selectedValues($("#scheduleYears")) : [state.years[0]]);
    fillSelect($("#scheduleItemType"), [option("subject", "Przedmiot"), option("club", "Klub")], $("#scheduleItemType")?.value || "subject");
    syncScheduleItems();
    syncScheduleTeacher();

    fillSelect($("#announcementAudience"), [option("Wszyscy"), option("Kadra"), ...yearOptions(false)], $("#announcementAudience")?.value || "Wszyscy");
    fillSelect($("#pointStudent"), studentOptions(false), $("#pointStudent")?.value || state.students[0]?.id);
    fillSelect($("#pointAuthor"), authorOptions(), $("#pointAuthor")?.value || authorOptions()[0]?.value || "");

    fillSelect($("#clubFieldType"), [option("teacher", "Wybór nauczyciela"), option("students", "Wybór uczniów"), option("studentRoles", "Uczniowie z rolami"), option("text", "Tekst"), option("details", "Wysuwana wiadomość")], $("#clubFieldType")?.value || "teacher");

    const today = todayIso();
    for (const id of ["gradeDate", "attendanceDate", "attendanceDateFilter", "scheduleDate", "announcementDate", "pointDate"]) {
      const input = $(`#${id}`);
      if (input && !input.value) input.value = today;
    }
    $("#currentWeekLabel").textContent = `Tydzień od ${formatDate(currentWeekStart())}`;
    $("#schoolNameInput").value = state.settings.schoolName;
    $("#semesterInput").value = state.settings.semester;
    $("#discordInput").value = state.settings.discordChannel;
    $("#yearsInput").value = state.years.join(", ");
    $("#requiredSubjectsInput").value = state.requiredSubjects.join(", ");
    $("#optionalSubjectsInput").value = state.optionalSubjects.join(", ");
    $("#discordClientIdInput").value = state.settings.discordClientId || "";
    $("#discordRedirectUriInput").value = state.settings.discordRedirectUri || discordRedirectUri();
    $("#allowLocalLoginInput").checked = state.settings.allowLocalLogin !== false;
    $("#exportBox").value = JSON.stringify(state, null, 2);
  }

  function updateAutoDayLabels() {
    const attendanceDate = $("#attendanceDate")?.value || todayIso();
    const scheduleDate = $("#scheduleDate")?.value || todayIso();
    if ($("#attendanceDayLabel")) $("#attendanceDayLabel").value = dayName(attendanceDate);
    if ($("#scheduleDayLabel")) $("#scheduleDayLabel").value = dayName(scheduleDate);
  }

  function syncTeacherSelectForSubject(subjectSelector, teacherSelector) {
    const subject = $(subjectSelector)?.value || "";
    const teachers = teachersForSubject(subject);
    const select = $(teacherSelector);
    fillSelect(select, teacherOptions(teachers, true), select?.value || "");
    if (select) select.disabled = !subject || !teachers.length;
  }

  function scheduleItemLabel(lesson) {
    if (lesson.itemType === "club") return getClub(lesson.itemId)?.name || "Klub";
    return lesson.itemId || "Przedmiot";
  }

  function syncScheduleItems() {
    const type = $("#scheduleItemType")?.value || "subject";
    if (type === "club") {
      fillSelect($("#scheduleItemId"), state.clubs.map((club) => option(club.id, club.name)), $("#scheduleItemId")?.value || state.clubs[0]?.id || "");
    } else {
      fillSelect($("#scheduleItemId"), subjectOptions(false, true), $("#scheduleItemId")?.value || "");
    }
  }

  function syncScheduleTeacher() {
    const type = $("#scheduleItemType")?.value || "subject";
    const itemId = $("#scheduleItemId")?.value || "";
    if (type === "club") {
      const club = getClub(itemId);
      const guardianId = club?.fields?.find((field) => field.type === "teacher")?.value || "";
      fillSelect($("#scheduleTeacher"), teacherOptions(state.teachers.filter((teacher) => teacher.status === "Aktywna"), true), guardianId || $("#scheduleTeacher")?.value || "");
      $("#scheduleTeacher").disabled = false;
      return;
    }
    syncTeacherSelectForSubject("#scheduleItemId", "#scheduleTeacher");
  }

  function scheduledSubjectsForAttendance() {
    const date = $("#attendanceDate")?.value || todayIso();
    const years = selectedValues($("#attendanceYears"));
    const lessons = state.schedule.filter((lesson) => lesson.date === date && lesson.itemType === "subject" && (!years.length || lesson.years.some((year) => years.includes(year))));
    return Array.from(new Set(lessons.map((lesson) => lesson.itemId))).sort((a, b) => a.localeCompare(b, "pl"));
  }

  function syncAttendanceSubjects() {
    const subjects = scheduledSubjectsForAttendance();
    fillSelect($("#attendanceSubject"), subjects.length ? subjects.map((subject) => option(subject)) : [option("", "Brak przedmiotów w planie")], $("#attendanceSubject")?.value || subjects[0] || "");
  }

  function authorOptions() {
    const teachers = state.teachers.map((teacher) => option(`teacher:${teacher.id}`, `Nauczyciel: ${teacher.name}`));
    const workers = state.workers.map((worker) => option(`worker:${worker.id}`, `Pracownik: ${worker.name}`));
    const prefects = state.prefects.map((prefect) => option(`prefect:${prefect.id}`, `Prefekt: ${prefect.name}`));
    return teachers.concat(workers, prefects);
  }

  function updatePermissions() {
    const allowed = new Set(allowedSections());
    $$(".nav-item").forEach((button) => button.classList.toggle("permission-hidden", !allowed.has(button.dataset.section)));
    if (!allowed.has(activeSection)) setActiveSection(allowedSections()[0], false);
    $$('[data-scope]').forEach((element) => element.classList.toggle("permission-hidden", !canEditScope(element.dataset.scope)));
    $$('[data-delete-scope]').forEach((element) => element.classList.toggle("permission-hidden", !canDeleteScope(element.dataset.deleteScope)));
    $$('[data-action^="edit-"]').forEach((element) => {
      const raw = element.dataset.action.replace("edit-", "");
      const scopeMap = { account: "accounts", student: "students", teacher: "teachers", worker: "workers", prefect: "prefects", house: "houses", attendance: "attendance", schedule: "schedule", club: "clubs", announcement: "announcements", point: "points" };
      element.classList.toggle("permission-hidden", !canEditScope(scopeMap[raw] || raw));
    });
    $("#sectionTitle").textContent = sectionTitles[activeSection] || "Panel";
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function render() {
    syncControls();
    if (!currentAccount()) return;
    renderDashboard();
    renderAccounts();
    renderStudents();
    renderTeachers();
    renderWorkers();
    renderPrefects();
    renderHouses();
    renderGradeBatchRows();
    renderGrades();
    renderAttendanceRoster();
    renderAttendance();
    renderSchedule();
    renderClubs();
    renderAnnouncements();
    renderPoints();
    renderClubDraft();
    updatePermissions();
  }

  function renderDashboard() {
    const attendance = state.attendance;
    const absent = attendance.filter((entry) => entry.status === "Nieobecny").length;
    const attendanceRate = attendance.length ? Math.round(((attendance.length - absent) / attendance.length) * 100) : 0;
    $("#metricStudents").textContent = state.students.length;
    $("#metricAccounts").textContent = state.accounts.length;
    $("#metricAttendance").textContent = `${attendanceRate}%`;
    $("#metricHousePoints").textContent = state.houses.reduce((sum, house) => sum + pointsForHouse(house.id), 0);
    $("#dashboardWeek").textContent = `od ${formatDate(currentWeekStart())}`;
    const lessons = state.schedule.filter((lesson) => lesson.weekStart === currentWeekStart()).sort(compareLessons).slice(0, 6);
    $("#dashboardLessons").innerHTML = lessons.length ? lessons.map(renderLessonMini).join("") : `<div class="empty-state">Brak zajęć w tym tygodniu.</div>`;
    $("#houseScoreboard").innerHTML = renderHouseScoreboard();
  }

  function renderLessonMini(lesson) {
    const teacher = getTeacher(lesson.teacherId);
    return `<article class="list-item"><div class="list-row"><strong>${escapeHtml(dayName(lesson.date))} · ${escapeHtml(lesson.time)} · ${escapeHtml(scheduleItemLabel(lesson))}</strong><span class="pill">${lesson.years.map(displayYear).join(", ")}</span></div><span class="muted-text">${escapeHtml(lesson.room || "Brak miejsca")} · ${escapeHtml(teacher?.name || "bez opiekuna")}</span></article>`;
  }

  function renderHouseScoreboard() {
    const houses = state.houses.slice().sort((a, b) => pointsForHouse(b.id) - pointsForHouse(a.id));
    return houses.length ? houses.map((house) => `<article class="score-item"><span class="score-color" style="background:${escapeHtml(house.color)}"></span><div><strong>${escapeHtml(house.name)}</strong><div class="muted-text">${state.students.filter((student) => student.houseId === house.id).length} uczniów</div></div><strong>${pointsForHouse(house.id)}</strong></article>`).join("") : `<div class="empty-state">Brak domów.</div>`;
  }

  function renderAccounts() {
    const rows = state.accounts.slice().sort((a, b) => a.displayName.localeCompare(b.displayName, "pl"));
    $("#accountsTable").innerHTML = rows.length ? rows.map((account) => `<tr><td>${accountCard(account.id)}</td><td>${escapeHtml(account.role)}</td><td>${escapeHtml(characterLabel(account))}</td><td>${statusBadge(account.status)}</td><td class="item-actions"><button class="secondary-button" data-action="edit-account" data-id="${escapeHtml(account.id)}">Edytuj</button><button class="ghost-button" data-action="delete-account" data-delete-scope="accounts" data-id="${escapeHtml(account.id)}">Usuń</button></td></tr>`).join("") : `<tr><td colspan="5">Brak kont.</td></tr>`;
  }

  function characterLabel(account) {
    if (account.characterType === "student") return getStudent(account.characterId)?.name || "Uczeń";
    if (account.characterType === "teacher") return getTeacher(account.characterId)?.name || "Nauczyciel";
    if (account.characterType === "worker") return getWorker(account.characterId)?.name || "Pracownik";
    if (account.characterType === "prefect") return getPrefect(account.characterId)?.name || "Prefekt";
    return "Brak";
  }

  function renderStudents() {
    const year = $("#studentYearFilter")?.value || "Wszystkie";
    const houseId = $("#studentHouseFilter")?.value || "Wszystkie";
    const search = ($("#studentSearch")?.value || "").trim().toLowerCase();
    const rows = filteredStudents(year, houseId).filter((student) => {
      const account = getAccount(student.accountId);
      const house = getHouse(student.houseId);
      return `${student.name} ${account?.displayName || ""} ${house?.name || ""}`.toLowerCase().includes(search);
    });
    $("#studentsTable").innerHTML = rows.length ? rows.map((student) => {
      const average = finalYearAverage(student.id);
      return `<tr><td><strong>${escapeHtml(student.name)}</strong></td><td>${accountCard(student.accountId)}</td><td>${displayYear(student.className)}</td><td>${houseChip(getHouse(student.houseId))}</td><td>${statusBadge(student.status)}</td><td>${average === null ? "-" : average.toFixed(2)}</td><td>${pointsMarkup(pointsForStudent(student.id))}</td><td class="item-actions"><button class="secondary-button" data-action="edit-student" data-id="${escapeHtml(student.id)}">Edytuj</button><button class="ghost-button" data-action="delete-student" data-delete-scope="students" data-id="${escapeHtml(student.id)}">Usuń</button></td></tr>`;
    }).join("") : `<tr><td colspan="8">Brak uczniów dla wybranych filtrów.</td></tr>`;
  }

  function renderTeachers() {
    const rows = state.teachers.slice().sort(compareByName);
    $("#teachersTable").innerHTML = rows.length ? rows.map((teacher) => `<tr><td><strong>${escapeHtml(teacher.name)}</strong></td><td>${accountCard(teacher.accountId)}</td><td>${escapeHtml(teacher.position || "-")}</td><td>${renderSubjectChips(teacher.subjects)}</td><td>${statusBadge(teacher.status)}</td><td class="item-actions"><button class="secondary-button" data-action="edit-teacher" data-id="${escapeHtml(teacher.id)}">Edytuj</button><button class="ghost-button" data-action="delete-teacher" data-delete-scope="teachers" data-id="${escapeHtml(teacher.id)}">Usuń</button></td></tr>`).join("") : `<tr><td colspan="6">Brak nauczycieli.</td></tr>`;
  }

  function renderSubjectChips(subjects) {
    return (subjects || []).length ? subjects.map((subject) => `<span class="subject-chip">${escapeHtml(subject)}</span>`).join("") : `<span class="muted-text">Brak</span>`;
  }

  function renderWorkers() {
    const rows = state.workers.slice().sort(compareByName);
    $("#workersTable").innerHTML = rows.length ? rows.map((worker) => `<tr><td><strong>${escapeHtml(worker.name)}</strong></td><td>${accountCard(worker.accountId)}</td><td>${escapeHtml(worker.position || "-")}</td><td>${statusBadge(worker.status)}</td><td class="item-actions"><button class="secondary-button" data-action="edit-worker" data-id="${escapeHtml(worker.id)}">Edytuj</button><button class="ghost-button" data-action="delete-worker" data-delete-scope="workers" data-id="${escapeHtml(worker.id)}">Usuń</button></td></tr>`).join("") : `<tr><td colspan="5">Brak pracowników.</td></tr>`;
  }

  function renderPrefects() {
    const rows = state.prefects.slice().sort(compareByName);
    $("#prefectsTable").innerHTML = rows.length ? rows.map((prefect) => `<tr><td><strong>${escapeHtml(prefect.name)}</strong></td><td>${accountCard(prefect.accountId)}</td><td>${escapeHtml(getStudent(prefect.studentId)?.name || "-")}</td><td>${houseChip(getHouse(prefect.houseId))}</td><td>${prefect.isHead ? "Prefekt naczelny" : "Prefekt domu"}</td><td>${statusBadge(prefect.status)}</td><td class="item-actions"><button class="secondary-button" data-action="edit-prefect" data-id="${escapeHtml(prefect.id)}">Edytuj</button><button class="ghost-button" data-action="delete-prefect" data-delete-scope="prefects" data-id="${escapeHtml(prefect.id)}">Usuń</button></td></tr>`).join("") : `<tr><td colspan="7">Brak prefektów.</td></tr>`;
  }

  function renderHouses() {
    $("#housesTable").innerHTML = state.houses.length ? state.houses.map((house) => `<tr><td>${houseChip(house)}</td><td>${escapeHtml(house.description || "-")}</td><td>${state.students.filter((student) => student.houseId === house.id).length}</td><td><strong>${pointsForHouse(house.id)}</strong></td><td class="item-actions"><button class="secondary-button" data-action="edit-house" data-id="${escapeHtml(house.id)}">Edytuj</button><button class="ghost-button" data-action="delete-house" data-delete-scope="houses" data-id="${escapeHtml(house.id)}">Usuń</button></td></tr>`).join("") : `<tr><td colspan="5">Brak domów.</td></tr>`;
  }

  function renderGradeBatchRows() {
    const year = $("#gradeYearFilter")?.value || "Wszystkie";
    const houseId = $("#gradeHouseFilter")?.value || "Wszystkie";
    const students = filteredStudents(year, houseId).filter((student) => student.status !== "Zawieszona");
    $("#gradeBatchRows").innerHTML = students.length ? students.map((student) => `<div class="batch-row" data-student-id="${escapeHtml(student.id)}"><label class="check-field"><input data-grade-enabled type="checkbox" checked /><span>${escapeHtml(student.name)}</span></label><span class="muted-text">${displayYear(student.className)} · ${escapeHtml(getHouse(student.houseId)?.name || "Bez domu")}</span><select data-grade-value>${gradeValues.map((value) => `<option>${value}</option>`).join("")}</select><input data-grade-weight type="number" min="1" max="6" value="1" /></div>`).join("") : `<div class="empty-state">Brak uczniów dla wybranych filtrów.</div>`;
  }

  function gradeChip(grade) {
    const number = gradeToNumber(grade.value);
    const tone = number >= 4.75 ? "strong" : number <= 2 ? "weak" : "";
    return `<span class="grade-chip ${tone}">${escapeHtml(grade.value)}${grade.isFinalYear ? " K" : ""}</span>`;
  }

  function renderGrades() {
    const year = $("#gradeYearFilter")?.value || "Wszystkie";
    const houseId = $("#gradeHouseFilter")?.value || "Wszystkie";
    const subject = $("#gradeSubjectFilter")?.value || "Wszystkie";
    const students = filteredStudents(year, houseId);
    $("#gradebookTable").innerHTML = students.length ? students.map((student) => {
      const grades = state.grades.filter((grade) => grade.studentId === student.id && (subject === "Wszystkie" || grade.subject === subject)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const finalAverage = weightedAverage(grades.filter((grade) => grade.isFinalYear));
      return `<tr><td><strong>${escapeHtml(student.name)}</strong></td><td>${displayYear(student.className)}</td><td>${houseChip(getHouse(student.houseId))}</td><td><strong>${finalAverage === null ? "-" : finalAverage.toFixed(2)}</strong></td><td><details class="grade-details"><summary>${grades.length} wpisów</summary>${grades.length ? `<div class="grade-list-inline">${grades.map(renderGradeDetail).join("")}</div>` : `<span class="muted-text">Brak ocen</span>`}</details></td></tr>`;
    }).join("") : `<tr><td colspan="5">Brak uczniów dla wybranych filtrów.</td></tr>`;
  }

  function renderGradeDetail(grade) {
    const teacher = getTeacher(grade.teacherId);
    return `<div class="grade-detail-row"><div>${gradeChip(grade)} <strong>${escapeHtml(grade.subject)}</strong><span>${escapeHtml(grade.description || "Bez opisu")} · waga ${escapeHtml(grade.weight)} · ${formatDate(grade.date)} · ${escapeHtml(teacher?.name || "bez nauczyciela")}</span></div><button class="ghost-button" data-action="delete-grade" data-delete-scope="grades" data-id="${escapeHtml(grade.id)}">Usuń</button></div>`;
  }

  function renderAttendanceRoster() {
    const years = selectedValues($("#attendanceYears"));
    const selected = years.length ? years : [state.years[0]];
    const editSession = $("#attendanceSessionEditId")?.value || "";
    const existing = editSession ? state.attendance.filter((entry) => entry.sessionId === editSession) : [];
    const existingByStudent = new Map(existing.map((entry) => [entry.studentId, entry.status]));
    const students = state.students.filter((student) => selected.includes(student.className) && student.status !== "Zawieszona").sort(compareStudents);
    $("#attendanceRoster").innerHTML = students.length ? students.map((student) => `<div class="roster-row" data-student-id="${escapeHtml(student.id)}"><div><strong>${escapeHtml(student.name)}</strong><span>${displayYear(student.className)} · ${escapeHtml(getHouse(student.houseId)?.name || "Bez domu")}</span></div><select data-attendance-status>${["Nieobecny", "Obecny", "Spóźnienie", "Usprawiedliwiony"].map((status) => `<option ${existingByStudent.get(student.id) === status ? "selected" : ""}>${status}</option>`).join("")}</select></div>`).join("") : `<div class="empty-state">Brak uczniów dla wybranych roczników.</div>`;
  }

  function attendanceBadge(status) {
    if (status === "Obecny") return `<span class="badge good">Obecny</span>`;
    if (status === "Spóźnienie" || status === "Usprawiedliwiony") return `<span class="badge warn">${escapeHtml(status)}</span>`;
    return `<span class="badge bad">${escapeHtml(status)}</span>`;
  }

  function renderAttendance() {
    const year = $("#attendanceYearFilter")?.value || "Wszystkie";
    const date = $("#attendanceDateFilter")?.value || "";
    const subject = $("#attendanceSubjectFilter")?.value || "Wszystkie";
    const entries = state.attendance.filter((entry) => {
      const student = getStudent(entry.studentId);
      return student && (year === "Wszystkie" || student.className === year) && (!date || entry.date === date) && (subject === "Wszystkie" || entry.subject === subject);
    }).sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.time.localeCompare(b.time));
    const students = Array.from(new Set(entries.map((entry) => entry.studentId))).map(getStudent).filter(Boolean).sort(compareStudents);
    $("#attendanceSummaryTable").innerHTML = students.length ? students.map((student) => {
      const studentEntries = entries.filter((entry) => entry.studentId === student.id);
      const present = studentEntries.filter((entry) => entry.status === "Obecny" || entry.status === "Usprawiedliwiony").length;
      const late = studentEntries.filter((entry) => entry.status === "Spóźnienie").length;
      const absent = studentEntries.filter((entry) => entry.status === "Nieobecny").length;
      const rate = studentEntries.length ? Math.round(((studentEntries.length - absent) / studentEntries.length) * 100) : 0;
      return `<tr><td><strong>${escapeHtml(student.name)}</strong></td><td>${displayYear(student.className)}</td><td>${present}</td><td>${late}</td><td>${absent}</td><td><strong>${rate}%</strong></td></tr>`;
    }).join("") : `<tr><td colspan="6">Brak frekwencji dla wybranych filtrów.</td></tr>`;
    const sessions = Object.values(entries.reduce((map, entry) => { map[entry.sessionId] ||= { ...entry, entries: [] }; map[entry.sessionId].entries.push(entry); return map; }, {})).sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.time.localeCompare(b.time));
    $("#attendanceSessions").innerHTML = sessions.length ? sessions.map(renderAttendanceSession).join("") : `<div class="empty-state">Brak zapisanych lekcji.</div>`;
  }

  function renderAttendanceSession(sessionItem) {
    const teacher = getTeacher(sessionItem.teacherId);
    const counts = sessionItem.entries.reduce((map, entry) => { map[entry.status] = (map[entry.status] || 0) + 1; return map; }, {});
    return `<article class="list-item"><div class="list-row"><strong>${escapeHtml(dayName(sessionItem.date))} · ${escapeHtml(sessionItem.time)} · ${escapeHtml(sessionItem.subject)}</strong><span class="pill">${formatDate(sessionItem.date)}</span></div><span class="muted-text">${escapeHtml(teacher?.name || "bez nauczyciela")} · ${sessionItem.years.map(displayYear).join(", ")}</span><div>${attendanceBadge("Obecny")} ${counts.Obecny || 0} ${attendanceBadge("Spóźnienie")} ${counts.Spóźnienie || 0} ${attendanceBadge("Nieobecny")} ${counts.Nieobecny || 0}</div><div class="item-actions"><button class="secondary-button" data-action="edit-attendance" data-id="${escapeHtml(sessionItem.sessionId)}">Edytuj</button><button class="ghost-button" data-action="delete-attendance-session" data-delete-scope="attendance" data-id="${escapeHtml(sessionItem.sessionId)}">Usuń</button></div></article>`;
  }

  function compareLessons(a, b) {
    return String(a.date).localeCompare(String(b.date)) || lessonTimes.indexOf(a.time) - lessonTimes.indexOf(b.time) || scheduleItemLabel(a).localeCompare(scheduleItemLabel(b), "pl");
  }

  function renderSchedule() {
    const weekStart = currentWeekStart();
    const year = $("#scheduleYearFilter")?.value || "Wszystkie";
    $("#scheduleGrid").innerHTML = schoolDays.map((day, index) => {
      const date = addDaysIso(weekStart, index);
      const lessons = state.schedule.filter((lesson) => lesson.date === date && (year === "Wszystkie" || lesson.years.includes(year))).sort(compareLessons);
      return `<section class="day-panel"><h3>${escapeHtml(day)} <span>${formatDate(date)}</span></h3>${lessons.length ? lessons.map(renderScheduleLesson).join("") : `<div class="empty-state">Brak zajęć.</div>`}</section>`;
    }).join("");
  }

  function renderScheduleLesson(lesson) {
    const teacher = getTeacher(lesson.teacherId);
    return `<article class="lesson-card"><div class="list-row"><strong>${escapeHtml(lesson.time)} · ${escapeHtml(scheduleItemLabel(lesson))}</strong><button class="secondary-button" data-action="edit-schedule" data-id="${escapeHtml(lesson.id)}">Edytuj</button></div><span class="muted-text">${lesson.years.map(displayYear).join(", ")} · ${escapeHtml(lesson.room || "Brak miejsca")}</span><span>${escapeHtml(teacher?.name || "bez opiekuna")}</span>${lesson.title ? `<span class="muted-text">${escapeHtml(lesson.title)}</span>` : ""}<div class="item-actions"><button class="ghost-button" data-action="delete-schedule" data-delete-scope="schedule" data-id="${escapeHtml(lesson.id)}">Usuń</button></div></article>`;
  }

  function renderClubDraft() {
    $("#clubFieldList").innerHTML = clubDraftFields.length ? clubDraftFields.map((field) => `<article class="list-item"><div class="list-row"><strong>${escapeHtml(field.label)}</strong><span class="pill">${escapeHtml(fieldTypeLabel(field.type))}</span></div><button class="ghost-button" data-action="remove-club-field" data-id="${escapeHtml(field.id)}">Usuń pole</button></article>`).join("") : `<div class="empty-state">Dodaj pola, których wymaga klub.</div>`;
    $("#clubDynamicFields").innerHTML = clubDraftFields.map(renderClubDynamicInput).join("");
  }

  function fieldTypeLabel(type) {
    return { teacher: "Wybór nauczyciela", students: "Wybór uczniów", studentRoles: "Uczniowie z rolami", text: "Tekst", details: "Wysuwana wiadomość" }[type] || type;
  }

  function renderClubDynamicInput(field) {
    const label = escapeHtml(field.label);
    if (field.type === "teacher") return `<label class="field" data-club-field="${escapeHtml(field.id)}"><span>${label}</span><select data-club-value>${state.teachers.map((teacher) => `<option value="${escapeHtml(teacher.id)}" ${field.value === teacher.id ? "selected" : ""}>${escapeHtml(teacher.name)}</option>`).join("")}</select></label>`;
    if (field.type === "students") return `<label class="field wide" data-club-field="${escapeHtml(field.id)}"><span>${label}</span><select class="multi-select" multiple data-club-value>${state.students.map((student) => `<option value="${escapeHtml(student.id)}" ${(field.value || []).includes(student.id) ? "selected" : ""}>${escapeHtml(student.name)} · ${displayYear(student.className)}</option>`).join("")}</select></label>`;
    if (field.type === "studentRoles") return `<label class="field wide" data-club-field="${escapeHtml(field.id)}"><span>${label}</span><textarea data-club-value rows="3" placeholder="np. Lena Kowalska - Lider">${escapeHtml(field.value || "")}</textarea></label>`;
    if (field.type === "details") return `<label class="field wide" data-club-field="${escapeHtml(field.id)}"><span>${label}</span><textarea data-club-value rows="4">${escapeHtml(field.value || "")}</textarea></label>`;
    return `<label class="field wide" data-club-field="${escapeHtml(field.id)}"><span>${label}</span><input data-club-value value="${escapeHtml(field.value || "")}" /></label>`;
  }

  function collectClubFields() {
    return clubDraftFields.map((field) => {
      const wrapper = $(`[data-club-field="${field.id}"]`);
      const input = $("[data-club-value]", wrapper);
      let value = input?.value || "";
      if (field.type === "students") value = selectedValues(input);
      return { ...field, value };
    });
  }

  function renderClubs() {
    $("#clubsList").innerHTML = state.clubs.length ? state.clubs.map((club) => `<article class="announcement-item"><div class="list-row"><h3>${clubBadge(club)} ${escapeHtml(club.name)}</h3><div class="item-actions"><button class="secondary-button" data-action="edit-club" data-id="${escapeHtml(club.id)}">Edytuj</button><button class="ghost-button" data-action="delete-club" data-delete-scope="clubs" data-id="${escapeHtml(club.id)}">Usuń</button></div></div><div class="club-fields">${club.fields.map(renderClubField).join("") || `<span class="muted-text">Brak pól.</span>`}</div></article>`).join("") : `<div class="empty-state">Brak klubów.</div>`;
  }

  function clubBadge(club) {
    const content = club.crestDataUrl ? `<img src="${club.crestDataUrl}" alt="" />` : "";
    return `<span class="house-chip" style="background:${escapeHtml(club.color)}">${content}${escapeHtml(club.name)}</span>`;
  }

  function renderClubField(field) {
    if (field.type === "teacher") return `<div><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(getTeacher(field.value)?.name || "Nie wybrano")}</div>`;
    if (field.type === "students") return `<div><strong>${escapeHtml(field.label)}:</strong> ${(field.value || []).map((id) => escapeHtml(getStudent(id)?.name || "Uczeń")).join(", ") || "Brak"}</div>`;
    if (field.type === "details") return `<details><summary>${escapeHtml(field.label)}</summary><p>${escapeHtml(field.value || "")}</p></details>`;
    return `<div><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(field.value || "-")}</div>`;
  }

  function renderAnnouncements() {
    const rows = state.announcements.slice().sort((a, b) => (a.pinned === b.pinned ? String(b.date).localeCompare(String(a.date)) : a.pinned ? -1 : 1));
    $("#announcementList").innerHTML = rows.length ? rows.map((announcement) => `<article class="announcement-item"><div class="list-row"><h3>${escapeHtml(announcement.title)}</h3><span class="pill">${escapeHtml(announcement.audience)}</span></div><p>${escapeHtml(announcement.body)}</p><div class="list-row"><span class="muted-text">${formatDate(announcement.date)}${announcement.pinned ? " · przypięte" : ""}</span><div class="item-actions"><button class="secondary-button" data-action="edit-announcement" data-id="${escapeHtml(announcement.id)}">Edytuj</button><button class="ghost-button" data-action="delete-announcement" data-delete-scope="announcements" data-id="${escapeHtml(announcement.id)}">Usuń</button></div></div></article>`).join("") : `<div class="empty-state">Brak ogłoszeń.</div>`;
  }

  function renderPoints() {
    $("#pointsHouseScoreboard").innerHTML = renderHouseScoreboard();
    const rows = state.points.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    $("#pointList").innerHTML = rows.length ? rows.map((point) => {
      const student = getStudent(point.studentId);
      const signed = point.type === "plus" ? Number(point.value || 0) : point.type === "minus" ? -Number(point.value || 0) : 0;
      return `<article class="announcement-item"><div class="list-row"><h3>${escapeHtml(student?.name || "Usunięty uczeń")}</h3>${pointsMarkup(signed)}</div><p>${escapeHtml(point.body)}</p><div class="list-row"><span class="muted-text">${formatDate(point.date)} · ${escapeHtml(point.category || "Wpis")} · ${escapeHtml(authorLabel(point))}</span><div class="item-actions"><button class="secondary-button" data-action="edit-point" data-id="${escapeHtml(point.id)}">Edytuj</button><button class="ghost-button" data-action="delete-point" data-delete-scope="points" data-id="${escapeHtml(point.id)}">Usuń</button></div></div></article>`;
    }).join("") : `<div class="empty-state">Brak punktów i uwag.</div>`;
  }

  function authorLabel(point) {
    if (point.authorType === "worker") return getWorker(point.authorId)?.name || "Pracownik";
    if (point.authorType === "prefect") return getPrefect(point.authorId)?.name || "Prefekt";
    return getTeacher(point.authorId)?.name || "Kadra";
  }

  function setActiveSection(sectionId, doRender = true) {
    activeSection = sectionId;
    $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.section === sectionId));
    $$(".view").forEach((view) => view.classList.toggle("active-view", view.id === sectionId));
    if (doRender) render();
  }

  function resetForm(formId, editId) {
    const form = $(formId);
    if (form) form.reset();
    if ($(editId)) $(editId).value = "";
    pendingHouseCrest = "";
    pendingClubCrest = "";
    render();
  }

  function readFile(input, callback) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => callback(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function upsertById(collection, item, editId) {
    if (editId) {
      const index = collection.findIndex((entry) => entry.id === editId);
      if (index >= 0) collection[index] = { ...collection[index], ...item, id: editId };
    } else {
      collection.push({ ...item, id: item.id || uid("item") });
    }
  }

  function bindEvents() {
    $$(".nav-item").forEach((button) => button.addEventListener("click", () => setActiveSection(button.dataset.section)));
    $("#discordLoginButton").addEventListener("click", beginDiscordLogin);
    $("#localLoginButton").addEventListener("click", () => {
      session.currentAccountId = $("#quickAccountSelect").value;
      saveSession();
      render();
    });
    $("#logoutButton").addEventListener("click", () => {
      session.currentAccountId = "";
      saveSession();
      render();
    });

    $("#accountCharacterType").addEventListener("change", () => fillSelect($("#accountCharacterId"), characterOptions($("#accountCharacterType").value), ""));
    for (const id of ["studentYearFilter", "studentHouseFilter"]) $(`#${id}`).addEventListener("change", renderStudents);
    $("#studentSearch").addEventListener("input", renderStudents);
    for (const id of ["gradeYearFilter", "gradeHouseFilter"]) $(`#${id}`).addEventListener("change", () => { renderGradeBatchRows(); renderGrades(); });
    $("#gradeSubjectFilter").addEventListener("change", renderGrades);
    $("#refreshGradeRoster").addEventListener("click", renderGradeBatchRows);
    $("#gradeSubject").addEventListener("change", () => syncTeacherSelectForSubject("#gradeSubject", "#gradeTeacher"));

    for (const id of ["attendanceYearFilter", "attendanceDateFilter", "attendanceSubjectFilter"]) $(`#${id}`).addEventListener("change", renderAttendance);
    $("#attendanceDate").addEventListener("change", () => { updateAutoDayLabels(); syncAttendanceSubjects(); syncTeacherSelectForSubject("#attendanceSubject", "#attendanceTeacher"); renderAttendanceRoster(); });
    $("#attendanceYears").addEventListener("change", () => { syncAttendanceSubjects(); syncTeacherSelectForSubject("#attendanceSubject", "#attendanceTeacher"); renderAttendanceRoster(); });
    $("#attendanceSubject").addEventListener("change", () => syncTeacherSelectForSubject("#attendanceSubject", "#attendanceTeacher"));
    $("#refreshAttendanceRoster").addEventListener("click", renderAttendanceRoster);

    $("#scheduleDate").addEventListener("change", updateAutoDayLabels);
    $("#scheduleItemType").addEventListener("change", () => { syncScheduleItems(); syncScheduleTeacher(); });
    $("#scheduleItemId").addEventListener("change", syncScheduleTeacher);
    $("#scheduleYearFilter").addEventListener("change", renderSchedule);
    $("#previousWeek").addEventListener("click", () => setWeek(addDaysIso(currentWeekStart(), -7)));
    $("#currentWeek").addEventListener("click", () => setWeek(todayIso()));
    $("#nextWeek").addEventListener("click", () => setWeek(addDaysIso(currentWeekStart(), 7)));

    $("#addClubField").addEventListener("click", () => {
      const label = $("#clubFieldLabel").value.trim();
      if (!label) return showToast("Wpisz nazwę pola klubu.");
      clubDraftFields.push({ id: uid("field"), label, type: $("#clubFieldType").value, value: $("#clubFieldType").value === "students" ? [] : "" });
      $("#clubFieldLabel").value = "";
      renderClubDraft();
    });

    $("#logoUpload").addEventListener("change", (event) => readFile(event.target, (dataUrl) => { state.settings.logoDataUrl = dataUrl; saveState(); render(); showToast("Dodano logo szkoły."); }));
    $("#removeLogo").addEventListener("click", () => { state.settings.logoDataUrl = ""; saveState(); render(); });
    $("#houseCrestUpload").addEventListener("change", (event) => readFile(event.target, (dataUrl) => { pendingHouseCrest = dataUrl; $("#houseCrestPreview").innerHTML = `<img class="logo-image" src="${dataUrl}" alt="" />`; }));
    $("#clubCrestUpload").addEventListener("change", (event) => readFile(event.target, (dataUrl) => { pendingClubCrest = dataUrl; $("#clubCrestPreview").innerHTML = `<img class="logo-image" src="${dataUrl}" alt="" />`; }));

    bindFormSubmits();
    bindCancelButtons();
    document.addEventListener("click", handleDocumentClick);
  }

  function bindCancelButtons() {
    $("#cancelAccountEdit").addEventListener("click", () => resetForm("#accountForm", "#accountEditId"));
    $("#cancelStudentEdit").addEventListener("click", () => resetForm("#studentForm", "#studentEditId"));
    $("#cancelTeacherEdit").addEventListener("click", () => resetForm("#teacherForm", "#teacherEditId"));
    $("#cancelWorkerEdit").addEventListener("click", () => resetForm("#workerForm", "#workerEditId"));
    $("#cancelPrefectEdit").addEventListener("click", () => resetForm("#prefectForm", "#prefectEditId"));
    $("#cancelHouseEdit").addEventListener("click", () => resetForm("#houseForm", "#houseEditId"));
    $("#cancelAttendanceEdit").addEventListener("click", () => resetForm("#attendanceForm", "#attendanceSessionEditId"));
    $("#cancelScheduleEdit").addEventListener("click", () => resetForm("#scheduleForm", "#scheduleEditId"));
    $("#cancelClubEdit").addEventListener("click", () => { clubDraftFields = []; resetForm("#clubForm", "#clubEditId"); });
    $("#cancelAnnouncementEdit").addEventListener("click", () => resetForm("#announcementForm", "#announcementEditId"));
    $("#cancelPointEdit").addEventListener("click", () => resetForm("#pointForm", "#pointEditId"));
  }

  function bindFormSubmits() {
    $("#accountForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("accounts")) return;
      const editId = $("#accountEditId").value;
      upsertById(state.accounts, { id: editId || uid("acc"), discordId: $("#accountDiscordId").value.trim(), displayName: $("#accountDisplayName").value.trim(), avatarUrl: $("#accountAvatarUrl").value.trim(), role: $("#accountRole").value, characterType: $("#accountCharacterType").value, characterId: $("#accountCharacterId").value, status: $("#accountStatus").value }, editId);
      saveState();
      resetForm("#accountForm", "#accountEditId");
      showToast("Zapisano konto.");
    });

    $("#studentForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("students")) return;
      const editId = $("#studentEditId").value;
      const item = { id: editId || uid("stu"), name: $("#studentName").value.trim(), accountId: $("#studentAccountId").value, className: $("#studentYear").value, houseId: $("#studentHouse").value, status: $("#studentStatus").value };
      upsertById(state.students, item, editId);
      linkAccountCharacter(item.accountId, "student", item.id);
      state.students.sort(compareStudents);
      saveState();
      resetForm("#studentForm", "#studentEditId");
      showToast("Zapisano ucznia.");
    });

    $("#teacherForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("teachers")) return;
      const editId = $("#teacherEditId").value;
      const item = { id: editId || uid("tea"), name: $("#teacherName").value.trim(), accountId: $("#teacherAccountId").value, position: $("#teacherPosition").value.trim(), subjects: selectedValues($("#teacherSubjects")), status: $("#teacherStatus").value };
      upsertById(state.teachers, item, editId);
      linkAccountCharacter(item.accountId, "teacher", item.id);
      state.teachers.sort(compareByName);
      saveState();
      resetForm("#teacherForm", "#teacherEditId");
      showToast("Zapisano nauczyciela.");
    });

    $("#workerForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("workers")) return;
      const editId = $("#workerEditId").value;
      const item = { id: editId || uid("wrk"), name: $("#workerName").value.trim(), accountId: $("#workerAccountId").value, position: $("#workerPosition").value.trim(), status: $("#workerStatus").value };
      upsertById(state.workers, item, editId);
      linkAccountCharacter(item.accountId, "worker", item.id);
      state.workers.sort(compareByName);
      saveState();
      resetForm("#workerForm", "#workerEditId");
      showToast("Zapisano pracownika.");
    });

    $("#prefectForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("prefects")) return;
      const editId = $("#prefectEditId").value;
      const item = { id: editId || uid("pref"), name: $("#prefectName").value.trim(), accountId: $("#prefectAccountId").value, studentId: $("#prefectStudentId").value, houseId: $("#prefectHouse").value, isHead: $("#prefectHead").checked, status: $("#prefectStatus").value };
      upsertById(state.prefects, item, editId);
      linkAccountCharacter(item.accountId, "prefect", item.id);
      state.prefects.sort(compareByName);
      saveState();
      resetForm("#prefectForm", "#prefectEditId");
      showToast("Zapisano prefekta.");
    });

    $("#houseForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("houses")) return;
      const editId = $("#houseEditId").value;
      const previous = editId ? getHouse(editId) : null;
      const item = { id: editId || uid("house"), name: $("#houseName").value.trim(), color: $("#houseColor").value, description: $("#houseDescription").value.trim(), crestDataUrl: pendingHouseCrest || previous?.crestDataUrl || "" };
      upsertById(state.houses, item, editId);
      saveState();
      resetForm("#houseForm", "#houseEditId");
      showToast("Zapisano dom.");
    });

    $("#gradeForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("grades")) return;
      if (!$("#gradeSubject").value || !$("#gradeTeacher").value) return showToast("Wybierz przedmiot i nauczyciela.");
      const rows = $$(".batch-row", $("#gradeBatchRows")).filter((row) => $("[data-grade-enabled]", row).checked);
      if (!rows.length) return showToast("Zaznacz przynajmniej jednego ucznia.");
      rows.forEach((row) => state.grades.push({ id: uid("gr"), studentId: row.dataset.studentId, subject: $("#gradeSubject").value, teacherId: $("#gradeTeacher").value, value: $("[data-grade-value]", row).value, weight: Number($("[data-grade-weight]", row).value) || 1, description: $("#gradeDescription").value.trim(), date: $("#gradeDate").value || todayIso(), isFinalYear: $("#gradeKind").value === "finalYear" }));
      saveState();
      $("#gradeDescription").value = "";
      render();
      showToast("Dodano oceny.");
    });

    $("#attendanceForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("attendance")) return;
      if (!$("#attendanceSubject").value || !$("#attendanceTeacher").value) return showToast("Wybierz przedmiot z planu i nauczyciela.");
      const sessionId = $("#attendanceSessionEditId").value || uid("sess");
      state.attendance = state.attendance.filter((entry) => entry.sessionId !== sessionId);
      const years = selectedValues($("#attendanceYears"));
      $$(".roster-row", $("#attendanceRoster")).forEach((row) => state.attendance.push({ id: uid("att"), sessionId, studentId: row.dataset.studentId, subject: $("#attendanceSubject").value, teacherId: $("#attendanceTeacher").value, status: $("[data-attendance-status]", row).value || "Nieobecny", date: $("#attendanceDate").value || todayIso(), time: lessonTimeForAttendance(), years }));
      saveState();
      resetForm("#attendanceForm", "#attendanceSessionEditId");
      showToast("Zapisano frekwencję.");
    });

    $("#scheduleForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("schedule")) return;
      const years = selectedValues($("#scheduleYears"));
      if (!years.length) return showToast("Wybierz przynajmniej jeden rocznik.");
      const itemType = $("#scheduleItemType").value;
      const itemId = $("#scheduleItemId").value;
      if (!itemId || !$("#scheduleTeacher").value) return showToast("Wybierz zajęcia i opiekuna.");
      const editId = $("#scheduleEditId").value;
      const date = $("#scheduleDate").value || todayIso();
      const item = { id: editId || uid("sch"), date, weekStart: startOfWeekIso(date), time: $("#scheduleTime").value, years, itemType, itemId, teacherId: $("#scheduleTeacher").value, room: $("#scheduleRoom").value.trim(), title: $("#scheduleTitle").value.trim() };
      upsertById(state.schedule, item, editId);
      state.settings.activeWeekStart = item.weekStart;
      saveState();
      resetForm("#scheduleForm", "#scheduleEditId");
      showToast("Zapisano zajęcia.");
    });

    $("#clubForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("clubs")) return;
      const editId = $("#clubEditId").value;
      const previous = editId ? getClub(editId) : null;
      const item = { id: editId || uid("club"), name: $("#clubName").value.trim(), color: $("#clubColor").value, crestDataUrl: pendingClubCrest || previous?.crestDataUrl || "", fields: collectClubFields() };
      upsertById(state.clubs, item, editId);
      clubDraftFields = [];
      saveState();
      resetForm("#clubForm", "#clubEditId");
      showToast("Zapisano klub.");
    });

    $("#announcementForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("announcements")) return;
      const editId = $("#announcementEditId").value;
      const item = { id: editId || uid("ann"), title: $("#announcementTitle").value.trim(), audience: $("#announcementAudience").value, date: $("#announcementDate").value || todayIso(), pinned: $("#announcementPinned").checked, body: $("#announcementBody").value.trim() };
      upsertById(state.announcements, item, editId);
      saveState();
      resetForm("#announcementForm", "#announcementEditId");
      showToast("Zapisano ogłoszenie.");
    });

    $("#pointForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("points")) return;
      const editId = $("#pointEditId").value;
      const [authorType, authorId] = String($("#pointAuthor").value || "teacher:").split(":");
      const item = { id: editId || uid("pt"), studentId: $("#pointStudent").value, type: $("#pointType").value, value: Number($("#pointValue").value) || 0, authorType, authorId, category: $("#pointCategory").value.trim(), body: $("#pointBody").value.trim(), date: $("#pointDate").value || todayIso() };
      upsertById(state.points, item, editId);
      saveState();
      resetForm("#pointForm", "#pointEditId");
      showToast("Zapisano punkty lub uwagę.");
    });

    $("#settingsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!canEditScope("settings")) return;
      state.settings.schoolName = $("#schoolNameInput").value.trim() || seedState.settings.schoolName;
      state.settings.semester = $("#semesterInput").value.trim() || seedState.settings.semester;
      state.settings.discordChannel = $("#discordInput").value.trim() || seedState.settings.discordChannel;
      state.years = normalizeYears(parseCommaList($("#yearsInput").value));
      state.requiredSubjects = parseCommaList($("#requiredSubjectsInput").value);
      state.optionalSubjects = parseCommaList($("#optionalSubjectsInput").value);
      if (!state.years.length) state.years = clone(seedState.years);
      if (!state.requiredSubjects.length) state.requiredSubjects = clone(seedState.requiredSubjects);
      state.settings.discordClientId = $("#discordClientIdInput").value.trim();
      state.settings.discordRedirectUri = $("#discordRedirectUriInput").value.trim();
      state.settings.allowLocalLogin = $("#allowLocalLoginInput").checked;
      saveState();
      render();
      showToast("Zapisano ustawienia.");
    });

    $("#downloadJson").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "edziennik-rp-dane.json";
      link.click();
      URL.revokeObjectURL(url);
      showToast("Przygotowano plik JSON.");
    });

    $("#importJson").addEventListener("click", () => {
      if (!canEditScope("settings")) return;
      try {
        state = normalizeState(JSON.parse($("#importBox").value));
        saveState();
        render();
        showToast("Wczytano dane.");
      } catch {
        showToast("Nie udało się wczytać JSON.");
      }
    });

    $("#resetDemo").addEventListener("click", () => {
      if (!canEditScope("settings")) return;
      state = clone(seedState);
      session.currentAccountId = "acc-admin";
      saveState();
      saveSession();
      render();
      showToast("Przywrócono dane demo.");
    });
  }

  function linkAccountCharacter(accountId, type, id) {
    if (!accountId) return;
    const account = getAccount(accountId);
    if (!account) return;
    account.characterType = type;
    account.characterId = id;
  }

  function lessonTimeForAttendance() {
    const date = $("#attendanceDate").value || todayIso();
    const subject = $("#attendanceSubject").value;
    const years = selectedValues($("#attendanceYears"));
    const lesson = state.schedule.find((item) => item.date === date && item.itemType === "subject" && item.itemId === subject && (!years.length || item.years.some((year) => years.includes(year))));
    return lesson?.time || lessonTimes[0];
  }

  function handleDocumentClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action.startsWith("edit-")) return handleEdit(action.replace("edit-", ""), id);
    if (action.startsWith("delete-")) return handleDelete(action.replace("delete-", ""), id);
    if (action === "remove-club-field") {
      clubDraftFields = clubDraftFields.filter((field) => field.id !== id);
      renderClubDraft();
    }
  }

  function handleEdit(type, id) {
    const map = {
      account: editAccount,
      student: editStudent,
      teacher: editTeacher,
      worker: editWorker,
      prefect: editPrefect,
      house: editHouse,
      attendance: editAttendance,
      schedule: editSchedule,
      club: editClub,
      announcement: editAnnouncement,
      point: editPoint,
    };
    map[type]?.(id);
  }

  function handleDelete(type, id) {
    const scope = type === "attendance-session" ? "attendance" : type;
    if (!canDeleteScope(scope)) return showToast("Nie masz uprawnień do usuwania tego wpisu.");
    if (type === "attendance-session") state.attendance = state.attendance.filter((entry) => entry.sessionId !== id);
    if (type === "account") state.accounts = state.accounts.filter((account) => account.id !== id);
    if (type === "student") {
      state.students = state.students.filter((student) => student.id !== id);
      state.grades = state.grades.filter((grade) => grade.studentId !== id);
      state.attendance = state.attendance.filter((entry) => entry.studentId !== id);
      state.points = state.points.filter((point) => point.studentId !== id);
    }
    if (type === "teacher") {
      state.teachers = state.teachers.filter((teacher) => teacher.id !== id);
      for (const grade of state.grades) if (grade.teacherId === id) grade.teacherId = "";
      for (const lesson of state.schedule) if (lesson.teacherId === id) lesson.teacherId = "";
    }
    if (type === "worker") state.workers = state.workers.filter((worker) => worker.id !== id);
    if (type === "prefect") state.prefects = state.prefects.filter((prefect) => prefect.id !== id);
    if (type === "house") {
      if (state.houses.length <= 1) return showToast("Zostaw przynajmniej jeden dom.");
      const fallback = state.houses.find((house) => house.id !== id)?.id || "";
      state.houses = state.houses.filter((house) => house.id !== id);
      state.students.forEach((student) => { if (student.houseId === id) student.houseId = fallback; });
      state.prefects.forEach((prefect) => { if (prefect.houseId === id) prefect.houseId = fallback; });
    }
    if (type === "grade") state.grades = state.grades.filter((grade) => grade.id !== id);
    if (type === "schedule") state.schedule = state.schedule.filter((lesson) => lesson.id !== id);
    if (type === "club") state.clubs = state.clubs.filter((club) => club.id !== id);
    if (type === "announcement") state.announcements = state.announcements.filter((announcement) => announcement.id !== id);
    if (type === "point") state.points = state.points.filter((point) => point.id !== id);
    saveState();
    render();
    showToast("Usunięto wpis.");
  }

  function editAccount(id) {
    const account = getAccount(id);
    if (!account || !canEditScope("accounts")) return;
    $("#accountEditId").value = account.id;
    $("#accountDiscordId").value = account.discordId;
    $("#accountDisplayName").value = account.displayName;
    $("#accountAvatarUrl").value = account.avatarUrl || "";
    $("#accountRole").value = account.role;
    $("#accountCharacterType").value = account.characterType;
    fillSelect($("#accountCharacterId"), characterOptions(account.characterType), account.characterId);
    $("#accountStatus").value = account.status;
    setActiveSection("accounts");
  }

  function editStudent(id) {
    const item = getStudent(id);
    if (!item || !canEditScope("students")) return;
    $("#studentEditId").value = item.id;
    $("#studentName").value = item.name;
    $("#studentAccountId").value = item.accountId || "";
    $("#studentYear").value = item.className;
    $("#studentHouse").value = item.houseId;
    $("#studentStatus").value = item.status;
    setActiveSection("students");
  }

  function editTeacher(id) {
    const item = getTeacher(id);
    if (!item || !canEditScope("teachers")) return;
    $("#teacherEditId").value = item.id;
    $("#teacherName").value = item.name;
    $("#teacherAccountId").value = item.accountId || "";
    $("#teacherPosition").value = item.position || "";
    $("#teacherStatus").value = item.status;
    fillMultiSelect($("#teacherSubjects"), allSubjects().map((subject) => option(subject)), item.subjects || []);
    setActiveSection("teachers");
  }

  function editWorker(id) {
    const item = getWorker(id);
    if (!item || !canEditScope("workers")) return;
    $("#workerEditId").value = item.id;
    $("#workerName").value = item.name;
    $("#workerAccountId").value = item.accountId || "";
    $("#workerPosition").value = item.position || "";
    $("#workerStatus").value = item.status;
    setActiveSection("workers");
  }

  function editPrefect(id) {
    const item = getPrefect(id);
    if (!item || !canEditScope("prefects")) return;
    $("#prefectEditId").value = item.id;
    $("#prefectName").value = item.name;
    $("#prefectAccountId").value = item.accountId || "";
    $("#prefectStudentId").value = item.studentId || "";
    $("#prefectHouse").value = item.houseId;
    $("#prefectStatus").value = item.status;
    $("#prefectHead").checked = item.isHead;
    setActiveSection("prefects");
  }

  function editHouse(id) {
    const item = getHouse(id);
    if (!item || !canEditScope("houses")) return;
    $("#houseEditId").value = item.id;
    $("#houseName").value = item.name;
    $("#houseColor").value = item.color;
    $("#houseDescription").value = item.description || "";
    pendingHouseCrest = "";
    $("#houseCrestPreview").innerHTML = item.crestDataUrl ? `<img class="logo-image" src="${item.crestDataUrl}" alt="" />` : "";
    setActiveSection("houses");
  }

  function editAttendance(sessionId) {
    const entries = state.attendance.filter((entry) => entry.sessionId === sessionId);
    if (!entries.length || !canEditScope("attendance")) return;
    const first = entries[0];
    $("#attendanceSessionEditId").value = sessionId;
    $("#attendanceDate").value = first.date;
    fillMultiSelect($("#attendanceYears"), yearOptions(false), first.years || []);
    updateAutoDayLabels();
    syncAttendanceSubjects();
    $("#attendanceSubject").value = first.subject;
    syncTeacherSelectForSubject("#attendanceSubject", "#attendanceTeacher");
    $("#attendanceTeacher").value = first.teacherId || "";
    renderAttendanceRoster();
    setActiveSection("attendance");
  }

  function editSchedule(id) {
    const item = state.schedule.find((lesson) => lesson.id === id);
    if (!item || !canEditScope("schedule")) return;
    $("#scheduleEditId").value = item.id;
    $("#scheduleDate").value = item.date;
    updateAutoDayLabels();
    $("#scheduleTime").value = item.time;
    fillMultiSelect($("#scheduleYears"), yearOptions(false), item.years || []);
    $("#scheduleItemType").value = item.itemType;
    syncScheduleItems();
    $("#scheduleItemId").value = item.itemId;
    syncScheduleTeacher();
    $("#scheduleTeacher").value = item.teacherId || "";
    $("#scheduleRoom").value = item.room || "";
    $("#scheduleTitle").value = item.title || "";
    setActiveSection("schedule");
  }

  function editClub(id) {
    const item = getClub(id);
    if (!item || !canEditScope("clubs")) return;
    $("#clubEditId").value = item.id;
    $("#clubName").value = item.name;
    $("#clubColor").value = item.color;
    pendingClubCrest = "";
    $("#clubCrestPreview").innerHTML = item.crestDataUrl ? `<img class="logo-image" src="${item.crestDataUrl}" alt="" />` : "";
    clubDraftFields = clone(item.fields || []);
    renderClubDraft();
    setActiveSection("clubs");
  }

  function editAnnouncement(id) {
    const item = state.announcements.find((announcement) => announcement.id === id);
    if (!item || !canEditScope("announcements")) return;
    $("#announcementEditId").value = item.id;
    $("#announcementTitle").value = item.title;
    $("#announcementAudience").value = item.audience;
    $("#announcementDate").value = item.date;
    $("#announcementPinned").checked = item.pinned;
    $("#announcementBody").value = item.body;
    setActiveSection("announcements");
  }

  function editPoint(id) {
    const item = state.points.find((point) => point.id === id);
    if (!item || !canEditScope("points")) return;
    $("#pointEditId").value = item.id;
    $("#pointStudent").value = item.studentId;
    $("#pointType").value = item.type;
    $("#pointValue").value = item.value;
    $("#pointAuthor").value = `${item.authorType || "teacher"}:${item.authorId || ""}`;
    $("#pointCategory").value = item.category || "";
    $("#pointDate").value = item.date;
    $("#pointBody").value = item.body;
    setActiveSection("points");
  }

  async function init() {
    await handleOAuthReturn();
    bindEvents();
    if (session.currentAccountId && !getAccount(session.currentAccountId)) session.currentAccountId = "";
    saveSession();
    render();
  }

  init();
})();



