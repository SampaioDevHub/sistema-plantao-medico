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
  const [step, setStep] = useState(0) // Controle de etapas
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"doctor" | "hospital" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cnpj, setCnpj] = useState("") // Para empresas
  const [crm, setCrm] = useState("") // Para médicos
  const router = useRouter()
  const { toast } = useToast()

  const handleRoleSelection = (value: "doctor" | "hospital") => {
    setRole(value)
    setStep(1) // Avança para o primeiro passo após seleção
  }

  const handleNextStep = () => {
    if (role === "hospital" && step === 1 && !isValidCnpj(cnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, insira um CNPJ válido no formato 00.000.000/0000-00.",
        variant: "destructive",
      })
      return
    }
    if (role === "doctor" && step === 1 && !isValidCrm(crm)) {
      toast({
        title: "CRM inválido",
        description: "Por favor, insira um CRM válido (ex.: CRM 12345).",
        variant: "destructive",
      })
      return
    }
    setStep(step + 1)
  }

  const handlePreviousStep = () => setStep(step - 1)

  // Validação de CNPJ (simples, apenas verifica formato)
  const isValidCnpj = (cnpj: string) => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    return cnpjRegex.test(cnpj)
  }

  // Validação de CRM (simples, aceita "CRM" seguido de números)
  const isValidCrm = (crm: string) => {
    const crmRegex = /^CRM\s?\d{4,6}$/
    return crmRegex.test(crm)
  }

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

    if (!role) {
      toast({
        title: "Erro",
        description: "Tipo de usuário não selecionado.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await registerUser(email, password, name, role, {
        ...(role === "hospital" && { cnpj }),
        ...(role === "doctor" && { crm }),
      })

      toast({
        title: "Cadastro realizado com sucesso",
        description: "Redirecionando para o dashboard...",
      })

      // Redireciona para /dashboard após o cadastro
      router.push("/dashboard")
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

  // Componente de Progresso (Stepper)
  const renderProgress = () => {
    if (step === 0) return null
    const steps = ["Seleção", "Dados", "Credenciais"]
    return (
      <div className="flex justify-between mb-6">
        {steps.map((label, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= index ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm mt-1">{label}</span>
          </div>
        ))}
      </div>
    )
  }

  // Componente de Steps
  const renderSteps = () => {
    if (step === 0) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Selecione o tipo de cadastro</h2>
          <RadioGroup 
            onValueChange={handleRoleSelection}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="doctor" id="doctor" />
              <Label htmlFor="doctor">Médico</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hospital" id="hospital" />
              <Label htmlFor="hospital">Empresa</Label>
            </div>
          </RadioGroup>
        </div>
      )
    }

    if (role === "hospital") {
      switch (step) {
        case 1:
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Dados da Empresa</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Nome do hospital</Label>
                <Input
                  id="name"
                  placeholder="Hospital São Lucas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Próximo
              </Button>
            </div>
          )
        case 2:
          return (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-semibold">Credenciais</h3>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={handlePreviousStep}>
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Finalizar"}
                </Button>
              </div>
            </form>
          )
      }
    }

    if (role === "doctor") {
      switch (step) {
        case 1:
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Dados do Médico</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Dr. João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm">CRM</Label>
                <Input
                  id="crm"
                  placeholder="CRM 12345"
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Próximo
              </Button>
            </div>
          )
        case 2:
          return (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-semibold">Credenciais</h3>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="medico@clinicasaude.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={handlePreviousStep}>
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Finalizar"}
                </Button>
              </div>
            </form>
          )
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-xl rounded-lg overflow-hidden">
        {/* Lado esquerdo - Imagem */}
        <div 
          className="hidden md:block w-1/2 bg-cover bg-center" 
          style={{ backgroundImage: "url('/images/clinica-interior.jpg')" }}
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
            {renderProgress()}
            {renderSteps()}
            {step > 0 && (
              <p className="text-center text-sm text-gray-600">
                Já possui conta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Faça login
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}