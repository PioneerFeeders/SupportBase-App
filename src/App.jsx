import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import * as api from './api';

// ─── Icons (inline SVG for zero dependencies) ───────────
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const icons = {
    mail: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    chart: <><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>,
    back: <path d="M19 12H5M12 19l-7-7 7-7"/>,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
    check: <path d="M20 6L9 17l-5-5"/>,
    refresh: <><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
    card: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></>,
    phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>,
    cart: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    flash: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
    chevron: <path d="M9 18l6-6-6-6"/>,
    x: <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    track: <><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── Auth Context ────────────────────────────────────────
const useAuth = () => {
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
};

// ─── Login Screen ────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError('');
    try {
      await onLogin(email.toLowerCase(), password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 28 }}>
      <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>S</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>SupportBase</h1>
      <p style={{ color: 'var(--text-sec)', marginBottom: 36 }}>Pioneer Feeders</p>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340 }}>
        <div className="label">Email</div>
        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pioneerfeeders.com" autoComplete="email" />
        <div className="label" style={{ marginTop: 16 }}>Password</div>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{error}</div>}
        <button className="btn btn-primary" style={{ marginTop: 24 }} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// ─── Quick Resolve Sheet ─────────────────────────────────
const RESOLVE_TYPES = [
  { id: 'no_action', label: 'No Action Needed', icon: '✅', needsReason: false },
  { id: 'info_only', label: 'Info / Answered Question', icon: '💡', needsReason: false },
  { id: 'reship', label: 'Reship Created', icon: '📦', needsReason: true },
  { id: 'refund', label: 'Refund Issued', icon: '💳', needsReason: true },
];

const RESOLVE_REASONS = [
  { id: 'doa', label: 'DOA' },
  { id: 'damaged', label: 'Damaged in Transit' },
  { id: 'wrong_order', label: 'Wrong Order' },
  { id: 'undercount', label: 'Undercount' },
  { id: 'missing', label: 'Missing Item' },
  { id: 'weather', label: 'Weather / Delay' },
  { id: 'customer_request', label: 'Customer Request' },
  { id: 'other', label: 'Other' },
];

