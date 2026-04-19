export const PROVIDERS = {
  Netflix: {
    url: 'https://www.netflix.com',
    providerId: 8,
    searchUrl: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  },
  'Prime Video': {
    url: 'https://www.primevideo.com',
    providerId: 119,
    searchUrl: (title) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`,
  },
  'HBO Max': {
    url: 'https://play.max.com',
    providerId: 1899,
    searchUrl: (title) => `https://play.max.com/search?q=${encodeURIComponent(title)}`,
  },
  'Disney+': {
    url: 'https://www.disneyplus.com',
    providerId: 337,
    searchUrl: (title) => `https://www.disneyplus.com/search/${encodeURIComponent(title)}`,
  },
  Crunchyroll: {
    url: 'https://www.crunchyroll.com',
    providerId: 283,
    searchUrl: (title) => `https://www.crunchyroll.com/pt-br/search?q=${encodeURIComponent(title)}`,
  },
}

export const PROVIDER_NAMES = Object.keys(PROVIDERS)
