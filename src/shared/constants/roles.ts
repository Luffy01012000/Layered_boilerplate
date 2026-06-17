export const APPLICATION_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const

export type ApplicationRole =
  (typeof APPLICATION_ROLES)[keyof typeof APPLICATION_ROLES]

const roles = new Set<string>(Object.values(APPLICATION_ROLES))

export const isValidRole = (role: string): role is ApplicationRole =>
  roles.has(role)
