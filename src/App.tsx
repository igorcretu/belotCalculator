import { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import './App.css';
import Row, { Game } from './model/row';

// ---- types ----
type Theme = 'felt' | 'parchment' | 'midnight';
type Density = 'compact' | 'comfortable' | 'roomy';
type ShowDelta = 'chip' | 'inline' | 'off';

interface ThemeColors {
  bg: string; bg2: string; panel: string; panelMute: string;
  ink: string; inkMute: string; rule: string;
  accent: string; accent2: string;
  teamA: string; teamB: string; teamC: string;
  chipBg: string; chipInk: string;
}

interface Headers { a: string; b: string; c: string; }
interface Draft { a: string; b: string; c: string; }
interface Totals { a: number; b: number; c: number; }
interface TeamInfo { key: string; v: number; label: string; color: string; }

// ---- theme data ----
const THEMES: Record<Theme, ThemeColors> = {
  felt: {
    bg: '#0e2b22', bg2: '#0a1f19', panel: '#f6efe1', panelMute: '#ece2cc',
    ink: '#1a1410', inkMute: '#5a4f42', rule: '#d8cdb4',
    accent: '#b8242b', accent2: '#c79a3e',
    teamA: '#b8242b', teamB: '#1f4d8a', teamC: '#3e7a3a',
    chipBg: '#fff', chipInk: '#1a1410',
  },
  parchment: {
    bg: '#efe7d2', bg2: '#e6dcc1', panel: '#fbf6e9', panelMute: '#f1ead4',
    ink: '#2b1a0e', inkMute: '#7a6750', rule: '#cdbf9b',
    accent: '#9e1b22', accent2: '#a67524',
    teamA: '#9e1b22', teamB: '#214a6f', teamC: '#3e6a36',
    chipBg: '#fff', chipInk: '#2b1a0e',
  },
  midnight: {
    bg: '#0b0f1a', bg2: '#070a12', panel: '#141a2a', panelMute: '#1c2336',
    ink: '#f1ecd9', inkMute: '#8a8fa3', rule: '#2a3148',
    accent: '#e2545a', accent2: '#e7c46a',
    teamA: '#e2545a', teamB: '#6aa6ff', teamC: '#7cd49a',
    chipBg: '#0b0f1a', chipInk: '#f1ecd9',
  },
};

const TARGET_OPTIONS = [51, 101, 151, 201];
const num = (v: string) => parseInt(v) || 0;

// ---- localStorage hook ----
function useLocal<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
}

