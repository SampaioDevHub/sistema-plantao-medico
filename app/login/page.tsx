"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { loginUser, resetPassword } from "@/lib/auth-service"
import { FirebaseError } from "firebase/app"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await loginUser(email, password)

      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para o dashboard.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)

      let errorMessage = "Verifique suas credenciais e tente novamente."

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "Email ou senha incorretos."
            break
          case "auth/too-many-requests":
            errorMessage = "Muitas tentativas de login. Tente novamente mais tarde."
            break
          case "auth/invalid-email":
            errorMessage = "Email inválido."
            break
        }
      }

      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para redefinir a senha.",
        variant: "destructive",
      })
      return
    }

    setIsResetting(true)

    try {
      await resetPassword(email)

      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha.",
      })
    } catch (error) {
      console.error("Reset password error:", error)

      let errorMessage = "Não foi possível enviar o email de redefinição."

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "Não encontramos uma conta com este email."
            break
          case "auth/invalid-email":
            errorMessage = "Email inválido."
            break
        }
      }

      toast({
        title: "Erro ao redefinir senha",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <CardDescription>Entre com seu email e senha para acessar sua conta</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={handleResetPassword}
                  disabled={isResetting}
                >
                  {isResetting ? "Enviando..." : "Esqueceu a senha?"}
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

