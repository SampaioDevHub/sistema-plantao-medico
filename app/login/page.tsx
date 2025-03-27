"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { loginUser, resetPassword } from "@/lib/auth-service"
import { FirebaseError } from "firebase/app"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await loginUser(email, password)
      toast({
        title: "Bem-vindo(a)",
        description: "Login realizado com sucesso.",
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
            errorMessage = "Muitas tentativas. Tente novamente mais tarde."
            break
          case "auth/invalid-email":
            errorMessage = "Email inválido."
            break
        }
      }
      toast({
        title: "Erro ao acessar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      toast({
        title: "Email necessário",
        description: "Por favor, informe seu email para redefinir a senha.",
        variant: "destructive",
      })
      return
    }

    setIsResetting(true)

    try {
      await resetPassword(resetEmail)
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      })
      setIsModalOpen(false) // Fecha o modal após sucesso
      setResetEmail("") // Limpa o campo
    } catch (error) {
      console.error("Reset password error:", error)
      let errorMessage = "Não foi possível enviar o email de redefinição."
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "Nenhuma conta encontrada com este email."
            break
          case "auth/invalid-email":
            errorMessage = "Email inválido."
            break
          case "auth/too-many-requests":
            errorMessage = "Muitas tentativas. Tente novamente mais tarde."
            break
        }
      }
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-xl rounded-lg overflow-hidden">
        {/* Lado esquerdo - Imagem da clínica */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/clinica-exterior.jpg')" // Substitua pelo caminho real da imagem
          }}
        >
          <div className="h-full bg-black/40 flex items-center justify-center">
            <div className="text-white text-center p-6">
              <h1 className="text-3xl font-bold mb-2">Clínica FHT</h1>
              <p className="text-lg">Cuidando de você com excelência</p>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário de login */}
        <div className="w-full md:w-1/2 bg-white p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Acesso Profissional</h2>
              <p className="text-sm text-gray-600">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="profissional@clinicasaude.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">Senha</Label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => setIsModalOpen(true)}
                    disabled={isResetting}
                  >
                    {isResetting ? "Enviando..." : "Esqueceu sua senha?"}
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Acessando..." : "Entrar"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Novo na plataforma?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Faça seu Cadastro
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Redefinição de Senha */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Redefinir Senha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail" className="text-gray-700">E-mail</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-600">
                Insira seu email para receber um link de redefinição.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isResetting}
              >
                {isResetting ? "Enviando..." : "Enviar Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}