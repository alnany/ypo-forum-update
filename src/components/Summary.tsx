import { useTranslation } from 'react-i18next'
import type { FormState, SectionData } from '../App'
import { feelingsData } from '../data/feelings'

interface Props {
  form: FormState
  onBack: () => void
  onRestart: () => void
  readOnly?: boolean
  onSubmit?: () => void
  submitStatus?: 'idle' | 'submitting' | 'success' | 'error'
}

const coreForFeeling = (feeling: string) => {
  for (const core of feelingsData) {
    if (core.secondary.find((s) => s.name === feeling || s.tertiary.includes(feeling))) return core
  }
  return null
}

function FeelingBadge({ feeling }: { feeling: string }) {
  const { t } = useTranslation()
  const core = coreForFeeling(feeling)
  return (
    <span
      style={{
        display: 'inline-block',
        background: core?.bgColor || '#f1f5f9',
        border: `1px solid ${core?.color || '#cbd5e1'}44`,
        color: core?.color || '#334155',
        borderRadius: 20,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
        margin: '2px 3px',
      }}
    >
      {t(`feelings.${feeling}`, feeling)}
    </span>
  )
}

function SectionBlock({
  titleKey,
  icon,
  questionKey,
  color,
  data,
}: {
  titleKey: string
  icon: string
  questionKey: string
  color: string
  data: SectionData
}) {
  const { t } = useTranslation()
  const hasContent = data.feelings.length > 0 || (data.triggers ?? []).some(tr => tr.event.trim()) || data.whyItMatters1

  if (!hasContent) return null

  return (
    <div
      style={{
        marginBottom: 28,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          background: color,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{t(titleKey)}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{t(questionKey)}</div>
        </div>
      </div>

      <div style={{ padding: '18px 20px', background: 'white' }}>
        {/* Feelings */}
        {data.feelings.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {t('summary.feelings')}
            </div>
            <div>{data.feelings.map((f) => <FeelingBadge key={f} feeling={f} />)}</div>
          </div>
        )}

        {/* Trigger entries */}
        {data.triggers && data.triggers.filter(tr => tr.event.trim()).length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              {t('summary.triggered')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.triggers.filter(tr => tr.event.trim()).map((tr) => (
                <div key={tr.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flexShrink: 0, maxWidth: '45%' }}>
                    {tr.feelings.map((f) => {
                      const core = coreForFeeling(f)
                      return (
                        <span key={f} style={{
                          background: core?.bgColor || '#f1f5f9',
                          border: `1px solid ${core?.color || '#cbd5e1'}55`,
                          color: core?.color || '#334155',
                          borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                        }}>{t(`feelings.${f}`, f)}</span>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, flex: 1, whiteSpace: 'pre-wrap', margin: 0 }}>{tr.event}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5% Significance */}
        {(data.whyItMatters1 || data.whyItMatters2 || data.whyItMatters3 || data.whatIRealize) && (
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 8,
              padding: '14px 16px',
              border: '1px solid var(--border-light)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  background: 'var(--navy)',
                  color: 'var(--gold)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontSize: 10,
                }}
              >
                5%
              </span>
              {t('section.sig_title')}
            </div>

            {(data.whyItMatters1 || data.whyItMatters2 || data.whyItMatters3) && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>{t('summary.whyMatters')}</div>
                {[
                  { labelKey: 'section.sig_why1', val: data.whyItMatters1 },
                  { labelKey: 'section.sig_why2', val: data.whyItMatters2 },
                  { labelKey: 'section.sig_why3', val: data.whyItMatters3 },
                ]
                  .filter((x) => x.val)
                  .map(({ labelKey, val }) => (
                    <div key={labelKey} style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'flex-start' }}>
                      <span
                        style={{
                          background: 'var(--navy)',
                          color: 'var(--gold)',
                          borderRadius: 4,
                          padding: '2px 7px',
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          marginTop: 2,
                        }}
                      >
                        {t(labelKey)}
                      </span>
                      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, flex: 1, whiteSpace: 'pre-wrap' }}>{val}</p>
                    </div>
                  ))}
              </div>
            )}

            {data.whatIRealize && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{t('summary.realize')}</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.whatIRealize}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Summary({ form, onBack, onRestart, readOnly, onSubmit, submitStatus = 'idle' }: Props) {
  const { t } = useTranslation()
  const handlePrint = () => window.print()

  return (
    <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: '24px 24px 60px' }}>
      {/* Summary Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-muted) 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 28,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{t('summary.title')}</h1>
        {form.memberName && (
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 4 }}>{form.memberName}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
          {form.forumName && (
            <span
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 13,
              }}
            >
              {form.forumName}
            </span>
          )}
          {form.date && (
            <span
              style={{
                background: 'rgba(201,168,76,0.3)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 13,
                color: 'var(--gold-light)',
                fontWeight: 600,
              }}
            >
              {form.date}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      <SectionBlock
        titleKey="section.work_title"
        icon="💼"
        questionKey="section.work_question"
        color="#1a3660"
        data={form.work}
      />
      <SectionBlock
        titleKey="section.family_title"
        icon="🏡"
        questionKey="section.family_question"
        color="#065f46"
        data={form.family}
      />
      <SectionBlock
        titleKey="section.me_title"
        icon="🪞"
        questionKey="section.me_question"
        color="#5b21b6"
        data={form.me}
      />

      {/* Next 30 Days */}
      {(form.next30.feelings.length > 0 || form.next30.outlook) && (
        <div
          style={{
            marginBottom: 28,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ background: '#b45309', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🗓️</span>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{t('summary.next30_title')}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{t('summary.next30_question')}</div>
            </div>
          </div>
          <div style={{ padding: '18px 20px', background: 'white' }}>
            {form.next30.feelings.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  {t('summary.feelings')}
                </div>
                <div>{form.next30.feelings.map((f) => <FeelingBadge key={f} feeling={f} />)}</div>
              </div>
            )}
            {form.next30.outlook && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  {t('summary.outlook')}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{form.next30.outlook}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Group Learning */}
      {form.groupLearning && (
        <div
          style={{
            marginBottom: 20,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ background: '#0B2045', padding: '12px 20px' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{t('summary.learning')}</div>
          </div>
          <div style={{ padding: '16px 20px', background: 'white' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{form.groupLearning}</p>
          </div>
        </div>
      )}

      {/* Explore */}
      {form.explore && (
        <div
          style={{
            marginBottom: 32,
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid var(--gold)',
          }}
        >
          <div style={{ background: 'var(--gold)', padding: '12px 20px' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{t('summary.explore')}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{t('summary.explore_subtitle')}</div>
          </div>
          <div style={{ padding: '16px 20px', background: 'var(--gold-pale)' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{form.explore}</p>
          </div>
        </div>
      )}

      {/* Confidentiality footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '16px',
          background: 'white',
          borderRadius: 10,
          border: '1px solid var(--border-light)',
          marginBottom: 32,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        {t('summary.confidential')}
      </div>

      {/* Action buttons */}
      <div className="no-print" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {readOnly ? (
          <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onBack}>
            {t('forumView.back')}
          </button>
        ) : submitStatus === 'success' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                background: '#d1fae5',
                border: '1.5px solid #059669',
                borderRadius: 10,
                padding: '14px 20px',
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: '#065f46',
              }}
            >
              {t('summary.submitted')}
            </div>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'center' }}
              onClick={onRestart}
            >
              ← {t('summary.backToHome')}
            </button>
          </div>
        ) : (
          <>
            <button className="btn-secondary" onClick={onBack}>
              {t('summary.back')}
            </button>
            {onSubmit && (
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={onSubmit}
                disabled={submitStatus === 'submitting'}
              >
                {submitStatus === 'submitting'
                  ? t('summary.submitting')
                  : submitStatus === 'error'
                  ? t('summary.error')
                  : t('summary.submit')}
              </button>
            )}
            <button
              className="btn-primary"
              style={{ background: '#334155', justifyContent: 'center' }}
              onClick={handlePrint}
            >
              🖨️
            </button>
            <button
              onClick={onRestart}
              style={{
                background: 'none',
                border: '1.5px solid var(--border)',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 14,
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              ↺
            </button>
          </>
        )}
      </div>
    </div>
  )
}
