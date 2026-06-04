const DATA = window.FOOTBALLDAY_DATA || { generatedAt: null, articles: [], feeds: [] };

const CATEGORIES = [
  ["all", "전체"],
  ["transfer", "이적"],
  ["worldcup", "월드컵"],
  ["ucl", "UCL"],
  ["league", "리그"],
  ["ratings", "평점"],
  ["issue", "이슈"]
];

const transferSignals = [
  {
    title: "Ederson -> Manchester United",
    meta: "Atalanta / midfield",
    value: 86,
    text: "잉글랜드 주요 보도에서 합의 단계로 다뤄진 중원 보강 카드입니다."
  },
  {
    title: "Ibrahima Konate -> Real Madrid",
    meta: "Liverpool / centre-back",
    value: 68,
    text: "레알의 수비 재편과 맞물려 계속 거론되는 대형 수비수 루머입니다."
  },
  {
    title: "Ansu Fati -> Monaco",
    meta: "Barcelona / forward",
    value: 78,
    text: "커리어 재시동 성격이 강한 Ligue 1 행선지로 묶이고 있습니다."
  }
];

const playerRadar = [
  {
    name: "Lamine Yamal",
    meta: "Barcelona / Spain",
    value: 94,
    text: "라리가와 UCL 평점 최상단에 동시에 오른 이번 주 가장 강한 포텐 신호입니다."
  },
  {
    name: "Michael Olise",
    meta: "Bayern / France",
    value: 91,
    text: "분데스리가 시즌상 흐름과 TOP5 통합 평점 XI가 동시에 붙었습니다."
  },
  {
    name: "Nico Paz",
    meta: "Como / Argentina",
    value: 89,
    text: "세리에A 시장가치 상승과 시즌 XI 진입으로 스카우팅 주목도가 커졌습니다."
  }
];

