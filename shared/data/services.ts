import type { ProviderService } from '../types/connections'

/**
 * Available payment services
 */
export const availableServices: ProviderService[] = [
  {
    id: 'strike',
    name: 'Strike',
    description: 'Connect your Strike account to start accepting payments.',
    logo: 'https://imgs.search.brave.com/RsTM1pqyQdo84cIFpCRwZVg9I8BxO_wjF4_-3PbDvrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF5/LWxoLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9fUEpXS0pnTkpT/Q1N6UDdnS3dCT1ZN/Ri1UNTZhREhrNS15/a3NJU1lrQlZrRFZV/bmFJNHhYcWhhMHFF/QXA5YzNzV1lFPXcy/NDAtaDQ4MC1ydw',
    url: 'https://strike.me',
  },
  {
    id: 'coinos',
    name: 'Coinos',
    description: 'Accept Lightning payments via Coinos.',
    logo: 'https://avatars.githubusercontent.com/u/6922450?s=200&v=4',
    url: 'https://coinos.io',
  },
  {
    id: 'alby',
    name: 'Alby',
    description: 'Connect your Alby wallet to receive tips.',
    logo: 'https://ugc.production.linktr.ee/Yo0H510WQ5CpNvb9D5dP_0001-22185927173.png?io=true&size=avatar-v3_0',
    url: 'https://getalby.com',
  },
]
