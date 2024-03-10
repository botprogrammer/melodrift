import React from 'react'
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  VolumeX,
  Volume1,
  Volume2,
} from 'lucide-react'

interface PlaybackControlsProps {
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  volume: number
  setVolume: (vol: number) => void
  changeChannel: (direction: 'next' | 'prev') => void
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  changeChannel,
}) => (
  <div className="flex w-full items-center justify-between sm:justify-start sm:gap-8">
    {/* Left Side - Playback Controls */}
    <div className="flex shrink-0 items-center space-x-1">
      <button
        onClick={() => changeChannel('prev')}
        className="rounded-[var(--lofi-button-radius)] pl-0 pr-1 py-1.5 text-[var(--lofi-text-primary)] shadow-[var(--lofi-card-shadow)] hover:bg-[var(--lofi-card-hover)] sm:px-2"
      >
        <SkipBack size={14} className="sm:h-4 sm:w-4" />
      </button>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="rounded-[var(--lofi-button-radius)] px-1 py-1.5 text-[var(--lofi-text-primary)] shadow-[var(--lofi-card-shadow)] hover:bg-[var(--lofi-card-hover)] sm:p-2"
      >
        {isPlaying ? (
          <Pause size={14} className="sm:h-4 sm:w-4" />
        ) : (
          <Play size={14} className="sm:h-4 sm:w-4" />
        )}
      </button>
      <button
        onClick={() => changeChannel('next')}
        className="rounded-[var(--lofi-button-radius)] px-1 py-1.5 text-[var(--lofi-text-primary)] shadow-[var(--lofi-card-shadow)] hover:bg-[var(--lofi-card-hover)] sm:p-2"
      >
        <SkipForward size={14} className="sm:h-4 sm:w-4" />
      </button>
      {/* Right Side - Volume Control */}
      <div className="flex min-w-[90px] items-center space-x-1 sm:min-w-[110px] sm:space-x-2">
        <button
          onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
          className="hidden sm:block rounded-[var(--lofi-button-radius)] px-1 py-1.5 text-[var(--lofi-text-primary)] shadow-[var(--lofi-card-shadow)] hover:bg-[var(--lofi-card-hover)] sm:p-2"
        >
          {volume === 0 ? (
            <VolumeX size={14} className="sm:h-4 sm:w-4" />
          ) : volume < 0.5 ? (
            <Volume1 size={14} className="sm:h-4 sm:w-4" />
          ) : (
            <Volume2 size={14} className="sm:h-4 sm:w-4" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          onTouchStart={(e) => {
            // Prevent default touch behavior
            e.stopPropagation()
          }}
          className="w-full cursor-pointer accent-[var(--lofi-accent)] rounded-lg bg-[var(--lofi-card-hover)] touch-none"
        />
      </div>
    </div>
  </div>
)

export default PlaybackControls
