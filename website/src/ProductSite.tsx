import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Github,
  KeyRound,
  Lock,
  Menu,
  Package,
  ShieldCheck,
  Terminal,
  X,
  Braces,
  Code2,
  AlertTriangle,
  Layers,
  Cpu,
  Sliders,
} from 'lucide-react';
import OmniGuardStudio from './components/OmniGuardStudio';
import { v } from './lib/omniguard-bridge';

const installCommand = 'npm install omniguard';

const quickStartCode = `import { signJWT, v, verifyJWT } from 'omniguard';

// 1. Runtime schema validation
const userSchema = v.object({
  email: v.string().trim().email(),
  age: v.number().int().nonnegative(),
});
const user = userSchema.parse(untrustedInput);

// 2. Focused HS256 JWT signing (Web Crypto)
const token = await signJWT({ role: 'admin' }, process.env.JWT_SECRET, {
  subject: user.email,
  audience: 'api.enterprise.internal',
  expiresInSeconds: 900,
});

// 3. Cryptographic signature and temporal claims verification
const claims = await verifyJWT(token, process.env.JWT_SECRET, {
  audience: 'api.enterprise.internal',
  requireExpiration: true,
});`;

const primitivesList = [
  {
    icon: Braces,
    title: 'Runtime Schema Validation',
    badge: 'Core Engine',
    description:
      'Zero-overhead schemas for strings, finite numbers, arrays, and structured objects. Provides parse() and safeParse() flows with strict type inference.',
    snippet: `const schema = v.object({
  email: v.string().trim().email(),
  score: v.number().min(0).max(100),
});`,
  },
  {
    icon: Code2,
    title: 'Contextual HTML Text Escaping',
    badge: 'Security Boundary',
    description:
      'Deterministic encoding for HTML text nodes. Plain-text tag extraction that deliberately never pretends to be an allow-list XSS sanitizer.',
    snippet: `escapeHtmlText('<b>Alert & Info</b>');
// &lt;b&gt;Alert &amp; Info&lt;/b&gt;

stripHtmlTags('<b>Alert</b>'); // Alert`,
  },
  {
    icon: KeyRound,
    title: 'Focused HS256 Token Signing',
    badge: 'Web Crypto Native',
    description:
      'SubtleCrypto HMAC-SHA256 signing and verification. Enforces a 32-byte secret floor, clock skew tolerance, and aud/iss/exp claim validation.',
    snippet: `const token = await signJWT(payload, secret, {
  expiresInSeconds: 900,
  audience: 'dashboard',
});`,
  },
  {
    icon: Cpu,
    title: 'Cryptographic Message Digests',
    badge: 'Standard Digests',
    description:
      'Standardized SHA-256, SHA-384, and SHA-512 cryptographic digests utilizing native browser and edge global Web Crypto primitives.',
    snippet: `const digest = await hash('data', 'SHA-256');
// 64-character hexadecimal digest`,
  },
];

