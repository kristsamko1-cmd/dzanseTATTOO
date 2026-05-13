export type AdminUserRow = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

function getFunctionsBaseUrl() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1`
}

function assertOk(res: Response) {
  if (res.ok) return
  throw new Error(`Admin API error: ${res.status}`)
}

export async function listUsers(authHeader: string): Promise<AdminUserRow[]> {
  const res = await fetch(`${getFunctionsBaseUrl()}/admin-users/users`, {
    headers: {
      Authorization: authHeader,
    },
  })
  assertOk(res)
  return (await res.json()) as AdminUserRow[]
}

export async function updateUser(
  authHeader: string,
  id: string,
  patch: { email?: string; full_name?: string | null; role?: string },
) {
  const res = await fetch(`${getFunctionsBaseUrl()}/admin-users/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  })
  assertOk(res)
}

export async function deleteUser(authHeader: string, id: string) {
  const res = await fetch(`${getFunctionsBaseUrl()}/admin-users/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: authHeader,
    },
  })
  assertOk(res)
}

