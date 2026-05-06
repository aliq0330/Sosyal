// =============================================
// Supabase Configuration
// Replace with your actual project values from
// https://supabase.com/dashboard/project/_/settings/api
// =============================================
const SUPABASE_URL = 'https://mixzbxalitstglslstbv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peHpieGFsaXRzdGdsc2xzdGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjE4MzcsImV4cCI6MjA5MzU5NzgzN30.X6a2z4Vex3b23VRxBt4K5n2lWfUI_5ansFKRrO7bHbs';

// Map tile configuration (OpenStreetMap - free, no API key)
const MAP_TILES = {
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  topo:  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
};

const APP_CONFIG = {
  name: 'Sosyal',
  version: '1.0.0',
  defaultCity: 'İstanbul',
  defaultCoords: [41.0082, 28.9784], // İstanbul
  defaultZoom: 12,
  rideMinDistance: 0.1, // km - minimum to save
};
