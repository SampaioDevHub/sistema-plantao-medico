"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { registerUser } from "@/lib/auth-service"
import { FirebaseError } from "firebase/app"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"doctor" | "hospital">("doctor")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Verifique se as senhas digitadas são iguais.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await registerUser(email, password, name, role)

      toast({
        title: "Cadastro realizado",
        description: "Você será redirecionado para completar seu perfil.",
      })

      router.push("/dashboard/profile")
    } catch (error) {
      console.error("Registration error:", error)
      let errorMessage = "Verifique os dados e tente novamente."
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Este email já está registrado."
            break
          case "auth/invalid-email":
            errorMessage = "Email inválido."
            break
          case "auth/weak-password":
            errorMessage = "A senha deve ter pelo menos 6 caracteres."
            break
        }
      }
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-xl rounded-lg overflow-hidden">
        {/* Lado esquerdo - Imagem */}
        <div 
          className="hidden md:block w-1/2 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('/images/clinica-interior.jpg')" // Substitua pelo caminho real
          }}
        >
          <div className="h-full bg-black/40 flex items-center justify-center">
            <div className="text-white text-center p-6">
              <h1 className="text-3xl font-bold mb-2">Clínica FHT</h1>
              <p className="text-lg">Junte-se à nossa rede de cuidados</p>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full md:w-1/2 bg-white p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Novo Cadastro</h2>
              <p className="text-sm text-gray-600">Preencha os dados para criar sua conta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de tipo de cadastro */}
              <div className="space-y-2">
                <Label className="text-gray-700">Tipo de cadastro</Label>
                <RadioGroup 
                  defaultValue="doctor" 
                  onValueChange={(value: "doctor" | "hospital") => setRole(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor">Médico</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hospital" id="hospital" />
                    <Label htmlFor="hospital">Hospital</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  {role === "doctor" ? "Nome completo" : "Nome do hospital"}
                </Label>
                <Input
                  id="name"
                  placeholder={role === "doctor" ? "Dr. João Silva" : "Hospital São Lucas"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={role === "doctor" ? "medico@clinicasaude.com" : "contato@hospital.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Confirmação de senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Botão de envio */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Criar conta"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Já possui conta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}