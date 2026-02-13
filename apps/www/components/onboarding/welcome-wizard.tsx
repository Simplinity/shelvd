'use client'

import { useState } from 'react'
import { saveWizardData } from '@/lib/actions/onboarding'
import type { UserType, CollectionSize, CurrentSystem, WizardData } from '@/lib/actions/onboarding'

const STEPS = ['user_type', 'collection_size', 'current_system', 'interests'] as const
type Step = typeof STEPS[number]

export function WelcomeWizard() {
  const [step, setStep] = useState<Step>('user_type')
  const [saving, setSaving] = useState(false)

  // Wizard state
  const [userType, setUserType] = useState<UserType | null>(null)
  const [collectionSize, setCollectionSize] = useState<CollectionSize | null>(null)
  const [currentSystem, setCurrentSystem] = useState<CurrentSystem | null>(null)
  const [interests, setInterests] = useState<string[]>([])

  const stepIndex = STEPS.indexOf(step)

  function next() {
    const nextStep = STEPS[stepIndex + 1]
    if (nextStep) setStep(nextStep)
  }

  function back() {
    const prevStep = STEPS[stepIndex - 1]
    if (prevStep) setStep(prevStep)
  }

  async function finish() {
    if (!userType || !collectionSize || !currentSystem) return
    setSaving(true)
    try {
      const data: WizardData = {
        user_type: userType,
        collection_size_estimate: collectionSize,
        current_system: currentSystem,
        interests,
      }
      const result = await saveWizardData(data)
      if (result?.error) {
        console.error('Wizard save failed:', result.error)
        setSaving(false)
        return
      }
      // Force full page reload to re-run server layout
      window.location.href = '/books'
    } catch (err) {
      console.error('Wizard save error:', err)
      setSaving(false)
    }
  }

  function toggleInterest(interest: string) {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 3
          ? [...prev, interest]
          : prev
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-lg bg-background border border-border p-8 shadow-lg">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 transition-colors ${
                i <= stepIndex ? 'bg-foreground' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: User Type */}
        {step === 'user_type' && (
          <StepContainer
            title="Who are you?"
            subtitle="Before we let you loose in the stacks, a few questions. We promise they're painless — unlike that time you found foxing on your first edition."
          >
            <OptionList
              options={[
                { value: 'collector', emoji: '🏠', label: 'Private collector', desc: 'I hoard books and call it a library' },
                { value: 'dealer', emoji: '📚', label: 'Professional dealer', desc: 'I sell books and call it a career' },
                { value: 'librarian', emoji: '🎓', label: 'Librarian / Archivist', desc: 'I catalog books and call it a calling' },
                { value: 'explorer', emoji: '👀', label: 'Just looking around', desc: 'I clicked a link and here we are' },
              ]}
              selected={userType}
              onSelect={(v) => { setUserType(v as UserType); next() }}
            />
          </StepContainer>
        )}

        {/* Step 2: Collection Size */}
        {step === 'collection_size' && (
          <StepContainer
            title="How many books?"
            subtitle="No judgment. We've seen everything from 3 to 30,000."
          >
            <OptionList
              options={[
                { value: 'under_50', label: 'A handful', desc: 'Under 50' },
                { value: '50_500', label: 'A proper collection', desc: '50–500' },
                { value: '500_5000', label: 'A serious problem', desc: '500–5,000' },
                { value: '5000_plus', label: 'We might need to talk', desc: '5,000+' },
              ]}
              selected={collectionSize}
              onSelect={(v) => { setCollectionSize(v as CollectionSize); next() }}
            />
            <BackButton onClick={back} />
          </StepContainer>
        )}

        {/* Step 3: Current System */}
        {step === 'current_system' && (
          <StepContainer
            title="How do you catalog now?"
            subtitle="Be honest. We've all been there."
          >
            <OptionList
              options={[
                { value: 'spreadsheet', emoji: '📊', label: 'Spreadsheet', desc: 'Excel/Google Sheets. It works. Sort of.' },
                { value: 'notebook', emoji: '📝', label: 'Notebook', desc: 'Pen, paper, and hope' },
                { value: 'memory', emoji: '🧠', label: 'My memory', desc: 'I know exactly where everything is. Usually.' },
                { value: 'other_app', emoji: '📦', label: 'Another app', desc: 'LibraryThing / Bookbuddy / CLZ / other' },
                { value: 'nothing', emoji: '🫣', label: "I don't", desc: "That's why I'm here" },
              ]}
              selected={currentSystem}
              onSelect={(v) => { setCurrentSystem(v as CurrentSystem); next() }}
            />
            <BackButton onClick={back} />
          </StepContainer>
        )}

        {/* Step 4: Interests */}
        {step === 'interests' && (
          <StepContainer
            title="What matters most to you?"
            subtitle="Pick up to 3. This helps us show you the right things first."
          >
            <div className="space-y-2">
              {[
                'Knowing what I own',
                'Tracking provenance & history',
                'Insurance & valuation',
                'Finding books in library catalogs',
                'Organizing by condition & rarity',
                'Selling online',
                'Just keeping it tidy',
              ].map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`w-full text-left px-4 py-3 border transition-colors ${
                    interests.includes(interest)
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border hover:border-foreground/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{interest}</span>
                    {interests.includes(interest) && (
                      <span className="text-xs font-bold">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {interests.length}/3 selected
            </p>
            <div className="flex items-center justify-between mt-6">
              <BackButton onClick={back} />
              <button
                onClick={finish}
                disabled={saving}
                className="px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Setting up...' : "Let's go →"}
              </button>
            </div>
          </StepContainer>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───

function StepContainer({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed italic">{subtitle}</p>
      {children}
    </div>
  )
}

function OptionList({ options, selected, onSelect }: {
  options: { value: string; emoji?: string; label: string; desc: string }[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`w-full text-left px-4 py-4 border transition-colors group ${
            selected === opt.value
              ? 'border-foreground bg-foreground/5'
              : 'border-border hover:border-foreground/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
            <div>
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted-foreground italic">{opt.desc}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
    >
      ← Back
    </button>
  )
}
