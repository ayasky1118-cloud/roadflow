/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_MAPTILER_API_KEY?: string
  readonly VITE_MAPTILER_STYLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
