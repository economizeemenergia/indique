'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from './types'
import { adminUser, indicadoras } from './mock-data'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'economize_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock authentication - check admin first
    if (email === adminUser.email && password === 'admin123') {
      setUser(adminUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser))
      return { success: true }
    }
    
    // Check indicadoras
    const indicadora = indicadoras.find(i => i.email === email)
    if (indicadora && password === 'indicadora123') {
      if (!indicadora.isActive) {
        return { success: false, error: 'Conta desativada. Entre em contato com o administrador.' }
      }
      setUser(indicadora)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(indicadora))
      return { success: true }
    }
    
    return { success: false, error: 'Email ou senha incorretos' }
  }

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check if email already exists
    if (email === adminUser.email) {
      return { success: false, error: 'Este email já está registrado' }
    }
    
    const exists = indicadoras.some(i => i.email === email)
    if (exists) {
      return { success: false, error: 'Este email já está registrado' }
    }
    
    // Validate password
    if (password.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' }
    }
    
    // Create new user (mock)
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '',
      role: 'indicadora',
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      isActive: true,
      validation: {
        documentType: 'pf',
        fullName: '',
        cpf: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email,
        status: 'nao_validada'
      }
    }
    
    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    // Store password (mock - in real app use secure backend)
    localStorage.setItem(`${STORAGE_KEY}_password_${email}`, password)
    
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
