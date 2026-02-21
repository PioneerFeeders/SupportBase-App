import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './index.css';
import * as api from './api';

/* ═══════════════════════════════════════════════════════════
   SVG Icons — Zendesk-weight (1.5 stroke)
   ═══════════════════════════════════════════════════════════ */
const iconPaths = {
  inbox: <><path d="M22 12H16L14 15H10L8 12H2"/><path d="M5.45 5.11L2 12V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V12L18.55 5.11A2 2 0 0 0 16.76 4H7.24A2 2 0 0 0 5.45 5.11Z"/></>,
  search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
  chart: <><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>,
  back: <path d="M19 12H5M12 19l-7-7 7-7"/>,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
  check: <path d="M20 6L9 17l-5-5"/>,
  refresh: <><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
  card: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></>,
  phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.37 1.97.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.84.33 2 .57 2.81.7A2 2 0 0122 16.92z"/>,
  user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  chevronR: <path d="M9 18l6-6-6-6"/>,
  x: <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  track: <><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  package: <><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  externalLink: <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
  messageCircle: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>,
  bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
};

function Icon({ name, size = 20, color = 'currentColor', style: extra, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={extra} className={className}>
      {iconPaths[name]}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */
const timeAgo = (d) => {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const channelLabels = { amazon: 'Amazon', shopify: 'Shopify', phone: 'Phone', text: 'Text', email: 'Email' };
const statusStyles = {
  open: 'badge-open', in_progress: 'badge-in-progress', resolved: 'badge-resolved', closed: 'badge-closed', new: 'badge-new',
};
const channelStyles = {
  amazon: 'badge-amazon', shopify: 'badge-shopify', phone: 'badge-phone', text: 'badge-text', email: 'badge-email',
};

/* ═══════════════════════════════════════════════════════════
   Auth Hook
   ═══════════════════════════════════════════════════════════ */
function useAuth() {
  const [agent, setAgent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agent')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));

  const doLogin = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('agent', JSON.stringify(res.data.agent));
    setToken(res.data.token);
    setAgent(res.data.agent);
  };

  const doLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('agent');
    setToken(null);
    setAgent(null);
  };

  return { agent, token, isAuth: !!token, doLogin, doLogout };
}

/* ═══════════════════════════════════════════════════════════
   SSE Hook
   ═══════════════════════════════════════════════════════════ */
function useSSE(token) {
  const [incoming, setIncoming] = useState(null);

  useEffect(() => {
    if (!token) return;
    const url = api.getEventStreamUrl();
    let es, retryTimeout, retryDelay = 1000;

    function connect() {
      es = new EventSource(url);
      es.addEventListener('connected', () => { retryDelay = 1000; });
      es.addEventListener('incoming', e => {
        try {
          setIncoming(JSON.parse(e.data));
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } catch {}
      });
      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30000);
          connect();
        }, retryDelay);
      };
    }
    connect();
    return () => { if (es) es.close(); if (retryTimeout) clearTimeout(retryTimeout); };
  }, [token]);

  const dismiss = () => setIncoming(null);
  return { incoming, dismiss };
}

