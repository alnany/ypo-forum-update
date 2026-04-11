import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from './i18n'
import { feelingsData } from './data/feelings'
import FeelingsPicker from './components/FeelingsPicker'
import Summary from './components/Summary'
import HomeScreen from './components/HomeScreen'
import ForumView from './components/ForumView'
import { saveUpdate, getMemberUpdate } from './lib/api'
import type { Meeting, MemberName } from './lib/api'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SectionData {
  feelings: string[]
  feelingEvents: Record<string, string>   // feeling → event that triggered it
  whyItMatters1: string
  whyItMatters2: string
  whyItMatters3: string
  whatIRealize: string
}

export interface FormState {
  memberName: string
  forumName: string
  meetingId: string    // "2026-04-10"
  date: string         // "April 10, 2026" – display
  location: string     // "Bangkok, Thailand"
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
  feelingEvents: {},
  whyItMatters1: '',
  whyItMatters2: '',
  whyItMatters3: '',
  whatIRealize: '',
})

const makeInitialState = (memberName = '', meeting?: Meeting): FormState => ({
  memberName,
  forumName: 'Forum 11',
  meetingId: meeting?.id ?? '',
  date: meeting?.displayDate ?? '',
  location: meeting?.location ?? '',
  work: emptySection(),
  family: emptySection(),
  me: emptySection(),
  next30: { feelings: [], outlook: '' },
  groupLearning: '',
  explore: '',
})

// ── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['intro', 'work', 'me', 'family', 'next30', 'extra', 'summary'] as const
type Step = (typeof STEPS)[number]
type AppScreen = 'home' | 'update' | 'forum'

const SECTION_ICON_COLOR: Record<'work' | 'family' | 'me', { icon: string; color: string }> = {
  work:   { icon: '💼', color: '#1a3660' },
  family: { icon: '🏡', color: '#065f46' },
  me:     { icon: '🪞', color: '#5b21b6' },
}

// ── Language Toggle ───────────────────────────────────────────────────────────

