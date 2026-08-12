// Widgets configurator: create/enable/configure/embed ZeroProfit website
// widgets (clock, score badge, impact ticker, Impact Drop game). All widgets
// run live in the preview; embed snippets document the production contract.

import { useState } from 'react';
import { useApp } from '../../store/StoreContext';
import { addWidget, removeWidget, updateWidget } from '../../store/store';
import type { WidgetInstance, WidgetType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Alert, DemoNote, EmptyState, PageHeader, Toggle } from '../../components/ui/Misc';
import { Chip } from '../../components/ui/Chip';
import { useToast } from '../../components/ui/Toast';
import {
  ClockWidget,
  ImpactGame,
  ImpactTickerWidget,
  ScoreBadgeWidget,
  widgetSnippet,
} from '../../components/widgets/widgets';
import { latestScore } from '../../store/seed';
import { IMPACT_FACTS } from '../../lib/content';
import { Copy, Plus, Trash2 } from 'lucide-react';

const WIDGET_TYPES: { type: WidgetType; label: string; hint: string }[] = [
  { type: 'clock', label: 'Clock', hint: 'Club time, 12/24h — great for websites and landing pages.' },
  { type: 'score_badge', label: 'IFS Score Badge', hint: 'Your public Impact Factor Score and tier.' },
  { type: 'impact_ticker', label: 'Impact Ticker', hint: 'Rotating impact statements (sample content in demo).' },
  { type: 'impact_game', label: 'Impact Drop (game)', hint: 'A lightweight catch-the-impact gem game.' },
];

