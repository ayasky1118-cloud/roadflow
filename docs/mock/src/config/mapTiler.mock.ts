/**
 * RoadFlow モック専用の MapTiler 設定（AWS / .env 不要でローカル開発可能）。
 * 看板アプリ signage の useMapInstance と同じ開発用キー。
 * 上書きする場合は docs/mock/.env に VITE_MAPTILER_API_KEY を設定。
 */
export const MOCK_MAPTILER_API_KEY = 'HzQk6uEjoEZ7PRWNUyYE'

export const MOCK_MAPTILER_STYLE_ID = 'streets-v2'
