import { useState } from 'react'
import { feelingsData } from './data/feelings'
import FeelingsPicker from './components/FeelingsPicker'
import Summary from './components/Summary'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SectionData {
  feelings: string[]
  events: string
  whatItSays: string
  whyItMatters1: string
  whyItMatters2: string
  whyItMatters3: string
  whatIRealize: string
}

export interface FormState {
  memberName: string
  forumName: string
  date: string
  work: SectionData
  family: SectionData
  me: SectionData
  next30: {
    feelings: string[]
    outlook: string
  }
  groupLearning: string
  explore: string
}

const emptySection = (): SectionData => ({
  feelings: [],
  events: '',
  whatItSays: '',
  whyItMatters1: '',
  whyItMatters2: '',
  whyItMatters3: '',
  whatIRealize: '',
})

const initialState: FormState = {
  memberName: '',
  forumName: 'Forum 11',
  date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  work: emptySection(),
  family: emptySection(),
  me: emptySection(),
  next30: { feelings: [], outlook: '' },
  groupLearning: '',
  explore: '',
}

// ── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['intro', 'work', 'family', 'me', 'next30', 'extra', 'summary'] as const
type Step = (typeof STEPS)[number]

const SECTION_META: Record<'work' | 'family' | 'me', { title: string; question: string; icon: string; color: string }> = {
  work: { title: 'Work', question: 'How do I feel about what I do?', icon: '💼', color: '#1a3660' },
  family: { title: 'Family', question: 'How do I feel about the people whom I love?', icon: '🏡', color: '#065f46' },
  me: { title: 'Me', question: 'How do I feel about myself?', icon: '🪞', color: '#5b21b6' },
}

// ── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  const idx = STEPS.indexOf(step)
  const total = STEPS.length - 1
  const pct = (idx / total) * 100
  const labels = ['Start', 'Work', 'Family', 'Me', 'Next 30', 'Extras', 'Done']

  return (
    <div style={{ padding: '0 24px 20px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        {labels.map((l, i) => (
          <span
            key={i}
            style={{
              fontSize: 11,
              fontWeight: i === idx ? 700 : 400,
              color: i <= idx ? 'var(--navy)' : 'var(--text-muted)',
              transition: 'color 0.3s',
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--navy), var(--navy-muted))',
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────

function Header({ step }: { step: Step }) {
  return (
    <header
      style={{
        background: 'var(--navy)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: 'var(--gold)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: 'white',
          fontSize: 16,
          letterSpacing: '-0.5px',
          flexShrink: 0,
        }}
      >
        Y
      </div>
      <div>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>YPO Forum Update</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>Monthly Revelation</div>
      </div>
      {step !== 'intro' && step !== 'summary' && (
        <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          Step {STEPS.indexOf(step)} of {STEPS.length - 2}
        </div>
      )}
    </header>
  )
}

// ── Intro Screen ─────────────────────────────────────────────────────────────

function IntroScreen({
  form,
  setForm,
  onNext,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
}) {
  return (
    <div className="animate-in" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
          Monthly Revelation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6 }}>
          A guided space to reflect on your month — across work, family, and self — and prepare your Forum Update.
        </p>
      </div>

      <div className="card" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--navy)' }}>About this update</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={form.memberName}
              onChange={(e) => setForm((f) => ({ ...f, memberName: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Forum Name
            </label>
            <input
              type="text"
              value={form.forumName}
              readOnly
              style={{ background: '#f8fafc', color: 'var(--text-muted)', cursor: 'default' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Month
            </label>
            <input
              type="text"
              placeholder="e.g. April 2026"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--gold-pale)',
          border: '1px solid #f3d87a',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 32,
          fontSize: 14,
          color: '#78500a',
          lineHeight: 1.6,
        }}
      >
        <strong>Forum Principles</strong>
        <br />
        Everything shared here is strictly confidential. Share experiences — not advice. Be authentic, be present.
      </div>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={onNext}>
        Begin My Update →
      </button>
    </div>
  )
}

// ── Section Step (Work / Family / Me) ────────────────────────────────────────

function SectionStep({
  sectionKey,
  form,
  setForm,
  onNext,
  onBack,
}: {
  sectionKey: 'work' | 'family' | 'me'
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
  onBack: () => void
}) {
  const meta = SECTION_META[sectionKey]
  const data = form[sectionKey]

  const updateSection = (patch: Partial<SectionData>) => {
    setForm((f) => ({ ...f, [sectionKey]: { ...f[sectionKey], ...patch } }))
  }

  const removeFeeiling = (feeling: string) => {
    updateSection({ feelings: data.feelings.filter((f) => f !== feeling) })
  }

  const addFeeling = (feeling: string) => {
    if (!data.feelings.includes(feeling)) {
      updateSection({ feelings: [...data.feelings, feeling] })
    }
  }

  const coreForFeeling = (feeling: string) => {
    for (const core of feelingsData) {
      if (core.secondary.find((s) => s.name === feeling || s.tertiary.includes(feeling))) return core
    }
    return null
  }

  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 40px' }}>
      {/* Section header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 100%)`,
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 24,
          color: 'white',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>{meta.icon}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{meta.title}</h2>
        <p style={{ opacity: 0.8, fontSize: 15 }}>{meta.question}</p>
      </div>

      {/* Feelings */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>Your Feelings</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Select at least 3 feelings</p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            style={{
              background: 'var(--navy)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            + Add Feeling
          </button>
        </div>

        {data.feelings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              border: '2px dashed var(--border)',
              borderRadius: 8,
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            No feelings added yet. Click "Add Feeling" to start.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.feelings.map((f) => {
              const core = coreForFeeling(f)
              return (
                <span
                  key={f}
                  className="feeling-tag"
                  style={{
                    background: core?.bgColor || '#f1f5f9',
                    borderColor: core?.color || '#cbd5e1',
                    color: core?.color || '#334155',
                  }}
                >
                  {f}
                  <button onClick={() => removeFeeiling(f)}>×</button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Events */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Events</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          What got triggered? Use 1 sentence to describe each event.
        </p>
        <textarea
          rows={4}
          placeholder="e.g. A major client pulled out of our deal last week..."
          value={data.events}
          onChange={(e) => updateSection({ events: e.target.value })}
        />
      </div>

      {/* 5% Significance */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-muted) 100%)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 2 }}>5% Significance</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            What do these incidents say about what truly matters to you?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              What do these incidents say about me?
            </label>
            <textarea
              rows={3}
              placeholder="Reflect on what these events reveal about your values, patterns, or identity..."
              value={data.whatItSays}
              onChange={(e) => updateSection({ whatItSays: e.target.value })}
            />
          </div>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: 8,
              padding: '16px',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
              Why do they matter to me? <span style={{ color: 'var(--gold)', fontSize: 11 }}>ASK WHY 3×</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Why #1', key: 'whyItMatters1', placeholder: 'Because...' },
                { label: 'Why #2', key: 'whyItMatters2', placeholder: 'And deeper, because...' },
                { label: 'Why #3', key: 'whyItMatters3', placeholder: 'At the core, because...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      background: 'var(--navy)',
                      color: 'var(--gold)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      marginTop: 12,
                    }}
                  >
                    {label}
                  </span>
                  <textarea
                    rows={2}
                    placeholder={placeholder}
                    value={(data as unknown as Record<string, string>)[key]}
                    onChange={(e) => updateSection({ [key]: e.target.value } as Partial<SectionData>)}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              What do I realize about myself?
            </label>
            <textarea
              rows={3}
              placeholder="A key insight or realization this reflection has brought..."
              value={data.whatIRealize}
              onChange={(e) => updateSection({ whatIRealize: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onNext}>
          Continue →
        </button>
      </div>

      {/* Feelings Picker Modal */}
      {showPicker && (
        <FeelingsPicker
          selectedFeelings={data.feelings}
          onAdd={addFeeling}
          onRemove={removeFeeiling}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ── Next 30 Days Step ─────────────────────────────────────────────────────────

function Next30Step({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
  onBack: () => void
}) {
  const [showPicker, setShowPicker] = useState(false)

  const addFeeling = (feeling: string) => {
    if (!form.next30.feelings.includes(feeling)) {
      setForm((f) => ({ ...f, next30: { ...f.next30, feelings: [...f.next30.feelings, feeling] } }))
    }
  }

  const removeFeeling = (feeling: string) => {
    setForm((f) => ({ ...f, next30: { ...f.next30, feelings: f.next30.feelings.filter((x) => x !== feeling) } }))
  }

  const coreForFeeling = (feeling: string) => {
    for (const core of feelingsData) {
      if (core.secondary.find((s) => s.name === feeling || s.tertiary.includes(feeling))) return core
    }
    return null
  }

  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 40px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 24,
          color: 'white',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🗓️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Next 30 Days</h2>
        <p style={{ opacity: 0.8, fontSize: 15 }}>How do I feel about the next 30 days?</p>
      </div>

      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>Feelings About What's Ahead</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>How do you feel looking forward?</p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            style={{
              background: 'var(--navy)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Feeling
          </button>
        </div>
        {form.next30.feelings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              border: '2px dashed var(--border)',
              borderRadius: 8,
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            Add how you're feeling about the upcoming month.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.next30.feelings.map((f) => {
              const core = coreForFeeling(f)
              return (
                <span
                  key={f}
                  className="feeling-tag"
                  style={{
                    background: core?.bgColor || '#f1f5f9',
                    borderColor: core?.color || '#cbd5e1',
                    color: core?.color || '#334155',
                  }}
                >
                  {f}
                  <button onClick={() => removeFeeling(f)}>×</button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>My Outlook</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          What's on my mind for the next 30 days? What am I anticipating, planning, or concerned about?
        </p>
        <textarea
          rows={5}
          placeholder="Share what's ahead — key events, decisions, opportunities, or worries..."
          value={form.next30.outlook}
          onChange={(e) => setForm((f) => ({ ...f, next30: { ...f.next30, outlook: e.target.value } }))}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onNext}>
          Continue →
        </button>
      </div>

      {showPicker && (
        <FeelingsPicker selectedFeelings={form.next30.feelings} onAdd={addFeeling} onRemove={removeFeeling} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}

// ── Extra Questions Step ──────────────────────────────────────────────────────

function ExtraStep({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 40px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0B2045 0%, #2d4a7a 100%)',
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 24,
          color: 'white',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Forum Exchange</h2>
        <p style={{ opacity: 0.8, fontSize: 15 }}>Two final questions to deepen your Forum's connection</p>
      </div>

      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
          💬 Something I could learn from you all
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          What would you love to get input on from your Forum peers?
        </p>
        <textarea
          rows={5}
          placeholder="e.g. How do you maintain discipline in building new habits when life gets hectic?..."
          value={form.groupLearning}
          onChange={(e) => setForm((f) => ({ ...f, groupLearning: e.target.value }))}
        />
      </div>

      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
          🔍 I want to explore this
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          Something that is important to you. Emotionally complex. Unsettled.
        </p>
        <p style={{ fontSize: 12, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 12 }}>
          This is a topic you want to bring to the Forum — not necessarily for answers, but for exploration.
        </p>
        <textarea
          rows={5}
          placeholder="e.g. I've been questioning whether the path I'm on still aligns with who I want to become..."
          value={form.explore}
          onChange={(e) => setForm((f) => ({ ...f, explore: e.target.value }))}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onNext}>
          Preview My Update →
        </button>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState<Step>('intro')
  const [form, setForm] = useState<FormState>(initialState)

  const next = () => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const back = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const restart = () => {
    setForm(initialState)
    setStep('intro')
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header step={step} />
      {step !== 'intro' && step !== 'summary' && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border-light)', paddingTop: 16 }}>
          <ProgressBar step={step} />
        </div>
      )}
      <main style={{ flex: 1 }}>
        {step === 'intro' && <IntroScreen form={form} setForm={setForm} onNext={next} />}
        {step === 'work' && (
          <SectionStep sectionKey="work" form={form} setForm={setForm} onNext={next} onBack={back} />
        )}
        {step === 'family' && (
          <SectionStep sectionKey="family" form={form} setForm={setForm} onNext={next} onBack={back} />
        )}
        {step === 'me' && (
          <SectionStep sectionKey="me" form={form} setForm={setForm} onNext={next} onBack={back} />
        )}
        {step === 'next30' && <Next30Step form={form} setForm={setForm} onNext={next} onBack={back} />}
        {step === 'extra' && <ExtraStep form={form} setForm={setForm} onNext={next} onBack={back} />}
        {step === 'summary' && <Summary form={form} onBack={back} onRestart={restart} />}
      </main>
    </div>
  )
}
