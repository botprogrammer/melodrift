export type Theme = {
  id: string
  name: string
}

export const themes: { [key: string]: Theme } = {
  dark: {
    id: 'dark',
    name: 'Dark',
  },
  light: {
    id: 'light',
    name: 'Light',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
  },
  metallic: {
    id: 'metallic',
    name: 'Metallic',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
  },
}
