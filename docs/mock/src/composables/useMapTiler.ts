/** MapTiler / MapLibre 用（看板アプリ signage の address API と同じ Geocoding エンドポイント） */

import { MOCK_MAPTILER_API_KEY, MOCK_MAPTILER_STYLE_ID } from '../config/mapTiler.mock'

const MAPTILER_GEOCODING_URL = 'https://api.maptiler.com/geocoding'

/** .env の VITE_MAPTILER_API_KEY があれば優先。なければモック用キー（AWS 不要） */
export function getMapTilerApiKey(): string {
  return ((import.meta.env.VITE_MAPTILER_API_KEY as string) ?? '').trim() || MOCK_MAPTILER_API_KEY
}

export function getMapTilerStyleId(): string {
  return (
    ((import.meta.env.VITE_MAPTILER_STYLE as string) ?? '').trim() || MOCK_MAPTILER_STYLE_ID
  )
}

export function getMapTilerStyleUrl(apiKey: string): string {
  return `https://api.maptiler.com/maps/${getMapTilerStyleId()}/style.json?key=${apiKey}`
}

export interface GeocodeResult {
  lat: number
  lng: number
}

/** 住所を MapTiler Geocoding で検索（country=jp。看板アプリ backend と同様） */
export async function geocodeAddress(address: string, apiKey: string): Promise<GeocodeResult> {
  const query = address.trim()
  if (!query) {
    throw new Error('住所が入力されていません。')
  }

  const url = `${MAPTILER_GEOCODING_URL}/${encodeURIComponent(query)}.json?key=${encodeURIComponent(apiKey)}&country=jp`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('住所の検索中にエラーが発生しました。')
  }

  const data = (await res.json()) as {
    features?: { geometry?: { coordinates?: number[] } }[]
  }
  const features = data.features ?? []
  if (features.length === 0) {
    throw new Error('該当する住所が見つかりません。')
  }

  const coords = features[0]?.geometry?.coordinates
  if (!coords || coords.length < 2) {
    throw new Error('座標を取得できませんでした。')
  }

  return { lng: coords[0], lat: coords[1] }
}