function QuickResolveSheet({ ticketId, onDone, onCancel }) {
  const [step, setStep] = useState('type'); // 'type' or 'reason'
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const resolve = async (type, reason) => {
    setLoading(true);
    try {
      await api.updateTicket(ticketId, {
        status: 'resolved',
        resolutionType: type,
        resolutionReason: reason || null,
      });
      onDone();
    } catch (e) {
      alert('Failed to resolve');
      console.error(e);
    } finally { setLoading(false); }
  };

  const handleTypeSelect = (type) => {
    if (type.needsReason) {
      setSelectedType(type);
      setStep('reason');
    } else {
      resolve(type.id, null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: 'var(--bg)', borderRadius: '20px 20px 0 0', paddingBottom: 'calc(16px + var(--safe-bottom))', animation: 'slideUp 0.25s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {step === 'type' ? (
          <div style={{ padding: '8px 20px 12px' }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Quick Resolve</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>How was this resolved?</div>
            {RESOLVE_TYPES.map(t => (
              <button key={t.id} onClick={() => handleTypeSelect(t)} disabled={loading}
                className="flex items-center gap-12"
                style={{
                  width: '100%', padding: '14px 16px', marginBottom: 6, borderRadius: 12,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  cursor: 'pointer', textAlign: 'left', opacity: loading ? 0.5 : 1,
                }}>
                <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{t.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{t.label}</span>
                {t.needsReason && <Icon name="chevron" size={16} color="var(--text-muted)" />}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '8px 20px 12px' }}>
            <div className="flex items-center gap-8" style={{ marginBottom: 16 }}>
              <button onClick={() => setStep('type')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="back" size={16} color="var(--text)" />
              </button>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{selectedType?.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Select reason</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {RESOLVE_REASONS.map(r => (
                <button key={r.id} onClick={() => resolve(selectedType.id, r.id)} disabled={loading}
                  style={{
                    padding: '12px 10px', borderRadius: 10,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text)',
                    textAlign: 'center', opacity: loading ? 0.5 : 1,
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '4px 20px 0' }}>
          <button onClick={onCancel} style={{
            width: '100%', padding: 12, borderRadius: 10,
            background: 'transparent', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--text-muted)',
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Inbox ───────────────────────────────────────────────
function InboxScreen({ onOpenTicket, onNavigate }) {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [resolveTicketId, setResolveTicketId] = useState(null);

  const load = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { channel: filter } : {};
      const res = await api.getTickets(params);
      setTickets(res.data.tickets);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const channelIcon = { amazon: '📦', shopify: '🛒', phone: '📞', text: '💬', email: '✉️' };
  const channelColor = { amazon: 'var(--amazon)', shopify: 'var(--shopify)', phone: 'var(--phone-c)', text: 'var(--text-c)' };
  const statusColor = { open: 'var(--warning)', in_progress: 'var(--info)', resolved: 'var(--success)', closed: 'var(--text-muted)' };

  return (
    <div className="page">
      <div className="page-header flex items-center justify-between">
        <h1>Inbox</h1>
        <button onClick={() => onNavigate('search')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={20} color="var(--primary)" />
        </button>
      </div>
      <div className="flex gap-8 px-20 mb-16" style={{ overflowX: 'auto' }}>
        {['all', 'amazon', 'shopify', 'phone', 'text'].map(f => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="px-20">
        {loading ? (
          <div className="text-center mt-24"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : tickets.length === 0 ? (
          <div className="text-center mt-24 fade-in">
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-sec)' }}>All clear</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No tickets to show</div>
          </div>
        ) : tickets.map(t => (
          <div key={t.id} className="card fade-in" style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-12" onClick={() => onOpenTicket(t.id)}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${channelColor[t.channel]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {channelIcon[t.channel]}
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex items-center justify-between">
                  <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.customerName || 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{timeAgo(t.updatedAt)}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-sec)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-8">
                <div style={{ width: 6, height: 6, borderRadius: 3, background: statusColor[t.status] }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: statusColor[t.status], textTransform: 'capitalize' }}>{t.status?.replace('_', ' ')}</span>
              </div>
              {t.status !== 'resolved' && t.status !== 'closed' && (
                <button onClick={(e) => { e.stopPropagation(); setResolveTicketId(t.id); }}
                  style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--success-bg)', border: '1px solid var(--success)30', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--success)' }}>
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {resolveTicketId && (
        <QuickResolveSheet
          ticketId={resolveTicketId}
          onCancel={() => setResolveTicketId(null)}
          onDone={() => { setResolveTicketId(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Search / Resolve ────────────────────────────────────
function SearchScreen({ onSelectCustomer }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (e) => {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true); setSearched(true);
    try {
      const res = await api.searchCustomers(query.trim());
      setResults(res.data.customers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header"><h1>Resolve</h1></div>
      <form onSubmit={doSearch} className="flex gap-8 px-20 mb-16">
        <div className="flex-1" style={{ position: 'relative' }}>
          <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, email, phone, or order #" style={{ paddingLeft: 40 }} />
          <Icon name="search" size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={query.trim().length < 2} style={{ width: 'auto', padding: '14px 16px' }}>Go</button>
      </form>
      <div className="px-20">
        {loading ? (
          <div className="text-center mt-24"><div className="spinner" style={{ margin: '0 auto' }} /><div style={{ color: 'var(--text-sec)', marginTop: 12 }}>Searching Shopify...</div></div>
        ) : results.length > 0 ? results.map(c => (
          <div key={c.id} className="card fade-in flex items-center gap-12" onClick={() => onSelectCustomer(c)} style={{ cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>
              {(c.name || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name || 'Unknown'}</div>
              {c.email && <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{c.email}</div>}
              {c.phone && <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{c.phone}</div>}
            </div>
            <div className="text-center" style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{c.ordersCount || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>orders</div>
            </div>
            <Icon name="chevron" size={16} color="var(--text-muted)" />
          </div>
        )) : searched ? (
          <div className="text-center mt-24 fade-in">
            <Icon name="user" size={48} color="var(--text-muted)" />
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-sec)', marginTop: 12 }}>No results</div>
          </div>
        ) : (
          <div className="text-center mt-24">
            <Icon name="search" size={48} color="var(--text-muted)" />
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-sec)', marginTop: 12 }}>Find a customer</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Search by name, email, phone, or order #</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Customer Detail ─────────────────────────────────────
function CustomerScreen({ customer, onBack, onReship, onRefund }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCustomerOrders(customer.id).then(r => setOrders(r.data.orders)).catch(console.error).finally(() => setLoading(false));
  }, [customer.id]);

  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const statusColor = { fulfilled: 'var(--success)', partial: 'var(--warning)', unfulfilled: 'var(--danger)' };

  return (
    <div className="page" style={{ paddingBottom: 20 }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '56px 20px 20px', textAlign: 'center' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 56, left: 20, width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={20} color="var(--text)" />
        </button>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26, fontWeight: 700, color: 'var(--primary)' }}>{(customer.name || '?')[0].toUpperCase()}</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{customer.name}</div>
        {customer.email && <div style={{ fontSize: 14, color: 'var(--info)', marginTop: 2 }}>{customer.email}</div>}
        {customer.phone && <div style={{ fontSize: 14, color: 'var(--info)', marginTop: 2 }}>{customer.phone}</div>}
        <div className="flex justify-between" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div className="text-center flex-1"><div style={{ fontSize: 17, fontWeight: 700 }}>{customer.ordersCount || 0}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Orders</div></div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div className="text-center flex-1"><div style={{ fontSize: 17, fontWeight: 700 }}>${customer.totalSpent || '0.00'}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lifetime</div></div>
        </div>
      </div>
      <div className="flex items-center justify-between px-20" style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Order History</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{orders.length}</div>
      </div>
      <div className="px-20">
        {loading ? <div className="text-center mt-24"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        : orders.map(o => (
          <div key={o.id} className="card fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8">
                <span style={{ fontSize: 14 }}>{o.channel === 'amazon' ? '📦' : '🛒'}</span>
                <span style={{ fontWeight: 600 }}>{o.name}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(o.createdAt)}</span>
            </div>
            {o.lineItems.map((li, i) => <div key={i} style={{ fontSize: 14, color: 'var(--text-sec)', marginBottom: 2 }}>{li.quantity}× {li.title}</div>)}
            <div className="flex items-center justify-between mt-8">
              <span className="badge" style={{ background: `${statusColor[o.fulfillmentStatus] || 'var(--text-muted)'}20`, color: statusColor[o.fulfillmentStatus] || 'var(--text-muted)', textTransform: 'capitalize' }}>
                {o.fulfillmentStatus || 'Unfulfilled'}
              </span>
              <span style={{ fontSize: 17, fontWeight: 700 }}>${o.totalPrice}</span>
            </div>
            {o.fulfillments?.[0]?.trackingNumber && (
              <a href={o.fulfillments[0].trackingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-8" style={{ marginTop: 10, padding: '8px 12px', background: 'var(--info-bg)', borderRadius: 8, fontSize: 13, color: 'var(--info)' }}>
                <Icon name="track" size={14} color="var(--info)" />
                <span className="flex-1">{o.fulfillments[0].trackingCompany} {o.fulfillments[0].trackingNumber}</span>
              </a>
            )}
            <div className="flex gap-8" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost flex-1" style={{ padding: '10px 0' }} onClick={() => onReship(o)}>
                <Icon name="refresh" size={16} color="var(--primary)" /> Reship
              </button>
              <button className="btn btn-danger-ghost flex-1" style={{ padding: '10px 0' }} onClick={() => onRefund(o)}>
                <Icon name="card" size={16} color="var(--danger)" /> Refund
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reship ──────────────────────────────────────────────
const REASONS = ['doa', 'damaged', 'missing', 'wrong_item', 'weather', 'customer_request', 'other'];
const REASON_LABELS = { doa: 'DOA', damaged: 'Damaged', missing: 'Missing', wrong_item: 'Wrong Item', weather: 'Weather', customer_request: 'Customer Request', other: 'Other' };
const SHIP_METHODS = ['Standard', 'Priority Mail', 'USPS First Class', 'UPS Ground', 'UPS 2-Day', 'UPS Next Day'];

function ReshipScreen({ order, customer, onBack, onDone }) {
  const [items, setItems] = useState(order.lineItems.map(i => ({ ...i, selected: true })));
  const [reason, setReason] = useState('');
  const [shipping, setShipping] = useState(order.shippingLines?.[0]?.title || 'Standard');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const toggle = (i) => { const u = [...items]; u[i] = { ...u[i], selected: !u[i].selected }; setItems(u); };
  const count = items.filter(i => i.selected).length;

  const submit = async () => {
    if (!reason || !count) return;
    if (!window.confirm(`Reship ${count} item(s) for ${order.name}?\nThis creates a new $0 order in Shopify.`)) return;
    setLoading(true);
    try {
      const res = await api.createReship(order.id, {
        lineItems: items.filter(i => i.selected).map(i => ({ title: i.title, quantity: i.quantity, price: i.price, sku: i.sku, variant_id: i.variantId })),
        shippingMethod: shipping, reason, notes: notes.trim() || undefined,
      });
      setSuccess(res.data);
    } catch (e) { alert(e.response?.data?.error || 'Reship failed'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="page flex-col items-center" style={{ justifyContent: 'center', padding: 28, paddingBottom: 28 }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon name="check" size={44} color="var(--success)" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Reship Created</h2>
      <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: 16, marginTop: 4 }}>{success.reship?.newOrderName || 'New Order'}</div>
      <div className="card w-full" style={{ marginTop: 24 }}>
        {[['Original', order.name], ['New Order', success.reship?.newOrderName || '—'], ['Items', `${count} item(s)`], ['Shipping', shipping], ['Reason', REASON_LABELS[reason]]].map(([l, v]) => (
          <div key={l} className="flex justify-between" style={{ padding: '8px 0' }}><span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{l}</span><span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span></div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 16 }}>Order will flow to ShipStation automatically.</div>
      <button className="btn btn-primary" style={{ marginTop: 24, maxWidth: 200 }} onClick={onDone}>Done</button>
    </div>
  );

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '56px 20px 16px' }} className="flex items-center gap-12">
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="back" size={20} color="var(--text)" />
        </button>
        <div><div style={{ fontSize: 20, fontWeight: 700 }}>Reship</div><div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{order.name} · {customer.name}</div></div>
      </div>
      <div className="px-20" style={{ paddingTop: 20 }}>
        <div className="label">Select Items</div>
        {items.map((item, i) => (
          <div key={i} className="card flex items-center gap-12" onClick={() => toggle(i)} style={{ cursor: 'pointer', borderColor: item.selected ? 'var(--primary)' : undefined, background: item.selected ? 'rgba(108,92,231,0.06)' : undefined }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.selected ? 'var(--primary)' : 'var(--text-muted)'}`, background: item.selected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.selected && <Icon name="check" size={14} color="#fff" />}
            </div>
            <div className="flex-1"><div style={{ fontWeight: 500, fontSize: 14 }}>{item.title}</div><div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Qty: {item.quantity} · ${item.price}</div></div>
          </div>
        ))}

        <div className="label mt-24">Shipping Method</div>
        <select className="input" value={shipping} onChange={e => setShipping(e.target.value)} style={{ appearance: 'auto' }}>
          {SHIP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <div className="label mt-24">Reason</div>
        <div className="flex flex-wrap gap-8">
          {REASONS.map(r => <button key={r} className={`chip ${reason === r ? 'active' : ''}`} onClick={() => setReason(r)}>{REASON_LABELS[r]}</button>)}
        </div>

        <div className="label mt-24">Notes (optional)</div>
        <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any details..." />
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', paddingBottom: 'calc(16px + var(--safe-bottom))', background: 'var(--bg)', borderTop: '1px solid var(--border)', zIndex: 50 }}>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !reason || !count}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: '#fff' }} /> : <><Icon name="refresh" size={18} color="#fff" /> Reship {count} Item{count !== 1 ? 's' : ''}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Refund ──────────────────────────────────────────────
function RefundScreen({ order, customer, onBack, onDone }) {
  const [full, setFull] = useState(true);
  const [items, setItems] = useState(order.lineItems.map(i => ({ ...i, selected: true })));
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const toggle = (i) => { const u = [...items]; u[i] = { ...u[i], selected: !u[i].selected }; setItems(u); };
  const total = full ? parseFloat(order.totalPrice) : items.filter(i => i.selected).reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  const submit = async () => {
    if (!reason) return;
    if (!window.confirm(`Refund $${total.toFixed(2)} for ${order.name}?`)) return;
    setLoading(true);
    try {
      const res = await api.createRefund(order.id, {
        fullRefund: full,
        lineItems: full ? undefined : items.filter(i => i.selected).map(i => ({ line_item_id: i.id, quantity: i.quantity })),
        reason, notes: notes.trim() || undefined,
      });
      setSuccess(res.data);
    } catch (e) { alert(e.response?.data?.error || 'Refund failed'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="page flex-col items-center" style={{ justifyContent: 'center', padding: 28, paddingBottom: 28 }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon name="check" size={44} color="var(--success)" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Refund Processed</h2>
      <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 28, marginTop: 4 }}>${success.refund?.amount?.toFixed(2) || total.toFixed(2)}</div>
      <div className="card w-full" style={{ marginTop: 24 }}>
        {[['Order', order.name], ['Type', full ? 'Full Refund' : 'Partial'], ['Reason', REASON_LABELS[reason]]].map(([l, v]) => (
          <div key={l} className="flex justify-between" style={{ padding: '8px 0' }}><span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{l}</span><span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span></div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 16 }}>Refund appears in 5-10 business days.</div>
      <button className="btn btn-primary" style={{ marginTop: 24, maxWidth: 200 }} onClick={onDone}>Done</button>
    </div>
  );

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '56px 20px 16px' }} className="flex items-center gap-12">
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="back" size={20} color="var(--text)" />
        </button>
        <div><div style={{ fontSize: 20, fontWeight: 700 }}>Refund</div><div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{order.name} · {customer.name}</div></div>
      </div>
      <div className="px-20" style={{ paddingTop: 20 }}>
        <div className="label">Refund Type</div>
        <div className="flex gap-8" style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 4, border: '1px solid var(--border)' }}>
          <button onClick={() => setFull(true)} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: full ? 'var(--primary)' : 'transparent', color: full ? '#fff' : 'var(--text-sec)' }}>Full Refund</button>
          <button onClick={() => setFull(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: !full ? 'var(--primary)' : 'transparent', color: !full ? '#fff' : 'var(--text-sec)' }}>Partial</button>
        </div>
        <div style={{ background: 'var(--danger-bg)', borderRadius: 'var(--radius)', padding: 20, marginTop: 16, textAlign: 'center', border: '1px solid var(--danger)30' }}>
          <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, letterSpacing: 1 }}>REFUND AMOUNT</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--danger)', marginTop: 4 }}>${total.toFixed(2)}</div>
        </div>
        {!full && (<>
          <div className="label mt-24">Select Items</div>
          {items.map((item, i) => (
            <div key={i} className="card flex items-center gap-12" onClick={() => toggle(i)} style={{ cursor: 'pointer', borderColor: item.selected ? 'var(--danger)' : undefined }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.selected ? 'var(--danger)' : 'var(--text-muted)'}`, background: item.selected ? 'var(--danger)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.selected && <Icon name="check" size={14} color="#fff" />}
              </div>
              <div className="flex-1"><div style={{ fontWeight: 500, fontSize: 14 }}>{item.title}</div><div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Qty: {item.quantity} · ${item.price}</div></div>
            </div>
          ))}
        </>)}
        <div className="label mt-24">Reason</div>
        <div className="flex flex-wrap gap-8">
          {REASONS.map(r => <button key={r} className={`chip chip-danger ${reason === r ? 'active' : ''}`} onClick={() => setReason(r)}>{REASON_LABELS[r]}</button>)}
        </div>
        <div className="label mt-24">Notes (optional)</div>
        <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any details..." />
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', paddingBottom: 'calc(16px + var(--safe-bottom))', background: 'var(--bg)', borderTop: '1px solid var(--border)', zIndex: 50 }}>
        <button className="btn btn-danger" onClick={submit} disabled={loading || !reason}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: '#fff' }} /> : <><Icon name="card" size={18} color="#fff" /> Refund ${total.toFixed(2)}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Analytics ───────────────────────────────────────────
function AnalyticsScreen() {
  const [overview, setOverview] = useState(null);
  const [doa, setDoa] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAnalyticsOverview(), api.getDoaByChannel()])
      .then(([o, d]) => { setOverview(o.data); setDoa(d.data.doaByChannel); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page flex-col items-center" style={{ justifyContent: 'center' }}><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header"><h1>Analytics</h1></div>
      <div className="px-20" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { icon: 'mail', color: 'var(--primary)', bg: 'var(--primary-bg)', val: overview?.openTickets || 0, label: 'Open Tickets' },
          { icon: 'alert', color: overview?.doaAboveTarget ? 'var(--danger)' : 'var(--success)', bg: overview?.doaAboveTarget ? 'var(--danger-bg)' : 'var(--success-bg)', val: `${overview?.doaRate || 0}%`, label: 'DOA Rate' },
          { icon: 'refresh', color: 'var(--warning)', bg: 'var(--warning-bg)', val: `$${(overview?.reshipCost?.month || 0).toFixed(0)}`, label: 'Reships (Mo)' },
          { icon: 'card', color: 'var(--danger)', bg: 'var(--danger-bg)', val: `$${(overview?.refunds?.month || 0).toFixed(0)}`, label: 'Refunds (Mo)' },
        ].map(({ icon, color, bg, val, label }) => (
          <div key={label} className="card">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name={icon} size={18} color={color} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: color === 'var(--danger)' && label === 'DOA Rate' ? color : 'var(--text)' }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {doa.length > 0 && (
        <div className="card mx-20" style={{ margin: '16px 20px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>DOA Rate by Channel</div>
          {doa.map(d => (
            <div key={d.channel} className="flex items-center gap-8 mb-8">
              <div style={{ width: 70, fontSize: 13, fontWeight: 600, color: d.channel === 'amazon' ? 'var(--amazon)' : 'var(--shopify)' }}>{d.channel === 'amazon' ? 'Amazon' : 'Shopify'}</div>
              <div className="flex-1" style={{ height: 24, background: 'var(--surface-hover)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(d.doaRate * 10, 100)}%`, background: d.doaRate > 2.5 ? 'var(--danger)' : d.channel === 'amazon' ? 'var(--amazon)' : 'var(--shopify)', borderRadius: 4 }} />
              </div>
              <div style={{ width: 45, textAlign: 'right', fontSize: 14, fontWeight: 600 }}>{d.doaRate}%</div>
            </div>
          ))}
          <div className="flex items-center gap-8" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--danger)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target: 2.5%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────
function SettingsScreen({ agent, onLogout }) {
  const [available, setAvailable] = useState(true);

  const toggleAvail = async () => {
    const next = !available;
    setAvailable(next);
    try { await api.updateAvailability(next); } catch { setAvailable(!next); }
  };

  return (
    <div className="page">
      <div className="page-header"><h1>Settings</h1></div>
      <div className="card mx-20 text-center" style={{ margin: '0 20px 16px', padding: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{(agent?.name || '?')[0].toUpperCase()}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{agent?.name}</div>
        <div style={{ fontSize: 14, color: 'var(--text-sec)' }}>{agent?.email}</div>
        <div style={{ display: 'inline-block', marginTop: 12, padding: '2px 12px', borderRadius: 999, background: agent?.role === 'admin' ? 'var(--primary-bg)' : 'var(--surface-hover)', color: agent?.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{agent?.role === 'admin' ? 'Admin' : 'Agent'}</div>
      </div>
      <div className="card mx-20 flex items-center justify-between" style={{ margin: '0 20px 16px' }} onClick={toggleAvail}>
        <div className="flex items-center gap-12">
          <div style={{ width: 10, height: 10, borderRadius: 5, background: available ? 'var(--success)' : 'var(--text-muted)' }} />
          <div><div style={{ fontWeight: 600 }}>Available</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Receive notifications</div></div>
        </div>
        <div style={{ width: 48, height: 28, borderRadius: 14, background: available ? 'var(--success)' : 'var(--surface-hover)', padding: 2, cursor: 'pointer', transition: 'background 0.2s' }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', transform: available ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
        </div>
      </div>
      <div className="label" style={{ margin: '16px 20px 8px' }}>CONNECTED SERVICES</div>
      <div style={{ margin: '0 20px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {[
          { name: 'Shopify', icon: '🛒', status: 'Connected', color: 'var(--success)' },
          { name: 'Quo Phone', icon: '📞', status: 'Connected', color: 'var(--success)' },
          { name: 'Amazon SP-API', icon: '📦', status: 'Pending', color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={s.name} className="flex items-center gap-12" style={{ padding: 16, borderTop: i ? '1px solid var(--border)' : undefined }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <span className="flex-1" style={{ fontSize: 15 }}>{s.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: s.color, padding: '2px 8px', borderRadius: 6, background: `${s.color}20` }}>{s.status}</span>
          </div>
        ))}
      </div>
      <button onClick={onLogout} className="flex items-center justify-center gap-8" style={{ margin: '24px 20px', padding: 16, background: 'var(--danger-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--danger)30', cursor: 'pointer', color: 'var(--danger)', fontWeight: 600, fontSize: 15 }}>
        <Icon name="logout" size={18} color="var(--danger)" /> Sign Out
      </button>
    </div>
  );
}

// ─── Ticket Detail ──────────────────────────────────────
function TicketDetailScreen({ ticketId, onBack, onNavigateCustomer }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const messagesEnd = React.useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getTicket(ticketId);
      setTicket(res.data.ticket || res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [ticketId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.messages]);

  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await api.addTicketMessage(ticketId, reply.trim());
      setReply('');
      await load();
    } catch (e) { alert('Failed to send'); }
    finally { setSending(false); }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.updateTicket(ticketId, { status });
      await load();
    } catch (e) { alert('Failed to update'); }
    finally { setUpdating(false); }
  };

  const channelIcon = { amazon: '📦', shopify: '🛒', phone: '📞', text: '💬', email: '✉️' };
  const statusColor = { open: 'var(--warning)', in_progress: 'var(--info)', resolved: 'var(--success)', closed: 'var(--text-muted)' };
  const statusOptions = ['open', 'in_progress', 'resolved', 'closed'];

  const fmt = (d) => {
    const date = new Date(d);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) return (
    <div className="page flex-col items-center" style={{ justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!ticket) return (
    <div className="page">
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '56px 20px 16px' }} className="flex items-center gap-12">
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="back" size={20} color="var(--text)" />
        </button>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Ticket Not Found</div>
      </div>
      <div className="text-center mt-24" style={{ padding: 20 }}>
        <Icon name="alert" size={48} color="var(--text-muted)" />
        <div style={{ fontSize: 16, color: 'var(--text-sec)', marginTop: 12 }}>Could not load this ticket.</div>
        <button className="btn btn-primary" style={{ marginTop: 20, maxWidth: 200, margin: '20px auto 0' }} onClick={onBack}>Go Back</button>
      </div>
    </div>
  );

  const messages = ticket.messages || [];

  return (
    <div className="page" style={{ paddingBottom: 80, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '56px 20px 16px', flexShrink: 0 }}>
        <div className="flex items-center gap-12">
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="back" size={20} color="var(--text)" />
          </button>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</div>
            <div className="flex items-center gap-8" style={{ marginTop: 2 }}>
              <span style={{ fontSize: 14 }}>{channelIcon[ticket.channel]}</span>
              <span style={{ fontSize: 13, color: 'var(--text-sec)', textTransform: 'capitalize' }}>{ticket.channel}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>·</span>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: statusColor[ticket.status] }} />
              <span style={{ fontSize: 13, color: statusColor[ticket.status], textTransform: 'capitalize' }}>{ticket.status?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Customer info bar */}
        <div className="flex items-center gap-12" style={{ marginTop: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>
            {(ticket.customerName || ticket.customerPhone || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{ticket.customerName || 'Unknown Customer'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {[ticket.customerEmail, ticket.customerPhone].filter(Boolean).join(' · ') || 'No contact info'}
            </div>
          </div>
          {(ticket.shopifyCustomerId || ticket.customerPhone) && (
            <button onClick={() => onNavigateCustomer && onNavigateCustomer(ticket)} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--primary-bg)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>
              View Orders
            </button>
          )}
        </div>

        {/* Quick Resolve + Status */}
        {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
          <button onClick={() => setShowResolve(true)}
            style={{
              width: '100%', marginTop: 8, padding: '10px 16px', borderRadius: 10,
              background: 'var(--success)', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <Icon name="check" size={16} color="#fff" /> Quick Resolve
          </button>
        ) : (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--success-bg)', border: '1px solid var(--success)30', fontSize: 13, color: 'var(--success)', fontWeight: 600, textAlign: 'center' }}>
            Resolved{ticket.resolutionType ? ` — ${ticket.resolutionType.replace('_', ' ')}` : ''}{ticket.resolutionReason ? ` (${ticket.resolutionReason.replace('_', ' ')})` : ''}
          </div>
        )}
        <div className="flex gap-8" style={{ marginTop: 8 }}>
          {statusOptions.map(s => (
            <button key={s} onClick={() => updateStatus(s)} disabled={updating || ticket.status === s}
              style={{
                flex: 1, padding: '6px 4px', borderRadius: 8, border: `1px solid ${ticket.status === s ? statusColor[s] : 'var(--border)'}`,
                background: ticket.status === s ? `${statusColor[s]}15` : 'transparent',
                color: ticket.status === s ? statusColor[s] : 'var(--text-muted)',
                fontSize: 10, fontWeight: 600, cursor: ticket.status === s ? 'default' : 'pointer', textTransform: 'capitalize',
                opacity: updating ? 0.5 : 1,
              }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {messages.length === 0 ? (
          <div className="text-center" style={{ padding: '40px 0' }}>
            <Icon name="mail" size={40} color="var(--text-muted)" />
            <div style={{ fontSize: 15, color: 'var(--text-sec)', marginTop: 12 }}>No messages yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Send a reply to start the conversation</div>
          </div>
        ) : messages.map((m, i) => {
          const isAgent = m.senderType === 'agent';
          const isSystem = m.senderType === 'system';
          return (
            <div key={m.id || i} style={{ marginBottom: 12 }}>
              {isSystem ? (
                <div className="text-center" style={{ padding: '8px 0' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface)', padding: '4px 12px', borderRadius: 12 }}>
                    {m.body}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, paddingLeft: isAgent ? 0 : 4, paddingRight: isAgent ? 4 : 0 }}>
                    {isAgent ? (m.senderAgent?.name || 'Agent') : (ticket.customerName || ticket.customerPhone || 'Customer')} · {fmt(m.createdAt)}
                  </div>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
                    borderTopLeftRadius: isAgent ? 16 : 4,
                    borderTopRightRadius: isAgent ? 4 : 16,
                    background: isAgent ? 'var(--primary)' : 'var(--surface)',
                    color: isAgent ? '#fff' : 'var(--text)',
                    border: isAgent ? 'none' : '1px solid var(--border)',
                    fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                  }}>
                    {m.body}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Reply composer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', paddingBottom: 'calc(12px + var(--safe-bottom))', background: 'var(--bg)', borderTop: '1px solid var(--border)', zIndex: 50 }}>
        <div className="flex items-center gap-8">
          <input
            className="input flex-1"
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type a reply..."
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
            style={{ margin: 0, borderRadius: 20, paddingLeft: 16, paddingRight: 16 }}
          />
          <button onClick={sendReply} disabled={!reply.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: reply.trim() ? 'var(--primary)' : 'var(--surface-hover)',
              border: 'none', cursor: reply.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              opacity: sending ? 0.5 : 1,
            }}>
            {sending ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Icon name="send" size={18} color={reply.trim() ? '#fff' : 'var(--text-muted)'} />}
          </button>
        </div>
      </div>
      {/* Quick Resolve Sheet */}
      {showResolve && (
        <QuickResolveSheet
          ticketId={ticketId}
          onCancel={() => setShowResolve(false)}
          onDone={() => { setShowResolve(false); load(); }}
        />
      )}
    </div>
  );
}

// ─── Incoming Call/Text Popup ─────────────────────────────
function IncomingPopup({ event, onDismiss, onReship, onRefund }) {
  if (!event) return null;

  const isCall = event.type === 'incoming_call';
  const customer = event.customer;
  const orders = event.recentOrders || [];
  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const statusColor = { fulfilled: 'var(--success)', partial: 'var(--warning)', unfulfilled: 'var(--danger)' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onDismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Popup panel */}
      <div style={{
        position: 'relative', background: 'var(--bg)', borderRadius: '24px 24px 0 0',
        maxHeight: '85dvh', overflowY: 'auto', animation: 'slideUp 0.3s ease-out',
        paddingBottom: 'calc(20px + var(--safe-bottom))',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '8px 20px 16px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
            background: isCall ? 'var(--success-bg)' : 'var(--info-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            animation: isCall ? 'pulse 1.5s infinite' : 'none',
          }}>
            {isCall ? '📞' : '💬'}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: isCall ? 'var(--success)' : 'var(--info)', textTransform: 'uppercase' }}>
            {isCall ? 'Incoming Call' : 'New Message'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            {customer ? customer.name : 'Unknown Caller'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-sec)', marginTop: 2 }}>{event.phone}</div>
          {event.messageBody && (
            <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text)', textAlign: 'left' }}>
              {event.messageBody}
            </div>
          )}
        </div>

        {/* Customer stats */}
        {customer && (
          <div className="flex justify-between" style={{ margin: '0 20px', padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div className="text-center flex-1">
              <div style={{ fontSize: 20, fontWeight: 700 }}>{customer.ordersCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Orders</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div className="text-center flex-1">
              <div style={{ fontSize: 20, fontWeight: 700 }}>${customer.totalSpent}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lifetime</div>
            </div>
            {customer.email && <>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div className="text-center flex-1" style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Email</div>
              </div>
            </>}
          </div>
        )}

        {/* Recent orders */}
        {orders.length > 0 && (
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.5, marginBottom: 8 }}>RECENT ORDERS</div>
            {orders.map((o, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: 14, marginBottom: 8 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{o.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(o.createdAt || o.date)}</span>
                </div>
                {(o.lineItems || o.items || []).map((li, j) => (
                  <div key={j} style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 1 }}>
                    {li.quantity}× {li.title}
                  </div>
                ))}
                <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                  <span className="badge" style={{
                    background: `${statusColor[o.fulfillmentStatus] || 'var(--text-muted)'}20`,
                    color: statusColor[o.fulfillmentStatus] || 'var(--text-muted)',
                    textTransform: 'capitalize', fontSize: 11, padding: '2px 8px', borderRadius: 6,
                  }}>
                    {o.fulfillmentStatus || 'Unfulfilled'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>${o.totalPrice || o.total}</span>
                </div>
                <div className="flex gap-8" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-ghost flex-1" style={{ padding: '8px 0', fontSize: 13 }} onClick={() => onReship(o, customer)}>
                    <Icon name="refresh" size={14} color="var(--primary)" /> Reship
                  </button>
                  <button className="btn btn-danger-ghost flex-1" style={{ padding: '8px 0', fontSize: 13 }} onClick={() => onRefund(o, customer)}>
                    <Icon name="card" size={14} color="var(--danger)" /> Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No customer match */}
        {!customer && (
          <div className="text-center" style={{ padding: '16px 20px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
              <Icon name="user" size={32} color="var(--text-muted)" />
              <div style={{ fontSize: 14, color: 'var(--text-sec)', marginTop: 8 }}>No matching customer in Shopify</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{event.phone}</div>
            </div>
          </div>
        )}

        {/* Dismiss */}
        <div style={{ padding: '12px 20px 0' }}>
          <button className="btn" onClick={onDismiss} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text-sec)', fontWeight: 600,
          }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SSE Hook ────────────────────────────────────────────
function useSSE(token) {
  const [incomingEvent, setIncomingEvent] = useState(null);

  useEffect(() => {
    if (!token) return;

    const API_BASE = 'https://support-base-production.up.railway.app/api/v1';
    const url = `${API_BASE}/events/stream?token=${encodeURIComponent(token)}`;

    let es = null;
    let retryTimeout = null;
    let retryDelay = 1000;

    function connect() {
      console.log('SSE: connecting...');
      es = new EventSource(url);

      es.addEventListener('connected', (e) => {
        console.log('SSE: connected', JSON.parse(e.data));
        retryDelay = 1000; // reset on successful connection
      });

      es.addEventListener('incoming', (e) => {
        console.log('SSE: incoming event', e.data);
        try {
          const data = JSON.parse(e.data);
          setIncomingEvent(data);

          // Play notification sound / vibrate
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } catch (err) {
          console.error('SSE: parse error', err);
        }
      });

      es.onerror = () => {
        console.log('SSE: error, reconnecting in', retryDelay, 'ms');
        es.close();
        retryTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30000);
          connect();
        }, retryDelay);
      };
    }

    connect();

    return () => {
      if (es) es.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [token]);

  const dismiss = () => setIncomingEvent(null);

  // Listen for push notification clicks from service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event) => {
      if (event.data?.type === 'PUSH_NOTIFICATION_CLICK' && event.data?.data) {
        console.log('Push notification clicked, showing popup');
        setIncomingEvent(event.data.data);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  return { incomingEvent, dismiss };
}

// ─── Main App ────────────────────────────────────────────
export default function App() {
  const auth = useAuth();
  const [tab, setTab] = useState('inbox');
  const [screen, setScreen] = useState({ name: 'tabs' });
  const { incomingEvent, dismiss } = useSSE(auth.token);

  if (!auth.isAuth) return <LoginScreen onLogin={auth.doLogin} />;

  const navigate = (name, props = {}) => setScreen({ name, ...props });
  const goTabs = () => setScreen({ name: 'tabs' });

  const handlePopupReship = (order, customer) => {
    dismiss();
    navigate('reship', { order, customer: { ...customer, name: customer.name } });
  };

  const handlePopupRefund = (order, customer) => {
    dismiss();
    navigate('refund', { order, customer: { ...customer, name: customer.name } });
  };

  const renderScreen = () => {
    switch (screen.name) {
      case 'customer':
        return <CustomerScreen customer={screen.customer} onBack={() => {
            if (screen.fromTicketId) navigate('ticket', { ticketId: screen.fromTicketId });
            else goTabs();
          }}
          onReship={(o) => navigate('reship', { order: o, customer: screen.customer, fromTicketId: screen.fromTicketId })}
          onRefund={(o) => navigate('refund', { order: o, customer: screen.customer, fromTicketId: screen.fromTicketId })} />;
      case 'reship':
        return <ReshipScreen order={screen.order} customer={screen.customer}
          onBack={() => navigate('customer', { customer: screen.customer, fromTicketId: screen.fromTicketId })}
          onDone={() => { if (screen.fromTicketId) navigate('ticket', { ticketId: screen.fromTicketId }); else goTabs(); }} />;
      case 'refund':
        return <RefundScreen order={screen.order} customer={screen.customer}
          onBack={() => navigate('customer', { customer: screen.customer, fromTicketId: screen.fromTicketId })}
          onDone={() => { if (screen.fromTicketId) navigate('ticket', { ticketId: screen.fromTicketId }); else goTabs(); }} />;
      case 'ticket':
        return <TicketDetailScreen ticketId={screen.ticketId} onBack={goTabs}
          onNavigateCustomer={async (ticket) => {
            // Load customer from Shopify by ID or search by phone
            try {
              let customer = null;
              if (ticket.shopifyCustomerId) {
                const res = await api.getCustomer(ticket.shopifyCustomerId);
                customer = res.data.customer;
              } else if (ticket.customerPhone) {
                const res = await api.searchCustomers(ticket.customerPhone);
                if (res.data.customers.length > 0) customer = res.data.customers[0];
              } else if (ticket.customerEmail) {
                const res = await api.searchCustomers(ticket.customerEmail);
                if (res.data.customers.length > 0) customer = res.data.customers[0];
              }
              if (customer) {
                navigate('customer', { customer, fromTicketId: ticket.id });
              } else {
                alert('Customer not found in Shopify');
              }
            } catch (e) {
              console.error(e);
              alert('Could not load customer');
            }
          }} />;
      default:
        return renderTab();
    }
  };

  const renderTab = () => {
    switch (tab) {
      case 'inbox': return <InboxScreen onOpenTicket={(id) => navigate('ticket', { ticketId: id })} onNavigate={(t) => setTab(t === 'search' ? 'search' : t)} />;
      case 'search': return <SearchScreen onSelectCustomer={(c) => navigate('customer', { customer: c })} />;
      case 'analytics': return <AnalyticsScreen />;
      case 'settings': return <SettingsScreen agent={auth.agent} onLogout={auth.doLogout} />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'inbox', icon: 'mail', label: 'Inbox' },
    { id: 'search', icon: 'search', label: 'Resolve' },
    { id: 'analytics', icon: 'chart', label: 'Analytics' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <>
      {renderScreen()}
      {screen.name === 'tabs' && (
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.id} className={`tab-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span className="tab-icon"><Icon name={t.icon} size={22} color="currentColor" /></span>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {/* Incoming call/text popup overlay */}
      <IncomingPopup
        event={incomingEvent}
        onDismiss={dismiss}
        onReship={handlePopupReship}
        onRefund={handlePopupRefund}
      />
    </>
  );
}
