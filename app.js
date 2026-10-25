(function () {
  "use strict";

  const STORAGE_KEY = "bazar-atlas-v1";
  const displayedQuestIds = new Set(Object.values(window.QUEST_DISPLAY_GROUPS || {}).flat());
  const CATALOG = (window.QUEST_CATALOG || []).filter(quest => displayedQuestIds.has(quest.id));
  const EVIDENCE_CATALOG = window.QUEST_EVIDENCE || {};
  const STATUS_LABELS = {
    unknown: "Não verificado",
    incomplete: "Falta concluir",
    partial: "Parcialmente concluída",
    complete: "Concluída"
  };
  const SKILLS = [
    ["magic", "Magic level", 150],
    ["club", "Club", 150],
    ["fist", "Fist", 150],
    ["sword", "Sword", 150],
    ["fishing", "Fishing", 150],
    ["axe", "Axe", 150],
    ["distance", "Distance", 160],
    ["shielding", "Shielding", 150]
  ];
  const METRICS = [
    ["achievementPoints", "Achievement points", "✧", "Ficha pública"],
    ["charmPoints", "Charm points", "◇", "Snapshot do bazar"],
    ["animusMasteries", "Animus Masteries", "◈", "Snapshot do bazar"],
    ["imbuements", "Imbuements", "⟐", "slots desbloqueados"],
    ["bossPoints", "Boss points", "✦", "Snapshot do bazar"],
    ["questlinesDone", "Quest lines", "✓", "linhas do bazar"],
    ["gems", "Gems", "❖", "Snapshot do bazar"],
    ["tcInvested", "TC investidas", "◉", "Snapshot do bazar"]
  ];

  let activeView = "overview";
  let activeFilter = "all";
  let sortByPriority = true;
  let toastTimer = null;
  let editingId = null;
  let pendingAuctionSnapshot = null;
  let bazaarAuctions = [];
  let auctionListings = [];
  const AUCTIONS_PER_PAGE = 12;
  let listingPage = 1;
  let listingTotal = 0;
  let listingTotalPages = 0;
  let listingType = "current";
  let listingQueryVersion = 0;
  let listingFilters = {};
  let listingError = "";
  let suppressFilterReload = false;
  const listingPageCache = new Map();
  const listingPageRequests = new Map();
  let activeDetailSnapshot = null;
  let activeCosmeticTab = "Outfits";
  const savedAuctionIds = (key) => {
    try { const data = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(data) ? data : []; }
    catch (error) { return []; }
  };
  const favoriteAuctionIds = savedAuctionIds("bazar-atlas-favorites");
  const notifiedAuctionIds = savedAuctionIds("bazar-atlas-notify");

  const OFFICIAL_QUEST_NAMES = {
    "make-believe": ["Make Believe"],
    "shards-moon": ["Shards of a Broken Moon"],
    "no-rest-wicked": ["No Rest for the Wicked"],
    "rotten-blood": ["Rotten Blood"],
    "soul-war": ["Soul War"],
    "primal-ordeal": ["Primal Ordeal"],
    "secret-library": ["The Secret Library", "Secret Library"],
    "feaster-of-souls": ["Feaster of Souls"],
    "dream-courts": ["The Dream Courts", "Dream Courts"],
    "grave-danger": ["Grave Danger"],
    "order-falcon": ["The Order of the Falcon", "Order of the Falcon"],
    "order-cobra": ["The Order of the Cobra", "Order of the Cobra"],
    "order-lion": ["The Order of the Lion", "Order of the Lion"],
    "heart-destruction": ["Heart of Destruction"],
    "dangerous-depths": ["Dangerous Depths"],
    "bigfoots-burden": ["Bigfoot's Burden"],
    "cults-of-tibia": ["Cults of Tibia"],
    "forgotten-knowledge": ["Forgotten Knowledge"],
    "new-frontier": ["The New Frontier", "New Frontier"],
    "wrath-emperor": ["Wrath of the Emperor"],
    "curse-spreads": ["The Curse Spreads"],
    "ice-islands": ["The Ice Islands", "Ice Islands"],
    "20-years-cook": ["20 Years a Cook"],
    "shattered-isles": ["The Shattered Isles", "Shattered Isles"],
    postman: ["The Postman Missions", "Postman Missions"]
  };

  let state = readState();

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const byId = (id) => document.getElementById(id);

  function newId() {
    return window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : "char-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function blankProfile(name) {
    const questFlags = {};
    CATALOG.forEach((quest) => {
      questFlags[quest.id] = { status: "unknown", manualStatus: null, checkpoints: [], evidence: [] };
    });
    return {
      id: newId(),
      name: name || "",
      auctionId: "",
      world: "",
      vocation: "",
      level: "",
      achievementPoints: "",
      auctionUrl: "",
      skills: {
        magic: "", club: "", fist: "", sword: "",
        fishing: "", axe: "", distance: "", shielding: ""
      },
      metrics: {
        charmPoints: "", animusMasteries: "", imbuements: "",
        bossPoints: "", questlinesDone: "", questlinesTotal: "42",
        gems: "", tcInvested: ""
      },
      highlights: "",
      auctionSnapshot: null,
      features: {
        weeklyTaskExpansion: "unknown",
        charmExpansion: "unknown",
        preySlot: "unknown",
        preySlots: ""
      },
      questFlags: questFlags,
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeProfile(profile) {
    const normalized = blankProfile(profile && profile.name);
    if (!profile || typeof profile !== "object") return normalized;
    normalized.id = String(profile.id || newId());
    ["name", "auctionId", "world", "vocation", "level", "achievementPoints", "auctionUrl", "updatedAt"].forEach((key) => {
      if (profile[key] !== undefined && profile[key] !== null) normalized[key] = String(profile[key]);
    });
    if (profile.skills && typeof profile.skills === "object") {
      Object.keys(normalized.skills).forEach((key) => {
        if (profile.skills[key] !== undefined && profile.skills[key] !== null) {
          normalized.skills[key] = String(profile.skills[key]);
        }
      });
    }
    const metrics = profile.metrics || {};
    Object.keys(normalized.metrics).forEach((key) => {
      if (metrics[key] !== undefined && metrics[key] !== null) normalized.metrics[key] = String(metrics[key]);
    });
    if (profile.highlights !== undefined && profile.highlights !== null) normalized.highlights = String(profile.highlights);
    if (profile.auctionSnapshot && typeof profile.auctionSnapshot === "object") {
      normalized.auctionSnapshot = profile.auctionSnapshot;
    }
    if (profile.features && typeof profile.features === "object") {
      Object.keys(normalized.features).forEach((key) => {
        if (key === "preySlots") {
          if (profile.features[key] !== undefined && profile.features[key] !== null) {
            normalized.features[key] = String(profile.features[key]);
          }
        } else if (["unknown", "yes", "no"].includes(profile.features[key])) {
          normalized.features[key] = profile.features[key];
        }
      });
    }
    if (profile.questFlags && typeof profile.questFlags === "object") {
      CATALOG.forEach((quest) => {
        const saved = profile.questFlags[quest.id];
        if (!saved) return;
        const status = ["unknown", "incomplete", "partial", "complete"].includes(saved.status)
          ? saved.status
          : "unknown";
        const checked = Array.isArray(saved.checkpoints) ? saved.checkpoints : [];
        const evidence = Array.isArray(saved.evidence)
          ? saved.evidence.filter((item) => item && item.name && item.source)
          : [];
        const inferredStatus = evidence.some((item) => item.tier === "complete")
          ? "complete"
          : evidence.some((item) => item.tier === "partial") ? "partial" : "unknown";
        const savedManualStatus = ["unknown", "incomplete", "partial", "complete"].includes(saved.manualStatus)
          ? saved.manualStatus
          : (evidence.length ? (status === inferredStatus ? null : status) : (status === "unknown" ? null : status));
        normalized.questFlags[quest.id] = {
          status: status,
          manualStatus: savedManualStatus,
          checkpoints: quest.checkpoints.map((_, index) => checked[index] === true),
          evidence: evidence
        };
      });
    }
    return normalized;
  }

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.profiles)) {
        const profiles = saved.profiles.map(normalizeProfile).filter((profile) => profile.name);
        profiles.forEach((profile) => {
          if (profile.auctionSnapshot) applyAuctionEvidence(profile, profile.auctionSnapshot);
        });
        const selectedId = profiles.some((profile) => profile.id === saved.selectedId)
          ? saved.selectedId
          : (profiles[0] ? profiles[0].id : null);
        return { profiles: profiles, selectedId: selectedId };
      }
    } catch (error) {
      console.warn("Não foi possível carregar o backup local.", error);
    }
    return { profiles: [], selectedId: null };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showToast("Não consegui salvar neste navegador. Exporte um backup JSON.");
    }
  }

  function selectedProfile() {
    return state.profiles.find((profile) => profile.id === state.selectedId) || null;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
  }

  function safeHttpsUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch (error) {
      return "";
    }
  }

  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "?";
  }

  function numberText(value) {
    if (value === "" || value === null || value === undefined) return "—";
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toLocaleString("pt-BR") : String(value);
  }

  function latestStatus(profile) {
    const flags = profile ? profile.questFlags : {};
    let complete = 0;
    let partial = 0;
    CATALOG.forEach((quest) => {
      const status = flags[quest.id] ? flags[quest.id].status : "unknown";
      if (status === "complete") complete += 1;
      if (status === "partial") partial += 1;
    });
    return { complete: complete, partial: partial };
  }

  function questFlag(profile, questId) {
    return profile && profile.questFlags[questId]
      ? profile.questFlags[questId]
      : { status: "unknown", manualStatus: null, checkpoints: [], evidence: [] };
  }

  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function persistAndRender() {
    saveState();
    renderAll();
  }

  function renderCharacterList() {
    const list = byId("characterList");
    if (!state.profiles.length) {
      list.innerHTML = '<div class="side-empty">Os personagens adicionados aparecem aqui.</div>';
      return;
    }
    list.innerHTML = state.profiles.map((profile) => {
      return '<button class="character-row ' + (profile.id === state.selectedId ? "selected" : "") +
        '" data-profile="' + escapeHtml(profile.id) + '">' +
        '<span class="mini-avatar">' + escapeHtml(initials(profile.name)) + "</span>" +
        "<span><strong>" + escapeHtml(profile.name) + "</strong><small>" +
        escapeHtml([profile.vocation, profile.world].filter(Boolean).join(" · ") || "Sem ficha pública") +
        "</small></span></button>";
    }).join("");
  }

  function metricCard(profile, metric) {
    const key = metric[0];
    const isProfileField = key === "achievementPoints";
    const value = isProfileField ? profile.achievementPoints : (profile.metrics[key] || "");
    const isQuestCount = key === "questlinesDone";
    const suffix = isQuestCount
      ? "/" + escapeHtml(profile.metrics.questlinesTotal || "42")
      : (key === "imbuements" ? "/23" : "");
    const inputType = key === "gems" ? "text" : "number";
    const placeholder = key === "gems" ? "0-0-0" : "—";
    return '<article class="metric-card"><div class="metric-head"><span>' + escapeHtml(metric[1]) +
      '</span><span class="metric-icon">' + escapeHtml(metric[2]) + '</span></div><div class="metric-value">' +
      '<input class="editable-input ' + (key === "gems" ? "text-entry" : "") +
      '" inputmode="' + (key === "gems" ? "text" : "numeric") + '" type="' + inputType + '" min="0" ' +
      (isProfileField ? 'data-profile-field="' : 'data-metric="') + escapeHtml(key) +
      '" value="' + escapeHtml(value) + '" placeholder="' + placeholder + '" aria-label="' + escapeHtml(metric[1]) + '">' +
      '<small>' + suffix + '</small></div><div class="metric-sub">' + escapeHtml(metric[3]) + "</div></article>";
  }

  function renderSkills(profile) {
    byId("skillsList").innerHTML = SKILLS.map((skill) => {
      const value = profile.skills[skill[0]];
      const parsed = Number(value);
      const fill = value !== "" && Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed / skill[2] * 100)) : 0;
      return '<div class="skill-row"><label class="skill-name" for="skill-' + skill[0] + '">' + skill[1] +
        '</label><div class="skill-track"><div class="skill-fill" style="width:' + fill.toFixed(1) + '%"></div></div>' +
        '<input class="skill-value" id="skill-' + skill[0] + '" type="number" min="0" max="999" data-skill="' +
        skill[0] + '" value="' + escapeHtml(value) + '" placeholder="—" aria-label="' + skill[1] + '">' +
        "</div>";
    }).join("");
  }

  function renderPriorityAccess(profile) {
    const priorityQuests = CATALOG.filter((quest) => quest.priority === 1).slice(0, 5);
    byId("priorityAccessList").innerHTML = priorityQuests.map((quest) => {
      const flag = questFlag(profile, quest.id);
      return '<div class="priority-row" data-status="' + flag.status + '"><span class="priority-mark"></span>' +
        '<span class="priority-name">' + escapeHtml(quest.name) + '</span><span class="priority-status">' +
        escapeHtml(STATUS_LABELS[flag.status]) + "</span></div>";
    }).join("");
    const summary = latestStatus(profile);
    byId("accessSummaryText").textContent = summary.complete + " de " + CATALOG.length +
      " linhas confirmadas · " + summary.partial + " parcialmente concluídas";
  }

  function renderSnapshotExtras(profile) {
    const chips = String(profile.highlights || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
    byId("highlightInput").value = profile.highlights || "";
    byId("highlightChips").innerHTML = chips.length
      ? chips.map((item) => '<span class="highlight-chip">' + escapeHtml(item) + "</span>").join("")
      : '<span class="metric-sub">Destaques do leilão aparecem aqui.</span>';
    byId("preySlotNote").textContent = profile.features.preySlots ? "(" + profile.features.preySlots + ")" : "";
    $$("[data-feature]").forEach((select) => {
      const saved = profile.features[select.dataset.feature] || "unknown";
      select.innerHTML = '<option value="unknown">Não verificado</option><option value="yes">Sim</option><option value="no">Não</option>';
      select.value = saved;
    });
  }

  function renderOfficialSnapshot(profile) {
    const panel = byId("officialSnapshotPanel");
    const snapshot = profile.auctionSnapshot;
    panel.hidden = !snapshot;
    if (!snapshot) return;
    const auction = snapshot.auction || {};
    const metrics = snapshot.metrics || {};
    const typeLabel = auction.type === "past" ? "leilão encerrado" : "leilão atual";
    const bid = auction.currentBid || auction.minimumBid;
    const bidLabel = bid ? " · " + numberText(bid) + " TC" : "";
    const endLabel = auction.end ? " · fim " + auction.end : "";
    byId("officialSnapshotTitle").textContent = "Leilão #" + (auction.id || profile.auctionId || "—") +
      " · " + typeLabel + (auction.state ? " · " + auction.state : "") + bidLabel + endLabel;
    const metricSummary = [
      ["Charm points", metrics.totalCharmPoints],
      ["Boss points", metrics.bossPoints],
      ["Animus Masteries", metrics.animusMasteries],
      ["Imbuements", metrics.imbuementsUnlocked],
      ["Quest lines no anúncio", metrics.completedQuestLines]
    ].filter((item) => item[1] !== "" && item[1] !== undefined && item[1] !== null);
    const metricHtml = metricSummary.length
      ? '<div class="official-section auction-summary"><h4>Métricas importadas</h4><ul class="official-section-list">' +
        metricSummary.map((item) => "<li>" + escapeHtml(item[0]) + ": " + escapeHtml(numberText(item[1])) + "</li>").join("") +
        "</ul></div>"
      : "";
    const sections = snapshot.sections && typeof snapshot.sections === "object" ? Object.entries(snapshot.sections) : [];
    const sectionHtml = sections.map((entry) => {
      const section = entry[1] || {};
      const title = section.title || entry[0];
      const rows = Array.isArray(section.entries) ? section.entries : [];
      const total = Number(section.total) || rows.length;
      const collapsed = Number(section.collapsed) || 0;
      const list = rows.length
        ? "<ul class=\"official-section-list\">" + rows.slice(0, 100).map((row) => "<li>" + escapeHtml(row) + "</li>").join("") + "</ul>"
        : '<div class="official-empty">Nenhum item nesta seção.</div>';
      const note = collapsed ? " · +" + collapsed + " recolhidos" : "";
      return '<section class="official-section"><h4><span>' + escapeHtml(title) + '</span><small>' +
        total + note + "</small></h4>" + list + "</section>";
    }).join("");
    byId("officialSnapshotContent").innerHTML = metricHtml + sectionHtml;
  }

  function renderFeaturedQuests(profile) {
    const featured = CATALOG.filter((quest) => quest.priority === 1).slice(0, 6);
    byId("featuredQuestGrid").innerHTML = featured.map((quest) => {
      const flag = questFlag(profile, quest.id);
      const status = STATUS_LABELS[flag.status];
      return '<article class="featured-quest-card"><div class="featured-card-top"><h3>' +
        escapeHtml(quest.name) + '</h3><span class="tag ' + (quest.year === "2026" ? "new" : "") + '">' +
        (quest.year === "2026" ? "NOVO" : escapeHtml(status.toUpperCase())) +
        '</span></div><p>' + escapeHtml(quest.summary) + '</p><div class="featured-unlock">' +
        escapeHtml(quest.unlocks) + '</div><div class="featured-bottom"><span class="quest-level">Level ' +
        escapeHtml(quest.level) + '</span><button class="text-button quest-open" data-open-quests data-find-quest="' +
        escapeHtml(quest.id) + '">Ver acesso ↗</button></div></article>';
    }).join("");
  }

  function officialAsset(value) {
    try {
      const url = new URL(value || "");
      return url.protocol === "https:" && (url.hostname === "static.tibia.com" || url.hostname === "www.tibia.com" || url.hostname === "tibia.com" ||
        (url.hostname === 'assets.service-exevopan.com' && url.pathname.startsWith('/public/sprites/')))
        ? url.href : "";
    } catch (error) { return ""; }
  }

  function spriteImage(url, alt='', kind='character', lazy=false) {
    return '<span class="sprite-stage" data-sprite-kind="' + kind + '"><img data-sprite-image' +
      (lazy ? ' loading="lazy"' : '') + ' src="' + escapeHtml(url) + '" alt="' + escapeHtml(alt) + '"></span>';
  }

  function auctionDeadline(value) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return Date.parse(text);
    const match = text.match(/^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{4}),\s+(\d{1,2}:\d{2})\s+(CEST|CET)$/);
    if (!match) return NaN;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Date.parse(match[3] + '-' + String(months.indexOf(match[1]) + 1).padStart(2,'0') + '-' + match[2].padStart(2,'0') + 'T' + match[4].padStart(5,'0') + ':00' + (match[5] === 'CEST' ? '+02:00' : '+01:00'));
  }

  function historicalAuctionEndMarkup(value) {
    const deadline = auctionDeadline(value);
    if (!Number.isFinite(deadline)) return escapeHtml(value || '—');
    const date = new Date(deadline);
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Berlin',day:'numeric',month:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
    const part = type => parts.find(value => value.type === type).value;
    const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(part('month'))-1];
    const label = Number(part('day')) + ' ' + month + ' ' + part('year') + ', ' + Number(part('hour')) + ':' + part('minute');
    return '<span class="auction-history-end">' + escapeHtml(label) + '</span>';
  }

  function auctionEndMarkup(value, historical = false) {
    if (historical) return historicalAuctionEndMarkup(value);
    const deadline = auctionDeadline(value);
    if (!Number.isFinite(deadline)) return escapeHtml(value || '—');
    const date = new Date(deadline), seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const clock = date.toLocaleTimeString('en-GB', {hour:'numeric', minute:'2-digit'});
    if (deadline <= Date.now()) return '<span class="auction-ended">Auction Ended!</span>';
    if (deadline - Date.now() <= 86400000) {
      const hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds / 60) % 60;
      const countdown = hours ? hours + 'h ' + minutes + 'm' : minutes + 'm ' + seconds % 60 + 's';
      return '<span class="auction-ending-soon">' + countdown + '</span>, ' + clock;
    }
    return date.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()] + ', ' + clock;
  }

  function updateAuctionClocks() {
    document.querySelectorAll('[data-auction-end]').forEach(element => {
      const markup = auctionEndMarkup(element.dataset.auctionEnd, element.dataset.auctionHistory === 'true');
      if (element.innerHTML !== markup) element.innerHTML = markup;
    });
  }

  function accessRowSummary(profile) {
    const rows = ['utility', 'access', 'boss'].flatMap(displayQuests);
    return { total: rows.length, complete: rows.filter(quest => displayQuestStatus(profile, quest) === 'complete').length };
  }

  function cardIcon(name) {
    const original = window.BAZAAR_ICONS?.[name];
    if (original) return '<svg class="card-icon" viewBox="' + original[0] + '" fill="currentColor" aria-hidden="true"><path d="' + original[1] + '"/></svg>';
    const paths = { masteries:'M12 3v18M3 12h18M5 5l14 14M5 19L19 5', charms:'M8 4c-5 0-5 7-1 8l4 1v4c0 5 8 4 8 0 0-3-3-4-5-3V9c0-4-3-6-6-5Z', imbuements:'m4 20 12-12 3 3L7 23ZM4 3v5M1 5h6M19 1v5M16 3h6', boss:'M3 10c3-8 15-8 18 0v7c-5 5-13 5-18 0ZM7 10v5m10-5v5M10 18h4', bounty:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z', quests:'M2 4h7l3 2 3-2h7v16h-7l-3 2-3-2H2Zm10 2v16M5 8h4M5 12h4m6-4h4m-4 4h4', gems:'m3 4-2 6 11 12 11-12-2-6ZM1 10h22M7 4l5 18 5-18', external:'M14 3h7v7M21 3 10 14M10 4H3v17h17v-7', transfer:'M4 5a9 9 0 1 1-1 12M4 5v6h6M20 19v-6h-6' };
    return '<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (paths[name] || paths.bounty) + '"/></svg>';
  }

  function formatAuctionNumber(value) {
    if (value === null || value === undefined || value === '') return '—';
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : (value || "—");
  }

  function profileForAuction(card, snapshot) {
    let saved = state.profiles.find((profile) =>
      (card && card.id && profile.auctionId === String(card.id)) ||
      (card && profile.name.toLowerCase() === String(card.name || "").toLowerCase())
    ) || null;
    // Historical unlocks belong to this auction, not to a later saved character.
    const historical = isHistoricalAuction(card, snapshot);
    const profile = saved && !historical ? normalizeProfile(saved) : blankProfile(card && card.name);
    if (snapshot) applyOfficialAuction(profile, snapshot);
    profile._historicalPresentation = historical;
    return { profile: profile, saved: saved };
  }

  function isHistoricalAuction(card, snapshot) {
    return snapshot?.auction?.type === 'past' || card?.type === 'past' || card?.market === 'past' || listingType === 'past';
  }

  function displayAuctionMetrics(card, snapshot) {
    const source = snapshot?.metrics || {};
    if (!isHistoricalAuction(card, snapshot)) return source;
    // Presentation defaults only. Raw unknown values remain unknown in storage
    // and never become evidence of an official unlock or sale.
    const metrics = {...source};
    ['animusMasteries','totalCharmPoints','imbuementsUnlocked','bossPoints','bountyPoints',
      'achievementPoints','hirelings','hirelingJobs','hirelingOutfits','tcInvested','preySlots'].forEach(key => {
      if (metrics[key] === null || metrics[key] === undefined || metrics[key] === '') metrics[key] = 0;
    });
    metrics.gemsByGrade = Object.fromEntries(['lesser','regular','greater'].map(key => [key, source.gemsByGrade?.[key] ?? 0]));
    return metrics;
  }

  function historicalListingSnapshot(card) {
    return {
      character: {name:card.name, level:card.level, vocation:card.vocation, world:card.world, ...(card.character || {})},
      auction: {id:String(card.id), type:'past', end:card.end, url:card.url},
      displayCard: {...card}, metrics:card.metrics || {}, skills:card.skills || {},
      sections:card.sections || {}, cosmetics:card.cosmetics || {},
      featureEntries:card.featureEntries || [], completedQuestLines:card.completedQuestLines || [],
      source:card.source, sourceDetails:card.sourceDetails || [], _historyDisplayOnly:true
    };
  }

  function listCardSkill(snapshot, key) {
    const skill = snapshot && snapshot.skills && snapshot.skills[key];
    if (!skill) return { value: "—", progress: 0 };
    const progress = Number(String(skill.progress || "0").replace(",", "."));
    return { value: skill.level || "—", progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0 };
  }

  function questPopover(profile) {
    const groups = [
      ["Utilitary", displayQuests("utility")],
      ["Access", displayQuests("access")],
      ["Bosses", displayQuests("boss")]
    ];
    return '<div class="quest-map-popover" role="tooltip" aria-label="Quests list"><div class="quest-access-list">' + groups.map(([label, quests]) => '<section><strong>' + label + '</strong>' + quests.map((quest) => {
        const status = displayQuestStatus(profile, quest);
        return '<span class="quest-map-entry ' + (status === "complete" ? "is-complete" : status === "partial" ? "is-partial" : "") + '" title="' +
          escapeHtml(STATUS_LABELS[status] + " · " + questOrderDescription(quest)) + '">· ' + escapeHtml(quest.name.replace(/ Quest$/, "")) + '</span>';
      }).join("") + '</section>').join("") + '</div></div>';
  }

  function displayQuests(group) {
    // Preserve the curated reference order. Minimum-level sorting interleaves
    // unrelated lines and cannot represent endgame difficulty.
    return (window.QUEST_DISPLAY_GROUPS?.[group] || []).map(id => CATALOG.find(q => q.id === id)).filter(Boolean).flatMap(quest => {
      const stages = window.QUEST_DISPLAY_STAGES?.[quest.id];
      return stages ? stages.map(stage => ({ ...quest, name: stage.name, displayStage: stage })) : [quest];
    });
  }

  function displayQuestStatus(profile, quest) {
    if (!quest.displayStage) {
      const status = questFlag(profile, quest.id).status;
      return status === 'unknown' && profile?._historicalPresentation ? 'incomplete' : status;
    }
    const snapshot = profile?.auctionSnapshot;
    if (!snapshot) return profile?._historicalPresentation ? 'incomplete' : 'unknown';
    return matchedEvidence(snapshot, "achievement", quest.displayStage.achievements, "complete").length ? "complete" : profile?._historicalPresentation ? 'incomplete' : 'unknown';
  }

  function questOrderDescription(quest) {
    const levels = window.QUEST_ORDER_LEVELS?.[quest.id];
    const lineup = (window.QUEST_LINEUPS || []).find(line => line.quests.includes(quest.id));
    return quest.name + (lineup ? ' · ' + lineup.name : '') +
      (levels ? ' · ' + (levels[0] ? 'Level mínimo ' + levels[0] : 'Sem mínimo geral informado') + ' · Recomendado ' + levels[1] + '+' : '');
  }

  function questDisplayGroup(quest) {
    return Object.keys(window.QUEST_DISPLAY_GROUPS || {}).find(group => window.QUEST_DISPLAY_GROUPS[group].includes(quest.id));
  }

  function imbuementPopover(snapshot) {
    const entries = snapshot?.sections?.Imbuements?.entries || [];
    const names = [["Critical Hit","Strike"],["Life Leech","Vampirism"],["Mana Leech","Void"],["Club Skill","Bash"],["Shield Skill","Blockade"],["Axe Skill","Chop"],["Magic Level","Epiphany"],["Distance Skill","Precision"],["Sword Skill","Slash"],["Capacity","Featherweight"],["Speed","Swiftness"],["Paralize Removal","Vibrancy"],["Energy Damage","Electrify"],["Ice Damage","Frost"],["Death Damage","Reap"],["Fire Damage","Scorch"],["Earth Damage","Venom"],["Energy Protection","Cloud Fabric"],["Holy Protection","Demon Presence"],["Fire Protection","Dragon Hide"],["Death Protection","Lich Shroud"],["Ice Protection","Quara Scale"],["Earth Protection","Snake Skin"]];
    return '<div class="bazaar-hover-panel imbuement-hover-panel" role="tooltip" aria-label="Imbuements list">' + names.map(([label, name]) => '<span class="' + (entries.some(e => String(e).toLowerCase().includes(name.toLowerCase())) ? 'unlocked' : '') + '">· ' + label + '</span>').join('') + '</div>';
  }

  function questAccessPanel(profile) {
    const summary = latestStatus(profile);
    return '<div class="detail-quest-summary"><strong>' + summary.complete + ' com acesso</strong><span>' + summary.partial + ' parciais · ' + CATALOG.length + ' quests importantes rastreáveis</span></div>' +
      '<div class="detail-quest-groups">' + [["utility", "Utilitary"], ["access", "Access"], ["boss", "Bosses"]].map(([group, label]) => '<section><h3>' + label + '</h3><div class="detail-quest-list">' + displayQuests(group).map((quest) => {
        const status = displayQuestStatus(profile, quest);
        const label = status === "complete" ? "Acesso" : status === "partial" ? "Parcial" : status === "incomplete" ? "Não feito" : "—";
        return '<div class="detail-quest-row ' + (status === "complete" ? "is-complete" : status === "partial" ? "is-partial" : "") + '" title="' +
          escapeHtml(STATUS_LABELS[status] + " · " + questOrderDescription(quest)) + '"><span>' + escapeHtml(quest.name.replace(/ Quest$/, "")) + '</span><b>' + label + '</b></div>';
      }).join("") + '</div></section>').join("") + '</div>';
  }

  function listingSnapshot(card) {
    const snapshot = card && (card.snapshot || (state.profiles.find((profile) => profile.auctionId === String(card.id)) || {}).auctionSnapshot);
    return snapshot || (card && isHistoricalAuction(card, null) ? historicalListingSnapshot(card) : null);
  }

  let snapshotFiltersActive=true;
  function skillRangeMatches(snapshot, keys, min, max) {
    if (!keys.length || (min === 10 && max === 150)) return true;
    return keys.some(key=>{
      const skill=snapshot?.skills?.[key];
      if (!skill || skill.level === '' || skill.level == null) return false;
      const value=Number(skill.level)+Number(String(skill.progress || 0).replace(',','.'))/100;
      return value>=min && value<=max;
    });
  }
  function cosmeticSelectionMatches(snapshot, section, names, addons=[], female=null) {
    if (!names.length) return true;
    if (female !== null && String(snapshot?.character?.gender || '').toLowerCase() !== (female ? 'female' : 'male')) return false;
    const owned=snapshot?.cosmetics?.[section] || [];
    return names.every(name=>owned.some(item=>cosmeticIdentity(item).name.toLowerCase()===name.toLowerCase() &&
      addons.every(addon=>(cosmeticIdentity(item).type & Number(addon)) === Number(addon))));
  }
  function transferIsAvailable(snapshot, card={}) {
    const text=String(snapshot?.transfer || (typeof card.transfer==='string' ? card.transfer : '')).replace(/\s+/g,' ');
    const after=text.match(/after\s+([A-Z][a-z]{2}\s+\d{1,2}\s+\d{4},\s*\d{1,2}:\d{2})(?::\d{2})?\s+(CEST|CET)/);
    if(after) return auctionDeadline(after[1]+' '+after[2])<=Date.now();
    if(typeof snapshot?.transferAvailable==='boolean')return snapshot.transferAvailable;
    if(typeof card.transfer==='boolean')return card.transfer;
    if(/immediately/i.test(text))return true;
    if(/not available|cannot|not possible/i.test(text))return false;
    return null;
  }
  function cardMatchesClientFilters(card, snapshot) {
    if(!snapshotFiltersActive)return true;
    let profileData;
    const getProfile=()=>profileData || (profileData=profileForAuction(card,snapshot).profile);
    const metrics = snapshot && snapshot.metrics || {};
    const sections = snapshot && snapshot.sections || {};
    const cosmetics = snapshot && snapshot.cosmetics || {};
    const allText = [
      ...(snapshot && snapshot.featureEntries || []),
      ...Object.values(sections).flatMap((section) => section && section.entries || []),
      ...Object.values(cosmetics).flatMap((items) => (items || []).map((item) => item.name))
    ].join(" ").toLowerCase();
    const locations = filterGroupValues("filterLocation");
    if (locations.length && !locations.includes(card.region)) return false;
    if (byId("filterBidded").checked && !card.currentBid) return false;
    const minBoss = Number(byId("filterBossPoints").value || 0);
    if (Number(metrics.bountyPoints || 0) < Number(byId("filterBountyPoints").value || 0)) return false;
    if (minBoss && Number(metrics.bossPoints || 0) < minBoss) return false;
    const minTc = Number(byId("filterTcInvested").value || 0);
    if (minTc && Number(metrics.tcInvested || 0) < minTc) return false;
    const charmsMin = Number(byId("filterCharmMin").value || 0);
    const charmsMax = Number(byId("filterCharmMax").value || 50000);
    if ((charmsMin!==0 || charmsMax!==50000) && (Number(metrics.totalCharmPoints || 0) < charmsMin || Number(metrics.totalCharmPoints || 0) > charmsMax)) return false;
    const achievementMin = Number(byId("filterAchievements").value || 0);
    if (achievementMin && Number(metrics.achievementPoints || 0) < achievementMin) return false;
    if (byId("filterImbuements").value === "all" && Number(metrics.imbuementsUnlocked || 0) < 23) return false;
    if (byId("filterImbuements").value && byId("filterImbuements").value !== "all" && Number(metrics.imbuementsUnlocked || 0) < Number(byId("filterImbuements").value)) return false;
    if (byId("filterAllImbuements").checked && Number(metrics.imbuementsUnlocked || 0) < 23) return false;
    const selectedQuest = byId("filterQuest").value;
    if (selectedQuest) {
      const trackedQuest=CATALOG.find(quest=>quest.name===selectedQuest);
      if (trackedQuest ? questFlag(getProfile(),trackedQuest.id).status !== 'complete' : !String(snapshot?.completedQuestLines || []).toLowerCase().includes(selectedQuest.toLowerCase())) return false;
    }
    const achievementQuery = byId("filterRareAchievements").value.trim().toLowerCase();
    if (achievementQuery && !String(sections.Achievements && sections.Achievements.entries || []).toLowerCase().includes(achievementQuery)) return false;
    const rareItemQuery = byId("filterRareItems").value.trim().toLowerCase();
    if (rareItemQuery && !String(sections.ItemSummary && sections.ItemSummary.entries || []).toLowerCase().includes(rareItemQuery)) return false;
    const greaterGems = Number(byId("filterGreaterGems").value || 0);
    if (greaterGems && Number(metrics.gemsByGrade?.greater || 0) < greaterGems) return false;
    const gemsQuery = byId("filterGems").value.trim().toLowerCase();
    if (gemsQuery && !String(sections.RevealedGems && sections.RevealedGems.entries || []).toLowerCase().includes(gemsQuery)) return false;
    for(const section of ['Outfits','StoreOutfits','Mounts','StoreMounts']){
      const choices=$$('[data-cosmetic-choice="'+section+'"]:checked').map(input=>input.value);
      const required=section==='Outfits'?$$('[data-required-addon]:checked').map(input=>input.dataset.requiredAddon):[];
      const gender=document.querySelector('[data-cosmetic-gender="'+section+'"]');
      if(!cosmeticSelectionMatches(snapshot,section,choices,required,gender ? gender.checked : null))return false;
    }
    for (const input of $$('[data-cosmetic-filter]')) {
      const value = input.value.trim().toLowerCase();
      if (value && !(cosmetics[input.dataset.cosmeticFilter] || []).some((item) => item.name.toLowerCase().includes(value))) return false;
    }
    for (const input of $$('[data-store-filter]:checked')) {
      const name=input.dataset.storeFilter;
      const flags={ 'Training Dummy': /training dummy|exercise dummy/.test(allText), 'Charm Expansion': metrics.charmExpansion==='yes', 'Gold Pouch': /gold pouch/.test(allText), 'Prey Slot':Number(metrics.preySlots||0)>0,'Reward Shrine': /reward shrine/.test(allText),'Imbuement Shrine': /imbu(?:ement|ing) shrine/.test(allText),'Hirelings':Number(metrics.hirelings||0)>0,'Weekly Task Expansion':metrics.weeklyTaskExpansion==='yes','Mailbox':/mailbox/.test(allText),'Regular World Transfer':transferIsAvailable(snapshot,card)===true};
      if (!flags[name]) return false;
    }
    const miscFilters=$$('[data-misc-filter]:checked');
    const matchingTags = miscFilters.length?new Set(auctionTags(card, snapshot).map(tag => tag.id.toLowerCase())):new Set();
    for (const input of miscFilters) {
      const expected = input.dataset.miscFilter.toLowerCase();
      if (!matchingTags.has(expected)) return false;
    }

    const minSkill = Number(byId("filterSkillMin").value || 0);
    const maxSkill = Number(byId("filterSkillMax").value || 999);
    const skillKeyById = { "1": "magic", "6": "shielding", "7": "distance", "8": "sword", "9": "club", "10": "axe", "11": "fist", "13": "fishing" };
    const selectedSkills = $$('[data-skill-choice]:checked').map((input) => skillKeyById[input.dataset.skillChoice]).filter(Boolean);
    const skillKey = skillKeyById[byId("filterSkill").value];
    if (!skillRangeMatches(snapshot,selectedSkills.length ? selectedSkills : skillKey ? [skillKey] : [],minSkill,maxSkill)) return false;
    return true;
  }

  function activeListingFilterCount() {
    const values = [
      byId("filterNickname").value, filterGroupValues("filterVocation").join(","), filterGroupValues("filterPvp").join(","),
      filterGroupValues("filterBattlEye").join(","), byId("filterWorld").value, byId("filterLocation").value,
      byId("filterBossPoints").value, byId("filterTcInvested").value, byId("filterImbuements").value,
      byId("filterQuest").value, byId("filterAchievements").value, byId("filterRareAchievements").value,
      byId("filterRareItems").value, byId("filterGems").value, byId("filterGreaterGems").value
    ].filter(Boolean).length;
    const ranges = (Number(byId("filterLevelMin").value || 0) > 0 ? 1 : 0) +
      (Number(byId("filterLevelMax").value || 3000) < 3000 ? 1 : 0) +
      (Number(byId("filterSkillMin").value || 10) > 10 ? 1 : 0) +
      (Number(byId("filterSkillMax").value || 150) < 150 ? 1 : 0) +
      (Number(byId("filterCharmMin").value || 0) > 0 ? 1 : 0) +
      (Number(byId("filterCharmMax").value || 50000) < 50000 ? 1 : 0);
    return values + ranges + $$('[data-store-filter]:checked, [data-misc-filter]:checked, [data-skill-choice]:checked, [data-cosmetic-filter]').filter((element) => element.checked || element.value.trim()).length +
      (byId("filterBidded").checked ? 1 : 0) + (byId("filterAllImbuements").checked ? 1 : 0);
  }

  // Exevo Pan's public character classification (chunk 3700, 2026-10-21).
  const RARE_MOUNTS = new Set(['Rift Runner', 'Phantasmal Jade', 'Singeing Steed', 'Neon Sparkid', 'Vortexion', 'Phant', 'Antelope', 'Fleeting Knowledge', 'Mystic Jaguar']);
  function cosmeticIdentity(item) {
    const label = typeof item === 'string' ? item : item.name || '';
    return {name: label.split('\n')[0].replace(/\s*\(.*$/, '').trim(), type: (/addon 1/i.test(label) ? 1 : 0) + (/addon 2/i.test(label) ? 2 : 0)};
  }
  function isRareOutfit(item, snapshot) {
    const {name, type} = cosmeticIdentity(item);
    const female = String(snapshot.character?.gender || '').toLowerCase() === 'female';
    if ((name === 'Mage' && !female) || (name === 'Summoner' && female)) return type >= 2;
    if (['Elementalist', 'Revenant', 'Battle Mage'].includes(name)) return type > 0;
    if (name === 'Demon Outfit') return type >= 2;
    if (name === 'Fire-Fighter') return type === 1 || type === 3;
    return ['Golden Outfit', 'Makeshift Warrior', 'Royal Costume', 'Falconer', 'Lion of War'].includes(name);
  }

  // Public Exevo Pan quest markers: separate from our expanded access tracker.
  const REFERENCE_QUEST_MARKERS = [
    ['The Postman Missions'], ['The Djinn War - Marid Faction'], ['The Djinn War - Efreet Faction'],
    ['Recognised Trader'], ['The Thieves Guild'], ['The Explorer Society'], ['Shadows of Yalahar'],
    ['Honorary Barbarian'], ["Lion's Den Explorer"], ['The Shattered Isles'], ['Twenty Miles Beneath The Sea'],
    ['Blood Brothers'], ['The Ice Islands'], ['The New Frontier'], ['Wrath of the Emperor'], ['The Ape City'],
    ['The Pits of Inferno'], ['The Inquisition'], ['Rathleton Citizen'], ['Hero of Rathleton'],
    ['Lost Palace Raider'], ['Corruption Contained'], ['Dark Trails'], ['Drama in Darama'], ['Dream Catcher'],
    ['Heart of Destruction'], ['Over the Moon'], ['Sun and Sea'], ['Beyonder'], ['Library Liberator'],
    ["Ferumbras' Ascendant"], ['A Study in Scarlett'], ['Millennial Falcon'], ['Lionheart'], ['Honorary Gnome'],
    ['Gnomish Art of War'], ['Buried the Baron'], ['His Days are Counted'], ['Duked it Out'],
    ['Soul War'], ['Primal Ordeal'], ['Rotten Blood']
  ];
  function referenceQuestSummary(snapshot) {
    const known = new Set([...(snapshot?.completedQuestLines || []),
      ...(snapshot?.sections?.Achievements?.entries || []),
      ...(snapshot?.classificationEvidence?.referenceRelevantAchievements || [])].map(name=>String(name).toLowerCase()));
    // API archive names are already translated marker labels.
    const aliases = {'Recognised Trader':'The Travelling Trader (Rashid)','Honorary Barbarian':'Barbarian Test',
      "Lion's Den Explorer":"Lion's Rock",'Rathleton Citizen':'Rathleton (Citzen)',
      'Lost Palace Raider':'Asura Palace','Corruption Contained':'Cults of Tibia','Drama in Darama':'Grimvale',
      'Dream Catcher':'The Dream Courts','Over the Moon':'The Curse Spreads','Sun and Sea':'Kilmaresh',
      'Beyonder':'Feaster of Souls','Library Liberator':'The Secret Library','A Study in Scarlett':'The Order of the Cobra',
      'Millennial Falcon':'The Order of the Falcon','Lionheart':'The Order of the Lion',
      'Honorary Gnome':"Bigfoot's Burden (Rank IV)",'Gnomish Art of War':"Bigfoot's Burden (Free boss access)",
      'Buried the Baron':'Dangerous Depths (Warzone 4)','His Days are Counted':'Dangerous Depths (Warzone 5)',
      'Duked it Out':'Dangerous Depths (Warzone 6)','The Djinn War - Marid Faction':'The Djinn War (blue)',
      'The Djinn War - Efreet Faction':'The Djinn War (green)'};
    const entries = REFERENCE_QUEST_MARKERS.map(([token])=>({name:aliases[token] || token,
      complete:known.has(token.toLowerCase()) || known.has(String(aliases[token] || token).toLowerCase())}));
    return {total:entries.length,complete:entries.filter(entry=>entry.complete).length,entries};
  }

  function rewardTagAvailability(card, snapshot) {
    const level = Number(snapshot.character?.level || card.level || 0);
    const end = auctionDeadline(snapshot.auction?.end || card.end);
    const outfits = snapshot.cosmetics?.Outfits;
    const fullOutfits = Array.isArray(outfits) && (snapshot.sections?.Outfits?.complete === true ||
      Number(snapshot.metrics?.outfits) === outfits.length ||
      Number(snapshot.metrics?.outfits) === outfits.length + (snapshot.cosmetics?.StoreOutfits || []).length);
    const achievementSection = snapshot.sections?.Achievements;
    const achievementKnown = achievementSection?.complete === true;
    const hasRoyalty = (achievementSection?.entries || []).some(name=>String(name).trim().toLowerCase()==='royalty of hazard');
    return {
      soulWar: snapshot.rewardAvailability?.soulWar ?? (level >= 400 && end > Date.UTC(2020,6,13) && fullOutfits && !outfits.some(item=>cosmeticIdentity(item).name==='Revenant')),
      primalOrdeal: snapshot.rewardAvailability?.primalOrdeal ?? (level >= 400 && end > Date.UTC(2022,6,18) &&
        ((achievementKnown && !hasRoyalty) || snapshot.classificationEvidence?.royaltyOfHazard === false))
    };
  }
  function auctionTags(card, snapshot) {
    if (!snapshot) return [];
    const metrics = snapshot.metrics || {}, cosmetics = snapshot.cosmetics || {};
    const tags = [];
    const add = (id, condition, suffix, reason, gold=false) => { if (condition) tags.push({id, label:id + (suffix || ''), reason, gold}); };
    const names = key => (cosmetics[key] || []).map(item => typeof item === 'string' ? item : item.name).join('|');
    add('Rare nicknames', /^[A-Za-z]{2,3}$/.test(card.name || ''), '', 'Local criterion: nickname with two or three letters');
    add('Many charms', Number(metrics.totalCharmPoints || 0) >= 4800, '', 'At least 4,800 charm points, following Exevo Pan');
    const quests = referenceQuestSummary(snapshot);
    add('Many quests', quests.complete >= 26, '', 'At least 26 reference quest markers, following Exevo Pan');
    add('Many mounts', (cosmetics.Mounts || []).length >= 35, '', 'At least 35 mounts, following Exevo Pan');
    add('Many store cosmetics', (cosmetics.StoreMounts || []).length + (cosmetics.StoreOutfits || []).length >= 4, ' 🛍️', 'At least 4 Store outfits and mounts, following Exevo Pan');
    add('Rare mounts', (cosmetics.Mounts || []).some(item => RARE_MOUNTS.has(cosmeticIdentity(item).name)), ' ✨', 'Rare mount according to the Exevo Pan classification');
    add('Rare outfits', (cosmetics.Outfits || []).some(item => isRareOutfit(item, snapshot)), ' 💎', 'Rare outfit or addon according to the Exevo Pan classification');
    add('Secondary skill', /knight/i.test(card.vocation || snapshot.character?.vocation || '') &&
      ['club','sword','axe'].filter(key => Number(listCardSkill(snapshot, key).value) >= 100).length >= 2,
      ' ⚔️', 'Knight with at least two melee skills at 100, following Exevo Pan');
    const rewards = rewardTagAvailability(card, snapshot);
    add('Soul War available', rewards.soulWar === true, ' 💀', 'Exevo Pan criterion: level 400+ without Revenant outfit. Availability indicator; not a quest completion flag.', true);
    add('Primal Ordeal available', rewards.primalOrdeal === true, ' 🦖', 'Exevo Pan criterion: level 400+ without Royalty of Hazard. Availability indicator; not a quest completion flag.', true);
    return tags;
  }

  function primarySkill(card, snapshot) {
    const vocation = String(card.vocation || '').toLowerCase();
    if (/paladin/.test(vocation)) return 'distance';
    if (/sorcerer|druid/.test(vocation)) return 'magic';
    if (/monk/.test(vocation)) return 'fist';
    return ['club','sword','axe'].sort((a,b) => Number(listCardSkill(snapshot,b).value) - Number(listCardSkill(snapshot,a).value))[0];
  }

  function bountyPopover(snapshot) {
    const labels = [
      [/^Bonus Damage/i, 'Bonus Damage'],
      [/^Life Leech/i, 'Life Leech'],
      [/^Bonus Loot/i, 'Bonus Loot'],
      [/^Chance For Extra Bestiary/i, 'Bonus Bestiary']
    ];
    const rows = (snapshot?.sections?.BountyTalisman?.entries || []).flatMap(entry => {
      const match = String(entry).match(/^(.*?)\s+(\d+)\s+(\d+(?:[.,]\d+)?)%$/);
      if (!match) return [];
      const label = labels.find(([pattern]) => pattern.test(match[1]));
      return ['<tr><td>' + escapeHtml(label ? label[1] : match[1]) + '</td><td>' + escapeHtml(match[2]) + '</td><td>' + escapeHtml(String(Number(match[3].replace(',', '.')))) + '%</td></tr>'];
    });
    return rows.length ? '<div class="bazaar-hover-panel bounty-hover-panel" role="tooltip"><table><thead><tr><th>Effect</th><th>Level</th><th>Value</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>' : '';
  }

  function greaterGemPopover(snapshot) {
    const effects = new Set();
    for (const gem of snapshot?.gems || []) {
      if (gem.grade !== 'greater') continue;
      for (const raw of gem.supremeMods || []) {
        const text = String(raw).replace(/<[^>]*>/g, '').trim();
        if (!text) continue;
        effects.add(text);
      }
    }
    return effects.size ? '<div class="bazaar-hover-panel gem-hover-panel" role="tooltip" aria-label="Available supreme gem modifiers">' + [...effects].sort().map(effect => '<span>· ' + escapeHtml(effect) + '</span>').join('') + '</div>' : '';
  }

  function auctionBidDisplay(card, snapshot, historical) {
    const firstValue = values => values.find(value => value !== null && value !== undefined && value !== '');
    const minimum = firstValue([card.minimumBid, snapshot?.displayCard?.minimumBid, snapshot?.auction?.minimumBid]);
    const winning = firstValue([card.currentBid, card.winningBid, snapshot?.auction?.winningBid, snapshot?.auction?.currentBid]);
    const status = card.resultStatus || snapshot?.auction?.resultStatus;
    const hasBid = Number(String(winning ?? '').replace(/,/g,'')) > 0;
    if (historical) return status === 'no_bid' || !hasBid
      ? {label:'MINIMUM BID',value:minimum ?? '—'}
      : {label:'WINNING BID',value:winning};
    return {label:hasBid ? 'CURRENT BID' : 'MINIMUM BID',value:hasBid ? winning : minimum ?? '—'};
  }

  function renderAuctionCard(card) {
    const snapshot = listingSnapshot(card);
    const historical = listingType === 'past';
    const pair = profileForAuction(card, snapshot);
    const profile = pair.profile;
    const metrics = displayAuctionMetrics(card, snapshot);
    const accessRows = accessRowSummary(profile);
    const completedCount = accessRows.complete;
    const tracked = latestStatus(profile);
    const url = "https://www.tibia.com/charactertrade/?" + new URLSearchParams({
      subtopic: listingType === "past" ? "pastcharactertrades" : "currentcharactertrades",
      page: "details", auctionid: String(card.id)
    }).toString();
    const outfit = officialAsset(card.outfitImage);
    const favorite = favoriteAuctionIds.includes(String(card.id));
    const {label:bid, value:bidValue} = auctionBidDisplay(card, snapshot, historical);
    const skillRows = [
      ["magic", "Magic"], ["club", "Club"], ["fist", "Fist"], ["sword", "Sword"],
      ["fishing", "Fishing"], ["axe", "Axe"], ["distance", "Distance"], ["shielding", "Shielding"]
    ].map(([key, label]) => {
      const skill = listCardSkill(snapshot, key);
      return '<div class="auction-skill ' + (key === primarySkill(card, snapshot) && Number(skill.value) >= 100 ? 'primary-skill' : '') + '" title="' + escapeHtml(label + " progress: " + skill.progress.toFixed(0) + "%") + '"><span class="skill-number ' + (key === primarySkill(card, snapshot) && Number(skill.value) >= 100 ? 'skill-high' : '') + '">' +
      escapeHtml(skill.value) + '</span><span class="skill-track-wrap"><span class="skill-name">' + label + '</span><span class="skill-track"><i style="width:' +
        skill.progress.toFixed(1) + '%"></i></span></span></div>';
    }).join("");
    const itemSquares = (card.items || []).slice(0, 4).map((item) => {
      const itemImage = officialAsset(item.image);
      return '<div class="auction-item-square" title="' + escapeHtml(item.name || "Featured item") + '">' +
        (itemImage ? spriteImage(itemImage, '', 'item') : "") + (Number(item.tier || (item.name || '').match(/tier\s*:?\s*(\d+)/i)?.[1] || 0) > 0 ? '<span class="item-tier">' + Number(item.tier || item.name.match(/tier\s*:?\s*(\d+)/i)[1]) + '</span>' : '') + '</div>';
    });
    while (itemSquares.length < 4) itemSquares.push('<div class="auction-item-square" title="Nenhum item em destaque"></div>');
    const questStatus = tracked.complete + "/" + CATALOG.length + " acessos" + (tracked.partial ? " · " + tracked.partial + " parciais" : "");
    const invest = metrics.tcInvested ? formatAuctionNumber(metrics.tcInvested) + " invested" : "— invested";
    const gems = metrics.gemsByGrade;
    const gemsText = gems ? [gems.lesser, gems.regular, gems.greater].join('-') : '—';
    const gemPanel = greaterGemPopover(snapshot);
    const bountyPanel = bountyPopover(snapshot);
    const tags = auctionTags(card, snapshot);
    const cosmeticsCount = Number(metrics.mounts || (snapshot && snapshot.cosmetics && snapshot.cosmetics.Mounts || []).length || 0);
    const badges = [card.isNew ? '<span class="auction-badge new">NEW</span>' : "",
      tracked.complete ? '<span class="auction-badge access">' + tracked.complete + ' quests</span>' : "",
      cosmeticsCount ? '<span class="auction-badge cosmetic">' + cosmeticsCount + ' mounts</span>' : ""].filter(Boolean).join("");
    return '<article class="auction-card" data-auction-card="' + escapeHtml(card.id) + '" data-load-detail="' + (snapshot ? "0" : "1") + '">' +
      '<div class="auction-card-heading"><div class="auction-character-link">' +
      '<span class="auction-avatar">' + (outfit ? spriteImage(outfit) : '<span>' + escapeHtml(initials(card.name)) + '</span>') + '</span>' +
      '<span class="auction-character-text"><span class="auction-name-line"><strong>' + escapeHtml(card.name) + '</strong><a class="auction-external" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer" aria-label="Official auction">' + cardIcon('external') + '</a></span><small>Level ' + escapeHtml(numberText(card.level)) + ' - ' + escapeHtml(card.vocation || "Unknown vocation") + '</small></span>' +
      '</div><span class="auction-badges">' + badges + '</span>' +
      '<div class="auction-menu-wrap"><button class="auction-more" aria-label="Auction options" aria-expanded="false" data-menu-toggle="' + escapeHtml(card.id) + '">' + cardIcon('more') + '</button>' +
      '<div class="auction-context-menu" data-auction-menu="' + escapeHtml(card.id) + '" hidden>' +
      '<button data-auction-action="details" data-id="' + escapeHtml(card.id) + '">' + cardIcon('details') + '<span>Details</span></button>' +
      '<button data-auction-action="copy" data-id="' + escapeHtml(card.id) + '">' + cardIcon('copy') + '<span>Copy link</span></button>' +
      '<button data-auction-action="favorite" data-id="' + escapeHtml(card.id) + '">' + cardIcon('favorite') + ' <span>' + (favorite ? "Unfavorite" : "Favorite") + '</span></button>' +
      '<button data-auction-action="notify" data-id="' + escapeHtml(card.id) + '">' + cardIcon('notify') + '<span>' + "Notify" + '</span></button>' +
      '<button data-auction-action="similar" data-id="' + escapeHtml(card.id) + '">' + cardIcon('similar') + '<span>Find similar</span></button>' +
      '<button data-auction-action="skills" data-id="' + escapeHtml(card.id) + '">' + cardIcon('skills') + '<span>Estimate skills</span></button>' +
      '<button data-auction-action="price" data-id="' + escapeHtml(card.id) + '">' + cardIcon('price') + '<span>Estimate price</span></button></div></div></div>' +
      '<div class="auction-meta-grid"><div class="auction-meta-box" title="Server and transfer availability"><small>SERVER</small><strong><span class="world-flag">' + (['BR','NA','EU','OCE'].includes(card.region) ? '<img src="https://assets.service-exevopan.com/public/assets/' + card.region.toLowerCase() + '-flag.png" alt="' + card.region + '">' : '🌐') + '</span>' + escapeHtml(card.world || "—") +
      '</strong><span class="transfer-icon" title="' + escapeHtml(snapshot?.transfer || card.transfer || "Transfer information is not available") + '">' + cardIcon(transferIsAvailable(snapshot,card) === false || (isHistoricalAuction(card,snapshot) && transferIsAvailable(snapshot,card) !== true) ? 'transfer' : 'transferOpen') + '</span></div>' +
      '<div class="auction-meta-box"><small>PVP</small><strong><img class="battleye-sprite" src="https://assets.service-exevopan.com/public/assets/' + (card.battleyeColor === 'yellow' ? 'yellow' : 'green') + 'battleye.png" alt="">' + escapeHtml(card.pvpType || "—") + '</strong></div>' +
      '<div class="auction-meta-box"><small>AUCTION END</small><strong data-auction-end="' + escapeHtml(card.end) + '" data-auction-history="' + String(historical) + '">' + auctionEndMarkup(card.end, historical) + '</strong></div>' +
      '<div class="auction-meta-box"><small>' + bid + '</small><strong><img class="coin-sprite" src="https://assets.service-exevopan.com/public/assets/tibiacoin.png" alt="TC">' + escapeHtml(formatAuctionNumber(bidValue)) + '</strong></div></div>' +
      '<div class="auction-items-row">' + itemSquares.join("") + (snapshot || isHistoricalAuction(card,snapshot) ? "" : '<span class="loading-detail-label">Snapshot unavailable</span>') + '</div>' +
      '<div class="auction-skills-grid">' + skillRows + '</div>' +
      '<div class="auction-facts-grid"><div class="auction-facts-left">' +
      '<span title="Animus Masteries unlocked">' + cardIcon('masteries') + '<span>Animus Masteries: <b>' + escapeHtml(formatAuctionNumber(metrics.animusMasteries ?? "—")) + '</b></span></span>' +
      '<span title="Total Charm Points">' + cardIcon('charms') + '<span>Charm points: <b>' + escapeHtml(formatAuctionNumber(metrics.totalCharmPoints ?? "—")) + '</b></span></span>' +
      '<div class="bazaar-hover-anchor" tabindex="0">' + cardIcon('imbuements') + '<span>Imbuements: <b>' + escapeHtml(formatAuctionNumber(metrics.imbuementsUnlocked ?? "—")) + '/23</b></span>' + imbuementPopover(snapshot) + '</div>' +
      '<span title="Boss points">' + cardIcon('boss') + '<span>Boss points: <b>' + escapeHtml(formatAuctionNumber(metrics.bossPoints ?? "—")) + '</b></span></span>' +
      '<div class="' + (bountyPanel ? 'bazaar-hover-anchor' : '') + '"' + (bountyPanel ? ' tabindex="0"' : '') + '>' + cardIcon('bounty') + '<span>Bounty points: <b>' + escapeHtml(formatAuctionNumber(metrics.bountyPoints ?? "—")) + '</b></span>' + bountyPanel + '</div>' +
      '<div class="quest-hover-wrap"><button class="auction-quest-count" data-quest-map="' + escapeHtml(card.id) + '" aria-label="Quest list and access tracker">' + cardIcon('quests') + '<span>Quests: <b>' +
      escapeHtml(completedCount + "/" + accessRows.total) + '</b></span></button>' + questPopover(profile) + '</div></div>' +
      '<div class="auction-facts-right">' +
      '<span class="expansion-value" title="Permanent Weekly Task Expansion"><i class="fact-checkbox ' + (metrics.weeklyTaskExpansion === "yes" ? "checked" : "") + '">' + (metrics.weeklyTaskExpansion === "yes" ? cardIcon('check') : "") + '</i>Weekly Task Expansion</span>' +
      '<span class="expansion-value" title="Charm Expansion"><i class="fact-checkbox ' + (metrics.charmExpansion === "yes" ? "checked" : "") + '">' + (metrics.charmExpansion === "yes" ? cardIcon('check') : "") + '</i>Charm Expansion</span>' +
      '<span class="expansion-value" title="Permanent Prey Slot"><i class="fact-checkbox ' + (Number(metrics.preySlots || 0) > 0 ? "checked" : "") + '">' + (Number(metrics.preySlots || 0) > 0 ? cardIcon('check') : "") + '</i>Prey Slot</span>' +
      '<div class="auction-gems' + (gemPanel ? ' bazaar-hover-anchor' : '') + '"' + (gemPanel ? ' tabindex="0"' : '') + '>' + cardIcon('gems') + 'Gems: ' + escapeHtml(gemsText) + gemPanel + '</div>' +
      (Number(metrics.tcInvested) > 0 ? '<span class="auction-invested" title="This character has invested at least ' + escapeHtml(formatAuctionNumber(metrics.tcInvested)) + ' Tibia Coins in store purchases"><img class="coin-sprite" src="https://assets.service-exevopan.com/public/assets/tibiacoin.png" alt="TC">' + escapeHtml(invest) + '</span>' : '') + '</div></div>' +
      '<div class="auction-card-footer">' + tags.map(tag => '<span class="auction-tag ' + (tag.gold ? 'availability-tag' : '') + '" role="img" aria-label="' + escapeHtml(tag.label) + '">' + escapeHtml(tag.label) + '</span>').join('') + '</div>' +
      '</article>';
  }

  function renderAuctionListings() {
    const grid = byId("auctionGrid");
    const visible = auctionListings.filter((card) => cardMatchesClientFilters(card, listingSnapshot(card)));
    if (listingError) {
      grid.innerHTML = '<div class="listing-error"><strong>Não consegui carregar os leilões.</strong><span>' + escapeHtml(listingError) + '</span><button class="list-control" id="retryListings">Tentar novamente</button></div>';
      byId("listingMessage").textContent = "Fonte oficial indisponível";
      return;
    }
    grid.innerHTML = visible.length ? visible.map(renderAuctionCard).join("") : '<div class="listing-empty-filter">Nenhum leilão salvo no banco local corresponde a estes filtros.</div>';
    const start = listingTotal ? (listingPage - 1) * AUCTIONS_PER_PAGE + 1 : 0;
    const end = listingTotal ? Math.min(listingPage * AUCTIONS_PER_PAGE, listingTotal) : 0;
    byId("listingRange").textContent = start + " - " + end + " of " + Number(listingTotal || 0).toLocaleString("en-US");
    ["firstPage", "previousPage"].forEach((id) => { byId(id).disabled = listingPage <= 1; });
    ["nextPage", "lastPage"].forEach((id) => { byId(id).disabled = !listingTotalPages || listingPage >= listingTotalPages; });
    updateAuctionClocks();
  }

  function listingQueryParams() {
    const filters = {
      nickname: byId("filterNickname").value.trim(),
      profession: filterGroupValues("filterVocation").join(","),
      pvp: filterGroupValues("filterPvp").join(","),
      battleye: filterGroupValues("filterBattlEye").join(","),
      world: byId("filterWorld").value.trim(),
      levelMin: byId("filterLevelMin").value,
      levelMax: byId("filterLevelMax").value,
      skillMin: byId("filterSkillMin").value,
      skillMax: byId("filterSkillMax").value,
      skillId: $$("[data-skill-choice]:checked").map(input=>input.dataset.skillChoice).join(",") || byId("filterSkill").value,
      sort: document.querySelector('input[name="auctionSort"]:checked')?.value || "end",
      ascending: byId("sortAscending").checked ? "false" : "true"
    };
    listingFilters = filters;
    return filters;
  }

  async function requestListingPage(params) {
    const key = params.toString();
    const cached = listingPageCache.get(key);
    if (cached && Date.now() - cached.savedAt < 30000) return cached.result;
    if (listingPageRequests.has(key)) return listingPageRequests.get(key);
    const request = (async () => {
      const response = await fetch('/api/bazaar/listings?' + key, {headers:{Accept:'application/json'},signal:AbortSignal.timeout(45000)});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The official listing did not respond.');
      if (listingPageCache.size >= 12) listingPageCache.delete(listingPageCache.keys().next().value);
      listingPageCache.set(key, {savedAt:Date.now(), result});
      return result;
    })();
    listingPageRequests.set(key, request);
    try { return await request; }
    finally { listingPageRequests.delete(key); }
  }

  const completeIndexCache = new Map();
  const cardImageCache = new Map();
  async function preloadCardImages(cards) {
    const urls=new Set(cards.flatMap(card=>[card.outfit,card.outfitImage,...(card.items || []).map(item=>item.image)]).filter(Boolean));
    await Promise.all(Array.from(urls,src=>{
      if(cardImageCache.has(src))return cardImageCache.get(src);
      const promise=new Promise(resolve=>{const image=new Image();const finish=()=>resolve();image.onload=finish;image.onerror=finish;image.src=src;if(image.complete)resolve();setTimeout(finish,1500);});
      cardImageCache.set(src,promise);return promise;
    }));
    if(cardImageCache.size>500)cardImageCache.clear();
  }
  function localNativeMatch(card, filters) {
    const level=Number(card.level || 0);
    const minLevel=Number(filters.levelMin || 0),maxLevel=Number(filters.levelMax || 3000);
    if((minLevel!==0 || maxLevel!==3000) && (level<minLevel || level>maxLevel))return false;
    const vocation=String(card.vocation || '').toLowerCase().replace(/^(elite |royal |master |elder |exalted )/,'');
    const professions={none:'1',druid:'2',knight:'3',paladin:'4',sorcerer:'5',monk:'6'};
    const pvps={Open:'0',Optional:'1',Hardcore:'2','Retro Open':'3','Retro Hardcore':'4'};
    for(const [key,value] of [['profession',professions[vocation]],['pvp',pvps[card.pvpType]],['battleye',card.battleyeColor==='green'?'1':card.battleyeColor==='yellow'?'2':'']]){
      if(filters[key]&&!filters[key].split(',').includes(value))return false;
    }
    if(filters.world&&String(card.world).toLowerCase()!==filters.world.toLowerCase())return false;
    if(filters.nickname&&!String(card.name).toLowerCase().includes(filters.nickname.toLowerCase()))return false;
    if(listingType==='current'&&auctionDeadline(card.end)<=Date.now())return false;
    return true;
  }
  function showDatabaseCoverage(coverage) {
    const notice=byId('databaseCoverage');if(!notice)return;
    const expected=Number(coverage.expected || 0), active=Number(coverage.active || 0), downloaded=Number(coverage.downloaded || 0);
    notice.textContent='Banco local: '+active+' leilões ativos · '+downloaded+' snapshots disponíveis · Histórico: '+Number(coverage.history || 0)+' · Vendas confirmadas: '+Number(coverage.confirmedSales || 0)+(coverage.error?' · Sincronização aguardando a fonte.':downloaded<active?' · Detalhes em carregamento.':'');
    if (coverage.staticPublishedAt) notice.textContent += ' · Base publicada: '+new Date(coverage.staticPublishedAt*1000).toLocaleString('pt-BR');
    if (coverage.verifiedOfficialAt) notice.textContent += ' · Conferido: '+new Date(coverage.verifiedOfficialAt*1000).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    if (Number(coverage.pendingSnapshots)>0) notice.textContent += ' · Atualizando snapshots: '+Number(coverage.pendingSnapshots)+' pendentes';
    if (coverage.snapshotError) notice.textContent += ' · Falha em snapshot; nova tentativa agendada.';
    notice.title=coverage.snapshotError || coverage.error || 'Filtros e paginação usam o banco deste computador. A coleta externa ocorre em segundo plano.';
  }
  let localCoverageRevision='';
  async function refreshLocalDatabase(){
    try{
      const response=await fetch('/api/bazaar/index-status');if(!response.ok)return;
      const coverage=await response.json();showDatabaseCoverage(coverage);
      const revision=JSON.stringify([coverage.active,coverage.history,coverage.downloaded,coverage.confirmedSales,coverage.lastListingSync,coverage.lastSnapshotSync]);
      if(revision===localCoverageRevision)return;
      // Keep the displayed page stable while the background collectors work.
      // The next user navigation/filter action reads the refreshed local index.
      localCoverageRevision=revision;completeIndexCache.clear();listingPageCache.clear();
    }catch(error){}
  }
  async function loadBazaarListings(page) {
    listingPage = Math.max(1, Number(page) || 1);
    const requestVersion = ++listingQueryVersion;
    listingError = "";
    byId("listingMessage").textContent = "Loading local Bazaar database…";
    byId("listingSourceDot").classList.add("loading");
    byId("auctionGrid").setAttribute("aria-busy", "true");
    if (!auctionListings.length) byId("auctionGrid").innerHTML = '<div class="listing-loading">Loading auctions…</div>';
    const params = new URLSearchParams({ type: listingType, page: String(listingPage), ...listingQueryParams() });
    try {
      let result;
      const advanced=true;
      const cacheKey='database:'+listingType;
      let cached=completeIndexCache.get(cacheKey), index;
      if(cached&&Date.now()-cached.savedAt<300000&&(!cached.index.nextExpiryAt||Date.now()<cached.index.nextExpiryAt))index=cached.index;
      else {
        const response=await fetch('/api/bazaar/filter-index?type='+listingType,{headers:{Accept:'application/json'}});
        index=await response.json();if(!response.ok)throw new Error(index.error || 'Unable to read the local Bazaar database.');
        completeIndexCache.set(cacheKey,{savedAt:Date.now(),index});
      }
      if(requestVersion!==listingQueryVersion)return;
      showDatabaseCoverage(index.coverage || {});
      const filters=Object.fromEntries(params.entries());
      snapshotFiltersActive=filterGroupValues('filterLocation').length || byId('filterBidded').checked ||
        ['filterBossPoints','filterBountyPoints','filterTcInvested','filterAchievements','filterGreaterGems','filterCharmMin'].some(id=>Number(byId(id).value)>0) ||
        Number(byId('filterCharmMax').value || 50000)<50000 ||
        ['filterImbuements','filterQuest','filterRareAchievements','filterRareItems','filterGems'].some(id=>byId(id).value.trim()) ||
        byId('filterAllImbuements').checked || $$('[data-cosmetic-choice]:checked,[data-store-filter]:checked,[data-misc-filter]:checked,[data-skill-choice]:checked').length || byId('filterSkill').value;
      const matching=index.auctions.filter(card=>localNativeMatch(card,filters)&&cardMatchesClientFilters(card,card.snapshot));
      const sortValue=card=>filters.sort==='level'?Number(card.level || 0):filters.sort==='price'?Number(card.currentBid || card.minimumBid || 0):auctionDeadline(card.end);
      const direction=filters.ascending==='true'?1:-1;
      matching.sort((a,b)=>(sortValue(a)-sortValue(b) || Number(a.id)-Number(b.id))*direction);
      const pages=Math.ceil(matching.length/AUCTIONS_PER_PAGE);
      listingPage=Math.max(1,Math.min(listingPage,pages || 1));
      result={auctions:matching.slice((listingPage-1)*AUCTIONS_PER_PAGE,listingPage*AUCTIONS_PER_PAGE),total:matching.length,totalPages:pages,worlds:index.worlds};
      const nextCards=matching.slice(listingPage*AUCTIONS_PER_PAGE,(listingPage+1)*AUCTIONS_PER_PAGE);
      preloadCardImages(nextCards).catch(()=>{});
      await preloadCardImages(result.auctions || []);
      if (requestVersion !== listingQueryVersion) return;
      auctionListings = Array.isArray(result.auctions) ? result.auctions : [];
      if (Array.isArray(result.worlds)) byId("bazaarWorlds").innerHTML=result.worlds.map(world=>'<option value="'+escapeHtml(world)+'">').join("");
      listingTotal = Number(result.total || 0);
      listingTotalPages = Number(result.totalPages || 0);
      listingError = "";
      byId("listingSourceDot").classList.remove("loading");
      byId("listingMessage").textContent = "Source: local Bazaar database";
      renderAuctionListings();
      byId("auctionGrid").setAttribute("aria-busy", "false");
      if (!advanced && listingPage < listingTotalPages) {
        const nextParams = new URLSearchParams(params);
        nextParams.set("page", String(listingPage + 1));
        requestListingPage(nextParams).then(result=>preloadCardImages(result.auctions || [])).catch(() => {});
      }
      renderActiveFilters();

    } catch (error) {
      if (requestVersion !== listingQueryVersion) return;
      listingError = error.message || "Falha de rede.";
      byId("auctionGrid").setAttribute("aria-busy", "false");
      byId("listingSourceDot").classList.remove("loading");
      renderAuctionListings();
    }
  }

  async function fetchAuctionDetail(auctionId) {
    let card = auctionListings.find((item) => String(item.id) === String(auctionId));
    if (card && listingSnapshot(card) && !listingSnapshot(card)._staticSummary) return listingSnapshot(card);
    // Archive listing-only records can still be opened locally. Opening the
    // history must not start an official-site enrichment request implicitly.
    if (card && isHistoricalAuction(card, listingSnapshot(card)) && !listingSnapshot(card)) return historicalListingSnapshot(card);
    const response = await fetch("/api/bazaar/detail?auctionid=" + encodeURIComponent(auctionId) + "&type=" + listingType, { headers: { Accept: "application/json" } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não foi possível abrir o snapshot oficial.");
    result.snapshot.displayCard = {...(result.snapshot.displayCard || {}), ...(result.world || {})};
    if (card) {
      card.snapshot = result.snapshot;
      const meta = result.world || {};
      card.pvpType = meta.pvpType || card.pvpType || "";
      card.region = meta.region || card.region || "";
      card.battleyeColor = meta.battleyeColor || card.battleyeColor || "";
      card.transfer = meta.transfer || card.transfer || "";
    }
    return result.snapshot;
  }

  function cosmeticsPanel(snapshot, tab, storeOnly = false) {
    const storeKey = tab === 'Outfits' ? 'StoreOutfits' : 'StoreMounts';
    const store = snapshot.cosmetics?.[storeKey] || [];
    const entries = tab === 'Store Items' ? detailCosmetics(snapshot, tab) : storeOnly ? store : snapshot.cosmetics?.[tab] || [];
    const extra = !storeOnly && tab !== 'Store Items' && store.length ? '<h4 class="store-cosmetics-heading">Store ' + tab.toLowerCase() + ' (' + store.length + ')</h4>' + cosmeticsPanel(snapshot,tab,true) : '';
    return entries.length ? '<div class="cosmetic-grid ' + (tab === 'Outfits' ? (storeOnly ? 'store-outfit-grid' : 'outfit-grid') : tab === 'Mounts' ? 'mount-grid' : 'store-grid') + '">' + entries.map(item => {
      const name = item.name.split('\n')[0];
      const quantity = name.match(/^(\d+)x\s+(.+)$/i);
      const label = quantity ? quantity[2] : name;
      const image = officialAsset(item.image);
      // The reference tags rare base outfits, but highlights outfit tiles only with an addon.
      const rare = !storeOnly && (tab === 'Mounts' ? RARE_MOUNTS.has(cosmeticIdentity(item).name) : tab === 'Outfits' && cosmeticIdentity(item).type > 0 && isRareOutfit(item, snapshot));
      const addons = tab === 'Outfits' && !storeOnly ? '<div class="outfit-addons">' + [1,2].map(n => '<i class="fact-checkbox ' + (new RegExp('addon ' + n).test(name) ? 'checked' : '') + '" title="Addon ' + n + '">' + (new RegExp('addon ' + n).test(name) ? cardIcon('check') : '') + '</i>').join('') + '</div>' : '';
      return '<div class="cosmetic-entry' + (rare ? ' cosmetic-rare' : '') + '" title="' + escapeHtml(label) + '">' + (image ? spriteImage(image, label, tab === 'Store Items' ? 'item' : 'character') : '') + addons + (tab === 'Store Items' ? '<span class="store-quantity">' + (quantity ? quantity[1] : '1') + 'x</span>' : '') + '</div>';
    }).join('') + '</div>' + extra : extra || '<div class="detail-empty">No entries</div>';
  }

  function renderAuctionDetails(snapshot, auctionId) {
    const previousScroll = byId('auctionDetailsBody').querySelector('.auction-card')?.dataset.auctionCard === String(auctionId) ? byId('auctionDetailsBody').querySelector('.detail-scroll-region')?.scrollTop || 0 : 0;
    activeDetailSnapshot = snapshot;
    const sourceCard = auctionListings.find(item => String(item.id) === String(auctionId));
    const character = snapshot.character || {}, metrics = displayAuctionMetrics(sourceCard, snapshot);
    const card = {...(snapshot.displayCard || {}), ...(sourceCard || {}), id:auctionId, ...character,
      end:sourceCard?.end || snapshot.displayCard?.end || snapshot.auction?.end,
      currentBid:sourceCard?.currentBid ?? snapshot.displayCard?.currentBid ?? snapshot.auction?.currentBid,
      minimumBid:sourceCard?.minimumBid ?? snapshot.displayCard?.minimumBid ?? snapshot.auction?.minimumBid,
      snapshot, outfitImage:sourceCard?.outfitImage || snapshot.displayCard?.outfitImage || (snapshot.cosmetics?.Outfits || [])[0]?.image};
    const template = document.createElement('template');
    template.innerHTML = renderAuctionCard(card);
    const summary = template.content.querySelector('.auction-card');
    const heading = summary.querySelector('.auction-card-heading');
    heading.querySelector('a')?.removeAttribute('data-auction-details');
    heading.querySelector('.auction-menu-wrap')?.remove();
    heading.querySelector('.auction-badges')?.remove();
    const rightFacts = summary.querySelector('.auction-facts-right');
    const gems = rightFacts.querySelector('.auction-gems');
    const leftFacts = summary.querySelector('.auction-facts-left');
    const facts = [...leftFacts.children];
    leftFacts.replaceChildren(facts[2], facts[1], facts[5], gems, facts[3], facts[4], facts[0]);
    leftFacts.insertAdjacentHTML('beforeend', '<span>♟ Hirelings: ' + escapeHtml(String(metrics.hirelings ?? 0)) + ' (' + escapeHtml(String(metrics.hirelingJobs ?? 0)) + '/4 jobs, ' + escapeHtml(String(metrics.hirelingOutfits ?? 0)) + ' outfits)</span><span>★ Achievement points: ' + escapeHtml(formatAuctionNumber(metrics.achievementPoints ?? 0)) + '</span>');
    rightFacts.remove();
    summary.querySelector('.auction-card-footer')?.remove();
    heading.remove();
    const storeText = (snapshot.cosmetics?.StoreItemSummary || []).map(item => item.name).join(' ') + ' ' + (snapshot.featureEntries || []).join(' ');
    const features = [
      ['Training Dummy', /exercise dummy|training dummy/i.test(storeText)],
      ['Gold pouch', /gold pouch/i.test(storeText)],
      ['Hirelings', Number(metrics.hirelings || 0) > 0 || /hireling/i.test(storeText)],
      ['Charm expansion', metrics.charmExpansion === 'yes'],
      ['Prey Slot', Number(metrics.preySlots || 0) > 0],
      ['Weekly Task Expansion', metrics.weeklyTaskExpansion === 'yes'],
      ['Imbuement Shrine', /imbu(?:ement|ing) shrine/i.test(storeText)],
      ['Reward Shrine', /reward shrine/i.test(storeText)],
      ['Mailbox', /mailbox/i.test(storeText)]
    ];
    const counts = ['Outfits','Mounts','Store Items'].map(tab => tab === 'Store Items' ? detailCosmetics(snapshot,tab).length : String((snapshot.cosmetics?.[tab] || []).length) + ((snapshot.cosmetics?.[tab === 'Outfits' ? 'StoreOutfits' : 'StoreMounts'] || []).length ? ' + ' + snapshot.cosmetics[tab === 'Outfits' ? 'StoreOutfits' : 'StoreMounts'].length : ''));
    if (!['Outfits','Mounts','Store Items'].includes(activeCosmeticTab)) activeCosmeticTab = 'Outfits';
    byId('auctionDetailsBody').innerHTML = '<div class="detail-pinned-heading">' + heading.outerHTML + '</div><div class="detail-scroll-region"><aside class="detail-sidebar">' + summary.outerHTML + '</aside><main class="detail-main"><div class="detail-investment"><img class="coin-sprite" src="https://assets.service-exevopan.com/public/assets/tibiacoin.png" alt="TC">Total invested: <strong title="Estimated reference value of identified Store purchases">' + escapeHtml(formatAuctionNumber(metrics.tcInvested ?? 0)) + ' Tibia Coins</strong></div><div class="detail-feature-grid">' + features.map(([name,yes]) => '<span><i class="fact-checkbox ' + (yes ? 'checked' : '') + '">' + (yes ? cardIcon('check') : '') + '</i>' + name + '</span>').join('') + '</div><section class="detail-cosmetics"><div class="detail-tabs" role="tablist">' + ['Outfits','Mounts','Store Items'].map((tab,i) => '<button role="tab" aria-selected="' + (activeCosmeticTab === tab) + '" data-cosmetic-tab="' + tab + '" class="' + (activeCosmeticTab === tab ? 'active' : '') + '"><span aria-hidden="true">' + cardIcon(['outfits','mounts','store'][i]) + '</span> ' + tab + ' (' + counts[i] + ')</button>').join('') + '</div><div class="cosmetics-content" role="tabpanel">' + cosmeticsPanel(snapshot,activeCosmeticTab) + '</div></section></main></div>';
    if (!Number(metrics.tcInvested)) byId('auctionDetailsBody').querySelector('.detail-investment')?.remove();
    if (snapshot.enrichment?.complete === false) {
      byId('auctionDetailsBody').querySelector('.detail-main').insertAdjacentHTML('afterbegin',
        '<p class="detail-empty" title="' + escapeHtml((snapshot.enrichment.missingFields || []).join(', ')) + '">Historical API data: partial snapshot. Some sections are unavailable; quest lists may be incomplete.</p>');
    }
    byId('auctionDetailsBody').querySelector('.detail-scroll-region').scrollTop=previousScroll;
  }

  function detailCosmetics(snapshot, tab) {
    const data = snapshot.cosmetics || {};
    if (tab === 'Store Items') return (data.StoreItemSummary || []).filter(item => !/rune|potion|gold converter|chilli con|salmon filet|carrion casserole|consecrated beef|overcooked noodles/i.test(item.name));
    return [...(data[tab] || []), ...(data[tab === 'Outfits' ? 'StoreOutfits' : 'StoreMounts'] || [])];
  }

  async function openAuctionDetails(auctionId, requestedTab) {
    activeCosmeticTab = requestedTab || "Outfits";
    byId("auctionDetailsDialog").showModal();
    byId("auctionDetailsBody").innerHTML = '<div class="listing-loading">Loading the official auction snapshot…</div>';
    try {
      const snapshot = await fetchAuctionDetail(auctionId);
      renderAuctionDetails(snapshot, auctionId);
      renderAuctionListings();
    } catch (error) {
      byId("auctionDetailsBody").innerHTML = '<div class="listing-error"><strong>Details unavailable</strong><span>' + escapeHtml(error.message) + '</span></div>';
    }
  }

  async function trackAuctionAccess(auctionId, name) {
    let card = auctionListings.find((item) => String(item.id) === String(auctionId));
    if (!card) card = { id: String(auctionId), name: name || "Character" };
    let snapshot = listingSnapshot(card);
    if (!snapshot) {
      try { snapshot = await fetchAuctionDetail(auctionId); }
      catch (error) { showToast(error.message || "Snapshot unavailable."); return; }
    }
    let profile = state.profiles.find((item) => item.auctionId === String(auctionId) || item.name.toLowerCase() === card.name.toLowerCase());
    if (!profile) { profile = blankProfile(card.name); state.profiles.unshift(profile); }
    applyOfficialAuction(profile, snapshot);
    profile.auctionId = String(auctionId);
    state.selectedId = profile.id;
    saveState();
    activeCosmeticTab = "Quest Access";
    if (byId("auctionDetailsDialog").open) renderAuctionDetails(snapshot, auctionId);
  }

  async function handleAuctionAction(button) {
    const id = button.dataset.id;
    const card = auctionListings.find((item) => String(item.id) === String(id));
    const action = button.dataset.auctionAction;
    const url = card ? "https://www.tibia.com/charactertrade/?" + new URLSearchParams({ subtopic: listingType === "past" ? "pastcharactertrades" : "currentcharactertrades", page: "details", auctionid: id }).toString() : "";
    if (action === "details") return openAuctionDetails(id);
    if (action === "copy") {
      try { await navigator.clipboard.writeText(url); showToast("Official auction link copied."); }
      catch (error) { showToast("Clipboard access is unavailable in this browser."); }
      return;
    }
    if (action === 'favorite') {
      const index=favoriteAuctionIds.indexOf(String(id));
      if(index>=0)favoriteAuctionIds.splice(index,1);else favoriteAuctionIds.push(String(id));
      localStorage.setItem('bazar-atlas-favorites',JSON.stringify(favoriteAuctionIds));
      renderAuctionListings();showToast(index>=0?'Removed from favorites.':'Auction added to favorites.');return;
    }
    if (action === 'similar') {
      suppressFilterReload=true;byId('clearAuctionFilters').click();suppressFilterReload=false;
      const vocation=String(card.vocation||'').toLowerCase();
      const profession=/knight/.test(vocation)?'3':/paladin/.test(vocation)?'4':/sorcerer/.test(vocation)?'5':/druid/.test(vocation)?'2':/monk/.test(vocation)?'6':'1';
      const set=(id,values)=>[...byId(id).options].forEach(o=>o.selected=values.includes(o.value));
      set('filterVocation',[profession]);
      const pvp={'Optional':'1','Open':'0','Retro Open':'3','Hardcore':'2','Retro Hardcore':'4'}[card.pvpType];
      if(pvp)set('filterPvp',[pvp]);
      set('filterBattlEye',[card.battleyeColor==='yellow'?'2':'1']);
      byId('filterLevelMin').value=Math.max(0,Number(card.level)-100);byId('filterLevelMax').value=Number(card.level)+100;
      const snapshot=await fetchAuctionDetail(id),skill=primarySkill(card,snapshot),level=Number(listCardSkill(snapshot,skill).value);
      byId('filterSkillMin').value=Math.max(0,level-3);byId('filterSkillMax').value=level+5;
      const choices=profession==='3'?['8','9','10']:skill==='magic'?['1']:skill==='distance'?['7']:['11'];
      document.querySelectorAll('[data-skill-choice]').forEach(input=>input.checked=choices.includes(input.dataset.skillChoice));
      byId('filterSkill').value=choices.length===1?choices[0]:'';
      renderActiveFilters();await loadBazaarListings(1);return;
    }
    if (action === 'skills' || action === 'price' || action === 'notify') return openAuctionTool(action,card);
  }

  // NPC prices effective 2026-10-06, confirmed against the official Tibia news.
  const EXERCISE_WEAPONS = {
    regular:{gold:434028,tc:25,points:300000},
    durable:{gold:1562500,tc:90,points:1080000},
    lasting:{gold:12500000,tc:720,points:8640000}
  };
  let auctionToolContext=null;
  function closeAuctionTool(){byId('auctionToolDialog').close();}
  async function openAuctionTool(action,card){
    const dialog=byId('auctionToolDialog');
    dialog.dataset.tool=action;
    auctionToolContext={action,card,snapshot:action==='price'?listingSnapshot(card):await fetchAuctionDetail(String(card.id))};
    if(!dialog.open)dialog.showModal();
    const body=byId('auctionToolBody');
    const heading=action==='skills'?'Character skills':action==='price'?'Estimated auction price':'Set auction notification';
    byId('auctionToolTitle').textContent=heading;
    if(action==='skills'){
      const initial=primarySkill(card,auctionToolContext.snapshot);
      body.innerHTML='<fieldset><legend>Skill</legend><div class="tool-skill-options">'+[['magic','Magic level'],['distance','Distance'],['fist','Fist'],['club','Club'],['sword','Sword'],['axe','Axe'],['shielding','Shield']].map(([key,label])=>'<label><input type="radio" name="toolSkill" value="'+key+'" '+(key===initial?'checked':'')+'>'+label+'</label>').join('')+'</div></fieldset><label class="tool-field">Loyalty<select id="toolLoyalty">'+Array.from({length:11},(_,i)=>'<option value="'+i*5+'">'+(i?i*5+'%':'None')+'</option>').join('')+'</select></label><label class="tool-field">Exercise weapon<select id="toolWeapon"><option value="regular">Regular · 500 charges</option><option value="durable">Durable · 1,800 charges</option><option value="lasting">Lasting · 14,400 charges</option></select></label><div class="tool-value-label">Skill value</div><div id="toolSkillValue" class="tool-cost"></div><div class="tool-value-label">Skill with bonus Loyalty</div><div id="toolSkillResult" class="tool-result"></div><small class="tool-assumptions">Double skill rate and expert dummy. NPC prices updated on Oct 06, 2026: regular 434,028 GP; durable 1,562,500 GP; lasting 12,500,000 GP. '+ '<a target="_blank" rel="noopener noreferrer" href="https://www.exevopan.com/calculators/exercise-weapons">Reference calculator</a></small>';
      body.onchange=updateSkillTool;updateSkillTool();
    }else if(action==='price'){
      body.innerHTML='<h3>'+escapeHtml(card.name)+'</h3><div class="tool-price-box"><small>ESTIMATED PRICE</small><strong id="estimatedPrice">—</strong><span id="priceSampleCount">Loading similar auctions…</span></div><p>Value is always subjective!</p><p>This estimation only considers:</p><ul><li>Server type</li><li>Skills, level and vocation</li></ul><small class="tool-assumptions">Estimate uses only confirmed sales in this computer’s Bazaar history. Opening this panel makes no external request.</small>';
      try{const response=await fetch('/api/bazaar/estimate?auctionid='+encodeURIComponent(card.id));const result=await response.json();if(auctionToolContext?.card.id!==card.id||auctionToolContext.action!=='price')return;if(!response.ok)throw new Error(result.error);byId('estimatedPrice').textContent=result.count?formatAuctionNumber(result.median)+' TC':'—';byId('priceSampleCount').textContent=result.count?result.count+' comparable sales in local history':'No comparable confirmed sales in local history yet';}catch(error){if(byId('priceSampleCount'))byId('priceSampleCount').textContent='Estimate unavailable';}
    }else{
      const saved=notifiedAuctionIds.includes(String(card.id));
      const historical=listingType==='past';
      body.innerHTML='<div class="notification-character"><strong>'+escapeHtml(card.name)+'</strong><div class="auction-meta-box"><small>AUCTION END</small><strong data-auction-end="'+escapeHtml(card.end)+'" data-auction-history="'+String(historical)+'">'+auctionEndMarkup(card.end,historical)+'</strong></div></div><label class="notification-choice"><input id="notifyBidded" type="checkbox">Notify me when bidded</label><label class="notification-choice"><input id="notifyEnding" type="checkbox" checked>Notify me before auction end:</label><div class="notification-time"><input id="notifyBefore" type="number" value="15" min="0" max="60" step="15"><select id="notifyUnit"><option value="1">Minutes left</option><option value="60">Hours left</option></select></div><div class="notification-actions"><button id="cancelAuctionNotification">CANCEL</button><button class="button button-primary" id="saveAuctionNotification">CONFIRM</button></div><small class="tool-assumptions">Reminders are saved on this computer and can notify with the browser closed, while the local Bazar Atlas server is running. Windows notification settings apply.</small>';
      byId('cancelAuctionNotification').onclick=closeAuctionTool;
      byId('notifyUnit').onchange=()=>{byId('notifyBefore').max=byId('notifyUnit').value==='60'?'24':'60';byId('notifyBefore').step=byId('notifyUnit').value==='60'?'1':'15';};
      byId('saveAuctionNotification').onclick=async()=>{const id=String(card.id);if(!byId('notifyBidded').checked&&!byId('notifyEnding').checked){const index=notifiedAuctionIds.indexOf(id);if(index>=0)notifiedAuctionIds.splice(index,1);localStorage.setItem('bazar-atlas-notify',JSON.stringify(notifiedAuctionIds));const reminders=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');delete reminders[id];localStorage.setItem('bazar-atlas-reminders',JSON.stringify(reminders));if(!await saveServerReminders())return;closeAuctionTool();renderAuctionListings();return;}if(!notifiedAuctionIds.includes(id))notifiedAuctionIds.push(id);localStorage.setItem('bazar-atlas-notify',JSON.stringify(notifiedAuctionIds));const reminders=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');reminders[id]={name:card.name,end:auctionDeadline(card.end),minutes:Number(byId('notifyBefore').value)*Number(byId('notifyUnit').value),whenBidded:byId('notifyBidded').checked,beforeEnd:byId('notifyEnding').checked,lastBid:card.currentBid||'',fired:false};localStorage.setItem('bazar-atlas-reminders',JSON.stringify(reminders));if(!await saveServerReminders())return;closeAuctionTool();showToast('Reminder saved on the local server.');renderAuctionListings();};
      if(saved&&byId('removeAuctionNotification'))byId('removeAuctionNotification').onclick=()=>{notifiedAuctionIds.splice(notifiedAuctionIds.indexOf(String(card.id)),1);localStorage.setItem('bazar-atlas-notify',JSON.stringify(notifiedAuctionIds));const reminders=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');delete reminders[String(card.id)];localStorage.setItem('bazar-atlas-reminders',JSON.stringify(reminders));closeAuctionTool();renderAuctionListings();};
    }
  }
  function updateSkillTool(){
    const {card,snapshot}=auctionToolContext,key=document.querySelector('[name="toolSkill"]:checked').value;
    const skill=listCardSkill(snapshot,key),level=Number(skill.value),loyalty=Number(byId('toolLoyalty').value),voc=String(card.vocation||'').toLowerCase();
    // Same formulas, weapon prices and double-skill/expert-dummy factors as the public reference calculator.
    const vocation=Object.keys({knight:1,paladin:1,sorcerer:1,druid:1,monk:1}).find(name=>voc.includes(name));
    const category=key==='magic'?'magic':key==='distance'?'distance':'melee';
    const rates={knight:{magic:3,melee:1.1,distance:1.4},paladin:{magic:1.4,melee:1.2,distance:1.1},druid:{magic:1.1,melee:1.8,distance:1.8},sorcerer:{magic:1.1,melee:2,distance:2},monk:{magic:1.25,melee:1.4,distance:1.5}};
    const growth=rates[vocation]?.[category];
    if(!growth||!Number.isFinite(level)){byId('toolSkillValue').textContent='Unavailable for this vocation';byId('toolSkillResult').textContent='—';return;}
    const base=category==='magic'?0:10, unit=category==='magic'?1600:category==='distance'?30:50;
    const actualLevel=level+skill.progress/100;
    const points=unit*(growth**(actualLevel-base)-1)/(growth-1);
    const boosted=base+Math.log(1+points*(1+loyalty/100)*(growth-1)/unit)/Math.log(growth);
    const training=1600*(growth**level-growth**base)/(growth-1)/1.1/2;
    const weapon=EXERCISE_WEAPONS[byId('toolWeapon').value];
    const weapons=Math.max(0,Math.ceil(training/weapon.points));
    byId('toolSkillValue').innerHTML='<span>🪙 '+formatAuctionNumber(weapons*weapon.gold)+'</span><small>or</small><span><img class="coin-sprite" src="https://assets.service-exevopan.com/public/assets/tibiacoin.png" alt="TC"> '+formatAuctionNumber(weapons*weapon.tc)+'</span>';
    byId('toolSkillResult').innerHTML='<strong>'+Math.floor(boosted)+'</strong><span>'+escapeHtml(key==='magic'?'Magic level':key[0].toUpperCase()+key.slice(1))+' (+'+(Math.floor(boosted)-level)+')</span>';
  }

  async function saveServerReminders(){
    const reminders=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');
    try{
      const response=await fetch('/api/bazaar/reminders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reminders)});
      const result=await response.json();if(!response.ok)throw new Error(result.error);
      Object.values(reminders).forEach(reminder=>{reminder.serverManaged=result.mode!=='browser';});
      localStorage.setItem('bazar-atlas-reminders',JSON.stringify(reminders));return true;
    }catch(error){showToast('Unable to save server reminder: '+error.message);return false;}
  }
  async function restoreServerReminders(){
    try{
      const response=await fetch('/api/bazaar/reminders');if(!response.ok)return;
      const data=await response.json(), local=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');
      const reminders={...local,...data.reminders};
      for(const [id,reminder] of Object.entries(data.reminders || {})){reminder.serverManaged=data.mode!=='browser';if(!notifiedAuctionIds.includes(id))notifiedAuctionIds.push(id);}
      localStorage.setItem('bazar-atlas-notify',JSON.stringify(notifiedAuctionIds));
      localStorage.setItem('bazar-atlas-reminders',JSON.stringify(reminders));
      if(Object.keys(local).some(id=>!data.reminders?.[id]))await saveServerReminders();
    }catch(error){}
  }
  function deliverAuctionReminder(message){
    showToast(message);
    if(typeof Notification!=='undefined'&&Notification.permission==='granted')new Notification('Bazar Atlas',{body:message});
  }
  function checkAuctionReminders(){
    const reminders=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');let changed=false;
    for(const [id,reminder] of Object.entries(reminders)){if(reminder.serverManaged)continue;const card=auctionListings.find(card=>String(card.id)===id);if(reminder.whenBidded&&card&&card.currentBid&&Number(card.currentBid)>Number(reminder.lastBid||0)){deliverAuctionReminder(reminder.name+': new bid '+formatAuctionNumber(card.currentBid)+' TC.');reminder.lastBid=card.currentBid;changed=true;}if(reminder.beforeEnd!==false&&!reminder.fired&&Date.now()>=reminder.end-reminder.minutes*60000){reminder.fired=true;changed=true;if(Date.now()<reminder.end)deliverAuctionReminder(reminder.name+': auction ends in '+Math.max(1,Math.ceil((reminder.end-Date.now())/60000))+' minutes.');}}
    if(changed)localStorage.setItem('bazar-atlas-reminders',JSON.stringify(reminders));
  }

  let bidReminderCursor=0;
  async function refreshBidReminders(){
    const all=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');
    const entries=Object.entries(all).filter(([id,reminder])=>!reminder.serverManaged&&reminder.whenBidded&&Date.now()<reminder.end);
    if(!entries.length)return;
    const targets=Array.from({length:Math.min(4,entries.length)},(_,i)=>entries[(bidReminderCursor+i)%entries.length]);bidReminderCursor=(bidReminderCursor+targets.length)%entries.length;
    for(const [id,original] of targets){
      try{const response=await fetch('/api/bazaar/live-bid?auctionid='+encodeURIComponent(id));if(!response.ok)continue;const result=await response.json();const reminders=JSON.parse(localStorage.getItem('bazar-atlas-reminders')||'{}');const reminder=reminders[id];if(!reminder)continue;if(result.active&&result.currentBid&&Number(result.currentBid)>Number(reminder.lastBid||0)){deliverAuctionReminder(reminder.name+': new bid '+formatAuctionNumber(result.currentBid)+' TC.');reminder.lastBid=result.currentBid;localStorage.setItem('bazar-atlas-reminders',JSON.stringify(reminders));}}catch(error){}
    }
  }

  function renderDashboard() {
    const profile = selectedProfile();
    byId("emptyState").hidden = Boolean(profile);
    byId("profileDashboard").hidden = !profile;
    if (!profile) return;

    byId("profileAvatar").textContent = initials(profile.name);
    byId("profileName").textContent = profile.name;
    byId("profileVocation").textContent = profile.vocation || "Vocação não informada";
    byId("profileWorld").textContent = profile.world || "Mundo não informado";
    byId("profileLevel").textContent = profile.level ? "Level " + numberText(profile.level) : "Level —";
    const profileStatus = byId("profileStatus");
    const summary = latestStatus(profile);
    profileStatus.textContent = summary.complete + " / " + CATALOG.length + " ACESSOS CONFIRMADOS";
    profileStatus.className = "pill " + (summary.complete ? "status-pill-done" : "pill-neutral");
    const auctionLink = byId("auctionLink");
    const auctionUrl = safeHttpsUrl(profile.auctionUrl);
    if (auctionUrl) {
      auctionLink.href = auctionUrl;
      auctionLink.hidden = false;
    } else {
      auctionLink.hidden = true;
      auctionLink.removeAttribute("href");
    }

    byId("metricGrid").innerHTML = '<article class="metric-card"><div class="metric-head"><span>Level</span><span class="metric-icon">↗</span></div>' +
      '<div class="metric-value"><input class="editable-input" type="number" min="0" data-profile-field="level" value="' +
      escapeHtml(profile.level) + '" placeholder="—" aria-label="Level"></div><div class="metric-sub">' +
      escapeHtml(profile.vocation || "Vocação não informada") + "</div></article>" +
      METRICS.map((metric) => metricCard(profile, metric)).join("");
    renderSnapshotExtras(profile);
    renderOfficialSnapshot(profile);
    renderSkills(profile);
    renderPriorityAccess(profile);
    renderFeaturedQuests(profile);
  }

  function categoryTag(category) {
    const labels = { new: ["NOVO", "new"], boss: ["BOSS", "boss"], hunt: ["HUNT", "hunt"], qol: ["QOL", "qol"] };
    return labels[category]
      ? '<span class="tag ' + labels[category][1] + '">' + labels[category][0] + "</span>"
      : "";
  }

  function renderQuestCard(quest, profile) {
    const flag = questFlag(profile, quest.id);
    const evidenceDefinition = EVIDENCE_CATALOG[quest.id] || {};
    const savedChecks = flag.checkpoints || [];
    const statusOptions = Object.keys(STATUS_LABELS).map((status) => {
      return '<option value="' + status + '" ' + (flag.status === status ? "selected" : "") + ">" +
        STATUS_LABELS[status] + "</option>";
    }).join("");
    const categoryTags = quest.categories.map(categoryTag).join("");
    const checkpoints = quest.checkpoints.map((checkpoint, index) => {
      const checked = savedChecks[index] === true;
      return '<label class="checkpoint"><input type="checkbox" data-checkpoint="' + index + '" data-quest="' +
        escapeHtml(quest.id) + '" ' + (checked ? "checked" : "") + " " + (!profile ? "disabled" : "") + ">" +
        "<span>" + escapeHtml(checkpoint) + "</span></label>";
    }).join("");
    const wikiLink = safeHttpsUrl(quest.wiki);
    const sourceLabels = { questline: "Quest line", achievement: "Conquista", boss: "Bosstiary", outfit: "Outfit", mount: "Montaria", creature: "Bestiary" };
    const evidenceList = flag.evidence || [];
    const exevoCompletionMapped = evidenceDefinition.exevoTracked === true &&
      Object.keys(evidenceDefinition.complete || {}).some((field) =>
        Array.isArray(evidenceDefinition.complete[field]) && evidenceDefinition.complete[field].length > 0);
    const evidenceHtml = profile && profile.auctionSnapshot
      ? (evidenceList.length
        ? '<div class="evidence-chips">' + evidenceList.map((item) => {
          const tierLabel = item.tier === "complete" ? "marcador de conclusão" :
            item.tier === "weak" ? "indício histórico fraco · não confirma acesso" : "marcador de progresso/acesso";
          const evidenceClass = item.tier === "complete" ? "evidence-complete" : item.tier === "weak" ? "evidence-weak" : "evidence-partial";
          return '<span class="evidence-chip ' + evidenceClass + '">' +
            escapeHtml(sourceLabels[item.source] || item.source) + " · " + escapeHtml(item.name) + " · " + tierLabel + "</span>";
        }).join("") + "</div>"
        : '<span class="evidence-empty">Sem evidência positiva nas entradas visíveis; isso não confirma ausência de acesso.</span>')
        : '<span class="evidence-empty">Importe um leilão para cruzar quest lines, conquistas, Bosstiary, Bestiary, outfits e montarias.</span>';
    return '<article class="quest-card" data-quest-card="' + escapeHtml(quest.id) + '" data-categories="' +
      escapeHtml(quest.categories.join(" ")) + '" data-priority="' + quest.priority + '">' +
      '<div class="quest-card-head"><div class="quest-title-line"><h3>' + escapeHtml(quest.name) + "</h3>" +
      categoryTags + '</div><span class="priority-label">' + (quest.priority === 1 ? "PRIORIDADE MÁXIMA" :
        (quest.priority === 2 ? "ALTA PRIORIDADE" : "UTILIDADE")) + "</span></div>" +
      '<p class="quest-summary">' + escapeHtml(quest.summary) + "</p>" +
      '<div class="unlock-row"><strong>Desbloqueia</strong><span>' + escapeHtml(quest.unlocks) + "</span></div>" +
      '<div class="unlock-row"><strong>Level wiki</strong><span>' + escapeHtml(quest.level) + "</span></div>" +
      '<div class="requirements">' + escapeHtml(quest.requirements) + "</div>" +
      (checkpoints ? '<div class="checkpoint-list">' + checkpoints + "</div>" : "") +
      '<div class="tracking-basis">' + (exevoCompletionMapped
        ? "Conclusão automática: quest line do Bazaar ou marcador de acesso do Exevo Pan"
        : (evidenceDefinition.exevoTracked
          ? "O Exevo Pan também rastreia etapas de acesso; conclusão automática depende da quest line do Bazaar"
          : "Conclusão automática: quest line concluída publicada pelo Bazaar")) + "</div>" +
      '<div class="evidence-block"><strong>Evidências do snapshot</strong>' + evidenceHtml +
        (evidenceDefinition.note ? '<small>' + escapeHtml(evidenceDefinition.note) + "</small>" : "") + "</div>" +
      '<div class="quest-card-foot">' + (wikiLink ? '<a href="' + escapeHtml(wikiLink) +
        '" target="_blank" rel="noopener noreferrer">Abrir TibiaWiki ↗</a>' : "<span></span>") +
      '<select class="status-select status-' + flag.status + '" data-status-quest="' + escapeHtml(quest.id) +
      '" aria-label="Status de ' + escapeHtml(quest.name) + '" ' + (!profile ? "disabled" : "") +
      '>' + statusOptions + "</select></div></article>";
  }

  function questMatches(quest, search, filter, profile) {
    const flag = questFlag(profile, quest.id);
    if (filter === "new" && !quest.categories.includes("new")) return false;
    if (filter === "boss" && questDisplayGroup(quest) !== "boss") return false;
    if (filter === "hunt" && questDisplayGroup(quest) !== "access") return false;
    if (filter === "qol" && questDisplayGroup(quest) !== "utility") return false;
    if (filter === "pending" && flag.status !== "incomplete" && flag.status !== "partial") return false;
    if (!search) return true;
    const haystack = [quest.name, quest.summary, quest.unlocks, quest.requirements, quest.level]
      .concat(quest.questLineNames || []).join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase());
  }

  function renderQuestCatalog() {
    const profile = selectedProfile();
    const search = byId("questSearch").value.trim();
    const quests = CATALOG.filter((quest) => questMatches(quest, search, activeFilter, profile));
    quests.sort((a, b) => sortByPriority
      ? (a.priority - b.priority || b.year.localeCompare(a.year) || a.name.localeCompare(b.name))
      : a.name.localeCompare(b.name));
    byId("questCatalog").innerHTML = quests.length
      ? quests.map((quest) => renderQuestCard(quest, profile)).join("")
      : '<div class="no-results">Nenhum acesso corresponde a este filtro.</div>';
    byId("catalogSummary").textContent = profile
      ? latestStatus(profile).complete + " de " + CATALOG.length + " acessos confirmados · " +
        latestStatus(profile).partial + " parcialmente concluídas · " + CATALOG.length + " quests na curadoria"
      : CATALOG.length + " quests de acesso e bosses na curadoria. Adicione um personagem para registrar os estados.";
  }

  function renderAll() {
    renderCharacterList();
    renderDashboard();
    renderAuctionListings();
    renderQuestCatalog();
    document.querySelectorAll('[id="sidebarQuestCount"]').forEach(element => { element.textContent = String(['utility','access','boss'].flatMap(displayQuests).length); });
    byId("catalogTotal").textContent = String(CATALOG.length);
    $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === activeView));
    const breadcrumb = byId("breadcrumbCurrent");
    if (breadcrumb) breadcrumb.textContent = activeView === "overview" ? "Visão geral" : (activeView === "quests" ? "Acessos e quests" : "Fontes e método");
  }

  function switchView(view) {
    activeView = view;
    byId("overviewView").hidden = view !== "overview";
    byId("questsView").hidden = view !== "quests";
    byId("sourcesView").hidden = view !== "sources";
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDialog(profile) {
    editingId = profile ? profile.id : null;
    pendingAuctionSnapshot = null;
    byId("dialogTitle").textContent = profile ? "Editar personagem" : "Adicionar personagem";
    byId("charName").value = profile ? profile.name : "";
    byId("auctionUrl").value = profile ? profile.auctionUrl : "";
    byId("fieldLevel").value = profile ? profile.level : "";
    byId("fieldVocation").value = profile ? profile.vocation : "";
    byId("fieldWorld").value = profile ? profile.world : "";
    byId("fieldAchievements").value = profile ? profile.achievementPoints : "";
    byId("lookupMessage").textContent = "Digite o nome para localizar o leilão atual e importar os dados oficiais automaticamente.";
    byId("lookupMessage").style.color = "";
    byId("characterDialog").showModal();
    setTimeout(() => byId("charName").focus(), 25);
  }

  function normalizedQuestName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\bquest\b/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function sectionEntries(snapshot, sectionId) {
    const section = snapshot && snapshot.sections && snapshot.sections[sectionId];
    return section && Array.isArray(section.entries) ? section.entries : [];
  }

  function evidenceRows(snapshot, source) {
    const sectionBySource = {
      achievement: "Achievements",
      boss: "BosstiaryProgress",
      outfit: "Outfits",
      mount: "Mounts",
      creature: "BestiaryProgress"
    };
    if (source === "questline") {
      return (snapshot && snapshot.completedQuestLines) || sectionEntries(snapshot, "CompletedQuestLines");
    }
    return sectionEntries(snapshot, sectionBySource[source]);
  }

  function matchedEvidence(snapshot, source, names, tier) {
    const rows = evidenceRows(snapshot, source);
    const matches = [];
    (names || []).forEach((name) => {
      const normalizedName = normalizedQuestName(name);
      if (!normalizedName) return;
      const row = rows.find((candidate) => source === "questline"
        ? normalizedQuestName(candidate) === normalizedName
        : normalizedQuestName(candidate).includes(normalizedName));
      if (row) matches.push({ source: source, name: String(name), tier: tier, row: String(row) });
    });
    return matches;
  }

  function questEvidenceMatches(snapshot, quest) {
    const definition = EVIDENCE_CATALOG[quest.id] || {};
    const result = [];
    const questlineNames = [quest.name]
      .concat(quest.questLineNames || [])
      .concat(OFFICIAL_QUEST_NAMES[quest.id] || []);
    result.push.apply(result, matchedEvidence(snapshot, "questline", questlineNames, "complete"));
    ["achievement", "boss", "outfit", "mount"].forEach((source) => {
      const field = source === "achievement" ? "achievements" : source === "boss" ? "bosses" : source === "outfit" ? "outfits" : "mounts";
      const exevoCompletionNames = source === "achievement" && definition.exevoTracked === true
        ? definition.complete && definition.complete[field]
        : [];
      result.push.apply(result, matchedEvidence(snapshot, source, exevoCompletionNames, "complete"));
      const partialTier = source === "boss" || source === "mount" ? "weak" : "partial";
      result.push.apply(result, matchedEvidence(snapshot, source, definition.partial && definition.partial[field], partialTier));
    });
    result.push.apply(result, matchedEvidence(snapshot, "creature", definition.creatures, "weak"));
    const unique = new Map();
    result.forEach((item) => {
      const key = item.source + ":" + normalizedQuestName(item.name);
      const existing = unique.get(key);
      if (!existing || (existing.tier === "partial" && item.tier === "complete")) unique.set(key, item);
    });
    return Array.from(unique.values());
  }

  function applyAuctionEvidence(profile, snapshot) {
    if (!profile || !snapshot) return;
    CATALOG.forEach((quest) => {
      if (!profile.questFlags[quest.id]) profile.questFlags[quest.id] = { status: "unknown", manualStatus: null, checkpoints: [], evidence: [] };
      const flag = profile.questFlags[quest.id];
      const freshEvidence = questEvidenceMatches(snapshot, quest);
      flag.evidence = freshEvidence;
      const inferredStatus = freshEvidence.some((item) => item.tier === "complete")
        ? "complete"
        : freshEvidence.some((item) => item.tier === "partial") ? "partial" : "unknown";
      flag.status = flag.manualStatus === null || flag.manualStatus === undefined
        ? inferredStatus
        : flag.manualStatus;

      const definition = EVIDENCE_CATALOG[quest.id] || {};
      (definition.checkpoints || []).forEach((checkpoint) => {
        const found = ["achievements", "outfits"].some((field) => {
          const source = field === "achievements" ? "achievement" : "outfit";
          return matchedEvidence(snapshot, source, checkpoint[field], "partial").length > 0;
        });
        if (found && checkpoint.index >= 0 && checkpoint.index < quest.checkpoints.length) {
          flag.checkpoints[checkpoint.index] = true;
        }
      });
    });
  }

  function applyOfficialAuction(profile, snapshot) {
    const character = snapshot.character || {};
    const metrics = snapshot.metrics || {};
    profile.name = character.name || profile.name;
    profile.level = character.level == null ? profile.level : String(character.level);
    profile.vocation = character.vocation || profile.vocation;
    profile.world = character.world || profile.world;
    profile.auctionId = String((snapshot.auction && snapshot.auction.id) || profile.auctionId || "");
    profile.auctionUrl = (snapshot.auction && snapshot.auction.url) || profile.auctionUrl;
    profile.auctionSnapshot = snapshot;
    Object.keys(profile.skills).forEach((key) => {
      const skill = snapshot.skills && snapshot.skills[key];
      if (skill && skill.level !== undefined && skill.level !== "") profile.skills[key] = String(skill.level);
    });
    if (metrics.achievementPoints !== undefined && metrics.achievementPoints !== "") {
      profile.achievementPoints = String(metrics.achievementPoints);
    }
    if (metrics.totalCharmPoints !== undefined && metrics.totalCharmPoints !== "") {
      profile.metrics.charmPoints = String(metrics.totalCharmPoints);
    }
    if (metrics.animusMasteries !== undefined && metrics.animusMasteries !== "") {
      profile.metrics.animusMasteries = String(metrics.animusMasteries);
    }
    if (metrics.imbuementsUnlocked !== undefined) profile.metrics.imbuements = String(metrics.imbuementsUnlocked);
    if (metrics.bossPoints !== undefined && metrics.bossPoints !== "") {
      profile.metrics.bossPoints = String(metrics.bossPoints);
    }
    if (metrics.weeklyTaskExpansion === "yes" || metrics.weeklyTaskExpansion === "no") {
      profile.features.weeklyTaskExpansion = metrics.weeklyTaskExpansion;
    }
    if (metrics.charmExpansion === "yes" || metrics.charmExpansion === "no") {
      profile.features.charmExpansion = metrics.charmExpansion;
    }
    if (metrics.preySlots !== undefined && metrics.preySlots !== "") {
      profile.features.preySlots = String(metrics.preySlots);
      profile.features.preySlot = Number(metrics.preySlots) > 0 ? "yes" : "no";
    }

    applyAuctionEvidence(profile, snapshot);
    profile.updatedAt = new Date().toISOString();
  }

  async function searchBazaarByName(nameValue) {
    const name = String(nameValue || byId("charName").value).trim();
    const message = byId("lookupMessage");
    if (!name) {
      message.textContent = "Digite o nome do personagem primeiro.";
      message.style.color = "#dc8c8c";
      return;
    }
    byId("charName").value = name;
    const button = byId("searchBazaarCharacter");
    button.disabled = true;
    message.textContent = "Procurando o leilão pelo nome e carregando o snapshot oficial…";
    message.style.color = "#80c8ce";
    try {
      const response = await fetch("/api/bazaar/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: name })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não encontrei esse personagem no Bazaar.");
      pendingAuctionSnapshot = result.snapshot || result;
      const snapshot = pendingAuctionSnapshot;
      const character = snapshot.character || {};
      byId("charName").value = character.name || byId("charName").value;
      byId("fieldLevel").value = character.level == null ? "" : String(character.level);
      byId("fieldVocation").value = character.vocation || "";
      byId("fieldWorld").value = character.world || "";
      byId("fieldAchievements").value = snapshot.metrics && snapshot.metrics.achievementPoints
        ? snapshot.metrics.achievementPoints
        : "";
      const questCount = snapshot.metrics ? snapshot.metrics.completedQuestLines : 0;
      const skillCount = Object.keys(snapshot.skills || {}).length;
      message.textContent = "Snapshot encontrado em " + (result.source || "Char Bazaar") + ": " + skillCount + " skills, " + questCount +
        " quest lines e dados públicos de conquistas, Bosstiary, Bestiary, outfits e montarias. Salvando no tracker…";
      message.style.color = "#a6db83";
      let profile = editingId ? state.profiles.find((item) => item.id === editingId) : null;
      if (!profile) profile = state.profiles.find((item) => item.name.toLowerCase() === character.name.toLowerCase());
      if (!profile) {
        profile = blankProfile(character.name);
        state.profiles.unshift(profile);
      }
      applyOfficialAuction(profile, snapshot);
      state.selectedId = profile.id;
      saveState();
      byId("characterDialog").close();
      switchView("overview");
      showToast("Dados do Bazaar importados e tracker atualizado para " + profile.name + ".");
      loadBazaarMonitor();
    } catch (error) {
      message.textContent = error.message || "Não consegui importar. Confira o link e se o servidor local está aberto.";
      message.style.color = "#dc8c8c";
    } finally {
      button.disabled = false;
    }
  }

  async function loadBazaarMonitor() {
    try {
      const results = await Promise.all([
        fetch("/api/bazaar/status", { headers: { "Accept": "application/json" } }),
        fetch("/api/bazaar/recent", { headers: { "Accept": "application/json" } })
      ]);
      const status = await results[0].json();
      const recent = await results[1].json();
      bazaarAuctions = Array.isArray(recent.auctions) ? recent.auctions : [];
      const statusLabel = status.status === "blocked" ? "Fonte oficial bloqueou a listagem" :
        status.status === "running" ? "Varredura em andamento" :
        status.lastSuccess ? "Última varredura concluída" : "Aguardando primeira varredura";
      const last = status.lastSuccess ? new Date(status.lastSuccess).toLocaleString("pt-BR") : "ainda não executada";
      const schedule = status.scheduleInstalled ? status.schedule : "Agendamento diário não instalado · execute install_daily_scan.ps1";
      const scanSummary = status.lastSuccess ? " · " + (status.scanned || 0) + " anúncios percorridos · " + (status.imported || 0) + " novos importados" : "";
      const error = status.error ? '<span class="monitor-error"> · ' + escapeHtml(status.error) + "</span>" : "";
      byId("bazaarMonitorStatus").innerHTML = "<strong>" + escapeHtml(statusLabel) + "</strong> · " +
        "Última varredura: " + escapeHtml(last) + escapeHtml(scanSummary) + " · " + escapeHtml(schedule || "") + error;
      byId("bazaarRecentList").innerHTML = bazaarAuctions.length ? bazaarAuctions.map((item) => {
        const auction = item.snapshot && item.snapshot.auction || {};
        const meta = [item.level ? "Level " + item.level : "", item.vocation, item.world, item.end ? "encerra " + item.end : ""]
          .filter(Boolean).join(" · ");
        return '<article class="bazaar-recent-item"><div><strong>' + escapeHtml(item.name) +
          (item.isNew ? ' <span class="tag new">NOVO</span>' : "") + '</strong><small>' + escapeHtml(meta || "Snapshot oficial salvo") +
          ' · leilão #' + escapeHtml(item.auctionId) + '</small></div><button class="text-button" data-tracked-auction="' +
          escapeHtml(item.auctionId) + '">Abrir tracker →</button></article>';
      }).join("") : '<div class="monitor-empty">Nenhum personagem monitorado ainda. Busque um nome ou rode uma varredura.</div>';
    } catch (error) {
      byId("bazaarMonitorStatus").textContent = "Não consegui consultar o monitor local. Confirme se o servidor está aberto.";
    }
  }

  async function runBazaarSync() {
    const button = byId("bazaarSyncNow");
    button.disabled = true;
    button.textContent = "Verificando…";
    byId("bazaarMonitorStatus").textContent = "Consultando a listagem oficial do Bazaar…";
    try {
      const response = await fetch("/api/bazaar/sync", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: "{}"
      });
      const result = await response.json();
      await loadBazaarMonitor();
      if (!result.ok) showToast(result.error || "A fonte oficial está indisponível.");
      else showToast("Varredura concluída: " + result.imported + " novo(s) personagem(ns).");
    } catch (error) {
      byId("bazaarMonitorStatus").textContent = error.message || "Falha ao consultar o Bazaar.";
    } finally {
      button.disabled = false;
      button.textContent = "Verificar agora";
    }
  }

  function openTrackedAuction(auctionId) {
    const item = bazaarAuctions.find((entry) => String(entry.auctionId) === String(auctionId));
    if (!item || !item.snapshot) return;
    let profile = state.profiles.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase());
    if (!profile) {
      profile = blankProfile(item.name);
      state.profiles.unshift(profile);
    }
    applyOfficialAuction(profile, item.snapshot);
    state.selectedId = profile.id;
    persistAndRender();
    openAuctionDetails(auctionId);
  }

  async function lookupPublicCharacter(name, targetProfile) {
    const searchName = (name || "").trim();
    if (!searchName) {
      byId("lookupMessage").textContent = "Digite o nome do personagem primeiro.";
      byId("lookupMessage").style.color = "#dc8c8c";
      return;
    }
    const message = byId("lookupMessage");
    message.textContent = "Consultando TibiaData…";
    message.style.color = "#80c8ce";
    const button = byId("lookupCharacter");
    button.disabled = true;
    try {
      const response = await fetch("https://api.tibiadata.com/v4/character/" + encodeURIComponent(searchName), {
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) throw new Error("A API respondeu HTTP " + response.status + ".");
      const result = await response.json();
      if (result.error) throw new Error(result.error.message || "Personagem não encontrado.");
      const character = result.character && result.character.character;
      if (!character || !character.name) throw new Error("A API não retornou essa ficha.");
      const mapped = {
        name: character.name,
        level: character.level == null ? "" : String(character.level),
        vocation: character.vocation || "",
        world: character.world || "",
        achievementPoints: character.achievement_points == null ? "" : String(character.achievement_points)
      };
      if (targetProfile) {
        Object.assign(targetProfile, mapped);
        targetProfile.updatedAt = new Date().toISOString();
        persistAndRender();
      } else {
        byId("charName").value = mapped.name;
        byId("fieldLevel").value = mapped.level;
        byId("fieldVocation").value = mapped.vocation;
        byId("fieldWorld").value = mapped.world;
        byId("fieldAchievements").value = mapped.achievementPoints;
      }
      message.textContent = "Ficha pública carregada. Skills de leilão e acessos continuam separados.";
      message.style.color = "#a6db83";
      showToast("Ficha pública atualizada para " + mapped.name + ".");
    } catch (error) {
      message.textContent = error.message || "Não consegui consultar a API. Confira o nome e tente novamente.";
      message.style.color = "#dc8c8c";
    } finally {
      button.disabled = false;
    }
  }

  function saveCharacterFromDialog(event) {
    event.preventDefault();
    const name = byId("charName").value.trim();
    if (!name) return;
    const existing = editingId ? state.profiles.find((profile) => profile.id === editingId) : null;
    const profile = existing || blankProfile(name);
    profile.name = name;
    profile.auctionUrl = byId("auctionUrl").value.trim();
    profile.level = byId("fieldLevel").value.trim();
    profile.vocation = byId("fieldVocation").value.trim();
    profile.world = byId("fieldWorld").value.trim();
    profile.achievementPoints = byId("fieldAchievements").value.trim();
    if (pendingAuctionSnapshot) applyOfficialAuction(profile, pendingAuctionSnapshot);
    profile.updatedAt = new Date().toISOString();
    if (!existing) state.profiles.unshift(profile);
    state.selectedId = profile.id;
    saveState();
    byId("characterDialog").close();
    switchView("overview");
    showToast(existing ? "Snapshot atualizado." : "Personagem adicionado à lista.");
  }

  function editMetric(profile, key, value) {
    if (key === "level" || key === "achievementPoints") profile[key] = value;
    else profile.metrics[key] = value;
    profile.updatedAt = new Date().toISOString();
    saveState();
    renderCharacterList();
    renderDashboard();
    renderQuestCatalog();
  }

  function setQuestStatus(questId, status) {
    const profile = selectedProfile();
    if (!profile || !profile.questFlags[questId]) return;
    profile.questFlags[questId].status = status;
    profile.questFlags[questId].manualStatus = status;
    profile.updatedAt = new Date().toISOString();
    persistAndRender();
  }

  function toggleCheckpoint(questId, index, isChecked) {
    const profile = selectedProfile();
    const quest = CATALOG.find((item) => item.id === questId);
    if (!profile || !quest) return;
    const saved = questFlag(profile, questId);
    saved.checkpoints[index] = isChecked;
    profile.questFlags[questId] = saved;
    profile.updatedAt = new Date().toISOString();
    persistAndRender();
  }

  function exportBackup() {
    const backup = {
      format: "bazar-atlas",
      version: 1,
      catalogVersion: "2026-10",
      exportedAt: new Date().toISOString(),
      selectedId: state.selectedId,
      profiles: state.profiles
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bazar-atlas-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast("Backup JSON exportado.");
  }

  async function importBackup(file) {
    try {
      const imported = JSON.parse(await file.text());
      const sourceProfiles = Array.isArray(imported) ? imported : imported.profiles;
      if (!Array.isArray(sourceProfiles)) throw new Error("O arquivo não tem uma lista de personagens reconhecida.");
      const profiles = sourceProfiles.map(normalizeProfile).filter((profile) => profile.name);
      if (!profiles.length) throw new Error("Não encontrei personagens válidos no arquivo.");
      const currentIds = new Set(state.profiles.map((profile) => profile.id));
      profiles.forEach((profile) => {
        if (currentIds.has(profile.id)) profile.id = newId();
        currentIds.add(profile.id);
        state.profiles.push(profile);
      });
      state.selectedId = profiles[0].id;
      persistAndRender();
      showToast(profiles.length + " personagem(ns) importado(s).");
    } catch (error) {
      showToast(error.message || "Arquivo JSON inválido.");
    } finally {
      byId("importFile").value = "";
    }
  }

  function openQuests(questId) {
    switchView("quests");
    if (!questId) return;
    const quest = CATALOG.find((item) => item.id === questId);
    if (!quest) return;
    byId("questSearch").value = quest.name;
    renderQuestCatalog();
    setTimeout(() => {
      const card = $("[data-quest-card=\"" + questId + "\"]");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  }

  function installEvents() {
    function positionHoverPanel(event) {
      const anchor = event.target.closest('.bazaar-hover-anchor, .quest-hover-wrap');
      if (!anchor) return;
      const panel = anchor.querySelector('.bazaar-hover-panel, .quest-map-popover');
      if (!panel) return;
      const bounds = anchor.getBoundingClientRect();
      const width = panel.offsetWidth || 240;
      const height = panel.offsetHeight || 210;
      panel.style.left = Math.max(8, Math.min(window.innerWidth - width - 8, bounds.left + bounds.width / 2 - width / 2)) + 'px';
      panel.style.top = Math.max(8, bounds.top >= height + 10 ? bounds.top - height - 8 : Math.min(window.innerHeight - height - 8, bounds.bottom + 8)) + 'px';
    }
    document.addEventListener('mouseover', positionHoverPanel);
    document.addEventListener('focusin', positionHoverPanel);
    $$(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
    ["addCharacterSide", "addCharacterTop", "addCharacterHero", "addCharacterEmpty"].forEach((id) => {
      const button = byId(id);
      if (button) button.addEventListener("click", () => openDialog(null));
    });
    byId("closeDialog").addEventListener("click", () => byId("characterDialog").close());
    byId("cancelDialog").addEventListener("click", () => byId("characterDialog").close());
    byId("characterForm").addEventListener("submit", saveCharacterFromDialog);
    byId("lookupCharacter").addEventListener("click", () => lookupPublicCharacter(byId("charName").value, null));
    byId("searchBazaarCharacter").addEventListener("click", () => searchBazaarByName());
    byId("bazaarRefresh").addEventListener("click", loadBazaarMonitor);
    byId("bazaarSyncNow").addEventListener("click", runBazaarSync);
    byId("auctionTypeButton").addEventListener("click", () => {
      const menu = byId("auctionTypeMenu");
      menu.hidden = !menu.hidden;
      byId("auctionTypeButton").setAttribute("aria-expanded", String(!menu.hidden));
    });
    byId("auctionTypeMenu").addEventListener("click", (event) => {
      const option = event.target.closest("[data-auction-type]");
      if (!option) return;
      listingType = option.dataset.auctionType;
      listingPage = 1;
      byId("auctionTypeButton").innerHTML = escapeHtml(listingType === "current" ? "Current auctions" : "Auction history") + " <span>⌄</span>";
      byId("auctionTypeMenu").hidden = true;
      byId("auctionTypeButton").setAttribute("aria-expanded", "false");
      loadBazaarListings(1);
    });
    byId("filterToggle").addEventListener("click", () => {
      const drawer = byId("auctionFilterDrawer");
      drawer.hidden = !drawer.hidden;
      byId("filterToggle").setAttribute("aria-expanded", String(!drawer.hidden));
    });
    byId("closeFilters").addEventListener("click", () => {
      byId("auctionFilterDrawer").hidden = true;
      byId("filterToggle").setAttribute("aria-expanded", "false");
    });
    byId("applyAuctionFilters").addEventListener("click", () => {
      listingPage = 1;
      listingFilters = listingQueryParams();
      byId("auctionFilterDrawer").hidden = true;
      byId("filterToggle").setAttribute("aria-expanded", "false");
      loadBazaarListings(1);
    });
    byId("clearAuctionFilters").addEventListener("click", () => {
      byId("auctionFilterDrawer").querySelectorAll("input").forEach((input) => {
        if (input.type === "checkbox") input.checked = false;
        else input.value = "";
      });
      ["filterLevelMin", "filterCharmMin"].forEach((id) => { byId(id).value = "0"; });
      ["filterLevelMax"].forEach((id) => { byId(id).value = "3000"; });
      ["filterSkillMin"].forEach((id) => { byId(id).value = "10"; });
      ["filterSkillMax"].forEach((id) => { byId(id).value = "150"; });
      ["filterCharmMax"].forEach((id) => { byId(id).value = "50000"; });
      ["filterVocation", "filterPvp", "filterBattlEye", "filterLocation", "filterSkill", "filterImbuements", "filterQuest"].forEach((id) => { byId(id).value = ""; });
      byId("sortAscending").checked = false;
      document.querySelector('input[name="auctionSort"][value="end"]').checked = true;
      byId("sortLabel").textContent = "Auction End";
      listingFilters = {};
      document.querySelectorAll('.cosmetic-filter-tile').forEach(tile=>{tile.hidden=false;const image=tile.querySelector('img');image.src=image.src.replace('/female/','/male/');});
      renderActiveFilters();
      if (!suppressFilterReload) loadBazaarListings(1);
    });
    byId("sortToggle").addEventListener("click", () => {
      const menu = byId("sortMenu");
      menu.hidden = !menu.hidden;
      byId("sortToggle").setAttribute("aria-expanded", String(!menu.hidden));
    });
    byId("sortMenu").addEventListener("change", () => {
      const selected = document.querySelector('input[name="auctionSort"]:checked');
      byId("sortLabel").textContent = selected && selected.value === "level" ? "Level" : selected && selected.value === "price" ? "Price" : "Auction End";
      listingPage = 1;
      listingFilters = listingQueryParams();
      loadBazaarListings(1);
    });
    [["firstPage", 1], ["previousPage", -1], ["nextPage", 1], ["lastPage", -1]].forEach(([id, offset]) => {
      byId(id).addEventListener("click", () => {
        const next = id === "firstPage" ? 1 : id === "lastPage" ? listingTotalPages : listingPage + offset;
        if (next >= 1 && next <= listingTotalPages) loadBazaarListings(next);
      });
    });
    byId("monitorOpen").addEventListener("click", () => {
      byId("monitorDetails").open = true;
      byId("monitorDetails").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    byId("closeAuctionDetails").addEventListener("click", () => byId("auctionDetailsDialog").close());
    byId("auctionDetailsBody").addEventListener("click", (event) => {
      const tracker = event.target.closest("[data-track-auction]");
      if (tracker) {
        trackAuctionAccess(tracker.dataset.trackAuction, tracker.dataset.trackName);
        return;
      }
      const tab = event.target.closest("[data-cosmetic-tab]");
      if (!tab || !activeDetailSnapshot) return;
      activeCosmeticTab = tab.dataset.cosmeticTab;
      renderAuctionDetails(activeDetailSnapshot, (activeDetailSnapshot.auction || {}).id || "");
    });
    byId("editCharacter").addEventListener("click", () => {
      const profile = selectedProfile();
      if (profile) openDialog(profile);
    });
    byId("deleteCharacter").addEventListener("click", () => {
      const profile = selectedProfile();
      if (!profile) return;
      if (!window.confirm("Remover " + profile.name + " e os estados salvos deste personagem?")) return;
      state.profiles = state.profiles.filter((item) => item.id !== profile.id);
      state.selectedId = state.profiles[0] ? state.profiles[0].id : null;
      persistAndRender();
      showToast("Personagem removido.");
    });
    byId("refreshPublicProfile").addEventListener("click", () => {
      const profile = selectedProfile();
      if (profile) lookupPublicCharacter(profile.name, profile);
    });
    byId("exportButton").addEventListener("click", exportBackup);
    byId("importButton").addEventListener("click", () => byId("importFile").click());
    byId("importFile").addEventListener("change", (event) => {
      if (event.target.files && event.target.files[0]) importBackup(event.target.files[0]);
    });
    let nicknameTimer;
    const applyNicknameSearch = () => {
      byId('filterNickname').value = byId('globalSearch').value.trim();
      renderActiveFilters();
      loadBazaarListings(1);
    };
    byId('globalSearch').addEventListener('input', () => {
      if (activeView !== 'overview') return;
      clearTimeout(nicknameTimer);
      nicknameTimer = setTimeout(applyNicknameSearch, 300);
    });
    byId("globalSearch").addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      if (activeView === 'overview') {
        event.preventDefault();
        clearTimeout(nicknameTimer);
        applyNicknameSearch();
        return;
      }
      const query = event.currentTarget.value.trim().toLowerCase();
      const profile = state.profiles.find((item) => item.name.toLowerCase().includes(query));
      if (profile) {
        state.selectedId = profile.id;
        persistAndRender();
        switchView("overview");
        return;
      }
      if (query) {
        const quest = CATALOG.find((item) => item.name.toLowerCase().includes(query));
        if (quest) {
          switchView("quests");
          byId("questSearch").value = event.currentTarget.value;
          renderQuestCatalog();
        } else {
          openDialog(null);
          byId("charName").value = event.currentTarget.value.trim();
          searchBazaarByName(event.currentTarget.value);
        }
      }
    });
    byId("questSearch").addEventListener("input", renderQuestCatalog);
    byId("filterChips").addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter;
      $$(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
      renderQuestCatalog();
    });
    byId("catalogSort").addEventListener("click", () => {
      sortByPriority = !sortByPriority;
      byId("catalogSort").textContent = sortByPriority ? "Prioridade ↓" : "Nome A–Z";
      renderQuestCatalog();
    });
    byId("auctionGrid").addEventListener("click", (event) => {
      if (event.target.closest("#retryListings")) { loadBazaarListings(listingPage); return; }
      const menuToggle = event.target.closest("[data-menu-toggle]");
      if (menuToggle) {
        const card = menuToggle.closest(".auction-card");
        const menu = card && card.querySelector(".auction-context-menu");
        const opening = menu && menu.hidden;
        $$(".auction-context-menu").forEach((item) => { item.hidden = true; });
        $$("[data-menu-toggle]").forEach((item) => item.setAttribute("aria-expanded", "false"));
        if (menu) { menu.hidden = !opening; menuToggle.setAttribute("aria-expanded", String(opening));
          menu.style.top='36px';menu.style.bottom='auto';
          if(opening&&menu.getBoundingClientRect().bottom>window.innerHeight-8){menu.style.top='auto';menu.style.bottom='32px';}
        }
        return;
      }
      const action = event.target.closest("[data-auction-action]");
      if (action) { action.closest(".auction-context-menu").hidden = true; action.closest(".auction-card").querySelector("[data-menu-toggle]").setAttribute("aria-expanded", "false"); handleAuctionAction(action); return; }
      const tracker = event.target.closest("[data-track-auction]");
      if (tracker) { trackAuctionAccess(tracker.dataset.trackAuction, tracker.dataset.trackName); return; }
      const details = event.target.closest("[data-auction-details]");
      if (details) { event.preventDefault(); openAuctionDetails(details.dataset.auctionDetails); return; }
      const cosmetic = event.target.closest("[data-detail-tab]");
      if (cosmetic) { openAuctionDetails(cosmetic.dataset.id, cosmetic.dataset.detailTab); return; }
      const questMap = event.target.closest("[data-quest-map]");
      if (questMap) {
        const popover = questMap.closest(".quest-hover-wrap") || questMap.closest(".auction-card")?.querySelector(".quest-hover-wrap");
        if (popover) popover.classList.toggle("open");
      }
    });
    document.addEventListener("click", (event) => {
      const viewButton = event.target.closest("[data-view]");
      if (viewButton) { switchView(viewButton.dataset.view); return; }
      if (!event.target.closest(".auction-menu-wrap")) {
        $$(".auction-context-menu").forEach((menu) => { menu.hidden = true; });
        $$("[data-menu-toggle]").forEach((button) => button.setAttribute("aria-expanded", "false"));
      }
      if (!event.target.closest(".sort-toggle") && !event.target.closest(".sort-menu")) {
        byId("sortMenu").hidden = true;
        byId("sortToggle").setAttribute("aria-expanded", "false");
      }
      if (!event.target.closest(".auction-type-wrap")) {
        byId("auctionTypeMenu").hidden = true;
        byId("auctionTypeButton").setAttribute("aria-expanded", "false");
      }
      const profileButton = event.target.closest("[data-profile]");
      if (profileButton) {
        state.selectedId = profileButton.dataset.profile;
        persistAndRender();
        switchView("overview");
        return;
      }
      const questButton = event.target.closest("[data-open-quests]");
      if (questButton) openQuests(questButton.dataset.findQuest || "");
      const trackedButton = event.target.closest("[data-tracked-auction]");
      if (trackedButton) openTrackedAuction(trackedButton.dataset.trackedAuction);
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.name === "auctionSort" || target.id === "sortAscending") return;
      if (target.closest("#auctionFilterDrawer")) return;
      const profile = selectedProfile();
      if (!profile) return;
      if (target.dataset.metric) {
        editMetric(profile, target.dataset.metric, target.value);
      } else if (target.dataset.profileField) {
        editMetric(profile, target.dataset.profileField, target.value);
      } else if (target.dataset.skill) {
        profile.skills[target.dataset.skill] = target.value;
        profile.updatedAt = new Date().toISOString();
        saveState();
        renderSkills(profile);
      } else if (target.id === "highlightInput") {
        profile.highlights = target.value;
        profile.updatedAt = new Date().toISOString();
        saveState();
        renderSnapshotExtras(profile);
      } else if (target.dataset.feature) {
        profile.features[target.dataset.feature] = target.value;
        profile.updatedAt = new Date().toISOString();
        saveState();
      } else if (target.dataset.statusQuest) {
        setQuestStatus(target.dataset.statusQuest, target.value);
      } else if (target.dataset.checkpoint !== undefined) {
        toggleCheckpoint(target.dataset.quest, Number(target.dataset.checkpoint), target.checked);
      }
    });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        byId("globalSearch").focus();
      }
      if (event.key === "Escape" && byId("characterDialog").open) byId("characterDialog").close();
      if (event.key === "Escape" && byId("auctionDetailsDialog").open) byId("auctionDetailsDialog").close();
    });
  }

  async function prepareCosmeticPickers(){
    try{
      const response=await fetch('/reference_cosmetics.json');if(!response.ok)return;const catalog=await response.json();
      for(const details of document.querySelectorAll('#auctionFilterDrawer .filter-accordion')){
        const search=details.querySelector('[data-cosmetic-filter]');if(!search)continue;const section=search.dataset.cosmeticFilter;
        search.removeAttribute('data-cosmetic-filter');search.dataset.cosmeticSearch=section;search.placeholder="e.g., '"+(section.includes('Outfit')?'Golden Outfit':'Draptor')+"'";
        const title=document.createElement('label');title.className='cosmetic-search-label';title.textContent='Search by name';details.insertBefore(title,search);
        const count=document.createElement('b');count.className='cosmetic-selection-count';count.dataset.cosmeticCount=section;count.hidden=true;details.querySelector('summary').append(count);
        if(section.includes('Outfit')){const options=document.createElement('div');options.className='cosmetic-picker-options';options.innerHTML='<label>Male <input type="checkbox" role="switch" data-cosmetic-gender="'+section+'"> Female</label>'+(section==='Outfits'?'<label><input data-required-addon="1" type="checkbox">Addon 1</label><label><input data-required-addon="2" type="checkbox">Addon 2</label>':'');details.append(options);}
        const grid=document.createElement('div');grid.className='cosmetic-picker-grid';
        grid.innerHTML=(catalog[section]||[]).map(item=>'<label class="cosmetic-filter-tile" title="'+escapeHtml(item.name)+'"><input type="checkbox" data-cosmetic-choice="'+section+'" value="'+escapeHtml(item.name)+'">'+spriteImage(item.image,item.name,'character',true)+'</label>').join('');details.append(grid);
      }
    }catch(error){}
  }

  const FILTER_GROUPS = {
    filterVocation: [['1','None','rook'],['3','Knight','knight'],['4','Paladin','paladin'],['5','Sorcerer','sorcerer'],['2','Druid','druid'],['6','Monk','monk']],
    filterPvp: [['1','Optional','dove'],['0','Open','whiteSkull'],['3','Retro Open','orangeSkull'],['2','Hardcore','redSkull'],['4','Retro Hardcore','blackSkull']],
    filterBattlEye: [['1','Green','greenbattleye'],['2','Yellow','yellowbattleye']],
    filterLocation: [['EU','EU','eu-flag'],['NA','NA','na-flag'],['BR','BR','br-flag'],['OCE','OCE','oce-flag']]
  };
  function filterGroupValues(id) { return [...byId(id).selectedOptions].map(o=>o.value).filter(Boolean); }
  function renderActiveFilters() {
    if (activeView === 'overview') byId('globalSearch').value = byId('filterNickname').value;
    const tags = [];
    const add = (label, target, value='', image='') => tags.push('<button class="active-auction-filter" data-remove-filter="' + escapeHtml(target) + '" data-remove-value="' + escapeHtml(value) + '">' + (image ? '<img src="https://assets.service-exevopan.com/public/assets/' + image + '.png" alt="">' : '') + escapeHtml(label) + '<span>×</span></button>');
    for (const [id, options] of Object.entries(FILTER_GROUPS)) {
      const selected = filterGroupValues(id);
      for (const [value,label,image] of options) {
        const input = document.querySelector('[data-filter-group="' + id + '"][value="' + value + '"]');
        if (input) input.checked = selected.includes(value);
        if (selected.includes(value)) add(label,id,value,image);
      }
    }
    byId('auctionFilterDrawer').querySelectorAll('input:not([data-filter-group]):not([data-cosmetic-search]):not([data-cosmetic-gender]),select:not([multiple])').forEach(input => {
      if (!input.id && !input.dataset.storeFilter && !input.dataset.miscFilter && !input.dataset.cosmeticFilter && !input.dataset.skillChoice && !input.dataset.cosmeticChoice && !input.dataset.requiredAddon) return;
      if (input.type === 'checkbox' && !input.checked) return;
      const defaults = {filterLevelMin:'0',filterLevelMax:'3000',filterSkillMin:'10',filterSkillMax:'150',filterCharmMin:'0',filterCharmMax:'50000'};
      if (input.type !== 'checkbox' && (!input.value || input.value === defaults[input.id])) return;
      if(input.dataset.cosmeticChoice){add(input.value,'choice:'+input.dataset.cosmeticChoice,input.value);return;}
      if(input.dataset.requiredAddon){add('Addon '+input.dataset.requiredAddon,'addon:'+input.dataset.requiredAddon);return;}
      const target = input.id || (input.dataset.storeFilter ? 'store:' + input.dataset.storeFilter : input.dataset.miscFilter ? 'misc:' + input.dataset.miscFilter : input.dataset.skillChoice ? 'skill:' + input.dataset.skillChoice : 'cosmetic:' + input.dataset.cosmeticFilter);
      const label = ({filterLevelMin:'📏 Min level',filterLevelMax:'📏 Max level',filterSkillMin:'Min skill',filterSkillMax:'Max skill',filterCharmMin:'Min charm points',filterCharmMax:'Max charm points'})[input.id] || input.closest('label')?.textContent.trim() || input.closest('fieldset')?.querySelector('legend')?.textContent || input.closest('details')?.querySelector('summary')?.textContent || input.placeholder || input.id;
      add(label + (input.type === 'checkbox' ? '' : ': ' + (input.type==='number'?Number(input.value).toLocaleString('en-US'):input.value)),target);
    });
    document.querySelectorAll('[data-cosmetic-count]').forEach(badge=>{const count=document.querySelectorAll('[data-cosmetic-choice="'+badge.dataset.cosmeticCount+'"]:checked').length;badge.textContent=count;badge.hidden=count===0;});
    byId('activeAuctionFilters').innerHTML = tags.join('');
    const count = Object.keys(FILTER_GROUPS).filter(id=>filterGroupValues(id).length).length + tags.filter(t=>!t.includes('data-remove-value="') || t.includes('data-remove-value=""')).length;
    byId('activeFilterCount').hidden = count === 0;
    byId('activeFilterCount').textContent = count;
  }
  function prepareReferenceFilters() {
    const drawer = byId('auctionFilterDrawer');
    byId('filterToggle').querySelector('span').outerHTML=cardIcon('filter');byId('sortToggle').querySelector('span').outerHTML=cardIcon('sort');
    const head = drawer.querySelector('.filter-drawer-head'), footer = drawer.querySelector('.filter-drawer-actions');
    const content = document.createElement('div'); content.className = 'filter-scroll-content';
    [...drawer.children].filter(e=>e!==head&&e!==footer).forEach(e=>content.append(e));
    drawer.insertBefore(content,footer);
    head.insertBefore(byId('closeFilters'),head.firstChild); byId('closeFilters').textContent='←';
    head.append(byId('clearAuctionFilters')); byId('clearAuctionFilters').textContent='RESET FILTERS';
    const applyButton = byId("applyAuctionFilters");
    footer.innerHTML='<span>Bazar Atlas</span>'; footer.append(applyButton);
    content.prepend(byId('filterBidded').closest('label'));
    byId('filterNickname').placeholder='Nickname';byId('filterWorld').placeholder='Choose a server';
    for(const [id,unit] of [['filterLevelMin','Min level'],['filterLevelMax','Max level'],['filterSkillMin','Min skill'],['filterSkillMax','Max skill'],['filterCharmMin','Min charm points'],['filterCharmMax','Max charm points']]){const input=byId(id),label=input.closest('label');if(label.firstChild?.nodeType===3)label.firstChild.textContent=unit;}
    for(const id of ['filterLevelMin','filterSkillMin','filterCharmMin'])byId(id).closest('fieldset')?.querySelector('legend')?.remove();
    byId('filterSkill').hidden=true;
    for (const [id, options] of Object.entries(FILTER_GROUPS)) {
      const select=byId(id); select.multiple=true; select.hidden=true;
      select.innerHTML=options.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('');
      const group=document.createElement('div'); group.className='reference-filter-pills';
      group.innerHTML=options.map(([value,label,image])=>'<label><input type="checkbox" data-filter-group="'+id+'" value="'+value+'"><img src="https://assets.service-exevopan.com/public/assets/'+image+'.png" alt="">'+label+'</label>').join('');
      select.after(group);
    }
    const chips=document.createElement('div');chips.id='activeAuctionFilters';byId('auctionTypeButton').parentElement.after(chips);
    const overlay=document.createElement('button');overlay.id='filterBackdrop';overlay.hidden=true;overlay.setAttribute('aria-label','Close filters');document.body.append(overlay);
    let timer;
    drawer.addEventListener('change',event=>{
      if(event.target.dataset.cosmeticSearch)return;
      if(event.target.dataset.cosmeticGender){const section=event.target.dataset.cosmeticGender;document.querySelectorAll('[data-cosmetic-choice="'+section+'"]').forEach(input=>{const image=input.parentElement.querySelector('img');image.src=image.src.replace(/\/(male|female)\//,'/'+(event.target.checked?'female':'male')+'/');});return;}
      if(event.target.dataset.filterGroup){const select=byId(event.target.dataset.filterGroup);[...select.options].find(o=>o.value===event.target.value).selected=event.target.checked;}
      renderActiveFilters();clearTimeout(timer);timer=setTimeout(()=>loadBazaarListings(1),180);
    });
    drawer.addEventListener('input',event=>{if(event.target.dataset.cosmeticSearch){const section=event.target.dataset.cosmeticSearch;document.querySelectorAll('[data-cosmetic-choice="'+section+'"]').forEach(input=>input.parentElement.hidden=!input.value.toLowerCase().includes(event.target.value.toLowerCase()));return;}if(event.target.type==='checkbox')return;renderActiveFilters();clearTimeout(timer);timer=setTimeout(()=>loadBazaarListings(1),400);});
    chips.addEventListener('click',event=>{
      const tag=event.target.closest('[data-remove-filter]');if(!tag)return;
      const id=tag.dataset.removeFilter;
      if(FILTER_GROUPS[id]) [...byId(id).options].find(o=>o.value===tag.dataset.removeValue).selected=false;
      else if(id.startsWith('choice:')){document.querySelectorAll('[data-cosmetic-choice="'+id.slice(7)+'"]').forEach(input=>{if(input.value===tag.dataset.removeValue)input.checked=false;});}
      else if(id.startsWith('addon:')){document.querySelector('[data-required-addon="'+id.slice(6)+'"]').checked=false;}
      else {const [type,value]=id.split(':');const input=byId(id)||document.querySelector(type==='store'?'[data-store-filter="'+value+'"]':type==='misc'?'[data-misc-filter="'+value+'"]':type==='skill'?'[data-skill-choice="'+value+'"]':'[data-cosmetic-filter="'+value+'"]');if(input){if(input.type==='checkbox')input.checked=false;else input.value=({filterLevelMin:0,filterLevelMax:3000,filterSkillMin:10,filterSkillMax:150,filterCharmMin:0,filterCharmMax:50000})[id]??'';}}
      renderActiveFilters();loadBazaarListings(1);
    });
    const observer=new MutationObserver(()=>{overlay.hidden=drawer.hidden;document.body.classList.toggle('filters-open',!drawer.hidden);});observer.observe(drawer,{attributes:true,attributeFilter:['hidden']});
    overlay.addEventListener('click',()=>byId('closeFilters').click());
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){byId('closeFilters').click();byId('sortMenu').hidden=true;byId('sortToggle').setAttribute('aria-expanded','false');document.querySelectorAll('.auction-context-menu').forEach(menu=>menu.hidden=true);document.querySelectorAll('[data-menu-toggle]').forEach(button=>button.setAttribute('aria-expanded','false'));}});
  }

  function init() {
    CATALOG.forEach((quest) => {
      const option = document.createElement("option");
      option.value = quest.name;
      byId("filterQuest").appendChild(option);
    });
    prepareReferenceFilters();
    prepareCosmeticPickers();
    byId("closeAuctionTool").onclick=closeAuctionTool;
    byId("auctionToolDialog").addEventListener("click", event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeAuctionTool();}});
    installEvents();
    renderAll();
    restoreServerReminders();
    setInterval(refreshLocalDatabase,30000);
    setInterval(checkAuctionReminders, 15000);
    setInterval(refreshBidReminders, 60000);
    setInterval(updateAuctionClocks, 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) updateAuctionClocks(); });
    const auctionToOpen = new URLSearchParams(window.location.search).get("auction");
    loadBazaarListings(1);
    loadBazaarMonitor().then(() => {
      if (auctionToOpen) {
        if (bazaarAuctions.some((entry) => String(entry.auctionId) === String(auctionToOpen))) openTrackedAuction(auctionToOpen);
        else openAuctionDetails(auctionToOpen);
      }
    });
    const questView = new URLSearchParams(window.location.search).get("view");
    if (questView === "quests") switchView("quests");
  }

  init();
})();