const bestElevens = {
  ucl: {
    label: "UCL",
    title: "UEFA Champions League 2025/26",
    formation: "3-4-3",
    source: "Sofascore UCL season XI",
    notes: [
      "야말 8.08, 음바페 8.05, 케인 7.93이 공격진의 핵심입니다.",
      "PSG 우승 서사는 크바라츠헬리아와 비티냐의 포함으로 이어집니다.",
      "아스널은 라야와 가브리엘이 수비 안정성 지표로 들어왔습니다."
    ],
    lines: [
      [{ pos: "ST", name: "Harry Kane", club: "Bayern", rating: "7.93" }],
      [
        { pos: "LW", name: "K. Kvaratskhelia", club: "PSG", rating: "7.71" },
        { pos: "FWD", name: "Kylian Mbappe", club: "Real Madrid", rating: "8.05" },
        { pos: "RW", name: "Lamine Yamal", club: "Barcelona", rating: "8.08" }
      ],
      [
        { pos: "MID", name: "Vitinha", club: "PSG", rating: "7.58" },
        { pos: "MID", name: "D. Szoboszlai", club: "Liverpool", rating: "7.53" },
        { pos: "RW", name: "Michael Olise", club: "Bayern", rating: "7.61" }
      ],
      [
        { pos: "CB", name: "Virgil van Dijk", club: "Liverpool", rating: "7.43" },
        { pos: "CB", name: "Goncalo Inacio", club: "Sporting CP", rating: "7.22" },
        { pos: "CB", name: "Gabriel", club: "Arsenal", rating: "7.18" }
      ],
      [{ pos: "GK", name: "David Raya", club: "Arsenal", rating: "7.37" }]
    ]
  },
  europe: {
    label: "TOP5",
    title: "Europe Top 5 Leagues 2025/26",
    formation: "3-2-4-1",
    source: "Sofascore Top 5 leagues XI",
    notes: [
      "Bayern은 케인, 올리세, 키미히로 최다 배출 클럽입니다.",
      "야말은 7.93으로 통합 XI 최고 평점입니다.",
      "로빈 바츠와 마리오 부슈코비치는 데이터 기반 픽의 의외성을 보여줍니다."
    ],
    lines: [
      [{ pos: "ST", name: "Harry Kane", club: "Bayern", rating: "7.84" }],
      [
        { pos: "LW", name: "Yan Diomande", club: "RB Leipzig", rating: "7.72" },
        { pos: "AM", name: "Bruno Fernandes", club: "Man United", rating: "7.61" },
        { pos: "RW", name: "Michael Olise", club: "Bayern", rating: "7.87" },
        { pos: "RW", name: "Lamine Yamal", club: "Barcelona", rating: "7.93" }
      ],
      [
        { pos: "CM", name: "Manuel Locatelli", club: "Juventus", rating: "7.72" },
        { pos: "CM", name: "Joshua Kimmich", club: "Bayern", rating: "7.71" }
      ],
      [
        { pos: "CB", name: "N. Schlotterbeck", club: "Dortmund", rating: "7.67" },
        { pos: "CB", name: "Marc Guehi", club: "Man City", rating: "7.30" },
        { pos: "CB", name: "Mario Vuskovic", club: "HSV", rating: "7.28" }
      ],
      [{ pos: "GK", name: "Robin Batz", club: "Mainz", rating: "7.42" }]
    ]
  },
  premier: {
    label: "EPL",
    title: "Premier League 2025/26",
    formation: "4-3-3",
    source: "Fan XI + Opta/Sofascore cross-check",
    notes: [
      "아스널 우승팀 수비 코어가 강하게 반영됐습니다.",
      "브루노 페르난데스는 21도움으로 창의성 지표의 중심입니다.",
      "홀란, 이고르 티아고, 사카가 득점과 영향도 서사를 나눕니다."
    ],
    lines: [
      [{ pos: "ST", name: "Erling Haaland", club: "Man City", rating: "27G" }],
      [
        { pos: "LW", name: "Antoine Semenyo", club: "Man City", rating: "Fan XI" },
        { pos: "ST", name: "Igor Thiago", club: "Brentford", rating: "Fan XI" },
        { pos: "RW", name: "Bukayo Saka", club: "Arsenal", rating: "7.24" }
      ],
      [
        { pos: "CM", name: "Declan Rice", club: "Arsenal", rating: "7.46" },
        { pos: "AM", name: "Bruno Fernandes", club: "Man United", rating: "7.61" },
        { pos: "CM", name: "D. Szoboszlai", club: "Liverpool", rating: "Fan XI" }
      ],
      [
        { pos: "RB", name: "Jurrien Timber", club: "Arsenal", rating: "Fan XI" },
        { pos: "CB", name: "William Saliba", club: "Arsenal", rating: "Opta" },
        { pos: "CB", name: "Gabriel", club: "Arsenal", rating: "7.27" },
        { pos: "LB", name: "Nico O'Reilly", club: "Man City", rating: "Fan XI" }
      ],
      [{ pos: "GK", name: "David Raya", club: "Arsenal", rating: "Fan XI" }]
    ]
  }
};

const state = {
  category: "all",
  search: "",
  xi: "ucl"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "날짜 없음", full: "날짜 없음" };
  return {
    day: new Intl.DateTimeFormat("ko-KR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("ko-KR", { month: "short" }).format(date),
    full: new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date)
  };
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("footballday-theme", theme);
  document.querySelector(".theme-label").textContent = theme === "dark" ? "Light" : "Dark";
}

