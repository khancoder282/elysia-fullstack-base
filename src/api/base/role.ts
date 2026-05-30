export const PERMISSION = ['get:me', 'get:me1'] as const

export type PERMISSION = typeof PERMISSION[number]
export type ROLE = 'user' | 'admin' | 'super-admin'

const ROLEMAP: Record<ROLE, (PERMISSION | ROLE)[]> = {
    'user': ['get:me'],
    'admin': ['get:me1'],
    'super-admin': ['user', 'admin']
}

export function getPermissionByRole(role: ROLE) {
    const Rolemapping = ROLEMAP[role] ?? ROLEMAP['user']
    const permission = Rolemapping.flatMap(i => ROLEMAP[i as ROLE] ?? i)
    return [...new Set(permission)] as PERMISSION[]
}

