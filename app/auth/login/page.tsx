'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      // Check user role and redirect appropriately
      const userData = JSON.parse(localStorage.getItem('economize_auth_user') || '{}')
      if (userData.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/indicadora/dashboard')
      }
    } else {
      setError(result.error || 'Erro ao fazer login')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-icon.png"
              alt="Economize em Energia"
              width={72}
              height={72}
              className="h-[72px] w-auto object-contain"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="text-[28px] font-semibold text-[#16a34a]">Economize</span>
              <span className="text-sm font-normal text-[#4b5563]">em Energia</span>
            </div>
          </div>
          <span className="mt-3 text-base font-semibold text-[#4b5563] tracking-wide">
            Embaixador Economize
          </span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar indicações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                Entrar
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Esqueceu sua senha?
            </Link>

            <div className="w-full border-t pt-4">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Não tem conta?{' '}
                <Link
                  href="/auth/signup"
                  className="text-primary font-semibold hover:underline"
                >
                  Criar conta
                </Link>
              </p>

              <p className="text-xs text-muted-foreground text-center mb-2">
                Credenciais de demonstração:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted p-2 rounded">
                  <p className="font-medium">Admin</p>
                  <p className="text-muted-foreground">admin@economize.com.br</p>
                  <p className="text-muted-foreground">admin123</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="font-medium">Indicadora</p>
                  <p className="text-muted-foreground">maria@indicadora.com</p>
                  <p className="text-muted-foreground">indicadora123</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
