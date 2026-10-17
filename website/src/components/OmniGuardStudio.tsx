import { useState } from 'react';
import {
  Braces,
  KeyRound,
  ShieldAlert,
  Hash,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  Lock,
} from 'lucide-react';
import {
  hash,
  signJWT,
  verifyJWT,
  escapeHtmlText,
  stripHtmlTags,
  SCHEMA_PRESETS,
  type SchemaPreset,
} from '../lib/omniguard-bridge';
import ErrorBoundary from './ErrorBoundary';

function decodeBase64UrlJson(segment: string): Record<string, unknown> | null {
  if (!segment) return null;
  try {
    const padding = '='.repeat((4 - (segment.length % 4)) % 4);
    const base64 = (segment + padding).replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

type StudioTab = 'schema' | 'jwt' | 'sanitize' | 'hash';

export default function OmniGuardStudio() {
  const [activeTab, setActiveTab] = useState<StudioTab>('schema');

  return (
    <div className="studio-container">
      {/* Studio Navigation Bar */}
      <div className="studio-nav-bar">
        <div className="studio-nav-title">
          <span className="studio-dot" />
          <span className="studio-heading">OmniGuard Studio</span>
          <span className="studio-pill">Interactive Workbench</span>
        </div>
        <div className="studio-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'schema'}
            className={`studio-tab-btn ${activeTab === 'schema' ? 'studio-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            <Braces size={15} />
            <span>Schema Validator</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'jwt'}
            className={`studio-tab-btn ${activeTab === 'jwt' ? 'studio-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('jwt')}
          >
            <KeyRound size={15} />
            <span>HS256 Token Engine</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sanitize'}
            className={`studio-tab-btn ${activeTab === 'sanitize' ? 'studio-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('sanitize')}
          >
            <ShieldAlert size={15} />
            <span>HTML & Text Encoder</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'hash'}
            className={`studio-tab-btn ${activeTab === 'hash' ? 'studio-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('hash')}
          >
            <Hash size={15} />
            <span>WebCrypto Hasher</span>
          </button>
        </div>
      </div>

      {/* Studio Instrument Workspace */}
      <div className="studio-viewport">
        <ErrorBoundary key={activeTab} fallbackTitle="Studio Workbench encountered an error">
          {activeTab === 'schema' && <SchemaWorkbench />}
          {activeTab === 'jwt' && <JwtStudio />}
          {activeTab === 'sanitize' && <SanitizationWorkbench />}
          {activeTab === 'hash' && <HashWorkbench />}
        </ErrorBoundary>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   1. SCHEMA WORKBENCH
------------------------------------------------------------- */
function SchemaWorkbench() {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('userAuth');
  const preset: SchemaPreset = SCHEMA_PRESETS[selectedPresetKey];

  const [rawPayload, setRawPayload] = useState<string>(preset.defaultPayload);
  const [parseResult, setParseResult] = useState<{
    success: boolean;
    data?: unknown;
    error?: unknown;
    durationMs: number;
  }>(() => {
    try {
      return preset.validate(JSON.parse(preset.defaultPayload));
    } catch {
      return {
        success: false,
        error: { issues: [{ path: 'JSON', message: 'Failed to parse default payload' }] },
        durationMs: 0,
      };
    }
  });
  const [copied, setCopied] = useState(false);

  const handleRunValidation = (payloadText: string = rawPayload) => {
    try {
      const parsed = JSON.parse(payloadText);
      setParseResult(preset.validate(parsed));
    } catch (err) {
      setParseResult({
        success: false,
        error: { issues: [{ path: 'JSON', message: `Malformed JSON: ${(err as Error).message}` }] },
        durationMs: 0,
      });
    }
  };

  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    const newPreset = SCHEMA_PRESETS[key];
    setRawPayload(newPreset.defaultPayload);
    try {
      const parsed = JSON.parse(newPreset.defaultPayload);
      setParseResult(newPreset.validate(parsed));
    } catch (err) {
      setParseResult({
        success: false,
        error: { issues: [{ path: 'JSON', message: `Malformed JSON: ${(err as Error).message}` }] },
        durationMs: 0,
      });
    }
  };

  const injectInvalidData = () => {
    if (selectedPresetKey === 'userAuth') {
      const invalid = {
        email: 'invalid-email-address',
        age: 15, // under 18 min
        website: 'not-a-valid-url',
        roles: ['INVALID_ROLE_CASE!'],
      };
      setRawPayload(JSON.stringify(invalid, null, 2));
      setParseResult(preset.validate(invalid));
    } else if (selectedPresetKey === 'apiOrder') {
      const invalid = {
        orderId: 'short',
        amount: -50,
        currency: 'TOOLONG',
        quantity: -1,
      };
      setRawPayload(JSON.stringify(invalid, null, 2));
      setParseResult(preset.validate(invalid));
    } else {
      const invalid = {
        sub: 'bad-email',
        org: 'INVALID CHARS!',
        level: 99,
      };
      setRawPayload(JSON.stringify(invalid, null, 2));
      setParseResult(preset.validate(invalid));
    }
  };

  const resetToValid = () => {
    setRawPayload(preset.defaultPayload);
    handleRunValidation(preset.defaultPayload);
  };

  const copyResult = () => {
    navigator.clipboard?.writeText(JSON.stringify(parseResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="workbench-grid">
      {/* Left Column: Schema Code & Control */}
      <div className="workbench-col">
        <div className="card-header">
          <div className="card-header-left">
            <span className="card-header-title">Schema Blueprint</span>
            <span className="card-badge">TypeScript</span>
          </div>
          <div className="preset-selector">
            {Object.keys(SCHEMA_PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                className={`preset-btn ${selectedPresetKey === key ? 'preset-btn--active' : ''}`}
                onClick={() => handleSelectPreset(key)}
              >
                {SCHEMA_PRESETS[key].name}
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor-box">
          <pre className="code-preview font-mono">
            <code>{preset.schemaCode}</code>
          </pre>
        </div>

        <div className="payload-editor-box">
          <div className="card-header card-header--sub">
            <span className="card-header-title">Untrusted Payload (JSON)</span>
            <div className="payload-actions">
              <button type="button" className="action-pill action-pill--warn" onClick={injectInvalidData}>
                Inject Violations
              </button>
              <button type="button" className="action-pill" onClick={resetToValid}>
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>
          <textarea
            className="payload-textarea font-mono"
            value={rawPayload}
            onChange={(e) => {
              const val = e.target.value;
              setRawPayload(val);
              handleRunValidation(val);
            }}
            rows={8}
            spellCheck="false"
          />
        </div>
      </div>

      {/* Right Column: Execution Output */}
      <div className="workbench-col">
        <div className="card-header">
          <div className="card-header-left">
            <span className="card-header-title">Live Execution Result</span>
            <span
              className={`status-pill ${
                parseResult.success ? 'status-pill--success' : 'status-pill--error'
              }`}
            >
              {parseResult.success ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {parseResult.success ? 'VALID' : 'REJECTED'}
            </span>
          </div>
          <div className="card-header-right">
            <span className="perf-tag font-mono" title="single run, this browser">{parseResult.durationMs.toFixed(2)} ms (single run, this browser)</span>
            <button
              type="button"
              className="copy-icon-btn"
              onClick={copyResult}
              title="Copy Result JSON"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="result-display-box font-mono">
          {parseResult.success ? (
            <div className="result-pass">
              <div className="result-pass-header">
                <span className="result-pass-badge">Validated & typed</span>
                <span className="result-pass-note">Schema validation succeeded</span>
              </div>
              <pre className="result-json">
                {JSON.stringify(parseResult.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="result-fail">
              <div className="result-fail-header">
                <span className="result-fail-badge">Validation Issues Detected</span>
                <span className="result-fail-note">Untrusted shape broke constraints</span>
              </div>
              <pre className="result-json result-json--err">
                {JSON.stringify(parseResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Informative Guarantee Card */}
        <div className="contract-card">
          <div className="contract-card-header">
            <Lock size={14} />
            <span>OmniGuard Runtime Invariant</span>
          </div>
          <p className="contract-card-body">
            Input is validated strictly against primitive boundaries. No extra keys leak into typed return
            when objects are constrained, and finite number bounds eliminate <code>NaN</code> and <code>Infinity</code> vectors.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   2. HS256 JWT ENGINE
------------------------------------------------------------- */
function JwtStudio() {
  const [jwtMode, setJwtMode] = useState<'sign' | 'verify'>('sign');

  // Sign state
  const [secret, setSecret] = useState(
    'demo-secret-change-me-at-least-32-bytes!!',
  );
  const [subject, setSubject] = useState('user_88291');
  const [issuer, setIssuer] = useState('api.omniguard.dev');
  const [audience, setAudience] = useState('omniguard-client');
  const [expiresInSeconds, setExpiresInSeconds] = useState(900);
  const [customClaims, setCustomClaims] = useState(
    JSON.stringify({ role: 'security_engineer', permissions: ['read:all', 'write:keys'] }, null, 2),
  );
  const [signedToken, setSignedToken] = useState<string>('');
  const [signError, setSignError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Verify state
  const [verifyTokenInput, setVerifyTokenInput] = useState<string>('');
  const [verifySecretInput, setVerifySecretInput] = useState<string>(
    'demo-secret-change-me-at-least-32-bytes!!',
  );
  const [verifyIssuer, setVerifyIssuer] = useState('api.omniguard.dev');
  const [verifyAudience, setVerifyAudience] = useState('omniguard-client');
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    claims?: unknown;
    error?: string;
  } | null>(null);

  // Handle Token Signing
  const handleSign = async () => {
    setSignError(null);
    try {
      let extra: Record<string, unknown> = {};
      if (customClaims.trim()) {
        try {
          const parsed = JSON.parse(customClaims);
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            setSignError('Custom claims must be a valid JSON object');
            return;
          }
          extra = parsed as Record<string, unknown>;
        } catch {
          setSignError('Custom claims must be valid JSON');
          return;
        }
      }

      const token = await signJWT(
        { ...extra },
        secret,
        {
          subject: subject || undefined,
          issuer: issuer || undefined,
          audience: audience || undefined,
          expiresInSeconds: Number(expiresInSeconds) || undefined,
        },
      );
      setSignedToken(token);
      setVerifyTokenInput(token);
    } catch (err) {
      setSignError((err as Error).message);
    }
  };

  // Handle Token Verification
  const handleVerify = async () => {
    try {
      const claims = await verifyJWT(verifyTokenInput.trim(), verifySecretInput, {
        issuer: verifyIssuer ? verifyIssuer : undefined,
        audience: verifyAudience ? verifyAudience : undefined,
        requireExpiration: true,
      });

      if (claims) {
        setVerifyResult({ verified: true, claims });
      } else {
        setVerifyResult({
          verified: false,
          error: 'Signature verification failed or claim constraint violated (exp/aud/iss mismatch).',
        });
      }
    } catch (err) {
      setVerifyResult({
        verified: false,
        error: (err as Error).message,
      });
    }
  };

  // Token breakdown
  const tokenParts = signedToken ? signedToken.split('.') : [];
  const decodedHeader = tokenParts[0] ? decodeBase64UrlJson(tokenParts[0]) : null;
  const decodedPayload = tokenParts[1] ? decodeBase64UrlJson(tokenParts[1]) : null;

  return (
    <div className="jwt-grid">
      {/* Mode Switcher */}
      <div className="jwt-control-header">
        <div className="segmented-control">
          <button
            type="button"
            className={`seg-btn ${jwtMode === 'sign' ? 'seg-btn--active' : ''}`}
            onClick={() => setJwtMode('sign')}
          >
            Issue / Sign Token
          </button>
          <button
            type="button"
            className={`seg-btn ${jwtMode === 'verify' ? 'seg-btn--active' : ''}`}
            onClick={() => setJwtMode('verify')}
          >
            Inspect & Verify Token
          </button>
        </div>
        <div className="security-notice">
          <Lock size={13} />
          <span>WebCrypto Subtle HMAC-SHA256 (32-byte secret floor enforced)</span>
        </div>
      </div>

      {jwtMode === 'sign' ? (
        <div className="workbench-grid">
          {/* Sign Inputs */}
          <div className="workbench-col">
            <div className="card-header">
              <span className="card-header-title">Signing Configuration</span>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="jwt-secret">Secret Key (HMAC-SHA256)</label>
                <span
                  className={`byte-count ${
                    new TextEncoder().encode(secret).length >= 32
                      ? 'byte-count--valid'
                      : 'byte-count--warn'
                  }`}
                >
                  {new TextEncoder().encode(secret).length} / 32 bytes minimum
                </span>
              </div>
              <input
                id="jwt-secret"
                type="text"
                className="studio-input font-mono"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="jwt-sub">Subject (sub)</label>
                <input
                  id="jwt-sub"
                  type="text"
                  className="studio-input font-mono"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="jwt-iss">Issuer (iss)</label>
                <input
                  id="jwt-iss"
                  type="text"
                  className="studio-input font-mono"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="jwt-aud">Audience (aud)</label>
                <input
                  id="jwt-aud"
                  type="text"
                  className="studio-input font-mono"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="jwt-exp">Expires In (seconds)</label>
                <input
                  id="jwt-exp"
                  type="number"
                  className="studio-input font-mono"
                  value={expiresInSeconds}
                  onChange={(e) => setExpiresInSeconds(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="jwt-claims">Custom Claims (JSON)</label>
              <textarea
                id="jwt-claims"
                className="payload-textarea font-mono"
                value={customClaims}
                onChange={(e) => setCustomClaims(e.target.value)}
                rows={4}
              />
            </div>

            <button
              type="button"
              className="primary-exec-btn"
              onClick={handleSign}
            >
              <Play size={14} /> Generate HS256 Token
            </button>

            {signError && (
              <div className="error-banner">
                <AlertCircle size={15} />
                <span>{signError}</span>
              </div>
            )}
          </div>

          {/* Sign Result */}
          <div className="workbench-col">
            <div className="card-header">
              <span className="card-header-title">Encoded Token & Inspection</span>
              {signedToken && (
                <button
                  type="button"
                  className="action-pill"
                  onClick={() => {
                    navigator.clipboard?.writeText(signedToken);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 1400);
                  }}
                >
                  {copiedToken ? <Check size={12} /> : <Copy size={12} />}
                  {copiedToken ? 'Copied' : 'Copy Token'}
                </button>
              )}
            </div>

            {signedToken ? (
              <div className="token-dissection">
                <div className="token-raw-box font-mono">
                  <span className="token-part-header">{tokenParts[0]}</span>.
                  <span className="token-part-payload">{tokenParts[1]}</span>.
                  <span className="token-part-signature">{tokenParts[2]}</span>
                </div>

                <div className="token-legend">
                  <span className="legend-item legend-header">Header (HS256)</span>
                  <span className="legend-item legend-payload">Payload (Claims)</span>
                  <span className="legend-item legend-sig">HMAC Signature</span>
                </div>

                <div className="token-claims-preview font-mono">
                  <div className="token-preview-title">Decoded Header:</div>
                  <pre>{JSON.stringify(decodedHeader ?? { alg: 'HS256', typ: 'JWT' }, null, 2)}</pre>

                  <div className="token-preview-title" style={{ marginTop: '14px' }}>
                    Signed Claims Payload:
                  </div>
                  <pre>
                    {JSON.stringify(decodedPayload ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="empty-studio-state">
                <KeyRound size={28} className="empty-icon" />
                <p>Configure parameters on the left and click "Generate HS256 Token".</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Verify Mode */
        <div className="workbench-grid">
          <div className="workbench-col">
            <div className="card-header">
              <span className="card-header-title">Verification Constraints</span>
            </div>

            <div className="form-group">
              <label htmlFor="verify-token-input">Bearer / JWT Token</label>
              <textarea
                id="verify-token-input"
                className="payload-textarea font-mono"
                placeholder="Paste HS256 token here (header.payload.signature)..."
                value={verifyTokenInput}
                onChange={(e) => setVerifyTokenInput(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="verify-secret-input">Secret Key</label>
              <input
                id="verify-secret-input"
                type="text"
                className="studio-input font-mono"
                value={verifySecretInput}
                onChange={(e) => setVerifySecretInput(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="verify-issuer-input">Expected Issuer (iss)</label>
                <input
                  id="verify-issuer-input"
                  type="text"
                  className="studio-input font-mono"
                  value={verifyIssuer}
                  onChange={(e) => setVerifyIssuer(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="verify-audience-input">Expected Audience (aud)</label>
                <input
                  id="verify-audience-input"
                  type="text"
                  className="studio-input font-mono"
                  value={verifyAudience}
                  onChange={(e) => setVerifyAudience(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="primary-exec-btn"
              onClick={handleVerify}
            >
              <CheckCircle2 size={14} /> Verify Claims & Authenticity
            </button>
          </div>

          <div className="workbench-col">
            <div className="card-header">
              <span className="card-header-title">Cryptographic Verdict</span>
            </div>

            {verifyResult ? (
              <div className="result-display-box font-mono">
                {verifyResult.verified ? (
                  <div className="result-pass">
                    <div className="result-pass-header">
                      <span className="result-pass-badge">
                        <CheckCircle2 size={14} /> SIGNATURE AUTHENTICATED
                      </span>
                    </div>
                    <pre className="result-json">
                      {JSON.stringify(verifyResult.claims, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="result-fail">
                    <div className="result-fail-header">
                      <span className="result-fail-badge">
                        <AlertCircle size={14} /> VERIFICATION REJECTED
                      </span>
                    </div>
                    <p className="result-fail-desc">{verifyResult.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-studio-state">
                <ShieldAlert size={28} className="empty-icon" />
                <p>Paste token and secret to evaluate cryptographic signature against Web Crypto.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
   3. SANITIZATION & HTML ESCAPING WORKBENCH
------------------------------------------------------------- */
function SanitizationWorkbench() {
  const [inputVal, setInputVal] = useState<string>(
    `<script>alert('xss')</script>\n<b onclick="leakData()">Security Admin</b> & "Special Quotations"`,
  );

  const escaped = escapeHtmlText(inputVal);
  const stripped = stripHtmlTags(inputVal);

  return (
    <div className="workbench-grid">
      <div className="workbench-col">
        <div className="card-header">
          <span className="card-header-title">Untrusted Input Stream</span>
          <button
            type="button"
            className="action-pill"
            onClick={() =>
              setInputVal(
                `<a href="javascript:void(0)" onfocus="stealCookies()">Click Here</a>\n<h1>Welcome & Good Luck!</h1>`,
              )
            }
          >
            Load Sample Payload
          </button>
        </div>
        <textarea
          className="payload-textarea font-mono"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          rows={8}
          spellCheck="false"
        />

        <div className="contract-card">
          <div className="contract-card-header">
            <Lock size={14} />
            <span>Honest Security Notice</span>
          </div>
          <p className="contract-card-body">
            <code>escapeHtmlText</code> performs deterministic contextual encoding for HTML text nodes.
            <code>stripHtmlTags</code> extracts approximate plain-text and <strong>must not be used as an XSS sanitizer</strong>.
            Preserving untrusted rich markup requires an allow-list engine such as DOMPurify.
          </p>
        </div>
      </div>

      <div className="workbench-col">
        <div className="card-header">
          <span className="card-header-title">escapeHtmlText(input)</span>
          <span className="card-badge">HTML Text Node Safe</span>
        </div>
        <div className="result-display-box font-mono" style={{ minHeight: '120px' }}>
          <pre className="result-json">{escaped}</pre>
        </div>

        <div className="card-header" style={{ marginTop: '18px' }}>
          <span className="card-header-title">stripHtmlTags(input)</span>
          <span className="card-badge">Plain-Text Extraction</span>
        </div>
        <div className="result-display-box font-mono" style={{ minHeight: '120px' }}>
          <pre className="result-json">{stripped}</pre>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   4. WEBCRYPTO HASHER WORKBENCH
------------------------------------------------------------- */
function HashWorkbench() {
  const [msg, setMsg] = useState('OmniGuard zero-dependency runtime primitive');
  const [algo, setAlgo] = useState<'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
  const [digest, setDigest] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Compute live hash
  const compute = async () => {
    const res = await hash(msg, algo);
    setDigest(res);
  };

  // Run initial or on change
  useState(() => {
    compute();
  });

  return (
    <div className="workbench-grid">
      <div className="workbench-col">
        <div className="card-header">
          <span className="card-header-title">Input String</span>
          <div className="algo-selector">
            {(['SHA-256', 'SHA-384', 'SHA-512'] as const).map((a) => (
              <button
                key={a}
                type="button"
                className={`preset-btn ${algo === a ? 'preset-btn--active' : ''}`}
                onClick={async () => {
                  setAlgo(a);
                  const res = await hash(msg, a);
                  setDigest(res);
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="payload-textarea font-mono"
          value={msg}
          onChange={async (e) => {
            setMsg(e.target.value);
            const res = await hash(e.target.value, algo);
            setDigest(res);
          }}
          rows={6}
          placeholder="Type message to hash..."
          spellCheck="false"
        />

        <div className="contract-card">
          <div className="contract-card-header">
            <Lock size={14} />
            <span>Cryptographic Digest Note</span>
          </div>
          <p className="contract-card-body">
            Produces standard WebCrypto hexadecimal digests. Intended for integrity checking, caching tokens, and non-credential
            signatures. For passwords, adopt a dedicated password hashing algorithm like Argon2id.
          </p>
        </div>
      </div>

      <div className="workbench-col">
        <div className="card-header">
          <div className="card-header-left">
            <span className="card-header-title">Digest Hex Output</span>
            <span className="card-badge">{algo}</span>
          </div>
          <button
            type="button"
            className="action-pill"
            onClick={() => {
              navigator.clipboard?.writeText(digest);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Digest'}
          </button>
        </div>

        <div className="hash-digest-box font-mono">
          <code>{digest || 'Computing...'}</code>
        </div>

        <div className="hash-meta-grid font-mono">
          <div className="meta-cell">
            <span className="meta-label">Output Bytes</span>
            <span className="meta-val">{digest ? digest.length / 2 : 0} bytes</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Bit Strength</span>
            <span className="meta-val">{algo.replace('SHA-', '')} bits</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Engine</span>
            <span className="meta-val">crypto.subtle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
