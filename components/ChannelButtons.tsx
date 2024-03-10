import React from 'react'
import { Channel } from '@/types/lofi'

interface ChannelButtonsProps {
  channels: Channel[]
  currentChannel: number
  setCurrentChannel: (index: number) => void
  currentTheme: string
}

const ChannelButtons: React.FC<ChannelButtonsProps> = ({
  channels,
  currentChannel,
  setCurrentChannel,
  currentTheme,
}) => (
  <div className="flex space-x-2 overflow-x-auto pb-2">
    {channels.map((channel, idx) => (
      <button
        key={idx}
        onClick={() => setCurrentChannel(idx)}
        className={`flex-shrink-0 rounded-[var(--lofi-button-radius)] px-3 py-1 font-mono text-xs shadow-[var(--lofi-card-shadow)] transition-colors ${
          currentChannel === idx
            ? 'bg-[var(--lofi-accent)] text-white hover:bg-[var(--lofi-accent-hover)]'
            : 'bg-[var(--lofi-button-bg)] text-[var(--lofi-button-text)] hover:bg-[var(--lofi-button-hover)]'
        }`}
      >
        CH{idx + 1} {channel.isCustom && '★'}
      </button>
    ))}
  </div>
)

export default ChannelButtons
