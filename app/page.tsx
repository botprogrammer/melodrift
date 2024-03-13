'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { X, Save, Settings } from 'lucide-react'
import { GitHubIcon } from '@/components/GitHubIcon'
import { soundEffects, DEFAULT_CHANNELS } from '@/lib/lofi_data'
import ChannelButtons from '@/components/ChannelButtons'
import PlaybackControls from '@/components/PlaybackControls'
import ChannelManagement from '@/components/ChannelManagement'
import SoundEffectsControls from '@/components/SoundEffectsControls'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Channel, CustomSoundEffect } from '@/types/lofi'
import SettingsModal from '@/components/SettingsModal'
import styles from '@/styles/Lofi.module.css'

const ReactPlayer = dynamic(() => import('react-player/youtube'), {
  ssr: false,
})

// Type Definitions
type AudioCache = {
  audio: HTMLAudioElement
  loaded: boolean
}

const StaticEffect = () => {
  const [staticPoints, setStaticPoints] = useState<
    { left: string; top: string; opacity: number }[]
  >([])

  useEffect(() => {
    setStaticPoints(
      Array.from({ length: 100 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5,
      }))
    )
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 opacity-10 mix-blend-screen">
      {staticPoints.map((point, i) => (
        <div key={i} className="absolute h-px w-px bg-white" style={point} />
      ))}
    </div>
  )
}

