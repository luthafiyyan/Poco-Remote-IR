export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Poco IR Remote - Samsung Smart TV</title>
  <style>
    /* ============================================================
       Modern Glassmorphism Theme - Optimized for Poco X7 Pro (20:9)
       ============================================================ */
    :root {
      --bg-primary: #07090e;
      --glass-panel: rgba(18, 24, 38, 0.68);
      --glass-border: rgba(255, 255, 255, 0.12);
      --glass-highlight: rgba(255, 255, 255, 0.08);
      --glass-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      
      --btn-bg: rgba(255, 255, 255, 0.06);
      --btn-border: rgba(255, 255, 255, 0.10);
      --btn-hover: rgba(255, 255, 255, 0.12);
      
      --accent-red: #ff3b30;
      --accent-red-glow: rgba(255, 59, 48, 0.45);
      
      --accent-blue: #0a84ff;
      --accent-blue-glow: rgba(10, 132, 255, 0.5);
      
      --accent-cyan: #30d158;
      --accent-cyan-glow: rgba(48, 209, 88, 0.4);

      --text-main: #f5f5f7;
      --text-muted: #8e8e93;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: radial-gradient(circle at 50% 10%, #1a2238 0%, #0c101b 55%, #05070b 100%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    }

    /* Outer Wrapper for responsive smartphone chassis */
    .remote-container {
      width: 100%;
      max-width: 412px;
      min-height: 100vh;
      padding: 14px 16px 20px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    @media (min-height: 800px) {
      .remote-container {
        height: 100vh;
        max-height: 920px;
      }
    }

    /* Top Bar: Brand, Hardware Status, IR LED Indicator */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 16px;
      margin-bottom: 12px;
    }

    .brand-info {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #ffffff;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .brand-sub {
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.3px;
    }

    .ir-emitter-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ir-bulb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #3a3d45;
      border: 2px solid rgba(255, 255, 255, 0.2);
      transition: all 0.15s ease;
      position: relative;
    }

    .ir-bulb.transmitting {
      background: #ff2d55;
      box-shadow: 0 0 16px #ff2d55, 0 0 30px #ff3b30;
      border-color: #ffffff;
      transform: scale(1.2);
    }

    .status-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-dot.online {
      background: #30d158;
      box-shadow: 0 0 8px #30d158;
    }

    .status-dot.simulated {
      background: #ff9f0a;
      box-shadow: 0 0 8px #ff9f0a;
    }

    /* Main Glass Remote Body */
    .remote-body {
      flex: 1;
      background: var(--glass-panel);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      box-shadow: var(--glass-shadow);
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }

    /* Button base styles with tactile micro-interactions */
    .btn {
      background: var(--btn-bg);
      border: 1px solid var(--btn-border);
      color: var(--text-main);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.12s, box-shadow 0.12s, border-color 0.12s;
      outline: none;
      position: relative;
      overflow: hidden;
    }

    .btn:active {
      transform: scale(0.93);
      box-shadow: 0 0 14px rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.35);
    }

    /* Section 1: Power & Source Row */
    .top-action-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      align-items: center;
    }

    .btn-power {
      background: rgba(255, 59, 48, 0.12);
      border-color: rgba(255, 59, 48, 0.35);
      color: var(--accent-red);
      height: 52px;
      border-radius: 20px;
    }

    .btn-power:active {
      background: rgba(255, 59, 48, 0.28);
      border-color: var(--accent-red);
      box-shadow: 0 0 20px var(--accent-red-glow);
    }

    .btn-source {
      height: 52px;
      border-radius: 20px;
      font-size: 11px;
      gap: 3px;
    }

    .btn-keypad-toggle {
      height: 52px;
      border-radius: 20px;
      font-size: 11px;
      gap: 3px;
    }

    /* Section 2: Circular D-Pad Navigator */
    .dpad-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 4px 0;
    }

    .dpad-outer {
      width: 210px;
      height: 210px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .dpad-dir {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.12s ease;
      z-index: 2;
    }

    .dpad-dir:active {
      transform: scale(0.88);
      color: #64d2ff;
    }

    .dpad-up {
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 64px;
      height: 50px;
    }

    .dpad-down {
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 64px;
      height: 50px;
    }

    .dpad-left {
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 64px;
    }

    .dpad-right {
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 64px;
    }

    .dpad-center-ok {
      width: 82px;
      height: 82px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, rgba(10, 132, 255, 0.28) 0%, rgba(10, 132, 255, 0.08) 100%);
      border: 1.5px solid rgba(10, 132, 255, 0.45);
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      z-index: 3;
      transition: transform 0.12s, box-shadow 0.12s, border-color 0.12s;
    }

    .dpad-center-ok:active {
      transform: scale(0.92);
      border-color: #64d2ff;
      box-shadow: 0 0 24px var(--accent-blue-glow);
    }

    /* Section 3: Navigation Grid (Back, Home, Menu, Exit) */
    .nav-pill-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .btn-nav {
      height: 48px;
      border-radius: 14px;
      font-size: 10px;
      gap: 3px;
    }

    .btn-nav svg {
      width: 17px;
      height: 17px;
      opacity: 0.9;
    }

    .btn-home {
      border-color: rgba(100, 210, 255, 0.25);
    }

    /* Section 4: Rocker Controls (Volume, Mute, Channel) */
    .rockers-row {
      display: grid;
      grid-template-columns: 1.1fr 1fr 1.1fr;
      gap: 12px;
      align-items: center;
    }

    .rocker-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--glass-border);
      border-radius: 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 120px;
      padding: 6px;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
    }

    .rocker-btn {
      width: 100%;
      height: 42px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .rocker-btn:active {
      transform: scale(0.92);
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .rocker-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .center-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      justify-content: center;
    }

    .btn-mute {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border-color: rgba(255, 255, 255, 0.15);
      font-size: 10px;
      gap: 3px;
    }

    .btn-mute:active {
      border-color: #ff9f0a;
      box-shadow: 0 0 16px rgba(255, 159, 10, 0.4);
    }

    .btn-info-pill {
      font-size: 10px;
      padding: 6px 10px;
      border-radius: 12px;
      color: var(--text-muted);
    }

    /* Bottom Sheet / Tab for Numpad */
    .numpad-drawer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(14, 18, 28, 0.96);
      border-top: 1px solid var(--glass-border);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-radius: 28px 28px 0 0;
      padding: 12px 18px 24px 18px;
      box-shadow: 0 -12px 36px rgba(0, 0, 0, 0.7);
      transform: translateY(105%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100;
    }

    .numpad-drawer.open {
      transform: translateY(0);
    }

    .drawer-handle-bar {
      width: 44px;
      height: 5px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 3px;
      margin: 0 auto 12px auto;
      cursor: pointer;
    }

    .drawer-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .drawer-title {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .drawer-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      padding: 4px 8px;
    }

    .numpad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .btn-num {
      height: 48px;
      border-radius: 16px;
      font-size: 18px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
    }

    /* Collapsible Debug Log Bar */
    .debug-toggle-bar {
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .debug-label {
      font-size: 10px;
      color: var(--text-muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .btn-debug-toggle {
      background: none;
      border: none;
      color: #64d2ff;
      font-size: 10px;
      cursor: pointer;
      text-decoration: underline;
    }

    .debug-panel {
      display: none;
      margin-top: 6px;
      background: rgba(5, 7, 12, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 8px 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 9.5px;
      color: #70d7ff;
      max-height: 90px;
      overflow-y: auto;
      line-height: 1.4;
      word-break: break-all;
    }

    .debug-panel.show {
      display: block;
    }

    /* Toast Notification */
    .toast-msg {
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      opacity: 0;
      pointer-events: none;
      background: rgba(20, 25, 38, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999;
      white-space: nowrap;
    }

    .toast-msg.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>

  <!-- Toast Notification Container -->
  <div id="toast" class="toast-msg">IR Signal Transmitted</div>

  <div class="remote-container">
    
    <!-- Header Bar: Hardware & Bridge Detection -->
    <div class="header-bar">
      <div class="brand-info">
        <span class="brand-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
          SAMSUNG SMART TV
        </span>
        <span class="brand-sub">Poco X7 Pro · IR Blaster Hybrid</span>
      </div>

      <div class="ir-emitter-indicator">
        <div id="irBulb" class="ir-bulb" title="IR Transmitter LED Status"></div>
        <div id="bridgeStatusBadge" class="status-badge">
          <span id="bridgeStatusDot" class="status-dot simulated"></span>
          <span id="bridgeStatusText">Detecting...</span>
        </div>
      </div>
    </div>

    <!-- Main Glassmorphic Remote Panel -->
    <div class="remote-body">
      
      <!-- Row 1: Power, Source, Numpad Toggle -->
      <div class="top-action-row">
        <button class="btn btn-power" id="btnPower" data-hex="0xE0E040BF" data-name="Power">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
          </svg>
          <span style="font-size: 9px; margin-top: 2px;">POWER</span>
        </button>

        <button class="btn btn-keypad-toggle" id="btnNumpadOpen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="5" height="5" rx="1"></rect>
            <rect x="10" y="3" width="5" height="5" rx="1"></rect>
            <rect x="17" y="3" width="5" height="5" rx="1"></rect>
            <rect x="3" y="10" width="5" height="5" rx="1"></rect>
            <rect x="10" y="10" width="5" height="5" rx="1"></rect>
            <rect x="17" y="10" width="5" height="5" rx="1"></rect>
            <rect x="3" y="17" width="5" height="5" rx="1"></rect>
            <rect x="10" y="17" width="5" height="5" rx="1"></rect>
            <rect x="17" y="17" width="5" height="5" rx="1"></rect>
          </svg>
          <span>NUMPAD</span>
        </button>

        <button class="btn btn-source" id="btnSource" data-hex="0xE0E0807F" data-name="Source">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>SOURCE</span>
        </button>
      </div>

      <!-- Row 2: Circular D-Pad Controller -->
      <div class="dpad-container">
        <div class="dpad-outer">
          <!-- Up -->
          <button class="dpad-dir dpad-up" id="btnUp" data-hex="0xE0E006F9" data-name="Up" aria-label="Up">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>

          <!-- Left -->
          <button class="dpad-dir dpad-left" id="btnLeft" data-hex="0xE0E0A659" data-name="Left" aria-label="Left">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <!-- OK / Enter -->
          <button class="dpad-center-ok" id="btnOk" data-hex="0xE0E016E9" data-name="OK / Enter" aria-label="OK">
            <span>OK</span>
          </button>

          <!-- Right -->
          <button class="dpad-dir dpad-right" id="btnRight" data-hex="0xE0E046B9" data-name="Right" aria-label="Right">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <!-- Down -->
          <button class="dpad-dir dpad-down" id="btnDown" data-hex="0xE0E08679" data-name="Down" aria-label="Down">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Row 3: Navigation Grid (Back, Home, Menu, Exit) -->
      <div class="nav-pill-row">
        <button class="btn btn-nav" id="btnBack" data-hex="0xE0E01AE5" data-name="Back / Return">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 14 4 9 9 4"></polyline>
            <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
          </svg>
          <span>BACK</span>
        </button>

        <button class="btn btn-nav btn-home" id="btnHome" data-hex="0xE0E09E61" data-name="Home (Smart Hub)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>HOME</span>
        </button>

        <button class="btn btn-nav" id="btnMenu" data-hex="0xE0E058A7" data-name="Menu / Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span>MENU</span>
        </button>

        <button class="btn btn-nav" id="btnExit" data-hex="0xE0E0B44B" data-name="Exit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>EXIT</span>
        </button>
      </div>

      <!-- Row 4: Rockers (Volume, Mute, Channel) -->
      <div class="rockers-row">
        <!-- Volume Rocker -->
        <div class="rocker-pill">
          <button class="rocker-btn" id="btnVolUp" data-hex="0xE0E0E01F" data-name="Volume Up" aria-label="Volume Up">
            +
          </button>
          <span class="rocker-label">VOL</span>
          <button class="rocker-btn" id="btnVolDown" data-hex="0xE0E0D02F" data-name="Volume Down" aria-label="Volume Down">
            −
          </button>
        </div>

        <!-- Center: Mute -->
        <div class="center-actions">
          <button class="btn btn-mute" id="btnMute" data-hex="0xE0E0F00F" data-name="Mute">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
            <span>MUTE</span>
          </button>
          <span class="btn-info-pill">38 kHz</span>
        </div>

        <!-- Channel Rocker -->
        <div class="rocker-pill">
          <button class="rocker-btn" id="btnChUp" data-hex="0xE0E048B7" data-name="Channel Up" aria-label="Channel Up">
            ∧
          </button>
          <span class="rocker-label">CH</span>
          <button class="rocker-btn" id="btnChDown" data-hex="0xE0E008F7" data-name="Channel Down" aria-label="Channel Down">
            ∨
          </button>
        </div>
      </div>

    </div>

    <!-- Collapsible Debug / Raw Signal Console for PC and Diagnostics -->
    <div class="debug-toggle-bar">
      <span class="debug-label" id="lastTxSummary">Ready · Standby</span>
      <button class="btn-debug-toggle" id="btnToggleDebug">Logs</button>
    </div>
    <div class="debug-panel" id="debugConsole">
      [READY] Initialized NECx2 encoder at 38,000 Hz. Waiting for keypress...
    </div>

    <!-- Bottom Sheet / Numpad Drawer -->
    <div class="numpad-drawer" id="numpadDrawer">
      <div class="drawer-handle-bar" id="drawerHandle"></div>
      <div class="drawer-title-row">
        <span class="drawer-title">Digital Number Pad</span>
        <button class="drawer-close" id="btnNumpadClose">Close ✕</button>
      </div>

      <div class="numpad-grid">
        <button class="btn btn-num" data-hex="0xE0E020DF" data-name="Digit 1">1</button>
        <button class="btn btn-num" data-hex="0xE0E0A05F" data-name="Digit 2">2</button>
        <button class="btn btn-num" data-hex="0xE0E0609F" data-name="Digit 3">3</button>
        <button class="btn btn-num" data-hex="0xE0E010EF" data-name="Digit 4">4</button>
        <button class="btn btn-num" data-hex="0xE0E0906F" data-name="Digit 5">5</button>
        <button class="btn btn-num" data-hex="0xE0E050AF" data-name="Digit 6">6</button>
        <button class="btn btn-num" data-hex="0xE0E030CF" data-name="Digit 7">7</button>
        <button class="btn btn-num" data-hex="0xE0E0B04F" data-name="Digit 8">8</button>
        <button class="btn btn-num" data-hex="0xE0E0708F" data-name="Digit 9">9</button>
        <button class="btn btn-num" data-hex="0xE0E0807F" data-name="Source">SRC</button>
        <button class="btn btn-num" data-hex="0xE0E08877" data-name="Digit 0">0</button>
        <button class="btn btn-num" data-hex="0xE0E01AE5" data-name="Return">RET</button>
      </div>
    </div>

  </div>

  <script>
    /* ============================================================
       IR PROTOCOL SPECIFICATION & SAMSUNG NECx2 ENCODER
       ============================================================ */
    const IR_FREQUENCY = 38000; // 38 kHz carrier frequency

    /**
     * Mengonversi kode HEX 32-bit Samsung ke dalam deretan mikrodetik NECx2.
     * Spesifikasi Samsung NECx2:
     * - Header Mark: 4500 us, Header Space: 4500 us
     * - Bit Mark: 560 us
     * - Bit '1' Space: 1690 us
     * - Bit '0' Space: 560 us
     * - Stop Bit: 560 us
     *
     * @param {string|number} hexCode - Contoh: "0xE0E040BF" atau 0xE0E040BF
     * @returns {string} String deretan mikrodetik dipisahkan koma
     */
    function hexToSamsungRaw(hexCode) {
      let numVal;
      if (typeof hexCode === 'string') {
        numVal = parseInt(hexCode.replace(/^0x/i, ''), 16);
      } else {
        numVal = Number(hexCode);
      }

      const HDR_MARK = 4500;
      const HDR_SPACE = 4500;
      const BIT_MARK = 560;
      const BIT_ONE_SPACE = 1690;
      const BIT_ZERO_SPACE = 560;
      const STOP_BIT = 560;

      // Inisialisasi dengan Header Mark & Space
      const pattern = [HDR_MARK, HDR_SPACE];

      // Transmisi 32 bit dari Most Significant Bit (MSB, bit 31) ke LSB (bit 0)
      for (let i = 31; i >= 0; i--) {
        const bit = (numVal >>> i) & 1;
        pattern.push(BIT_MARK);
        pattern.push(bit === 1 ? BIT_ONE_SPACE : BIT_ZERO_SPACE);
      }

      // Stop Bit terakhir
      pattern.push(STOP_BIT);

      // Return sebagai string comma-separated (contoh: "4500,4500,560,1690,...")
      return pattern.join(',');
    }

    /* ============================================================
       DOM Elements & Hardware Bridge Detection
       ============================================================ */
    const irBulb = document.getElementById('irBulb');
    const toast = document.getElementById('toast');
    const bridgeStatusDot = document.getElementById('bridgeStatusDot');
    const bridgeStatusText = document.getElementById('bridgeStatusText');
    const debugConsole = document.getElementById('debugConsole');
    const lastTxSummary = document.getElementById('lastTxSummary');
    const btnToggleDebug = document.getElementById('btnToggleDebug');
    
    // Numpad drawer elements
    const numpadDrawer = document.getElementById('numpadDrawer');
    const btnNumpadOpen = document.getElementById('btnNumpadOpen');
    const btnNumpadClose = document.getElementById('btnNumpadClose');
    const drawerHandle = document.getElementById('drawerHandle');

    let toastTimer = null;

    /**
     * Cek apakah lingkungan berjalan di Android WebView dengan objek bridge window.AndroidIR
     */
    function checkAndroidBridge() {
      const hasBridge = typeof window.AndroidIR !== 'undefined' && typeof window.AndroidIR.transmitIR === 'function';
      if (hasBridge) {
        bridgeStatusDot.className = 'status-dot online';
        bridgeStatusText.textContent = 'Android IR Ready';
        logDebug('[BRIDGE] window.AndroidIR terdeteksi. Siap transmisi ConsumerIrManager fisik.');
      } else {
        bridgeStatusDot.className = 'status-dot simulated';
        bridgeStatusText.textContent = 'Browser Simulation';
        logDebug('[BRIDGE] window.AndroidIR tidak ditemukan. Mode simulasi aktif (aman untuk testing di browser PC).');
      }
      return hasBridge;
    }

    /**
     * Menampilkan pesan toast sementara di layar
     */
    function showToast(message) {
      if (toastTimer) clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add('show');
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 1600);
    }

    /**
     * Mencatat pesan log ke mini console
     */
    function logDebug(msg) {
      const timestamp = new Date().toLocaleTimeString('id-ID', { hour12: false });
      const line = '[' + timestamp + '] ' + msg;
      debugConsole.innerHTML = '<div>' + line + '</div>' + debugConsole.innerHTML;
    }

    /**
     * Trigger efek visual LED IR transmitter menyala sejenak
     */
    function triggerIrFlash() {
      irBulb.classList.add('transmitting');
      setTimeout(() => {
        irBulb.classList.remove('transmitting');
      }, 140);
    }

    /**
     * Fungsi utama untuk mengirim sinyal IR
     * @param {string} hexCode - Kode HEX perintah Samsung (contoh: "0xE0E040BF")
     * @param {string} buttonName - Nama label tombol untuk UI/log
     */
    function sendIrCommand(hexCode, buttonName) {
      // 1. Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }

      // 2. Visual flash LED
      triggerIrFlash();

      // 3. Konversi HEX ke pulsa raw NECx2 (string durasi mikrodetik)
      const rawPatternString = hexToSamsungRaw(hexCode);
      const pulseCount = rawPatternString.split(',').length;

      // 4. Update ringkasan status bar
      lastTxSummary.textContent = buttonName + ' · ' + hexCode;

      // 5. Cek bridge AndroidIR dan lakukan transmisi
      if (typeof window.AndroidIR !== 'undefined' && typeof window.AndroidIR.transmitIR === 'function') {
        try {
          const success = window.AndroidIR.transmitIR(IR_FREQUENCY, rawPatternString);
          showToast('📡 [IR] ' + buttonName + ' (' + hexCode + ')');
          logDebug('[TRANSMIT-OK] ' + buttonName + ' (' + hexCode + ') -> 38kHz, ' + pulseCount + ' pulsa terkirim via ConsumerIrManager.');
        } catch (err) {
          showToast('⚠️ Gagal IR: ' + err.message);
          logDebug('[ERROR] Eksekusi AndroidIR: ' + err.message);
        }
      } else {
        // Simulasi jika dibuka di browser PC / Chrome Android biasa
        showToast('⚡ [SIMULASI] ' + buttonName + ' (' + hexCode + ')');
        logDebug('[SIMULASI] ' + buttonName + ' | HEX: ' + hexCode + ' | Pulsa: [' + rawPatternString.substring(0, 48) + '...] (' + pulseCount + ' durasi)');
      }
    }

    /* ============================================================
       Event Listeners Binding
       ============================================================ */
    // Pasang listener pada semua tombol yang memiliki attribute data-hex
    document.querySelectorAll('[data-hex]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const hex = btn.getAttribute('data-hex');
        const name = btn.getAttribute('data-name') || btn.textContent.trim();
        sendIrCommand(hex, name);
      });
    });

    // Buka / Tutup Numpad Drawer
    btnNumpadOpen.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(20);
      numpadDrawer.classList.add('open');
    });

    btnNumpadClose.addEventListener('click', () => {
      numpadDrawer.classList.remove('open');
    });

    drawerHandle.addEventListener('click', () => {
      numpadDrawer.classList.remove('open');
    });

    // Toggle Debug Console
    btnToggleDebug.addEventListener('click', () => {
      debugConsole.classList.toggle('show');
      btnToggleDebug.textContent = debugConsole.classList.contains('show') ? 'Tutup' : 'Logs';
    });

    // Cek bridge saat halaman siap
    window.addEventListener('DOMContentLoaded', () => {
      checkAndroidBridge();
    });
  </script>
</body>
</html>`;
