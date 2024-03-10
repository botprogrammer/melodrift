import React from 'react'
import { Edit2, X, Plus, Save } from 'lucide-react'
import { Channel } from '@/types/lofi'

interface ChannelManagementProps {
  isAddingChannel: boolean
  setIsAddingChannel: (adding: boolean) => void
  newChannel: Channel
  setNewChannel: (channel: Channel) => void
  saveChannel: () => void
  currentTheme: string
  currentChannel: number
  handleEditChannel: (index: number) => void
  setShowDeleteConfirm: (channelIndex: number) => void
}

const ChannelManagement: React.FC<ChannelManagementProps> = ({
  isAddingChannel,
  setIsAddingChannel,
  newChannel,
  setNewChannel,
  saveChannel,
  currentTheme,
  currentChannel,
  handleEditChannel,
  setShowDeleteConfirm,
}) => (
  <div
    className={
      isAddingChannel
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
        : 'flex items-center space-x-2'
    }
  >
    {!isAddingChannel ? (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleEditChannel(currentChannel)}
          className="rounded-[var(--lofi-button-radius)] bg-[var(--lofi-button-bg)] p-2 text-[var(--lofi-button-text)] shadow-[var(--lofi-card-shadow)] transition-colors hover:bg-[var(--lofi-button-hover)]"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(currentChannel)}
          className="rounded-[var(--lofi-button-radius)] bg-[var(--lofi-button-bg)] p-2 text-[var(--lofi-button-text)] shadow-[var(--lofi-card-shadow)] transition-colors hover:bg-[var(--lofi-button-hover)]"
        >
          <X size={16} />
        </button>
        <button
          onClick={() => setIsAddingChannel(true)}
          className="rounded-[var(--lofi-button-radius)] bg-[var(--lofi-button-bg)] p-2 text-[var(--lofi-button-text)] shadow-[var(--lofi-card-shadow)] transition-colors hover:bg-[var(--lofi-button-hover)]"
        >
          <Plus size={16} />
        </button>
      </div>
    ) : (
      <div className="w-full max-w-md space-y-3 rounded-[var(--lofi-card-radius)] bg-[var(--lofi-card)] p-6 shadow-[var(--lofi-card-shadow)]">
        <h3 className="text-lg font-bold text-[var(--lofi-text-primary)]">
          Add New Channel
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Channel Name"
            value={newChannel.name}
            onChange={(e) =>
              setNewChannel({ ...newChannel, name: e.target.value })
            }
            className="rounded-[var(--lofi-button-radius)] bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]"
          />
          <input
            type="text"
            placeholder="YouTube URL"
            value={newChannel.url}
            onChange={(e) =>
              setNewChannel({ ...newChannel, url: e.target.value })
            }
            className="rounded-[var(--lofi-button-radius)] bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]"
          />
          <input
            type="text"
            placeholder="Description"
            value={newChannel.description}
            onChange={(e) =>
              setNewChannel({ ...newChannel, description: e.target.value })
            }
            className="rounded-[var(--lofi-button-radius)] bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]"
          />
          <input
            type="text"
            placeholder="Creator"
            value={newChannel.creator}
            onChange={(e) =>
              setNewChannel({ ...newChannel, creator: e.target.value })
            }
            className="rounded-[var(--lofi-button-radius)] bg-[var(--lofi-card-hover)] px-3 py-2 text-sm text-[var(--lofi-text-primary)] placeholder:text-[var(--lofi-text-secondary)]"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsAddingChannel(false)}
            className="rounded-[var(--lofi-button-radius)] px-3 py-1 text-xs text-[var(--lofi-text-secondary)] hover:text-[var(--lofi-text-primary)]"
          >
            Cancel
          </button>
          <button
            onClick={saveChannel}
            className="flex items-center space-x-2 rounded-[var(--lofi-button-radius)] bg-[var(--lofi-accent)] px-3 py-1 text-xs text-white shadow-[var(--lofi-card-shadow)] hover:bg-[var(--lofi-accent-hover)]"
          >
            <Save size={14} />
            <span>Save Channel</span>
          </button>
        </div>
      </div>
    )}
  </div>
)

export default ChannelManagement