function initTheme() {
  const requested = new URLSearchParams(window.location.search).get("theme");
  if (requested === "dark" || requested === "light") {
    setTheme(requested);
    return;
  }
  const saved = localStorage.getItem("footballday-theme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(saved || preferred);
}

function articleMatches(article) {
  const haystack = [
    article.title,
    article.summary,
    article.source,
    article.category,
    article.region,
    ...(article.tags || [])
  ]
    .join(" ")
    .toLowerCase();
  const categoryOk = state.category === "all" || article.category === state.category;
  const searchOk = !state.search || haystack.includes(state.search.toLowerCase());
  return categoryOk && searchOk;
}

function renderCategoryTabs() {
  document.querySelector("#category-tabs").innerHTML = CATEGORIES.map(
    ([value, label]) => `
      <button class="tab ${state.category === value ? "is-active" : ""}" type="button" data-category="${value}">
        ${label}
      </button>
    `
  ).join("");
}

function renderArticles() {
  const articles = [...DATA.articles]
    .filter(articleMatches)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const container = document.querySelector("#article-list");
  if (!articles.length) {
    container.innerHTML = `<div class="empty">조건에 맞는 기사가 없습니다.</div>`;
    return;
  }

  container.innerHTML = articles
    .map((article) => {
      const date = formatDate(article.publishedAt);
      return `
        <article class="article-card">
          <div class="date-box">
            <span>${escapeHtml(date.month)}</span>
            <strong>${escapeHtml(date.day)}</strong>
            <span>${escapeHtml(article.source)}</span>
          </div>
          <div class="article-body">
            <div class="article-meta">
              <span class="article-category">${escapeHtml(categoryLabel(article.category))}</span>
              <span>${escapeHtml(article.region || "global")}</span>
              <span>${escapeHtml(date.full)}</span>
            </div>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.summary)}</p>
            <div class="article-actions">
              <a class="read-link" href="${escapeHtml(article.url)}" target="_blank" rel="noreferrer">원문 읽기</a>
              <div class="article-tags">
                ${(article.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function categoryLabel(value) {
  const match = CATEGORIES.find(([key]) => key === value);
  return match ? match[1] : value;
}

function renderSignals() {
  document.querySelector("#transfer-signals").innerHTML = transferSignals
    .map(
      (signal) => `
        <article class="signal-item">
          <div class="signal-meta">
            <span>${escapeHtml(signal.meta)}</span>
            <span>${signal.value}%</span>
          </div>
          <h3>${escapeHtml(signal.title)}</h3>
          <p>${escapeHtml(signal.text)}</p>
          <div class="progress" aria-label="진행도 ${signal.value}">
            <span style="--value: ${signal.value}%"></span>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelector("#player-radar").innerHTML = playerRadar
    .map(
      (player) => `
        <article class="radar-item">
          <div class="signal-meta">
            <span>${escapeHtml(player.meta)}</span>
            <span>${player.value}</span>
          </div>
          <h3>${escapeHtml(player.name)}</h3>
          <p>${escapeHtml(player.text)}</p>
          <div class="progress" aria-label="포텐 지수 ${player.value}">
            <span style="--value: ${player.value}%"></span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderXiTabs() {
  document.querySelector("#xi-tabs").innerHTML = Object.entries(bestElevens)
    .map(
      ([key, xi]) => `
        <button class="tab ${state.xi === key ? "is-active" : ""}" type="button" data-xi="${key}" role="tab">
          ${escapeHtml(xi.label)}
        </button>
      `
    )
    .join("");
}

function renderXi() {
  const xi = bestElevens[state.xi];
  document.querySelector("#pitch").innerHTML = xi.lines
    .map(
      (line) => `
        <div class="pitch-line">
          ${line
            .map(
              (player) => `
                <div class="xi-player">
                  <strong>${escapeHtml(player.name)}</strong>
                  <span>${escapeHtml(player.pos)} / ${escapeHtml(player.rating)}</span>
                  <span>${escapeHtml(player.club)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      `
    )
    .join("");

  document.querySelector("#xi-summary").innerHTML = `
    <p class="kicker">${escapeHtml(xi.source)}</p>
    <h3>${escapeHtml(xi.title)}</h3>
    <p>${escapeHtml(xi.formation)}</p>
    <ul>${xi.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
  `;
}

function renderSources() {
  document.querySelector("#source-list").innerHTML = DATA.feeds
    .map(
      (feed) => `
        <a class="source-card" href="${escapeHtml(feed.homepage || feed.url)}" target="_blank" rel="noreferrer">
          <strong>${escapeHtml(feed.name)}</strong>
          <span>${escapeHtml(feed.region)} / ${escapeHtml(categoryLabel(feed.category))}</span>
        </a>
      `
    )
    .join("");
}

function bindEvents() {
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  document.querySelector("#search").addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    renderArticles();
  });

  document.querySelector("#category-tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    renderCategoryTabs();
    renderArticles();
  });

  document.querySelector("#xi-tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-xi]");
    if (!button) return;
    state.xi = button.dataset.xi;
    renderXiTabs();
    renderXi();
  });
}

function renderMeta() {
  const formatted = DATA.generatedAt ? formatDate(DATA.generatedAt).full : "업데이트 정보 없음";
  document.querySelector("#updated-at").textContent = formatted;
  const topSource = DATA.articles[0]?.source || "FootballDay Desk";
  document.querySelector("#lead-source").textContent = topSource;
}

initTheme();
renderMeta();
renderCategoryTabs();
renderArticles();
renderSignals();
renderXiTabs();
renderXi();
renderSources();
bindEvents();
