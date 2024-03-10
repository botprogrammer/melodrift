import React, { useState, useEffect } from 'react'
import { Plus, Music, X } from 'lucide-react'
import { soundEffects } from '@/lib/lofi_data'
import { SoundEffect, CustomSoundEffect } from '@/types/lofi'
import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player/youtube'), {
  ssr: false,
}) as any

interface SoundEffectsControlsProps {
  activeEffects: Set<string>
  toggleEffect: (effectId: string) => void
  effectsVolume: number
  setEffectsVolume: (vol: number) => void
  effectVolumes: { [key: string]: number }
  setEffectVolumes: (volumes: { [key: string]: number }) => void
  currentTheme: string
  customEffects: CustomSoundEffect[]
  setCustomEffects: (effects: CustomSoundEffect[]) => void
  loadingEffects: Set<string>
}

const SoundEffectsControls: React.FC<SoundEffectsControlsProps> = ({
  activeEffects,
  toggleEffect,
  effectsVolume,
  setEffectsVolume,
  effectVolumes,
  setEffectVolumes,
  currentTheme,
  customEffects,
  setCustomEffects,
  loadingEffects,
}) => {
  const [isAddingEffect, setIsAddingEffect] = useState(false)
  const [newEffect, setNewEffect] = useState<CustomSoundEffect>({
    id: '',
    name: '',
    file: '',
  })
  const [urlError, setUrlError] = useState('')

  const allEffects = [
    ...soundEffects.map((effect) => ({
      ...effect,
    })),
    ...customEffects.map((effect) => ({
      ...effect,
      icon: Music,
      isCustom: true,
    })),
  ]

  const validateYoutubeUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return (
        urlObj.hostname === 'www.youtube.com' ||
        urlObj.hostname === 'youtube.com' ||
        urlObj.hostname === 'youtu.be'
      )
    } catch {
      return false
    }
  }

  const handleAddEffect = async () => {
    if (!newEffect.name || !newEffect.file) {
      alert('Please provide both name and YouTube URL')
      return
    }

    if (!validateYoutubeUrl(newEffect.file)) {
      alert('Please provide a valid YouTube URL')
      return
    }

    const effectId = `custom_${Date.now()}`
    const newCustomEffect: CustomSoundEffect = {
      id: effectId,
      name: newEffect.name,
      file: newEffect.file,
    }

    setCustomEffects([...customEffects, newCustomEffect])
    const defaultVolume = 0.5
    setEffectVolumes({
      ...effectVolumes,
      [effectId]: defaultVolume,
    })
    setIsAddingEffect(false)
    setNewEffect({ id: '', name: '', file: '' })
  }

  const handleDeleteEffect = (effectId: string) => {
    setCustomEffects(customEffects.filter((effect) => effect.id !== effectId))
    const newVolumes = { ...effectVolumes }
    delete newVolumes[effectId]
    setEffectVolumes(newVolumes)
    if (activeEffects.has(effectId)) {
      toggleEffect(effectId)
    }
  }

  const renderSoundEffect = (effect: SoundEffect) => {
    const isActive = activeEffects.has(effect.id)
    const isLoading = loadingEffects.has(effect.id)

    return (
      <div
        key={effect.id}
        className={`relative flex flex-col rounded-[var(--lofi-card-radius)] p-3 shadow-[var(--lofi-card-shadow)] transition-colors ${
          isActive
            ? 'bg-[var(--lofi-card)] ring-1 ring-[var(--lofi-accent)] ring-opacity-50'
            : 'bg-[var(--lofi-card-hover)]'
        }`}
      >
        {isActive && (
          <div className="hidden">
            <ReactPlayer
              url={effect.file}
              playing={isActive}
              volume={effectVolumes[effect.id] * effectsVolume}
              loop
              config={{
                youtube: {
                  playerVars: { controls: 0 },
                },
              }}
            />
          </div>
        )}

        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleEffect(effect.id)}
              disabled={isLoading}
              className={`rounded-[var(--lofi-button-radius)] p-1.5 shadow-lg transition-all hover:translate-y-[-1px] hover:shadow-xl focus:outline-none active:translate-y-[1px] ${
                isLoading
                  ? 'opacity-50'
                  : isActive
                  ? 'bg-[var(--lofi-accent)] text-white shadow-[var(--lofi-accent)]/20'
                  : 'bg-[var(--lofi-button-bg)] text-[var(--lofi-button-text)] hover:bg-[var(--lofi-button-hover)]'
              }`}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
              ) : (
                <effect.icon size={16} />
              )}
            </button>
            <span className="font-mono text-xs text-[var(--lofi-text-primary)]">
              {effect.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-[var(--lofi-text-secondary)]">
              {Math.round(effectVolumes[effect.id] * 100)}%
            </span>
            {effect.isCustom && (
              <button
                onClick={() => handleDeleteEffect(effect.id)}
                className="rounded-md bg-[var(--lofi-button-bg)] p-1 text-[var(--lofi-button-text)] shadow-lg transition-all hover:translate-y-[-1px] hover:bg-[var(--lofi-button-hover)] hover:shadow-xl focus:outline-none active:translate-y-[1px]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effectVolumes[effect.id]}
          onChange={(e) => {
            if (!isActive && !isLoading) {
              toggleEffect(effect.id)
            }
            setEffectVolumes({
              ...effectVolumes,
              [effect.id]: parseFloat(e.target.value),
            })
          }}
          className="w-full cursor-pointer focus:outline-none [&::-moz-range-thumb]:bg-[var(--lofi-accent)] [&::-webkit-slider-thumb]:bg-[var(--lofi-accent)]"
          style={{
            accentColor: 'var(--lofi-accent)',
          }}
        />
      </div>
    )
  }

  useEffect(() => {
    const defaultVolume = 0.5
    const newVolumes = { ...effectVolumes }
    let hasChanges = false

    allEffects.forEach((effect) => {
      if (effectVolumes[effect.id] === undefined) {
        newVolumes[effect.id] = defaultVolume
        hasChanges = true
      }
    })

    if (hasChanges) {
      setEffectVolumes(newVolumes)
    }
  }, [allEffects, effectVolumes])

  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-row justify-between gap-4 sm:items-center">
        <h3 className="mt-2 font-mono text-sm text-[var(--lofi-text-primary)]">
          Effects
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddingEffect(true)}
            className="rounded-full bg-[var(--lofi-button-bg)] p-2 text-[var(--lofi-button-text)] hover:bg-[var(--lofi-button-hover)] focus:outline-none"
          >
            <Plus size={16} />
          </button>
          <span className="hidden font-mono text-xs text-[var(--lofi-text-secondary)] sm:inline">
            Master Volume
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={effectsVolume}
            onChange={(e) => setEffectsVolume(parseFloat(e.target.value))}
            className="w-32 focus:outline-none sm:w-20 [&::-moz-range-thumb]:bg-[var(--lofi-accent)] [&::-webkit-slider-thumb]:bg-[var(--lofi-accent)]"
            style={{
              accentColor: 'var(--lofi-accent)',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allEffects.map((effect) => renderSoundEffect(effect))}
      </div>

      {isAddingEffect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-3 rounded-[var(--lofi-card-radius)] bg-[var(--lofi-card)] p-6 shadow-[var(--lofi-card-shadow)]">
            <h3 className="text-lg font-bold text-[var(--lofi-text-primary)]">
              Add Sound Effect
            </h3>
            <input
              type="text"
              placeholder="Effect Name"
              value={newEffect.name}
              onChange={(e) =>
                setNewEffect({ ...newEffect, name: e.target.value })
              }
              className="w-full rounded-[var(--lofi-button-radius)] bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)] focus:outline-none"
            />
            <div className="space-y-1">
              <input
                type="url"
                placeholder="YouTube URL"
                value={newEffect.file}
                onChange={(e) => {
                  setNewEffect({ ...newEffect, file: e.target.value })
                  setUrlError('')
                }}
                className={`w-full rounded-[var(--lofi-button-radius)] bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)] focus:outline-none ${
                  urlError ? 'border border-red-500' : ''
                }`}
              />
              {urlError && <p className="text-xs text-red-500">{urlError}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingEffect(false)}
                className="rounded-[var(--lofi-button-radius)] px-3 py-1 text-xs text-[var(--lofi-text-secondary)] hover:text-[var(--lofi-text-primary)] focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEffect}
                className="flex items-center space-x-2 rounded-[var(--lofi-button-radius)] bg-[var(--lofi-accent)] px-3 py-1 text-xs text-white shadow-[var(--lofi-card-shadow)] hover:bg-[var(--lofi-accent-hover)]"
              >
                <Plus size={14} />
                <span>Add Effect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SoundEffectsControls
