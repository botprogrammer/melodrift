export interface Channel {
  originalIndex?: number
  name: string
  url: string
  description: string
  creator: string
  isCustom?: boolean
}

export interface SoundEffect {
  id: string
  name: string
  file: string
  icon: any
  isCustom?: boolean
}

export interface CustomSoundEffect {
  id: string
  name: string
  file: string
}
