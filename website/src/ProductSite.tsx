import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Github,
  KeyRound,
  LockKeyhole,
  Menu,
  Package,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';

const installCommand = 'npm install omniguard';

const quickStart = `import { signJWT, v, verifyJWT } from 'omniguard';

const user = v.object({
  email: v.string().trim().email(),
  age: v.number().int().nonnegative(),
}).parse(input);

const token = await signJWT({ role: 'editor' }, secret, {
  audience: 'dashboard',
  expiresInSeconds: 900,
  issuer: 'my-api',
  subject: user.email,
});

const claims = await verifyJWT(token, secret, {
  audience: 'dashboard',
  issuer: 'my-api',
  requireExpiration: true,
});`;

const primitives = [
  {
    icon: Braces,
    label: 'Runtime validation',
    copy: 'Composable string, finite-number, array, and object schemas with parse and safeParse flows.',
    accent: 'mint',
  },
  {
    icon: Code2,
    label: 'Contextual encoding',
    copy: 'HTML text escaping with an explicit name—and plain-text tag extraction that never pretends to sanitize.',
    accent: 'blue',
  },
  {
    icon: KeyRound,
    label: 'Focused HS256',
    copy: 'Web Crypto signing plus issuer, audience, subject, expiry, age, and clock-tolerance verification policies.',
    accent: 'amber',
  },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__core" />
      <span className="brand-mark__orbit" />
    </span>
  );
}