function LangToggle() {
  const { i18n: i18nHook } = useTranslation()
  const lang = i18nHook.language.startsWith('zh') ? 'zh' : 'en'

  const toggle = (l: 'en' | 'zh') => {
    i18n.changeLanguage(l)
    localStorage.setItem('lang', l)
  }

  return (
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
      {(['en', 'zh'] as const).map((l) => (
        <button
          key={l}
          onClick={() => toggle(l)}
          style={{
            background: lang === l ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: `1px solid ${lang === l ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
            color: lang === l ? 'white' : 'rgba(255,255,255,0.5)',
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 12,
            fontWeight: lang === l ? 700 : 400,
            cursor: 'pointer',
          }}
        >
          {l === 'en' ? 'EN' : '中文'}
        </button>
      ))}
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  const { t } = useTranslation()
  const idx = STEPS.indexOf(step)
  const total = STEPS.length - 1
  const pct = (idx / total) * 100
  const labels = [
    t('intro.begin', 'Start'),
    t('section.work_title', 'Work'),
    t('section.family_title', 'Family'),
    t('section.me_title', 'Me'),
    t('next30.title', 'Next 30'),
    t('forumExchange.title', 'Extras'),
    t('summary.title', 'Done'),
  ]

  return (
    <div style={{ padding: '0 24px 20px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        {labels.map((l, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: i === idx ? 700 : 400, color: i <= idx ? 'var(--navy)' : 'var(--text-muted)', transition: 'color 0.3s' }}>
            {l}
          </span>
        ))}
      </div>
      <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--navy), var(--navy-muted))', borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────

function Header({
  step,
  screen,
  memberName,
  meetingDate,
  onHome,
}: {
  step: Step
  screen: AppScreen
  memberName?: string
  meetingDate?: string
  onHome?: () => void
}) {
  const { t } = useTranslation()

  const subtitle = screen === 'forum'
    ? t('app.subtitle_forumView')
    : memberName && meetingDate
    ? `${memberName} · ${meetingDate}`
    : t('app.subtitle_default')

  return (
    <header style={{ background: 'var(--navy)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        onClick={onHome}
        style={{
          width: 36, height: 36, background: 'var(--gold)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: 'white', fontSize: 16, letterSpacing: '-0.5px',
          flexShrink: 0, cursor: onHome ? 'pointer' : 'default',
        }}
      >
        Y
      </div>
      <div>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{t('app.title')}</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{subtitle}</div>
      </div>
      {screen === 'update' && step !== 'intro' && step !== 'summary' && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            {t('app.step', { current: STEPS.indexOf(step), total: STEPS.length - 2 })}
          </span>
          <LangToggle />
        </div>
      )}
      {(screen !== 'update' || step === 'intro' || step === 'summary') && <LangToggle />}
    </header>
  )
}

// ── Intro Screen ──────────────────────────────────────────────────────────────

function IntroScreen({
  form,
  onNext,
  onBack,
}: {
  form: FormState
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="animate-in" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
          {t('intro.greeting', { name: form.memberName })}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6 }}>
          {t('intro.subtitle')}
        </p>
      </div>

      <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: t('intro.field_forum'), value: form.forumName },
            { label: t('intro.field_date'), value: form.date },
            { label: t('intro.field_location'), value: form.location },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: 64, flexShrink: 0 }}>
                {label}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--gold-pale)', border: '1px solid #f3d87a', borderRadius: 10, padding: '14px 18px', marginBottom: 32, fontSize: 13, color: '#78500a', lineHeight: 1.6 }}>
        <strong>{t('intro.principles_title')}</strong><br />
        {t('intro.principles_text')}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack}>{t('section.back')}</button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onNext}>
          {t('intro.begin')}
        </button>
      </div>
    </div>
  )
}

// ── Section Step ──────────────────────────────────────────────────────────────

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
  const { t } = useTranslation()
  const meta = SECTION_ICON_COLOR[sectionKey]
  const data = form[sectionKey]
  const [showPicker, setShowPicker] = useState(false)

  const sectionTitle = t(`section.${sectionKey}_title`)
  const sectionQuestion = t(`section.${sectionKey}_question`)

  const updateSection = (patch: Partial<SectionData>) =>
    setForm((f) => ({ ...f, [sectionKey]: { ...f[sectionKey], ...patch } }))

  const coreForFeeling = (feeling: string) => {
    for (const core of feelingsData) {
      if (core.secondary.find((s) => s.name === feeling || s.tertiary.includes(feeling))) return core
    }
    return null
  }

  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 40px' }}>
      <div style={{ background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 100%)`, borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: 'white' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{meta.icon}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{sectionTitle}</h2>
        <p style={{ opacity: 0.8, fontSize: 15 }}>{sectionQuestion}</p>
      </div>

      {/* Feelings */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{t('section.yourFeelings')}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t('section.selectAtLeast3')}</p>
          </div>
          <button onClick={() => setShowPicker(true)} style={{ background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + {t('section.addFeeling')}
          </button>
        </div>
        {data.feelings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', border: '2px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 14 }}>
            {t('section.noFeelings')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.feelings.map((f) => {
              const core = coreForFeeling(f)
              return (
                <span key={f} className="feeling-tag" style={{ background: core?.bgColor || '#f1f5f9', borderColor: core?.color || '#cbd5e1', color: core?.color || '#334155' }}>
                  {t(`feelings.${f}`, f)}
                  <button onClick={() => {
                    const updated = data.feelings.filter((x) => x !== f)
                    const updatedEvents = { ...data.feelingEvents }
                    delete updatedEvents[f]
                    updateSection({ feelings: updated, feelingEvents: updatedEvents })
                  }}>×</button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Per-feeling events */}
      {data.feelings.length > 0 && (
        <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{t('section.triggered_title')}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{t('section.triggered_desc')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.feelings.map((f) => {
              const core = coreForFeeling(f)
              return (
                <div key={f} style={{ borderRadius: 8, border: `1.5px solid ${core?.color || '#cbd5e1'}44`, overflow: 'hidden' }}>
                  <div style={{ background: core?.bgColor || '#f1f5f9', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: core?.color || '#94a3b8', color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 700 }}>{t(`feelings.${f}`, f)}</span>
                  </div>
                  <div style={{ padding: '10px 14px' }}>
                    <textarea
                      rows={2}
                      placeholder={t('section.triggered_placeholder', { feeling: t(`feelings.${f}`, f).toLowerCase() })}
                      value={data.feelingEvents[f] || ''}
                      onChange={(e) => updateSection({ feelingEvents: { ...data.feelingEvents, [f]: e.target.value } })}
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5% Significance */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-muted) 100%)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 2 }}>{t('section.sig_title')}</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{t('section.sig_subtitle')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
              {t('section.sig_why')} <span style={{ color: 'var(--gold)', fontSize: 11 }}>{t('section.sig_askWhy')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                { labelKey: 'section.sig_why1', key: 'whyItMatters1' as keyof SectionData, prev: null },
                { labelKey: 'section.sig_why2', key: 'whyItMatters2' as keyof SectionData, prev: data.whyItMatters1 },
                { labelKey: 'section.sig_why3', key: 'whyItMatters3' as keyof SectionData, prev: data.whyItMatters2 },
              ]).map(({ labelKey, key, prev }) => {
                const trimmed = prev?.trim() ?? ''
                const question = trimmed
                  ? t('section.sig_whyMatters', { answer: trimmed.length > 75 ? trimmed.slice(0, 75) + '…' : trimmed })
                  : null
                return (
                  <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ background: 'var(--navy)', color: 'var(--gold)', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', marginTop: question ? 24 : 12 }}>{t(labelKey)}</span>
                    <div style={{ flex: 1 }}>
                      {question && (
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 6, lineHeight: 1.4 }}>{question}</div>
                      )}
                      <textarea rows={2} placeholder={t('section.sig_because')} value={data[key] as string} onChange={(e) => updateSection({ [key]: e.target.value } as Partial<SectionData>)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{t('section.sig_realize')}</label>
            <textarea rows={3} placeholder={t('section.sig_realizePlaceholder')} value={data.whatIRealize} onChange={(e) => updateSection({ whatIRealize: e.target.value })} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack}>{t('section.back')}</button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onNext}>{t('section.continue')}</button>
      </div>

      {showPicker && (
        <FeelingsPicker
          selectedFeelings={data.feelings}
          onAdd={(f) => { if (!data.feelings.includes(f)) updateSection({ feelings: [...data.feelings, f], feelingEvents: { ...data.feelingEvents, [f]: '' } }) }}
          onRemove={(f) => {
            const updatedEvents = { ...data.feelingEvents }
            delete updatedEvents[f]
            updateSection({ feelings: data.feelings.filter((x) => x !== f), feelingEvents: updatedEvents })
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ── Next 30 Days ──────────────────────────────────────────────────────────────

function Next30Step({ form, setForm, onNext, onBack }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; onNext: () => void; onBack: () => void }) {
  const { t } = useTranslation()
  const [showPicker, setShowPicker] = useState(false)
  const coreForFeeling = (feeling: string) => {
    for (const core of feelingsData) {
      if (core.secondary.find((s) => s.name === feeling || s.tertiary.includes(feeling))) return core
    }
    return null
  }
  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 40px' }}>
      <div style={{ background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: 'white' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🗓️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{t('next30.title')}</h2>
        <p style={{ opacity: 0.8, fontSize: 15 }}>{t('next30.subtitle')}</p>
      </div>
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{t('next30.feelingsTitle')}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t('next30.feelingsDesc')}</p>
          </div>
          <button onClick={() => setShowPicker(true)} style={{ background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + {t('section.addFeeling')}
          </button>
        </div>
        {form.next30.feelings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', border: '2px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 14 }}>
            {t('section.noFeelings')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.next30.feelings.map((f) => {
              const core = coreForFeeling(f)
              return (
                <span key={f} className="feeling-tag" style={{ background: core?.bgColor || '#f1f5f9', borderColor: core?.color || '#cbd5e1', color: core?.color || '#334155' }}>
                  {t(`feelings.${f}`, f)}
                  <button onClick={() => setForm((x) => ({ ...x, next30: { ...x.next30, feelings: x.next30.feelings.filter((y) => y !== f) } }))}>×</button>
                </span>
              )
            })}
          </div>
        )}
      </div>
      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{t('next30.outlookTitle')}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{t('next30.outlookDesc')}</p>
        <textarea rows={5} placeholder={t('next30.outlookPlaceholder')} value={form.next30.outlook} onChange={(e) => setForm((f) => ({ ...f, next30: { ...f.next30, outlook: e.target.value } }))} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack}>{t('next30.back')}</button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onNext}>{t('next30.continue')}</button>
      </div>
      {showPicker && (
        <FeelingsPicker
          selectedFeelings={form.next30.feelings}
          onAdd={(f) => { if (!form.next30.feelings.includes(f)) setForm((x) => ({ ...x, next30: { ...x.next30, feelings: [...x.next30.feelings, f] } })) }}
          onRemove={(f) => setForm((x) => ({ ...x, next30: { ...x.next30, feelings: x.next30.feelings.filter((y) => y !== f) } }))}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ── Extra Questions ───────────────────────────────────────────────────────────

function ExtraStep({ form, setForm, onNext, onBack }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; onNext: () => void; onBack: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 40px' }}>
      <div style={{ background: 'linear-gradient(135deg, #0B2045 0%, #2d4a7a 100%)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: 'white' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{t('forumExchange.title')}</h2>
        <p style={{ opacity: 0.8, fontSize: 15 }}>{t('forumExchange.subtitle')}</p>
      </div>
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{t('forumExchange.learning_title')}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{t('forumExchange.learning_desc')}</p>
        <textarea rows={5} placeholder={t('forumExchange.learning_placeholder')} value={form.groupLearning} onChange={(e) => setForm((f) => ({ ...f, groupLearning: e.target.value }))} />
      </div>
      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{t('forumExchange.explore_title')}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{t('forumExchange.explore_desc')}</p>
        <p style={{ fontSize: 12, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 12 }}>{t('forumExchange.explore_note')}</p>
        <textarea rows={5} placeholder={t('forumExchange.explore_placeholder')} value={form.explore} onChange={(e) => setForm((f) => ({ ...f, explore: e.target.value }))} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack}>{t('forumExchange.back')}</button>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onNext}>{t('forumExchange.preview')}</button>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

// ── Draft helpers ─────────────────────────────────────────────────────────────

const draftKey = (meetingId: string, memberName: string) =>
  `forum11_draft_${meetingId}_${memberName}`

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [step, setStep] = useState<Step>('intro')
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)
  const [form, setForm] = useState<FormState>(makeInitialState())
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  // Auto-save draft to localStorage on every form/step change
  useEffect(() => {
    if (screen === 'update' && form.meetingId && form.memberName) {
      localStorage.setItem(draftKey(form.meetingId, form.memberName), JSON.stringify({ form, step }))
    }
  }, [form, step, screen])

  const goHome = () => {
    setScreen('home')
    setStep('intro')
    setActiveMeeting(null)
    setSubmitStatus('idle')
    window.scrollTo(0, 0)
  }

  const startUpdate = async (meeting: Meeting, member: MemberName) => {
    const key = draftKey(meeting.id, member)
    const saved = localStorage.getItem(key)
    if (saved) {
      // In-progress draft takes priority
      try {
        const { form: savedForm, step: savedStep } = JSON.parse(saved)
        setForm({ ...savedForm, memberName: member, meetingId: meeting.id, date: meeting.displayDate, location: meeting.location })
        setStep(savedStep || 'intro')
      } catch {
        setForm(makeInitialState(member, meeting))
        setStep('intro')
      }
    } else {
      // Check if a submitted update already exists on the server
      const existing = await getMemberUpdate(member, meeting.id)
      if (existing?.hasUpdate && existing.data) {
        // Load existing submission for editing (skip intro)
        setForm({ ...existing.data, memberName: member, meetingId: meeting.id, date: meeting.displayDate, location: meeting.location })
        setStep('work')
      } else {
        setForm(makeInitialState(member, meeting))
        setStep('intro')
      }
    }
    setActiveMeeting(meeting)
    setSubmitStatus('idle')
    setScreen('update')
    window.scrollTo(0, 0)
  }

  // Start editing an already-submitted update (loaded from server)
  const startEdit = (meeting: Meeting, memberName: string, existingData: FormState) => {
    setActiveMeeting(meeting)
    setForm({ ...existingData, memberName, meetingId: meeting.id, date: meeting.displayDate, location: meeting.location })
    setSubmitStatus('idle')
    setStep('work')
    setScreen('update')
    window.scrollTo(0, 0)
  }

  const openForum = (meeting: Meeting) => {
    setActiveMeeting(meeting)
    setScreen('forum')
    window.scrollTo(0, 0)
  }

  const next = () => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
    window.scrollTo(0, 0)
  }

  const back = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) {
      setStep(STEPS[idx - 1])
      window.scrollTo(0, 0)
    } else {
      goHome()
    }
  }

  const handleSubmit = async () => {
    if (!activeMeeting) return
    setSubmitStatus('submitting')
    const ok = await saveUpdate({
      member: form.memberName,
      meetingId: activeMeeting.id,
      displayDate: activeMeeting.displayDate,
      location: activeMeeting.location,
      data: form,
    })
    if (ok) {
      // Clear the local draft — it's now persisted on the server
      localStorage.removeItem(draftKey(form.meetingId, form.memberName))
      setSubmitStatus('success')
    } else {
      setSubmitStatus('error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        step={step}
        screen={screen}
        memberName={form.memberName || undefined}
        meetingDate={activeMeeting?.displayDate}
        onHome={screen !== 'home' ? goHome : undefined}
      />

      {screen === 'update' && step !== 'intro' && step !== 'summary' && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border-light)', paddingTop: 16 }}>
          <ProgressBar step={step} />
        </div>
      )}

      <main style={{ flex: 1 }}>
        {screen === 'home' && (
          <HomeScreen onStartUpdate={startUpdate} onViewForum={openForum} />
        )}

        {screen === 'forum' && activeMeeting && (
          <ForumView meeting={activeMeeting} onBack={goHome} onEdit={(member, data) => startEdit(activeMeeting, member, data)} />
        )}

        {screen === 'update' && (
          <>
            {step === 'intro' && <IntroScreen form={form} onNext={next} onBack={back} />}
            {step === 'work' && <SectionStep sectionKey="work" form={form} setForm={setForm} onNext={next} onBack={back} />}
            {step === 'family' && <SectionStep sectionKey="family" form={form} setForm={setForm} onNext={next} onBack={back} />}
            {step === 'me' && <SectionStep sectionKey="me" form={form} setForm={setForm} onNext={next} onBack={back} />}
            {step === 'next30' && <Next30Step form={form} setForm={setForm} onNext={next} onBack={back} />}
            {step === 'extra' && <ExtraStep form={form} setForm={setForm} onNext={next} onBack={back} />}
            {step === 'summary' && (
              <Summary
                form={form}
                onBack={back}
                onRestart={goHome}
                onSubmit={handleSubmit}
                submitStatus={submitStatus}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
