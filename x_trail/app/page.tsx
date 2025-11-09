'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
        <input type="email" placeholder="Email" className="border p-2 rounded" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="border p-2 rounded" onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
      <button onClick={() => router.push('/signup')} className="text-blue-600 mt-3 text-sm">Create an account</button>
    </div>
  )
}
