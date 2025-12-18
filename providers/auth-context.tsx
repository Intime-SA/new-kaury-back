"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdTokenResult } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Constantes para validación de credenciales admin
const ADMIN_EMAIL = "admin@kaurymdp.com"
const ADMIN_UID = "x3ZZHckzV5R7rCJ0Usk3y88Zxdd2"

// Función helper para validar credenciales de admin
const validateAdminCredentials = (user: User): boolean => {
  return user.email === ADMIN_EMAIL && user.uid === ADMIN_UID
}

// Componente para proteger rutas
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-white">Verificando autenticación...</div>
      </div>
    )
  }

  // Si estamos en la página de login, no proteger
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return <>{children}</>
  }

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push("/login")
    }
    return null
  }

  // Si hay usuario autenticado, mostrar el contenido protegido
  return <>{children}</>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verificar si el token está vencido
          const tokenResult = await getIdTokenResult(user)
          const expirationTime = new Date(tokenResult.expirationTime).getTime()
          const currentTime = new Date().getTime()

          if (currentTime >= expirationTime) {
            // Token vencido, cerrar sesión
            await signOut(auth)
            setUser(null)
          } else {
            // Validar credenciales de admin
            if (validateAdminCredentials(user)) {
              setUser(user)
            } else {
              // Usuario no autorizado, cerrar sesión
              await signOut(auth)
              setUser(null)
            }
          }
        } catch (error) {
          console.error("Error verificando token:", error)
          await signOut(auth)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Verificar que el email sea el de admin antes de intentar login
      if (email !== ADMIN_EMAIL) {
        throw new Error("Acceso no autorizado. Solo se permite el email de administrador.")
      }

      await signInWithEmailAndPassword(auth, email, password)

      // Esperar a que Firebase actualice el estado de autenticación
      await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe()
          if (user) {
            // Validar credenciales de admin
            if (validateAdminCredentials(user)) {
              resolve(user)
            } else {
              // Usuario no autorizado, cerrar sesión
              signOut(auth)
              reject(new Error("Acceso no autorizado. Credenciales de administrador requeridas."))
            }
          } else {
            reject(new Error("Error de autenticación"))
          }
        })
      })
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
