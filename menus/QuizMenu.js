class QuizMenu extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div id="game-viewport">
  <header>
  <div class="header-left">
  <svg class="logo-icon" viewbox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"></path></svg>
  <h1>BLITZ4U</h1>
  </div>

  <!-- HOME BUTTON ADDED -->
  <div class="header-right">
    <button class="home-btn" id="quiz-menu-home-btn">Home</button>
  </div>

  </header>
  <main>
  <button class="import-btn">
  <div style="display:flex; align-items:center; gap:12px;">
  <svg fill="#81b64c" height="20" viewbox="0 0 24 24" width="20"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z"></path></svg>
  <span style="font-weight:800; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Import Custom Set (Coming Soon)</span>
  </div>
  <svg fill="#8c9381" height="20" viewbox="0 0 24 24" width="20"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
  </button>
  <div class="section-label">
  <div class="section-label-line"></div>
  <span class="section-label-text">Select Question Set (you can scroll down!)</span>
  </div>
  <div class="quiz-item">
  <div class="quiz-content">
  <div class="quiz-thumb"><img src="../src/sprites/trig_id.png"/></div>
  <div>
  <div class="quiz-title">Trig Identities</div>
  <div class="quiz-meta">MHF4U • Trigonometry Part 2</div>
  </div>
  </div>
  <button class="select-btn disabled" data-quiz="1">Select</button>
  </div>
  <div class="quiz-item">
  <div class="quiz-content">
  <div class="quiz-thumb"><img src="../src/sprites/solubility.png"/></div>
  <div>
  <div class="quiz-title">Solubility Theory Quiz</div>
  <div class="quiz-meta">SCH4U • Solubility</div>
  </div>
  </div>
  <button class="select-btn" data-quiz="2">Select</button>
  </div>
  <div class="quiz-item">
  <div class="quiz-content">
  <div class="quiz-thumb"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWqOlm8iOWIrUz1yhVX3VdGfLG7bz7lPSwCtq0c4Rn5Vi0svdQ0dKWURaHHarSzU7fovGoFLH2_upWKEYJ_H_mvPLzz4MiCNOdT6Px7TJO0jDXI2yyqULcqk6QdeugBRlQ65ZhfyarUZxKJi-xwvP-ctD3I8_Z2rcIRnZ1Yv-gWZke3FlOfZmWRzF2hm5zjEFjzuQKIhjWmtKhBKZXKL_ZV_bscZX-lPx29RPvakaYp2k-GJzZKe_0uhHed8ECGj1T4bAapN8F0w"/></div>
  <div>
  <div class="quiz-title">Custom Set (Coming Soon)</div>
  <div class="quiz-meta">Imported</div>
  </div>
  </div>
  <!-- 
    <button class="select-btn" data-quiz="3">Select</button> 
    add ts back later gng
  -->
  </div> 
  </main>
  <footer>
  <div class="status-left">
  <span><span class="online-dot"></span> 1 Online</span>
  <span style="opacity: 0.2;">|</span>
  <span>Server: 127.0.0.1:5500</span>
  </div>
  <div class="version-tag">v1.0.0</div>
  </footer>
  </div>
  `;
  }
}

customElements.define("quiz-menu", QuizMenu);