const EnhancedLofiPlayer = () => {
  const [mounted, setMounted] = useState(false)
  const [currentChannel, setCurrentChannel] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useLocalStorage('lofi-volume', 0.7)
  const [played, setPlayed] = useState(0)
  const [currentTheme, setCurrentTheme] = useLocalStorage<string>(
    'lofi-theme',
    'dark'
  )
  const [effectsVolume, setEffectsVolume] = useLocalStorage(
    'lofi-effects-volume',
    0.5
  )
  const [customChannels, setCustomChannels] = useLocalStorage<Channel[]>(
    'customChannels',
    []
  )
  const [hiddenDefaultChannels, setHiddenDefaultChannels] = useLocalStorage<
    number[]
  >('hiddenDefaultChannels', [])
  const [effectVolumes, setEffectVolumes] = useLocalStorage<{
    [key: string]: number
  }>(
    'lofi-effect-volumes',
    Object.fromEntries(soundEffects.map((effect) => [effect.id, 0.5]))
  )
  const [customEffects, setCustomEffects] = useLocalStorage<
    CustomSoundEffect[]
  >('customSoundEffects', [])

  const playerRef = useRef<any>(null)
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set())
  const [isAddingChannel, setIsAddingChannel] = useState(false)
  const [newChannel, setNewChannel] = useState<Channel>({
    name: '',
    url: '',
    description: '',
    creator: '',
    isCustom: true,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  )
  const [isEditingChannel, setIsEditingChannel] = useState<number | null>(null)
  const [editingChannel, setEditingChannel] = useState<Channel>({
    name: '',
    url: '',
    description: '',
    creator: '',
    isCustom: true,
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const isBrowser = typeof window !== 'undefined'

  useEffect(() => {
    if (!isBrowser) return
    setMounted(true)
  }, [isBrowser])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get theme from localStorage directly to ensure immediate application
      const savedTheme = localStorage.getItem('lofi-theme') || 'dark'
      document.documentElement.dataset.theme = savedTheme
      if (currentTheme !== savedTheme) {
        setCurrentTheme(savedTheme)
      }
    }
  }, [])

  const toggleEffect = (effectId: string) => {
    setActiveEffects((prev) => {
      const newEffects = new Set(prev)
      if (newEffects.has(effectId)) {
        newEffects.delete(effectId)
      } else {
        newEffects.add(effectId)
      }
      return newEffects
    })
  }

  const handleProgress = (state: { played: number }) => {
    if (!isPlaying) return
    setPlayed(state.played)
  }

  const handleChannelChange = (index: number) => {
    setCurrentChannel(index)
    setPlayed(0)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
  }

  const handleEffectsVolumeChange = (newVolume: number) => {
    setEffectsVolume(newVolume)
  }

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
  }

  const handleAddChannel = () => {
    if (!newChannel.name || !newChannel.url) {
      alert('Channel Name and URL are required.')
      return
    }

    const updatedChannels: Channel[] = [
      ...customChannels,
      { ...newChannel, isCustom: true },
    ]
    setCustomChannels(updatedChannels)
    setIsAddingChannel(false)
    setNewChannel({
      name: '',
      url: '',
      description: '',
      creator: '',
      isCustom: true,
    })
  }

  const handleDeleteChannel = (channelIndex: number) => {
    const channelToDelete = allChannels[channelIndex]
    if (!channelToDelete) return

    let newChannelIndex = channelIndex

    if (
      !channelToDelete.isCustom &&
      typeof channelToDelete.originalIndex === 'number'
    ) {
      // It's a default channel
      if (!hiddenDefaultChannels.includes(channelToDelete.originalIndex)) {
        const updatedHidden = [
          ...hiddenDefaultChannels,
          channelToDelete.originalIndex,
        ]
        setHiddenDefaultChannels(updatedHidden)
      }
    } else {
      // It's a custom channel
      const updatedChannels = customChannels.filter(
        (channel) =>
          channel.name !== channelToDelete.name ||
          channel.url !== channelToDelete.url
      )
      setCustomChannels(updatedChannels)
    }

    // Switch channel if needed
    if (channelIndex === currentChannel) {
      newChannelIndex = Math.max(0, channelIndex - 1)
      setCurrentChannel(newChannelIndex)
    }

    setShowDeleteConfirm(null)
  }

  const changeChannel = (direction: 'next' | 'prev') => {
    setCurrentChannel((prev) => {
      if (direction === 'next') {
        return (prev + 1) % allChannels.length
      } else {
        return (prev - 1 + allChannels.length) % allChannels.length
      }
    })
  }

  const allChannels = useMemo<Channel[]>(() => {
    // Get visible default channels
    const visibleDefaultChannels = DEFAULT_CHANNELS.map((channel, index) => ({
      ...channel,
      isCustom: false,
      originalIndex: index,
    })).filter((_, index) => !hiddenDefaultChannels.includes(index))

    // Add custom channels
    return [...visibleDefaultChannels, ...customChannels]
  }, [customChannels, hiddenDefaultChannels])

  const handleSaveChannel = () => {
    if (!newChannel.name || !newChannel.url) {
      alert('Channel Name and URL are required.')
      return
    }

    const updatedChannels: Channel[] = [
      ...customChannels,
      { ...newChannel, isCustom: true },
    ]
    setCustomChannels(updatedChannels)
    setIsAddingChannel(false)
    setNewChannel({
      name: '',
      url: '',
      description: '',
      creator: '',
      isCustom: true,
    })
  }

  const handleEditChannel = (channelIndex: number) => {
    console.log('Starting edit for channel:', {
      channelIndex,
      channel: allChannels[channelIndex],
    })
    const channel = allChannels[channelIndex]
    setEditingChannel({ ...channel })
    setIsEditingChannel(channelIndex)
  }

  const handleSaveEditedChannel = () => {
    if (!editingChannel.name || !editingChannel.url) {
      alert('Channel Name and URL are required.')
      return
    }

    const channelToEdit = allChannels[isEditingChannel ?? -1]
    if (!channelToEdit) return

    if (channelToEdit.isCustom) {
      // Editing a custom channel
      const customIndex = customChannels.findIndex(
        (channel) =>
          channel.name === channelToEdit.name &&
          channel.url === channelToEdit.url
      )

      if (customIndex !== -1) {
        const updatedChannels = [...customChannels]
        updatedChannels[customIndex] = { ...editingChannel, isCustom: true }
        setCustomChannels(updatedChannels)
      }
    } else if (typeof channelToEdit.originalIndex === 'number') {
      // Editing a default channel - hide default and add as custom
      if (!hiddenDefaultChannels.includes(channelToEdit.originalIndex)) {
        const updatedHidden = [
          ...hiddenDefaultChannels,
          channelToEdit.originalIndex,
        ]
        setHiddenDefaultChannels(updatedHidden)
      }

      const updatedChannels = [
        ...customChannels,
        { ...editingChannel, isCustom: true },
      ]
      setCustomChannels(updatedChannels)
    }

    setIsEditingChannel(null)
    setEditingChannel({
      name: '',
      url: '',
      description: '',
      creator: '',
      isCustom: true,
    })
  }

  return (
    <div
      className={styles['theme-container']}
      data-theme={mounted ? currentTheme : 'dark'}
    >
      <a
        href="https://github.com/botprogrammer/melodrift"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 top-4 hidden text-[var(--lofi-text-primary)] transition-opacity hover:opacity-70 lg:block"
        aria-label="View source on GitHub"
      >
        <GitHubIcon />
      </a>
      <div className="flex min-h-screen w-full items-start justify-center bg-[var(--lofi-background)] p-4 transition-colors duration-500 sm:items-center sm:p-8">
        <div className="w-full max-w-4xl space-y-8 py-4">
          {/* Retro TV */}
          <div className="shadow-[var(--lofi-accent)]/30 relative aspect-video overflow-hidden rounded-2xl border-4 border-[var(--lofi-border)] bg-black shadow-md transition-all duration-500">
            <div className="absolute inset-0">
              {mounted && <StaticEffect />}
              {mounted && (
                // @ts-ignore
                <ReactPlayer
                  ref={playerRef}
                  url={allChannels[currentChannel]?.url || ''}
                  playing={isPlaying}
                  volume={volume}
                  loop
                  width="100%"
                  height="100%"
                  onProgress={handleProgress}
                  onError={(error: Error) =>
                    console.error('Player error:', error)
                  }
                  config={{
                    playerVars: {
                      controls: 0,
                      modestbranding: 1,
                      iv_load_policy: 3,
                      rel: 0,
                      showinfo: 0,
                    },
                  }}
                />
              )}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="font-mono text-xs text-red-400">LIVE</span>
                  </div>
                  <span className="font-mono text-xs text-white/80">
                    CH{currentChannel + 1}
                  </span>
                </div>
              </div>
              <div className="animate-scan absolute bottom-0 left-0 right-0 h-px bg-white/10" />
            </div>
          </div>

          {/* Main Controls Section */}
          <div className="space-y-6 rounded-xl bg-[var(--lofi-card)] p-4 transition-colors duration-500 sm:p-6">
            {/* Channel Information */}
            <div className="relative space-y-1 px-2 font-mono text-[var(--lofi-text-primary)]">
              {/* Settings button */}
              <div className="absolute top-0 right-0 flex justify-center">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="rounded-full bg-[var(--lofi-button-bg)] p-2 text-[var(--lofi-button-text)] transition-colors hover:bg-[var(--lofi-button-hover)]"
                >
                  <Settings size={18} />
                </button>
              </div>
              {mounted ? (
                <>
                  <h2 className="text-xl font-bold">
                    {allChannels[currentChannel].name}
                  </h2>
                  <p className="text-sm text-[var(--lofi-text-secondary)]">
                    {allChannels[currentChannel].description}
                  </p>
                  <p className="text-sm text-[var(--lofi-accent)]">
                    by {allChannels[currentChannel].creator}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">
                    {DEFAULT_CHANNELS[0].name}
                  </h2>
                  <p className="text-sm text-[var(--lofi-text-secondary)]">
                    {DEFAULT_CHANNELS[0].description}
                  </p>
                  <p className="text-sm text-purple-400">
                    by {DEFAULT_CHANNELS[0].creator}
                  </p>
                </>
              )}
            </div>

            {/* Channel Buttons */}
            {mounted && (
              <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <ChannelButtons
                  channels={allChannels}
                  currentChannel={currentChannel}
                  setCurrentChannel={setCurrentChannel}
                  currentTheme={currentTheme}
                />
              </div>
            )}

            {/* Controls Container */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {/* Left Side - Playback Controls */}
                {mounted && (
                  <PlaybackControls
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    volume={volume}
                    setVolume={handleVolumeChange}
                    changeChannel={changeChannel}
                  />
                )}

                {/* Right Side - Channel Management */}
                {mounted && (
                  <div className="flex shrink-0 items-center">
                    <ChannelManagement
                      isAddingChannel={isAddingChannel}
                      setIsAddingChannel={setIsAddingChannel}
                      newChannel={newChannel}
                      setNewChannel={setNewChannel}
                      saveChannel={handleSaveChannel}
                      currentTheme={currentTheme}
                      currentChannel={currentChannel}
                      handleEditChannel={handleEditChannel}
                      setShowDeleteConfirm={setShowDeleteConfirm}
                    />
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="">
                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--lofi-card-hover)]">
                  <div
                    className="h-full bg-[var(--lofi-accent)] transition-all duration-300"
                    style={{ width: `${played * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sound Effects Section - Separated into its own card */}
          {mounted && (
            <div className="rounded-xl bg-[var(--lofi-card)] p-4 transition-colors duration-500 sm:p-6">
              <SoundEffectsControls
                activeEffects={activeEffects}
                toggleEffect={toggleEffect}
                effectsVolume={effectsVolume}
                setEffectsVolume={handleEffectsVolumeChange}
                effectVolumes={effectVolumes}
                setEffectVolumes={setEffectVolumes}
                currentTheme={currentTheme}
                customEffects={customEffects}
                setCustomEffects={setCustomEffects}
                loadingEffects={new Set()}
              />
            </div>
          )}
        </div>

        {/* Channel Edit Modal */}
        {isEditingChannel !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              className={`w-full max-w-md rounded-lg bg-[var(--lofi-card)] p-6`}
            >
              <h3
                className={`mb-4 text-lg font-bold text-[var(--lofi-text-primary)]`}
              >
                Edit Channel {isEditingChannel + 1}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Channel Name"
                  value={editingChannel.name}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      name: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]`}
                />
                <input
                  type="text"
                  placeholder="YouTube URL"
                  value={editingChannel.url}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      url: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]`}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={editingChannel.description}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      description: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]`}
                />
                <input
                  type="text"
                  placeholder="Creator"
                  value={editingChannel.creator}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      creator: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]`}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditingChannel(null)}
                    className={`rounded-full px-3 py-1 text-xs text-[var(--lofi-text-primary)] hover:text-[var(--lofi-text-secondary)]`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedChannel}
                    className="flex items-center space-x-2 rounded-full bg-[var(--lofi-button-bg)] px-3 py-1 text-xs text-[var(--lofi-button-text)] hover:bg-[var(--lofi-button-hover)]"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
              className={`w-full max-w-sm rounded-lg bg-[var(--lofi-card)] p-6`}
            >
              <h3
                className={`mb-4 text-lg font-bold text-[var(--lofi-text-primary)]`}
              >
                Delete Channel
              </h3>
              {allChannels.length <= 1 ? (
                <p className="mb-4 text-sm text-[var(--lofi-text-secondary)]">
                  Cannot delete the last remaining channel.
                </p>
              ) : (
                <p className={`mb-4 text-sm text-[var(--lofi-text-secondary)]`}>
                  Are you sure you want to delete "
                  {allChannels[showDeleteConfirm].name}"?
                  {showDeleteConfirm <
                    DEFAULT_CHANNELS.length - hiddenDefaultChannels.length &&
                    ' This will hide the default channel.'}
                </p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`rounded-full px-3 py-1 text-xs text-[var(--lofi-text-primary)] hover:text-[var(--lofi-text-secondary)]`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteChannel(showDeleteConfirm)}
                  className={`flex items-center space-x-2 rounded-full ${
                    allChannels.length <= 1
                      ? 'cursor-not-allowed bg-[var(--lofi-button-bg)]'
                      : 'bg-[var(--lofi-button-bg)] hover:bg-[var(--lofi-button-hover)]'
                  } px-3 py-1 text-xs text-[var(--lofi-button-text)]`}
                  disabled={allChannels.length <= 1}
                >
                  <X size={14} />
                  <span>Delete Channel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentTheme={currentTheme}
          setCurrentTheme={handleThemeChange}
        />
      </div>
    </div>
  )
}

export default EnhancedLofiPlayer