function ProductSite() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('onur@example.com');
  const [menuOpen, setMenuOpen] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const copyInstall = async () => {
    await navigator.clipboard?.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="OmniGuard home">
          <BrandMark />
          <span>OmniGuard</span>
        </a>

        <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Primary navigation">
          <a href="#primitives" onClick={closeMenu}>Primitives</a>
          <a href="#playground" onClick={closeMenu}>Playground</a>
          <a href="#security" onClick={closeMenu}>Security</a>
          <a href="#quickstart" onClick={closeMenu}>Quick start</a>
          <a className="nav__github" href="https://github.com/onuracar-dev/omniguard" target="_blank" rel="noreferrer">
            <Github size={17} /> GitHub
          </a>
        </nav>

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__copy">
            <div className="eyebrow"><span /> v0.2.0 · zero runtime dependencies</div>
            <h1>Small security primitives.<br /><em>Explicit guarantees.</em></h1>
            <p className="hero__lead">
              Validate inputs, encode HTML text, hash messages, and verify focused HS256 tokens—without hiding the trust boundary behind a magic API.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#quickstart">
                Start building <ArrowRight size={18} />
              </a>
              <a className="button button--quiet" href="https://www.npmjs.com/package/omniguard" target="_blank" rel="noreferrer">
                <Package size={18} /> View on npm
              </a>
            </div>
            <button className="install-pill" type="button" onClick={copyInstall} aria-label="Copy npm install command">
              <Terminal size={17} />
              <code>{installCommand}</code>
              <span>{copied ? <Check size={17} /> : <Copy size={17} />}</span>
              <span className="sr-only" aria-live="polite">{copied ? 'Install command copied' : ''}</span>
            </button>
          </div>

          <div className="hero__visual" aria-label="OmniGuard verification pipeline diagram">
            <div className="orbit orbit--outer" />
            <div className="orbit orbit--inner" />
            <div className="visual-card visual-card--input">
              <span className="visual-card__index">01</span>
              <Braces size={18} />
              <div><strong>unknown</strong><small>untrusted input</small></div>
            </div>
            <div className="visual-card visual-card--policy">
              <span className="visual-card__index">02</span>
              <ShieldCheck size={18} />
              <div><strong>policy</strong><small>explicit constraints</small></div>
            </div>
            <div className="visual-card visual-card--result">
              <span className="visual-card__index">03</span>
              <CheckCircle2 size={18} />
              <div><strong>trusted shape</strong><small>typed result</small></div>
            </div>
            <div className="visual-core"><BrandMark /><span>guard</span></div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Package facts">
          <div><strong>0</strong><span>runtime dependencies</span></div>
          <div><strong>41</strong><span>automated tests</span></div>
          <div><strong>HS256</strong><span>deliberately focused</span></div>
          <div><strong>MIT</strong><span>open source</span></div>
        </section>

        <section className="section" id="primitives">
          <div className="section-heading">
            <span className="kicker">01 / PRIMITIVES</span>
            <h2>Enough surface area.<br />No mystery surface.</h2>
            <p>Each primitive does one job and names the boundary it can actually defend.</p>
          </div>
          <div className="primitive-grid">
            {primitives.map(({ icon: Icon, label, copy, accent }, index) => (
              <article className={`primitive-card primitive-card--${accent}`} key={label}>
                <span className="primitive-card__number">0{index + 1}</span>
                <div className="primitive-card__icon"><Icon /></div>
                <h3>{label}</h3>
                <p>{copy}</p>
                <a href="#quickstart">See the API <ArrowUpRight size={16} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="section playground" id="playground">
          <div className="playground__copy">
            <span className="kicker">02 / PLAYGROUND</span>
            <h2>See the boundary move.</h2>
            <p>Transforms run before configured validation rules. Try a malformed email and watch the result change without a request leaving your browser.</p>
            <div className="rule-list">
              <span><Check size={16} /> trim whitespace</span>
              <span><Check size={16} /> require email shape</span>
              <span><Check size={16} /> return typed result</span>
            </div>
          </div>
          <div className="playground__panel">
            <div className="panel-bar"><span /><span /><span /><code>validation.ts</code></div>
            <div className="panel-code">
              <span><b>const</b> email = v.<i>string</i>()</span>
              <span>&nbsp;&nbsp;.<i>trim</i>()</span>
              <span>&nbsp;&nbsp;.<i>email</i>()</span>
              <span>&nbsp;&nbsp;.<i>safeParse</i>(input);</span>
            </div>
            <label htmlFor="email-demo">Untrusted input</label>
            <div className={emailValid ? 'demo-input demo-input--valid' : 'demo-input demo-input--invalid'}>
              <input id="email-demo" value={email} onChange={(event) => setEmail(event.target.value)} spellCheck="false" />
              {emailValid ? <CheckCircle2 aria-label="Valid email" /> : <AlertTriangle aria-label="Invalid email" />}
            </div>
            <div className={emailValid ? 'result result--success' : 'result result--error'} aria-live="polite">
              <span>{emailValid ? 'success' : 'invalid_string'}</span>
              <code>{emailValid ? JSON.stringify({ data: email.trim() }) : 'Invalid email'}</code>
            </div>
          </div>
        </section>

        <section className="section security" id="security">
          <div className="security__seal"><LockKeyhole /><span>security<br />contract</span></div>
          <div className="security__content">
            <span className="kicker">03 / HONEST BY DEFAULT</span>
            <h2>Security claims should fit in a code review.</h2>
            <p>OmniGuard documents what it verifies, what remains your responsibility, and where a specialist library belongs.</p>
            <div className="security__columns">
              <div>
                <h3><CheckCircle2 /> What it guarantees</h3>
                <ul>
                  <li>Finite values and configured schema rules</li>
                  <li>HS256 signature before claims are returned</li>
                  <li>Configured time and identity claim policies</li>
                </ul>
              </div>
              <div>
                <h3><AlertTriangle /> What it does not</h3>
                <ul>
                  <li>HTML allow-list sanitization or authorization</li>
                  <li>Password hashing, key rotation, or revocation</li>
                  <li>Independent security-audit assurance</li>
                </ul>
              </div>
            </div>
            <a href="https://github.com/onuracar-dev/omniguard/blob/main/docs/security-guarantees.md" target="_blank" rel="noreferrer">
              Read the complete security contract <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <section className="section quickstart" id="quickstart">
          <div className="section-heading section-heading--compact">
            <span className="kicker">04 / QUICK START</span>
            <h2>From unknown to constrained.</h2>
            <p>ESM and CommonJS exports, TypeScript declarations, and Web Crypto primitives are included.</p>
          </div>
          <div className="code-window">
            <div className="code-window__bar">
              <div><span /><span /><span /></div>
              <code>guard.ts</code>
              <button type="button" onClick={() => navigator.clipboard?.writeText(quickStart)} aria-label="Copy quick start code"><Copy size={16} /></button>
            </div>
            <pre><code>{quickStart}</code></pre>
          </div>
        </section>

        <section className="closing">
          <div>
            <span className="kicker">OPEN SOURCE · MIT</span>
            <h2>Keep the boundary<br />small enough to inspect.</h2>
          </div>
          <div className="closing__actions">
            <a className="button button--primary" href="https://github.com/onuracar-dev/omniguard" target="_blank" rel="noreferrer">
              <Github size={18} /> Explore the source
            </a>
            <p>Built in public by <a href="https://github.com/onuracar-dev">Onur Acar</a>.</p>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand brand--footer" href="#top"><BrandMark /><span>OmniGuard</span></a>
        <p>Validation and focused security helpers for TypeScript.</p>
        <div><a href="https://www.npmjs.com/package/omniguard">npm</a><a href="https://github.com/onuracar-dev/omniguard">GitHub</a><a href="https://github.com/onuracar-dev/omniguard/blob/main/SECURITY.md">Security</a></div>
      </footer>
    </div>
  );
}

export default ProductSite;