/* ═══════════════════════════════════════════════════════════
   LOGIN SCREEN
   ═══════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError('');
    try { await onLogin(email.toLowerCase().trim(), password); }
    catch (err) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-subtle)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Logo */}
          <div className="flex items-center gap-8" style={{ marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--kale-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>PF</span>
            </div>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)' }}>SupportBase</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-xxl)', fontWeight: 'var(--weight-bold)', marginBottom: 4 }}>Sign in</h1>
          <p style={{ color: 'var(--fg-muted)', marginBottom: 28 }}>Pioneer Feeders support workspace</p>
          <form onSubmit={submit}>
            <label className="label">Email address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@pioneerfeeders.com" autoComplete="email" />
            <label className="label" style={{ marginTop: 16 }}>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" autoComplete="current-password" />
            {error && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginTop: 8, fontWeight: 500 }}>{error}</div>}
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 24 }} disabled={loading}>
              {loading ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP BAR
   ═══════════════════════════════════════════════════════════ */
function TopBar({ agent, onLogout }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="top-bar">
      <div className="top-bar-logo">
        <div className="top-bar-logo-mark">PF</div>
        <span>SupportBase</span>
      </div>
      <div className="top-bar-center" />
      <div className="top-bar-actions">
        <div style={{ position: 'relative' }}>
          <div className="top-bar-avatar" onClick={() => setMenu(!menu)}>
            {(agent?.name || '?')[0].toUpperCase()}
          </div>
          {menu && <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setMenu(false)} />
            <div style={{
              position: 'absolute', top: 40, right: 0, zIndex: 1000, background: 'var(--bg-default)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)', minWidth: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>{agent?.name}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>{agent?.email}</div>
              </div>
              <button onClick={onLogout} className="flex items-center gap-8"
                style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--danger)', fontSize: 'var(--text-md)', fontWeight: 500 }}>
                <Icon name="logout" size={16} color="var(--danger)" /> Sign out
              </button>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOTTOM TAB BAR (mobile)
   ═══════════════════════════════════════════════════════════ */
function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'inbox', icon: 'inbox', label: 'Tickets' },
    { id: 'search', icon: 'search', label: 'Resolve' },
    { id: 'stats', icon: 'chart', label: 'Stats' },
  ];
  return (
    <div className="tab-bar">
      {tabs.map(t => (
        <button key={t.id} className={`tab-item ${active === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          <span className="tab-icon"><Icon name={t.icon} size={20} /></span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUICK RESOLVE SHEET
   ═══════════════════════════════════════════════════════════ */
const RESOLVE_TYPES = [
  { id: 'no_action', label: 'No Action Needed', icon: '✓', color: 'var(--success)', needsReason: false },
  { id: 'info_only', label: 'Info / Answered', icon: 'ℹ', color: 'var(--primary)', needsReason: false },
  { id: 'reship', label: 'Reship Created', icon: '↻', color: 'var(--warning)', needsReason: true },
  { id: 'refund', label: 'Refund Issued', icon: '$', color: 'var(--danger)', needsReason: true },
];
const RESOLVE_REASONS = [
  { id: 'doa', label: 'DOA' }, { id: 'damaged', label: 'Damaged in Transit' },
  { id: 'wrong_order', label: 'Wrong Order' }, { id: 'undercount', label: 'Undercount' },
  { id: 'missing', label: 'Missing Item' }, { id: 'weather', label: 'Weather / Delay' },
  { id: 'customer_request', label: 'Customer Request' }, { id: 'other', label: 'Other' },
];

function QuickResolveSheet({ ticketId, onDone, onCancel }) {
  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const resolve = async (type, reason) => {
    setLoading(true);
    try {
      await api.updateTicket(ticketId, { status: 'resolved', resolutionType: type, resolutionReason: reason || null });
      onDone();
    } catch { alert('Failed to resolve'); }
    finally { setLoading(false); }
  };

  const handleType = t => { if (t.needsReason) { setSelectedType(t); setStep('reason'); } else resolve(t.id, null); };

  return (
    <div className="sheet-overlay">
      <div className="sheet-backdrop" onClick={onCancel} />
      <div className="sheet-content">
        <div className="sheet-handle"><div className="sheet-handle-bar" /></div>
        {step === 'type' ? (
          <div style={{ padding: '8px 20px 12px' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 4 }}>Quick Resolve</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', marginBottom: 16 }}>How was this ticket resolved?</p>
            {RESOLVE_TYPES.map(t => (
              <button key={t.id} onClick={() => handleType(t)} disabled={loading}
                className="flex items-center gap-12"
                style={{ width: '100%', padding: '12px 16px', marginBottom: 4, borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: `color-mix(in srgb, ${t.color} 12%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: t.color }}>{t.icon}</div>
                <span style={{ flex: 1, fontWeight: 500 }}>{t.label}</span>
                {t.needsReason && <Icon name="chevronR" size={16} color="var(--fg-muted)" />}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '8px 20px 12px' }}>
            <div className="flex items-center gap-8" style={{ marginBottom: 16 }}>
              <button onClick={() => setStep('type')} className="btn btn-default btn-sm" style={{ padding: 4 }}>
                <Icon name="back" size={16} />
              </button>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{selectedType?.label}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>Select reason</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {RESOLVE_REASONS.map(r => (
                <button key={r.id} onClick={() => resolve(selectedType.id, r.id)} disabled={loading}
                  className="btn btn-default" style={{ justifyContent: 'center', fontSize: 'var(--text-sm)' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ padding: '0 20px 4px' }}>
          <button onClick={onCancel} className="btn btn-default btn-full" style={{ marginTop: 8 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TICKET LIST PANEL
   ═══════════════════════════════════════════════════════════ */
function TicketList({ onSelect, selectedId, onReload, reloadKey }) {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'resolved') { params.status = 'resolved'; params.showAll = true; }
      else if (filter !== 'all') params.channel = filter;
      const res = await api.getTickets(params);
      setTickets(res.data.tickets || res.data || []);
    } catch (e) { console.error('tickets load fail', e); }
    finally { setLoading(false); }
  }, [filter, reloadKey]);

  useEffect(() => { load(); }, [load]);

  const filters = ['all', 'phone', 'text', 'shopify', 'amazon', 'resolved'];

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-default)', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Tickets</h2>
          <button onClick={load} className="top-bar-btn" style={{ color: 'var(--fg-muted)' }}>
            <Icon name="refresh" size={18} />
          </button>
        </div>
        <div className="flex gap-4" style={{ overflowX: 'auto', paddingBottom: 2 }}>
          {filters.map(f => (
            <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'resolved' ? 'Resolved' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : tickets.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-state-icon"><Icon name="inbox" size={24} /></div>
            <div className="empty-state-title">All clear</div>
            <div className="empty-state-desc">No tickets match this filter</div>
          </div>
        ) : tickets.map(t => (
          <div key={t.id}
            className={`ticket-item fade-in ${selectedId === t.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(t)}>
            <div className="ticket-item-avatar" style={{ background: 'var(--primary-subtle)', color: 'var(--primary-fg)' }}>
              {(t.customerName || '?')[0].toUpperCase()}
            </div>
            <div className="ticket-item-body">
              <div className="ticket-item-header">
                <span className="ticket-item-name truncate">{t.customerName || 'Unknown'}</span>
                <span className="ticket-item-time">{timeAgo(t.updatedAt || t.createdAt)}</span>
              </div>
              <div className="ticket-item-subject">{t.subject || 'No subject'}</div>
              <div className="ticket-item-meta">
                <span className={`badge ${statusStyles[t.status] || 'badge-open'}`}>
                  {(t.status || 'open').replace('_', ' ')}
                </span>
                <span className={`badge ${channelStyles[t.channel] || 'badge-email'}`}>
                  {channelLabels[t.channel] || t.channel || 'Email'}
                </span>
                {t.status !== 'resolved' && t.status !== 'closed' && (
                  <button onClick={e => { e.stopPropagation(); setResolveId(t.id); }}
                    className="btn btn-sm" style={{
                      marginLeft: 'auto', padding: '1px 8px', minHeight: 24,
                      background: 'var(--success-subtle)', color: 'var(--success-fg)',
                      border: '1px solid var(--green-300)', fontSize: 'var(--text-xs)',
                    }}>
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {resolveId && <QuickResolveSheet ticketId={resolveId} onCancel={() => setResolveId(null)} onDone={() => { setResolveId(null); load(); }} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TICKET DETAIL / CONVERSATION
   ═══════════════════════════════════════════════════════════ */
function TicketDetail({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.getTicketMessages(ticket.id);
      setMessages(res.data.messages || res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [ticket.id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.sendMessage(ticket.id, { body: text.trim(), type: 'reply' });
      setText('');
      await loadMessages();
    } catch (e) { alert('Send failed'); }
    finally { setSending(false); }
  };

  return (
    <div className="flex-col" style={{ height: '100%', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
      {/* Detail header */}
      <div style={{
        padding: '12px 16px', background: 'var(--bg-default)',
        borderBottom: '1px solid var(--border-default)', flexShrink: 0,
      }}>
        <div className="flex items-center gap-12">
          {onBack && (
            <button onClick={onBack} className="btn btn-default btn-sm" style={{ padding: 4 }}>
              <Icon name="back" size={18} />
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-8">
              <span style={{ fontWeight: 600, fontSize: 'var(--text-md)' }} className="truncate">
                {ticket.customerName || 'Unknown'}
              </span>
              <span className={`badge ${statusStyles[ticket.status] || 'badge-open'}`}>
                {(ticket.status || 'open').replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }} className="truncate">
              {ticket.subject || 'No subject'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : messages.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-state-icon"><Icon name="messageCircle" size={24} /></div>
            <div className="empty-state-title">No messages yet</div>
          </div>
        ) : messages.map((msg, i) => {
          const isAgent = msg.sender === 'agent' || msg.senderType === 'agent';
          const isSystem = msg.type === 'system' || msg.sender === 'system';
          if (isSystem) return (
            <div key={msg.id || i} style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
              <div className="msg-bubble-system">{msg.body}</div>
            </div>
          );
          return (
            <div key={msg.id || i} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: isAgent ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}>
              <div className="msg-sender">{isAgent ? (msg.agentName || 'You') : (ticket.customerName || 'Customer')}</div>
              <div className={isAgent ? 'msg-bubble msg-bubble-agent' : 'msg-bubble msg-bubble-customer'}>
                {msg.body}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 2 }}>
                {timeAgo(msg.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="composer">
        <textarea className="composer-input" value={text} onChange={e => setText(e.target.value)}
          placeholder="Type a reply..." rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button onClick={send}
          className={`composer-send ${text.trim() ? 'composer-send-active' : 'composer-send-inactive'}`}
          disabled={!text.trim() || sending}>
          {sending ? <div className="spinner spinner-sm" /> : <Icon name="send" size={18} />}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOMER CONTEXT PANEL (right side, desktop)
   ═══════════════════════════════════════════════════════════ */
function ContextPanel({ ticket }) {
  if (!ticket) return (
    <div className="context-panel" style={{ display: 'none' }}>
      {/* Placeholder — shows only on desktop via CSS */}
    </div>
  );

  return (
    <div className="context-panel">
      <div className="context-panel-header">
        <h3><Icon name="user" size={16} style={{ marginRight: 6, verticalAlign: -2 }} />Customer</h3>
      </div>
      <div className="context-panel-body">
        {/* Customer Info */}
        <div className="context-section">
          <div className="context-section-title">Contact</div>
          <div className="context-field">
            <span className="context-field-label">Name</span>
            <span className="context-field-value">{ticket.customerName || '—'}</span>
          </div>
          {ticket.customerEmail && (
            <div className="context-field">
              <span className="context-field-label">Email</span>
              <span className="context-field-value" style={{ fontSize: 'var(--text-xs)' }}>{ticket.customerEmail}</span>
            </div>
          )}
          {ticket.customerPhone && (
            <div className="context-field">
              <span className="context-field-label">Phone</span>
              <span className="context-field-value">{ticket.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Ticket Info */}
        <div className="context-section">
          <div className="context-section-title">Ticket Details</div>
          <div className="context-field">
            <span className="context-field-label">Channel</span>
            <span className={`badge ${channelStyles[ticket.channel] || 'badge-email'}`}>
              {channelLabels[ticket.channel] || ticket.channel || 'Email'}
            </span>
          </div>
          <div className="context-field">
            <span className="context-field-label">Status</span>
            <span className={`badge ${statusStyles[ticket.status] || 'badge-open'}`}>
              {(ticket.status || 'open').replace('_', ' ')}
            </span>
          </div>
          <div className="context-field">
            <span className="context-field-label">Created</span>
            <span className="context-field-value">{fmtDate(ticket.createdAt)}</span>
          </div>
          {ticket.orderNumber && (
            <div className="context-field">
              <span className="context-field-label">Order</span>
              <span className="context-field-value" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {ticket.orderNumber}
              </span>
            </div>
          )}
        </div>

        {/* Order Info (if available) */}
        {ticket.orderTotal && (
          <div className="context-section">
            <div className="context-section-title">Order</div>
            <div className="context-field">
              <span className="context-field-label">Total</span>
              <span className="context-field-value">${ticket.orderTotal}</span>
            </div>
            {ticket.trackingNumber && (
              <div className="context-field">
                <span className="context-field-label">Tracking</span>
                <span className="context-field-value" style={{ fontSize: 'var(--text-xs)' }}>{ticket.trackingNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Resolution (if resolved) */}
        {ticket.resolutionType && (
          <div className="context-section">
            <div className="context-section-title">Resolution</div>
            <div className="context-field">
              <span className="context-field-label">Type</span>
              <span className="context-field-value">{ticket.resolutionType}</span>
            </div>
            {ticket.resolutionReason && (
              <div className="context-field">
                <span className="context-field-label">Reason</span>
                <span className="context-field-value">{ticket.resolutionReason}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SEARCH / RESOLVE SCREEN
   ═══════════════════════════════════════════════════════════ */
function SearchScreen({ onSelectCustomer }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async e => {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true); setSearched(true);
    try {
      const res = await api.searchCustomers(query.trim());
      setResults(res.data.customers || res.data || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 16px', background: 'var(--bg-default)', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xxl)', fontWeight: 700 }}>Resolve</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', marginTop: 2 }}>
          Search customers by name, email, phone, or order number
        </p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        <form onSubmit={doSearch} className="flex gap-8" style={{ padding: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input className="input" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search customers..." style={{ paddingLeft: 36 }} />
            <Icon name="search" size={16} color="var(--fg-muted)"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={query.trim().length < 2}>Search</button>
        </form>
        <div style={{ padding: '0 16px' }}>
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : results.length > 0 ? results.map(c => (
            <div key={c.id} className="card card-interactive fade-in flex items-center gap-12"
              onClick={() => onSelectCustomer(c)}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-full)',
                background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--primary-fg)', flexShrink: 0,
              }}>
                {(c.name || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{c.name || 'Unknown'}</div>
                {c.email && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>{c.email}</div>}
              </div>
              <div className="text-center" style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{c.ordersCount || 0}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>orders</div>
              </div>
              <Icon name="chevronR" size={16} color="var(--fg-muted)" />
            </div>
          )) : searched ? (
            <div className="empty-state fade-in">
              <div className="empty-state-icon"><Icon name="user" size={24} /></div>
              <div className="empty-state-title">No results</div>
              <div className="empty-state-desc">Try a different search</div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Icon name="search" size={24} /></div>
              <div className="empty-state-title">Find a customer</div>
              <div className="empty-state-desc">Search by name, email, phone, or order #</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOMER DETAIL (orders list)
   ═══════════════════════════════════════════════════════════ */
function CustomerDetail({ customer, onBack, onReship, onRefund }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCustomerOrders(customer.id)
      .then(r => setOrders(r.data.orders || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customer.id]);

  const statusColor = { fulfilled: 'var(--success)', partial: 'var(--warning)', unfulfilled: 'var(--danger)' };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', background: 'var(--bg-default)', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <div className="flex items-center gap-12" style={{ marginBottom: 12 }}>
          <button onClick={onBack} className="btn btn-default btn-sm" style={{ padding: 4 }}><Icon name="back" size={18} /></button>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{customer.name}</h2>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>{[customer.email, customer.phone].filter(Boolean).join(' · ')}</div>
          </div>
        </div>
        <div className="flex gap-16" style={{ paddingTop: 8 }}>
          <div><div style={{ fontSize: 'var(--text-xxl)', fontWeight: 700 }}>{customer.ordersCount || 0}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Orders</div></div>
          <div style={{ width: 1, background: 'var(--border-default)' }} />
          <div><div style={{ fontSize: 'var(--text-xxl)', fontWeight: 700 }}>${customer.totalSpent || '0.00'}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Lifetime</div></div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 }}>
        <span className="label-muted">{orders.length} Order{orders.length !== 1 ? 's' : ''}</span>
        {loading ? <div className="empty-state"><div className="spinner" /></div> : orders.map(o => (
          <div key={o.id} className="card fade-in">
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <div className="flex items-center gap-8">
                <span className={`badge ${o.channel === 'amazon' ? 'badge-amazon' : 'badge-shopify'}`}>
                  {o.channel === 'amazon' ? 'Amazon' : 'Shopify'}
                </span>
                <span style={{ fontWeight: 600 }}>{o.name}</span>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{fmtDate(o.createdAt)}</span>
            </div>
            {o.lineItems?.map((li, i) => (
              <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-subtle)', marginBottom: 2 }}>
                {li.quantity}× {li.title}
              </div>
            ))}
            <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
              <span className="badge" style={{
                background: `color-mix(in srgb, ${statusColor[o.fulfillmentStatus] || 'var(--fg-muted)'} 12%, transparent)`,
                color: statusColor[o.fulfillmentStatus] || 'var(--fg-muted)', textTransform: 'capitalize',
              }}>
                {o.fulfillmentStatus || 'Unfulfilled'}
              </span>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>${o.totalPrice}</span>
            </div>
            {o.fulfillments?.[0]?.trackingNumber && (
              <a href={o.fulfillments[0].trackingUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-8"
                style={{ marginTop: 8, padding: '8px 12px', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', color: 'var(--primary-fg)' }}>
                <Icon name="track" size={14} color="var(--primary-fg)" />
                <span style={{ flex: 1 }}>{o.fulfillments[0].trackingCompany} {o.fulfillments[0].trackingNumber}</span>
                <Icon name="externalLink" size={12} color="var(--primary-fg)" />
              </a>
            )}
            <div className="flex gap-8" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <button className="btn btn-ghost btn-sm flex-1" onClick={() => onReship(o)}>
                <Icon name="refresh" size={14} /> Reship
              </button>
              <button className="btn btn-danger-ghost btn-sm flex-1" onClick={() => onRefund(o)}>
                <Icon name="card" size={14} /> Refund
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATS SCREEN
   ═══════════════════════════════════════════════════════════ */
function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTicketStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state" style={{ height: '100%' }}><div className="spinner" /></div>;
  if (!stats) return <div className="empty-state" style={{ height: '100%' }}><div className="empty-state-title">Stats unavailable</div></div>;

  const statCards = [
    { label: 'Open', value: stats.open || 0, color: 'var(--warning)' },
    { label: 'In Progress', value: stats.inProgress || stats.in_progress || 0, color: 'var(--primary)' },
    { label: 'Resolved Today', value: stats.resolvedToday || 0, color: 'var(--success)' },
    { label: 'Total', value: stats.total || 0, color: 'var(--fg-muted)' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 16px', background: 'var(--bg-default)', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 'var(--text-xxl)', fontWeight: 700 }}>Dashboard</h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {statCards.map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Channel breakdown */}
        {stats.byChannel && (
          <div style={{ marginTop: 20 }}>
            <span className="label-muted">By Channel</span>
            {Object.entries(stats.byChannel).map(([ch, count]) => (
              <div key={ch} className="card flex items-center justify-between" style={{ padding: '12px 16px' }}>
                <span className={`badge ${channelStyles[ch] || 'badge-email'}`}>{channelLabels[ch] || ch}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INCOMING EVENT POPUP
   ═══════════════════════════════════════════════════════════ */
function IncomingPopup({ event, onOpen, onDismiss }) {
  if (!event) return null;
  return (
    <div style={{
      position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 400,
    }}>
      <div className="card fade-in" style={{
        boxShadow: 'var(--shadow-lg)', borderColor: 'var(--primary)',
        borderWidth: 2, padding: '16px',
      }}>
        <div className="flex items-center gap-12">
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-full)', background: 'var(--primary-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="bell" size={20} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{event.customerName || 'New Ticket'}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }} className="truncate">{event.subject || event.preview || 'Incoming message'}</div>
          </div>
        </div>
        <div className="flex gap-8" style={{ marginTop: 12 }}>
          <button className="btn btn-primary btn-sm flex-1" onClick={() => onOpen(event)}>Open</button>
          <button className="btn btn-default btn-sm" onClick={onDismiss}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const { agent, token, isAuth, doLogin, doLogout } = useAuth();
  const { incoming, dismiss: dismissIncoming } = useSSE(token);

  // Navigation state
  const [tab, setTab] = useState('inbox');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [subScreen, setSubScreen] = useState(null); // { type: 'customer', data } or { type: 'reship', data } etc.
  const [reloadKey, setReloadKey] = useState(0);

  // Detect desktop
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Handle incoming event
  const handleOpenIncoming = (event) => {
    if (event.ticketId) {
      setSelectedTicket({ id: event.ticketId, ...event });
      setTab('inbox');
    }
    dismissIncoming();
  };

  // Handle ticket selection
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setSubScreen(null);
  };

  // Customer flow
  const handleSelectCustomer = c => setSubScreen({ type: 'customer', data: c });
  const handleReship = o => setSubScreen({ type: 'reship', data: o });
  const handleRefund = o => setSubScreen({ type: 'refund', data: o });

  if (!isAuth) return <LoginScreen onLogin={doLogin} />;

  // ─── Render ────────────────────────────────────────────
  const renderMainContent = () => {
    // Sub-screens (customer detail, reship, refund)
    if (subScreen?.type === 'customer') {
      return <CustomerDetail
        customer={subScreen.data}
        onBack={() => setSubScreen(null)}
        onReship={handleReship}
        onRefund={handleRefund}
      />;
    }

    switch (tab) {
      case 'inbox':
        // Split pane on desktop
        if (isDesktop) {
          return (
            <div className="split-view">
              <div className="split-list">
                <TicketList onSelect={handleSelectTicket} selectedId={selectedTicket?.id} reloadKey={reloadKey} />
              </div>
              <div className="split-detail" style={{ display: 'flex' }}>
                {selectedTicket ? (
                  <TicketDetail ticket={selectedTicket} />
                ) : (
                  <div className="empty-state" style={{ flex: 1 }}>
                    <div className="empty-state-icon"><Icon name="messageCircle" size={24} /></div>
                    <div className="empty-state-title">Select a ticket</div>
                    <div className="empty-state-desc">Choose a conversation from the list</div>
                  </div>
                )}
              </div>
              <ContextPanel ticket={selectedTicket} />
            </div>
          );
        }
        // Mobile: show detail or list
        if (selectedTicket) {
          return <TicketDetail ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />;
        }
        return <TicketList onSelect={handleSelectTicket} selectedId={null} reloadKey={reloadKey} />;

      case 'search':
        return <SearchScreen onSelectCustomer={handleSelectCustomer} />;

      case 'stats':
        return <StatsScreen />;

      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <TopBar agent={agent} onLogout={doLogout} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderMainContent()}
      </div>
      {/* Hide tab bar when viewing ticket detail on mobile */}
      {!(selectedTicket && !isDesktop) && !subScreen && (
        <TabBar active={tab} onChange={t => { setTab(t); setSelectedTicket(null); setSubScreen(null); }} />
      )}
      <IncomingPopup event={incoming} onOpen={handleOpenIncoming} onDismiss={dismissIncoming} />
    </div>
  );
}