// ---- main app ----
function App() {
  const [rows, setRows] = useLocal<Row[]>('bc.rows', []);
  const [headers, setHeaders] = useLocal<Headers>('bc.headers', { a: 'Noi', b: 'Voi', c: 'Third' });
  const [showThird, setShowThird] = useLocal<boolean>('bc.showThird', false);
  const [history, setHistory] = useLocal<Game[]>('bc.history', []);
  const [theme, setTheme] = useLocal<Theme>('bc.theme', 'felt');
  const [density, setDensity] = useLocal<Density>('bc.density', 'comfortable');
  const [showDelta, setShowDelta] = useLocal<ShowDelta>('bc.showDelta', 'chip');
  const [showTurnDots, setShowTurnDots] = useLocal<boolean>('bc.showTurnDots', true);
  const [target, setTarget] = useLocal<number>('bc.target', 151);

  const [draft, setDraft] = useState<Draft>({ a: '', b: '', c: '' });
  const [modal, setModal] = useState<'settings' | 'history' | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'save' | 'reset' } | null>(null);

  const themeColors = THEMES[theme] || THEMES.felt;

  const totals = useMemo<Totals>(() => {
    if (!rows.length) return { a: 0, b: 0, c: 0 };
    const last = rows[rows.length - 1];
    return { a: last.noi, b: last.voi, c: last.thirdColumng || 0 };
  }, [rows]);

  const leader = useMemo<TeamInfo[]>(() => {
    const arr: TeamInfo[] = [
      { key: 'a', v: totals.a, label: headers.a, color: themeColors.teamA },
      { key: 'b', v: totals.b, label: headers.b, color: themeColors.teamB },
      ...(showThird ? [{ key: 'c', v: totals.c, label: headers.c, color: themeColors.teamC }] : []),
    ];
    arr.sort((x, y) => y.v - x.v);
    return arr;
  }, [totals, headers, showThird, themeColors]);

  const getNextTurn = (): string => {
    const lists = [headers.a, headers.b, ...(showThird ? [headers.c] : [])]
      .map(h => h.split(',').map(s => s.trim()).filter(Boolean));
    const all: string[] = [];
    const max = Math.max(...lists.map(l => l.length || 1));
    for (let i = 0; i < max; i++) lists.forEach(l => l[i] && all.push(l[i]));
    if (!all.length) return '—';
    return all[rows.length % all.length][0].toUpperCase();
  };

  const canAdd = draft.a !== '' || draft.b !== '' || (showThird && draft.c !== '');

  const addRow = () => {
    if (!canAdd) return;
    const dA = num(draft.a), dB = num(draft.b), dC = num(draft.c);
    const newRow: Row = {
      row_id: rows.length + 1,
      noi: totals.a + dA,
      voi: totals.b + dB,
      thirdColumng: totals.c + dC,
      noiOld: dA,
      voiOld: dB,
      thirdColumnOld: dC,
      turn: getNextTurn(),
    };
    setRows([...rows, newRow]);
    setDraft({ a: '', b: '', c: '' });
  };

  const deleteLast = () => {
    if (!rows.length) return;
    setRows(rows.slice(0, -1));
  };

  const saveAndReset = () => {
    if (rows.length) {
      const game: Game = {
        id: Date.now(),
        date: new Date().toISOString(),
        rows: [...rows],
        noiHeader: headers.a,
        voiHeader: headers.b,
        thirdHeader: showThird ? headers.c : undefined,
        showThirdColumn: showThird,
        totalNoi: totals.a,
        totalVoi: totals.b,
        totalThird: showThird ? totals.c : undefined,
      };
      setHistory([...history, game]);
    }
    setRows([]);
    setDraft({ a: '', b: '', c: '' });
  };

  const resetEverything = () => {
    setRows([]);
    setHistory([]);
    setHeaders({ a: 'Noi', b: 'Voi', c: 'Third' });
    setShowThird(false);
    setDraft({ a: '', b: '', c: '' });
    setTheme('felt');
    setDensity('comfortable');
    setShowDelta('chip');
    setShowTurnDots(true);
    setTarget(151);
    setConfirm(null);
    try { localStorage.clear(); } catch {}
  };

  const rowPad = density === 'compact' ? '8px 12px' : density === 'roomy' ? '16px 14px' : '12px 14px';

  const cssVars = {
    '--bg': themeColors.bg, '--bg2': themeColors.bg2,
    '--panel': themeColors.panel, '--panel-mute': themeColors.panelMute,
    '--ink': themeColors.ink, '--ink-mute': themeColors.inkMute,
    '--rule': themeColors.rule,
    '--accent': themeColors.accent, '--accent2': themeColors.accent2,
    '--team-a': themeColors.teamA, '--team-b': themeColors.teamB, '--team-c': themeColors.teamC,
    '--chip-bg': themeColors.chipBg, '--chip-ink': themeColors.chipInk,
    '--row-pad': rowPad,
  } as React.CSSProperties;

  return (
    <div className="bc-root" style={cssVars}>
      <div className="bc-bg" />
      <div className="bc-frame">
        <Header
          theme={themeColors}
          headers={headers}
          showThird={showThird}
          totals={totals}
          rowCount={rows.length}
          onSettings={() => setModal('settings')}
          onHistory={() => setModal('history')}
          target={target}
          leader={leader}
          showTurnDots={showTurnDots}
          nextTurnLetter={getNextTurn()}
        />
        <ScoreTable
          rows={rows}
          headers={headers}
          showThird={showThird}
          showDelta={showDelta}
          onDeleteLast={deleteLast}
          theme={themeColors}
          target={target}
        />
        <InputBar
          draft={draft}
          setDraft={setDraft}
          headers={headers}
          showThird={showThird}
          canAdd={canAdd}
          onAdd={addRow}
          canSave={rows.length > 0}
          onSave={() => setConfirm({ kind: 'save' })}
        />
      </div>

      {modal === 'settings' && (
        <Modal title="Settings" onClose={() => setModal(null)}>
          <SettingsBody
            headers={headers}
            setHeaders={setHeaders}
            showThird={showThird}
            setShowThird={setShowThird}
            theme={theme}
            setTheme={setTheme}
            density={density}
            setDensity={setDensity}
            showDelta={showDelta}
            setShowDelta={setShowDelta}
            showTurnDots={showTurnDots}
            setShowTurnDots={setShowTurnDots}
            target={target}
            setTarget={setTarget}
            onResetAll={() => { setModal(null); setConfirm({ kind: 'reset' }); }}
          />
        </Modal>
      )}

      {modal === 'history' && (
        <Modal title="Game history" onClose={() => setModal(null)}>
          <HistoryBody history={history} onClear={() => setHistory([])} />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.kind === 'reset' ? 'Reset everything?' : 'Save game and start new?'}
          body={
            confirm.kind === 'reset'
              ? 'This clears the current game, history, names and settings. Cannot be undone.'
              : `Archive this game (${rows.length} rounds) to history and clear the board.`
          }
          confirmLabel={confirm.kind === 'reset' ? 'Reset' : 'Save & new game'}
          danger={confirm.kind === 'reset'}
          onConfirm={() => {
            if (confirm.kind === 'reset') resetEverything();
            else { saveAndReset(); setConfirm(null); }
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ---- Header ----
interface HeaderProps {
  theme: ThemeColors;
  headers: Headers;
  showThird: boolean;
  totals: Totals;
  rowCount: number;
  onSettings: () => void;
  onHistory: () => void;
  target: number;
  leader: TeamInfo[];
  showTurnDots: boolean;
  nextTurnLetter: string;
}

function Header({ headers, showThird, totals, onSettings, onHistory, target, leader, theme, showTurnDots, nextTurnLetter, rowCount }: HeaderProps) {
  const teams = [
    { key: 'a', label: headers.a, v: totals.a, color: theme.teamA },
    { key: 'b', label: headers.b, v: totals.b, color: theme.teamB },
    ...(showThird ? [{ key: 'c', label: headers.c, v: totals.c, color: theme.teamC }] : []),
  ];
  const top = leader[0];
  const second = leader[1];
  const gap = top && second ? top.v - second.v : 0;

  return (
    <header className="bc-header">
      <div className="bc-brand">
        <BelotMark theme={theme} />
        <div className="bc-brand-text">
          <div className="bc-brand-eyebrow">Belot</div>
          <div className="bc-brand-title">Score Pad</div>
        </div>
        <div className="bc-actions">
          <IconBtn label="History" onClick={onHistory}><IconHistory /></IconBtn>
          <IconBtn label="Settings" onClick={onSettings}><IconCog /></IconBtn>
        </div>
      </div>

      <div className={`bc-totals bc-totals-${teams.length}`}>
        {teams.map(team => {
          const pct = Math.min(100, Math.round((team.v / target) * 100));
          const isLeader = top && team.key === top.key && team.v > 0;
          return (
            <div key={team.key} className="bc-team-card" style={{ '--team': team.color } as React.CSSProperties}>
              <div className="bc-team-row">
                <span className="bc-team-name" title={team.label}>{team.label}</span>
                {isLeader && <span className="bc-team-badge">Lead</span>}
              </div>
              <div className="bc-team-score">
                <span className="bc-team-num">{team.v}</span>
                <span className="bc-team-target">/ {target}</span>
              </div>
              <div className="bc-team-bar"><span style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>

      {showTurnDots && (
        <div className="bc-turn-strip">
          <span className="bc-turn-label">Next deal</span>
          <span className="bc-turn-dot">{nextTurnLetter}</span>
          <span className="bc-turn-meta">Round {rowCount + 1}{gap > 0 && top ? ` · ${top.label} +${gap}` : ''}</span>
        </div>
      )}
    </header>
  );
}

// ---- ScoreTable ----
interface ScoreTableProps {
  rows: Row[];
  headers: Headers;
  showThird: boolean;
  showDelta: ShowDelta;
  onDeleteLast: () => void;
  theme: ThemeColors;
  target: number;
}

function ScoreTable({ rows, headers, showThird, showDelta, onDeleteLast, theme, target }: ScoreTableProps) {
  const cols = showThird ? 3 : 2;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [rows.length]);

  if (!rows.length) {
    return (
      <div className="bc-table-wrap bc-empty-wrap">
        <div className="bc-empty">
          <BelotMark theme={theme} large />
          <div className="bc-empty-title">New hand, fresh slate.</div>
          <div className="bc-empty-sub">
            Enter each team's points below and tap <kbd>+</kbd>. First to <strong>{target}</strong> wins.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bc-table-wrap">
      <div className={`bc-table cols-${cols}`} ref={ref}>
        <div className="bc-thead">
          <div className="bc-th bc-th-turn">#</div>
          <div className="bc-th" style={{ '--team': theme.teamA } as React.CSSProperties}>{headers.a}</div>
          <div className="bc-th" style={{ '--team': theme.teamB } as React.CSSProperties}>{headers.b}</div>
          {showThird && <div className="bc-th" style={{ '--team': theme.teamC } as React.CSSProperties}>{headers.c}</div>}
          <div className="bc-th bc-th-act" />
        </div>
        <div className="bc-tbody">
          {rows.map((r, i) => {
            const milestone = showThird ? r.row_id % 3 === 0 : r.row_id % 4 === 0;
            const isLast = i === rows.length - 1;
            return (
              <div className={`bc-tr${milestone ? ' milestone' : ''}${isLast ? ' is-last' : ''}`} key={r.row_id}>
                <div className="bc-td bc-td-turn"><span className="bc-turn-pill">{r.turn}</span></div>
                <Cell value={r.noi} delta={r.noiOld ?? 0} mode={showDelta} />
                <Cell value={r.voi} delta={r.voiOld ?? 0} mode={showDelta} />
                {showThird && <Cell value={r.thirdColumng ?? 0} delta={r.thirdColumnOld ?? 0} mode={showDelta} />}
                <div className="bc-td bc-td-act">
                  {isLast && (
                    <button className="bc-undo" onClick={onDeleteLast} title="Undo last round" aria-label="Undo last round">
                      <IconUndo />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Cell({ value, delta, mode }: { value: number; delta: number; mode: ShowDelta }) {
  const tag = delta === 0 ? 'BT' : `${delta > 0 ? '+' : ''}${delta}`;
  return (
    <div className="bc-td bc-td-num">
      <span className="bc-num">{value}</span>
      {mode === 'chip' && (
        <span className={`bc-delta-chip${delta === 0 ? ' is-bt' : delta > 0 ? ' is-pos' : ' is-neg'}`}>{tag}</span>
      )}
      {mode === 'inline' && (
        <span className="bc-delta-inline">({tag})</span>
      )}
    </div>
  );
}

// ---- InputBar ----
interface InputBarProps {
  draft: Draft;
  setDraft: (d: Draft) => void;
  headers: Headers;
  showThird: boolean;
  canAdd: boolean;
  onAdd: () => void;
  canSave: boolean;
  onSave: () => void;
}

function InputBar({ draft, setDraft, headers, showThird, canAdd, onAdd, canSave, onSave }: InputBarProps) {
  const refA = useRef<HTMLInputElement>(null);
  const refB = useRef<HTMLInputElement>(null);
  const refC = useRef<HTMLInputElement>(null);

  const onKey = (e: React.KeyboardEvent, k: 'a' | 'b' | 'c') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const order: ('a' | 'b' | 'c')[] = showThird ? ['a', 'b', 'c'] : ['a', 'b'];
      const i = order.indexOf(k);
      if (i < order.length - 1) {
        const refs = { a: refA, b: refB, c: refC };
        refs[order[i + 1]].current?.focus();
      } else if (canAdd) onAdd();
    }
  };

  return (
    <div className="bc-input-bar">
      <div className="bc-inputs">
        <NumField
          label={headers.a} team="a" value={draft.a}
          onChange={v => setDraft({ ...draft, a: v })}
          ref={refA} onKeyDown={(e: React.KeyboardEvent) => onKey(e, 'a')}
        />
        <NumField
          label={headers.b} team="b" value={draft.b}
          onChange={v => setDraft({ ...draft, b: v })}
          ref={refB} onKeyDown={(e: React.KeyboardEvent) => onKey(e, 'b')}
        />
        {showThird && (
          <NumField
            label={headers.c} team="c" value={draft.c}
            onChange={v => setDraft({ ...draft, c: v })}
            ref={refC} onKeyDown={(e: React.KeyboardEvent) => onKey(e, 'c')}
          />
        )}
      </div>
      <div className="bc-input-actions">
        {canSave && (
          <button className="bc-btn bc-btn-ghost" onClick={onSave} title="Save game and start new">
            <IconFlag /> <span>New</span>
          </button>
        )}
        <button
          className={`bc-btn bc-btn-primary${canAdd ? '' : ' is-disabled'}`}
          onClick={onAdd}
          disabled={!canAdd}
          aria-label="Add round"
        >
          <IconPlus /> <span>Add</span>
        </button>
      </div>
    </div>
  );
}

interface NumFieldProps {
  label: string;
  team: 'a' | 'b' | 'c';
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const NumField = forwardRef<HTMLInputElement, NumFieldProps>(function NumField({ label, team, value, onChange, onKeyDown }, ref) {
  return (
    <label className={`bc-field bc-field-${team}`}>
      <span className="bc-field-label">{label}</span>
      <input
        ref={ref}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </label>
  );
});

// ---- Modal ----
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="bc-modal-shade" onClick={onClose}>
      <div className="bc-modal" onClick={e => e.stopPropagation()}>
        <div className="bc-modal-head">
          <h2>{title}</h2>
          <button className="bc-icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="bc-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ---- SettingsBody ----
interface SettingsBodyProps {
  headers: Headers;
  setHeaders: (h: Headers) => void;
  showThird: boolean;
  setShowThird: (v: boolean) => void;
  theme: Theme;
  setTheme: (v: Theme) => void;
  density: Density;
  setDensity: (v: Density) => void;
  showDelta: ShowDelta;
  setShowDelta: (v: ShowDelta) => void;
  showTurnDots: boolean;
  setShowTurnDots: (v: boolean) => void;
  target: number;
  setTarget: (v: number) => void;
  onResetAll: () => void;
}

function SettingsBody({ headers, setHeaders, showThird, setShowThird, theme, setTheme, density, setDensity, showDelta, setShowDelta, showTurnDots, setShowTurnDots, target, setTarget, onResetAll }: SettingsBodyProps) {
  const themeOpts: { value: Theme; label: string; swatches: string[] }[] = [
    { value: 'felt', label: 'Felt', swatches: ['#0e2b22', '#b8242b', '#c79a3e'] },
    { value: 'parchment', label: 'Parchment', swatches: ['#efe7d2', '#9e1b22', '#a67524'] },
    { value: 'midnight', label: 'Midnight', swatches: ['#0b0f1a', '#e2545a', '#e7c46a'] },
  ];
  const targetOpts = TARGET_OPTIONS.map(v => ({ value: String(v), label: String(v) }));
  const densityOpts = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfy' },
    { value: 'roomy', label: 'Roomy' },
  ];
  const deltaOpts = [
    { value: 'chip', label: 'Chip' },
    { value: 'inline', label: 'Inline' },
    { value: 'off', label: 'Off' },
  ];

  return (
    <div className="bc-settings">
      <section>
        <h3>Team names</h3>
        <p className="bc-help">Use commas for multiple players — dealer hint cycles through all names.</p>
        <div className="bc-name-grid">
          <NameField label="Team 1" color="var(--team-a)" value={headers.a} onChange={v => setHeaders({ ...headers, a: v })} />
          <NameField label="Team 2" color="var(--team-b)" value={headers.b} onChange={v => setHeaders({ ...headers, b: v })} />
          {showThird && <NameField label="Team 3" color="var(--team-c)" value={headers.c} onChange={v => setHeaders({ ...headers, c: v })} />}
        </div>
      </section>

      <section>
        <h3>Players</h3>
        <div className="bc-toggle-row">
          <div>
            <div className="bc-toggle-title">Three-team mode</div>
            <div className="bc-help">Adds a third score column.</div>
          </div>
          <BCSwitch checked={showThird} onChange={setShowThird} />
        </div>
      </section>

      <section>
        <h3>Play to</h3>
        <Segmented value={String(target)} options={targetOpts} onChange={v => setTarget(Number(v))} />
      </section>

      <section>
        <h3>Theme</h3>
        <div className="bc-theme-grid">
          {themeOpts.map(opt => (
            <button
              key={opt.value}
              className={`bc-theme-card${theme === opt.value ? ' is-on' : ''}`}
              onClick={() => setTheme(opt.value)}
            >
              <div className="bc-theme-preview">
                {opt.swatches.map((c, i) => <span key={i} style={{ background: c }} />)}
              </div>
              <span className="bc-theme-name">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Density</h3>
        <Segmented value={density} options={densityOpts} onChange={v => setDensity(v as Density)} />
        <p className="bc-help">Controls row padding in the score table.</p>
      </section>

      <section>
        <h3>Round delta</h3>
        <Segmented value={showDelta} options={deltaOpts} onChange={v => setShowDelta(v as ShowDelta)} />
        <p className="bc-help">How the points added per round are shown next to each total.</p>
      </section>

      <section>
        <h3>Behavior</h3>
        <div className="bc-toggle-row">
          <div>
            <div className="bc-toggle-title">Next-dealer hint</div>
            <div className="bc-help">Shows whose turn it is to deal.</div>
          </div>
          <BCSwitch checked={showTurnDots} onChange={setShowTurnDots} />
        </div>
      </section>

      <section className="bc-danger">
        <h3>Danger zone</h3>
        <button className="bc-btn bc-btn-danger" onClick={onResetAll}>Reset everything</button>
      </section>
    </div>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="bc-seg" role="radiogroup">
      {options.map(o => (
        <button
          key={o.value}
          className={`bc-seg-btn${value === o.value ? ' is-on' : ''}`}
          onClick={() => onChange(o.value)}
          role="radio"
          aria-checked={value === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NameField({ label, color, value, onChange }: { label: string; color: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="bc-name-field">
      <span className="bc-name-dot" style={{ background: color }} />
      <span className="bc-name-label">{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Names..." />
    </label>
  );
}

function BCSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`bc-switch${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span />
    </button>
  );
}

// ---- HistoryBody ----
function HistoryBody({ history, onClear }: { history: Game[]; onClear: () => void }) {
  if (!history.length) {
    return (
      <div className="bc-history-empty">
        <div className="bc-history-empty-icon"><IconHistory /></div>
        <div className="bc-history-empty-title">No games yet</div>
        <div className="bc-help">Saved games appear here. Tap <strong>New</strong> after a finished game to archive it.</div>
      </div>
    );
  }
  return (
    <div className="bc-history">
      <div className="bc-history-list">
        {[...history].reverse().map(g => {
          const teams = [
            { name: g.noiHeader, v: g.totalNoi },
            { name: g.voiHeader, v: g.totalVoi },
            ...(g.showThirdColumn && g.thirdHeader ? [{ name: g.thirdHeader, v: g.totalThird ?? 0 }] : []),
          ];
          const winner = teams.reduce((a, b) => (b.v > a.v ? b : a), teams[0]);
          const d = new Date(g.date);
          return (
            <div className="bc-history-item" key={g.id}>
              <div className="bc-history-date">
                <span className="bc-history-day">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span className="bc-history-time">{d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="bc-history-scores">
                {teams.map((t, i) => (
                  <div className={`bc-history-team${t.v === winner.v ? ' is-win' : ''}`} key={i}>
                    <span className="bc-history-team-name">{t.name}</span>
                    <span className="bc-history-team-v">{t.v}</span>
                  </div>
                ))}
              </div>
              <div className="bc-history-meta">{g.rows.length} rounds</div>
            </div>
          );
        })}
      </div>
      <button className="bc-btn bc-btn-ghost" onClick={onClear}>Clear history</button>
    </div>
  );
}

// ---- ConfirmDialog ----
function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel, danger }: {
  title: string; body: string; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void; danger: boolean;
}) {
  return (
    <div className="bc-modal-shade" onClick={onCancel}>
      <div className="bc-confirm" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="bc-confirm-actions">
          <button className="bc-btn bc-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`bc-btn${danger ? ' bc-btn-danger' : ' bc-btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ---- Atoms ----
function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button className="bc-icon-btn" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function BelotMark({ theme, large }: { theme: ThemeColors; large?: boolean }) {
  const size = large ? 56 : 32;
  return (
    <svg className="bc-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="bcg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={theme.accent2} stopOpacity="1" />
          <stop offset="1" stopColor={theme.accent2} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="9" fill={theme.ink} stroke="url(#bcg)" strokeWidth="1.4" />
      <path d="M20 30 C12 24 12 17 16 15 C18.5 13.7 20 15.5 20 17 C20 15.5 21.5 13.7 24 15 C28 17 28 24 20 30 Z" fill={theme.accent} />
    </svg>
  );
}

const IconCog = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

const IconHistory = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3 2" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconUndo = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" />
  </svg>
);

const IconFlag = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21V4" /><path d="M4 4h12l-2 4 2 4H4" />
  </svg>
);

export default App;