export function WidgetsPage() {
  const { state } = useApp();
  const toast = useToast();
  const org = state.org && state.org.status !== 'closed' ? state.org : null;
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<WidgetType>('clock');
  const [createName, setCreateName] = useState('');
  const [configure, setConfigure] = useState<WidgetInstance | null>(null);
  const [embed, setEmbed] = useState<WidgetInstance | null>(null);

  if (!org) {
    return (
      <div>
        <PageHeader title="Widgets" />
        <Alert tone="info" >
          Create your ZPO first to configure widgets.
        </Alert>
      </div>
    );
  }

  const row = latestScore(state.scoreLedger);

  const previewFor = (w: WidgetInstance) => {
    switch (w.type) {
      case 'clock':
        return <ClockWidget format24={w.config.format24 !== false} />;
      case 'score_badge':
        return <ScoreBadgeWidget org={org} row={row} showTier={w.config.showTier !== false} />;
      case 'impact_ticker':
        return <ImpactTickerWidget facts={IMPACT_FACTS} speedMs={Number(w.config.speedMs ?? 4000)} />;
      case 'impact_game':
        return <ImpactGame durationSec={Number(w.config.durationSec ?? 30)} />;
    }
  };

  const create = () => {
    addWidget(createType, createName || (WIDGET_TYPES.find((t) => t.type === createType)?.label ?? createType));
    toast.push('Widget added — configure and enable it below.');
    setCreateOpen(false);
    setCreateName('');
  };

  const copyEmbed = (w: WidgetInstance) => {
    const snippet = widgetSnippet(org.slug, w.type, 1);
    try {
      navigator.clipboard?.writeText(snippet);
      toast.push('Embed snippet copied (documentation).');
    } catch {
      toast.push('Clipboard unavailable — snippet shown in dialog.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Widgets"
        intro="Embed your IFS and club presence anywhere. Widgets are enabled per ZPO and versioned so embeds never break (production serves them from widgets.zeroprofit.org)."
        actions={
          <span className="row">
            <DemoNote />
            <Button variant="rust" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> New widget
            </Button>
          </span>
        }
      />

      {state.widgets.length === 0 ? (
        <EmptyState
          title="No widgets yet"
          body="Create a clock, score badge, impact ticker, or the Impact Drop game. Every widget works live in this demo."
          action={
            <Button variant="rust" onClick={() => setCreateOpen(true)}>
              Create your first widget
            </Button>
          }
        />
      ) : (
        <div className="grid-3">
          {state.widgets.map((w) => (
            <div className="card widget-card" key={w.id}>
              <div className="row row--between">
                <h3 style={{ margin: 0 }}>{w.name}</h3>
                <Chip tone={w.enabled ? 'green' : 'gray'}>{w.enabled ? 'Enabled' : 'Disabled'}</Chip>
              </div>
              <div className="widget-preview-frame">{previewFor(w)}</div>
              <Toggle checked={w.enabled} onChange={(v) => { updateWidget(w.id, { enabled: v }); toast.push(v ? 'Widget enabled.' : 'Widget disabled.'); }} label={w.enabled ? 'Enabled' : 'Disabled'} />
              <div className="row">
                <Button size="sm" variant="navy" onClick={() => setConfigure(w)}>
                  Configure
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEmbed(w)}>
                  Embed code
                </Button>
                <Button size="sm" variant="danger" aria-label={`Delete ${w.name}`} onClick={() => { removeWidget(w.id); toast.push('Widget removed.'); }}>
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Try the Impact Drop game</h2>
        <ImpactGame durationSec={30} />
        <p className="small muted" style={{ marginBottom: 0 }}>
          Keyboard: ← / → or A / D · pointer drag also works. Best score is saved in this browser.
        </p>
      </div>

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New widget">
        <div className="stack" style={{ gap: 12 }}>
          {WIDGET_TYPES.map((t) => (
            <label key={t.type} className="card" style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start', borderColor: createType === t.type ? 'var(--navy)' : undefined }}>
              <input
                type="radio"
                name="widget-type"
                checked={createType === t.type}
                onChange={() => setCreateType(t.type)}
                style={{ marginTop: 4 }}
              />
              <span>
                <strong>{t.label}</strong>
                <span className="small muted" style={{ display: 'block' }}>{t.hint}</span>
              </span>
            </label>
          ))}
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label" htmlFor="widget-name">Name (optional)</label>
            <input id="widget-name" className="input" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder={WIDGET_TYPES.find((t) => t.type === createType)?.label} />
          </div>
          <Button variant="rust" onClick={create} block>
            Add widget
          </Button>
        </div>
      </Modal>

      {/* Configure */}
      <Modal open={configure !== null} onClose={() => setConfigure(null)} title={`Configure — ${configure?.name ?? ''}`} size="sm">
        {configure ? (
          <div className="stack" style={{ gap: 12 }}>
            {configure.type === 'clock' ? (
              <Toggle checked={configure.config.format24 !== false} onChange={(v) => { updateWidget(configure.id, { config: { format24: v } }); toast.push('Clock format updated.'); }} label="24-hour format" />
            ) : null}
            {configure.type === 'score_badge' ? (
              <Toggle checked={configure.config.showTier !== false} onChange={(v) => { updateWidget(configure.id, { config: { showTier: v } }); toast.push('Badge tier shown updated.'); }} label="Show tier chip" />
            ) : null}
            {configure.type === 'impact_ticker' ? (
              <Toggle checked={(configure.config.speedMs ?? 4000) !== 1200} onChange={(v) => { updateWidget(configure.id, { config: { speedMs: v ? 4000 : 1200 } }); toast.push('Ticker speed updated.'); }} label="Normal speed (faster on off)" />
            ) : null}
            <div className="widget-preview-frame">{previewFor(configure)}</div>
            <p className="small muted" style={{ margin: 0 }}>
              Config changes bump the widget config version in production (old embeds keep working). Demo stores config locally.
            </p>
          </div>
        ) : null}
      </Modal>

      {/* Embed */}
      <Modal open={embed !== null} onClose={() => setEmbed(null)} title={`Embed — ${embed?.name ?? ''}`} size="sm">
        {embed ? (
          <div>
            <p className="small muted">
              Production widget host: <code>widgets.zeroprofit.org</code> serves versioned, immutable scripts with
              signed config. This demo renders the widget live above; the snippet below is documentation.
            </p>
            <pre className="code-block">{widgetSnippet(org.slug, embed.type, 1)}</pre>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
              <Button variant="ghost" size="sm" onClick={() => setEmbed(null)}>
                Close
              </Button>
              <Button variant="navy" size="sm" onClick={() => copyEmbed(embed)}>
                <Copy size={13} /> Copy snippet
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
