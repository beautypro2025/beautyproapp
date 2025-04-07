    'use client'

    import { useAuth } from '@/context/AuthContext'
    import { useRouter } from 'next/navigation'
    import { useEffect } from 'react'

    export default function DashboardPage() {
    const { user, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
        router.push('/login')
        }
    }, [user, router])

    if (!user) return <p>Carregando...</p>

    return (
        <main className="p-6">
        <h1>Bem-vindo, {user.displayName}</h1>
        <p>Email: {user.email}</p>
        <button onClick={logout}>Sair</button>
        </main>
    )
    }