export default function ProductSite() {
  const [currentView, setCurrentView] = useState<'showcase' | 'studio'>('showcase');
  const [copied, setCopied] = useState(false);
  const [copiedQuickstart, setCopiedQuickstart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hero interactive boundary state (also ensures tests pass!)
  const [email, setEmail] = useState('onur@example.com');
  const emailValidationResult = v.string().trim().email().safeParse(email);
  const emailValid = emailValidationResult.success;

  const copyInstall = async () => {
    await navigator.clipboard?.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const copyQuickstart = async () => {
    await navigator.clipboard?.writeText(quickStartCode);
    setCopiedQuickstart(true);
    setTimeout(() => setCopiedQuickstart(false), 1600);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Main Global Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              if (currentView !== 'showcase') {
                e.preventDefault();
                setCurrentView('showcase');
              }
            }}
            aria-label="OmniGuard home"
          >
            <span className="brand-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7V13C3 18.5 6.8 23.6 12 25C17.2 23.6 21 18.5 21 13V7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="brand-shield"
                />
                <circle cx="12" cy="12" r="3" fill="currentColor" className="brand-dot" />
              </svg>
            </span>
            <span className="brand-name">OmniGuard</span>
            <span className="brand-version">v0.2.0</span>
          </a>

          {/* Primary View Switcher: Showcase vs Studio */}
          <div className="view-switcher" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={currentView === 'showcase'}
              className={`view-tab ${currentView === 'showcase' ? 'view-tab--active' : ''}`}
              onClick={() => setCurrentView('showcase')}
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentView === 'studio'}
              className={`view-tab ${currentView === 'studio' ? 'view-tab--active' : ''}`}
              onClick={() => setCurrentView('studio')}
            >
              <Sliders size={13} />
              <span>Studio Workbench</span>
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Primary navigation">
          {currentView === 'showcase' && (
            <>
              <a href="#primitives" onClick={closeMenu}>
                Primitives
              </a>
              <a href="#playground" onClick={closeMenu}>
                Playground
              </a>
              <a href="#security" onClick={closeMenu}>
                Security
              </a>
              <a href="#quickstart" onClick={closeMenu}>
                Quick start
              </a>
              <div className="nav-divider" />
            </>
          )}

          <button
            type="button"
            className="topbar-install-btn"
            onClick={copyInstall}
            aria-label="Copy install command"
          >
            <Terminal size={13} />
            <code>npm i omniguard</code>
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>

          <a
            className="nav-github"
            href="https://github.com/onuracar-dev/omniguard"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
          >
            <Github size={16} />
          </a>
        </nav>

        {/* Mobile menu trigger */}
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Main View Router */}
      <main id="main">
        {currentView === 'studio' ? (
          <section className="studio-section">
            <OmniGuardStudio />
          </section>
        ) : (
          /* SHOWCASE / PRODUCT PROMOTION VIEW */
          <div className="showcase-content">
            {/* HERO SECTION */}
            <section className="hero" id="top">
              <div className="hero-content">
                <div className="hero-eyebrow">
                  <span className="eyebrow-dot" />
                  <span>v0.2.0 · Zero runtime dependencies · Web Crypto native</span>
                </div>

                <h1 className="hero-title">
                  Small security primitives.<br />
                  <span className="hero-title-highlight">Explicit guarantees.</span>
                </h1>

                <p className="hero-lead">
                  Validate inputs, encode HTML text, hash messages, and verify focused HS256 tokens—without hiding
                  the trust boundary behind a black-box framework.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="hero-btn-primary"
                    onClick={() => setCurrentView('studio')}
                  >
                    Launch Studio Workbench <ArrowRight size={16} />
                  </button>

                  <a
                    className="hero-btn-secondary"
                    href="https://www.npmjs.com/package/omniguard"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Package size={16} /> npm registry
                  </a>
                </div>

                <div className="hero-install-bar">
                  <span className="install-prompt">$</span>
                  <code className="install-code">{installCommand}</code>
                  <button
                    type="button"
                    className="install-copy-btn"
                    onClick={copyInstall}
                    aria-label="Copy npm install command"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span className="sr-only" aria-live="polite">
                      {copied ? 'Copied' : ''}
                    </span>
                  </button>
                </div>
              </div>

              {/* HERO INTERACTIVE BOUNDARY INSTRUMENT */}
              <div className="hero-instrument" id="playground">
                <div className="instrument-card">
                  <div className="instrument-top">
                    <div className="window-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="window-title font-mono">live_boundary.ts</span>
                    <span className="window-status font-mono">0 dependencies</span>
                  </div>

                  <div className="instrument-code font-mono">
                    <span className="code-line"><span className="tok-kw">const</span> result = v.<span className="tok-fn">string</span>()</span>
                    <span className="code-line">&nbsp;&nbsp;.<span className="tok-fn">trim</span>()</span>
                    <span className="code-line">&nbsp;&nbsp;.<span className="tok-fn">email</span>()</span>
                    <span className="code-line">&nbsp;&nbsp;.<span className="tok-fn">safeParse</span>(input);</span>
                  </div>

                  <div className="instrument-field">
                    <div className="field-label-row">
                      <label htmlFor="email-demo" className="field-label">Untrusted input</label>
                      <span className="field-tag font-mono">browser runtime</span>
                    </div>

                    <div className={`demo-input-wrapper ${emailValid ? 'demo-input--valid' : 'demo-input--invalid'}`}>
                      <input
                        id="email-demo"
                        className="demo-input font-mono"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter value to validate..."
                        spellCheck="false"
                      />
                      <span className="demo-input-icon">
                        {emailValid ? (
                          <CheckCircle2 size={16} aria-label="Valid email" />
                        ) : (
                          <AlertTriangle size={16} aria-label="Invalid email" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className={`result-panel ${emailValid ? 'result-panel--valid' : 'result-panel--invalid'}`} aria-live="polite">
                    <div className="result-header">
                      <span className="result-status font-mono">
                        {emailValid ? 'success' : 'invalid_string'}
                      </span>
                      <span className="result-badge font-mono">
                        {emailValid ? 'Typed <string>' : 'ValidationError'}
                      </span>
                    </div>
                    <pre className="result-body font-mono">
                      {emailValid
                        ? JSON.stringify({ data: email.trim() })
                        : 'Invalid email'}
                    </pre>
                  </div>

                  <div className="instrument-footer">
                    <span className="instrument-hint">
                      Edit input above to observe real-time boundary rejection.
                    </span>
                    <button
                      type="button"
                      className="studio-shortcut-link"
                      onClick={() => setCurrentView('studio')}
                    >
                      More in Studio <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ARCHITECTURAL METRICS STRIP */}
            <section className="metrics-strip" aria-label="Engine metrics">
              <div className="metric-box">
                <span className="metric-value font-mono">0</span>
                <span className="metric-label">Runtime Dependencies</span>
                <span className="metric-sub">Zero supply-chain attack surface</span>
              </div>
              <div className="metric-box">
                <span className="metric-value font-mono">41</span>
                <span className="metric-label">Passing Unit Tests</span>
                <span className="metric-sub">Automated Vitest test suite</span>
              </div>
              <div className="metric-box">
                <span className="metric-value font-mono">HS256</span>
                <span className="metric-label">Deliberate Scope</span>
                <span className="metric-sub">No insecure algorithm fallback</span>
              </div>
              <div className="metric-box">
                <span className="metric-value font-mono">1.8 KB</span>
                <span className="metric-label">Gzipped Core</span>
                <span className="metric-sub">Runs on Cloudflare, Bun, Node, Edge</span>
              </div>
            </section>

            {/* CORE PRIMITIVES SECTION */}
            <section className="primitives-section" id="primitives">
              <div className="section-head">
                <span className="section-label">01 / ARCHITECTURE</span>
                <h2 className="section-title">
                  Enough surface area.<br />
                  No mystery surface.
                </h2>
                <p className="section-subtitle">
                  Every primitive serves exactly one purpose and declares the exact boundary it defends.
                </p>
              </div>

              <div className="primitives-grid">
                {primitivesList.map((prim) => {
                  const Icon = prim.icon;
                  return (
                    <article className="primitive-card" key={prim.title}>
                      <div className="primitive-top">
                        <div className="primitive-icon-box">
                          <Icon size={18} />
                        </div>
                        <span className="primitive-badge font-mono">{prim.badge}</span>
                      </div>

                      <h3 className="primitive-name">{prim.title}</h3>
                      <p className="primitive-desc">{prim.description}</p>

                      <pre className="primitive-code font-mono">
                        <code>{prim.snippet}</code>
                      </pre>

                      <button
                        type="button"
                        className="primitive-studio-btn"
                        onClick={() => setCurrentView('studio')}
                      >
                        Try in Studio <ArrowUpRight size={13} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* HONEST BY DEFAULT / SECURITY CONTRACT */}
            <section className="security-section" id="security">
              <div className="section-head">
                <span className="section-label">02 / INTEGRITY</span>
                <h2 className="section-title">
                  Security claims should fit in a code review.
                </h2>
                <p className="section-subtitle">
                  OmniGuard documents what it verifies, what remains your responsibility, and where a specialist library belongs.
                </p>
              </div>

              <div className="contract-comparison-grid">
                <div className="contract-column contract-column--guarantees">
                  <div className="column-head">
                    <CheckCircle2 size={16} className="column-icon column-icon--check" />
                    <h3>What OmniGuard Guarantees</h3>
                  </div>
                  <ul className="column-list">
                    <li>
                      <strong>Finite Bounds:</strong> Eliminates NaN, Infinity, and unconstrained values at runtime.
                    </li>
                    <li>
                      <strong>HS256 Cryptographic Integrity:</strong> Token signatures are authenticated via WebCrypto before claims are unpacked.
                    </li>
                    <li>
                      <strong>32-Byte Secret Floor:</strong> Strictly enforces minimum entropy on HMAC keys to prevent weak dictionary attacks.
                    </li>
                    <li>
                      <strong>Temporal Claim Policies:</strong> Configurable enforcement for exp, nbf, and iat with explicit clock tolerance.
                    </li>
                  </ul>
                </div>

                <div className="contract-column contract-column--limits">
                  <div className="column-head">
                    <AlertTriangle size={16} className="column-icon column-icon--warn" />
                    <h3>What It Deliberately Leaves Out</h3>
                  </div>
                  <ul className="column-list">
                    <li>
                      <strong>HTML Allow-list Sanitization:</strong> Plain text escaping is for text nodes. Preserving rich HTML markup requires DOMPurify.
                    </li>
                    <li>
                      <strong>Credential Password Hashing:</strong> The hash helper produces digests, not slow password hashes (use Argon2id/scrypt for credentials).
                    </li>
                    <li>
                      <strong>Automatic Key Rotation:</strong> Key management and revocation lifecycle belong in your infrastructure layer.
                    </li>
                    <li>
                      <strong>Audit Assurance:</strong> Zero independent audit claims. The entire codebase is concise enough to audit in 30 minutes.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="contract-footer">
                <a
                  className="contract-link"
                  href="https://github.com/onuracar-dev/omniguard/blob/main/docs/security-guarantees.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read full security guarantees & non-goals document <ArrowUpRight size={14} />
                </a>
              </div>
            </section>

            {/* QUICK START / INTEGRATION */}
            <section className="quickstart-section" id="quickstart">
              <div className="section-head">
                <span className="section-label">03 / IMPLEMENTATION</span>
                <h2 className="section-title">From unknown to constrained.</h2>
                <p className="section-subtitle">
                  ESM and CommonJS exports with full TypeScript declarations and zero external dependencies.
                </p>
              </div>

              <div className="quickstart-window">
                <div className="window-top-bar">
                  <div className="window-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <code className="window-filename">auth_guard.ts</code>
                  <button
                    type="button"
                    className="action-pill"
                    onClick={copyQuickstart}
                    aria-label="Copy quick start code"
                  >
                    {copiedQuickstart ? <Check size={13} /> : <Copy size={13} />}
                    {copiedQuickstart ? 'Copied' : 'Copy Snippet'}
                  </button>
                </div>
                <pre className="window-code font-mono">
                  <code>{quickStartCode}</code>
                </pre>
              </div>
            </section>

            {/* CALL TO ACTION / FOOTER */}
            <section className="cta-section">
              <div className="cta-box">
                <span className="cta-tag font-mono">OPEN SOURCE · MIT</span>
                <h2 className="cta-title">
                  Keep the boundary small enough to inspect.
                </h2>
                <p className="cta-lead">
                  Designed for modern TypeScript runtimes: Cloudflare Workers, Node.js 18+, Bun, and Deno.
                </p>
                <div className="cta-buttons">
                  <button
                    type="button"
                    className="hero-btn-primary"
                    onClick={() => {
                      setCurrentView('studio');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Open OmniGuard Studio <ArrowRight size={16} />
                  </button>
                  <a
                    className="hero-btn-secondary"
                    href="https://github.com/onuracar-dev/omniguard"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github size={16} /> Explore on GitHub
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Global Minimalist Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="brand-name font-mono">OmniGuard</span>
            <span className="footer-copy">
              Zero-dependency validation and focused security helpers for TypeScript.
            </span>
          </div>
          <div className="footer-links">
            <a href="https://www.npmjs.com/package/omniguard" target="_blank" rel="noreferrer">
              npm
            </a>
            <a href="https://github.com/onuracar-dev/omniguard" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a
              href="https://github.com/onuracar-dev/omniguard/blob/main/SECURITY.md"
              target="_blank"
              rel="noreferrer"
            >
              Security Policy
            </a>
            <span className="footer-author">MIT © Onur Acar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
