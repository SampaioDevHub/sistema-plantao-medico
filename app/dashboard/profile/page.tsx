"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getDoctorProfile,
  updatePersonalInfo,
  updateProfessionalInfo,
  updateFinancialInfo,
  type PersonalInfo,
  type ProfessionalInfo,
  type FinancialInfo,
} from "@/lib/profile-service"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthdate: "",
    gender: "",
    address: "",
  })

  // Professional info state
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    crm: "",
    graduation: "",
    graduationYear: "",
    specialties: [],
    serviceType: "",
    experience: 0,
    bio: "",
  })

  // Financial info state
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
    hourlyRate: 0,
    bank: "",
    agency: "",
    account: "",
    accountType: "",
    pix: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getDoctorProfile()

        if (profile) {
          if (profile.personal) {
            setPersonalInfo(profile.personal)
          }

          if (profile.professional) {
            setProfessionalInfo(profile.professional)
          }

          if (profile.financial) {
            setFinancialInfo(profile.financial)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updatePersonalInfo(personalInfo)

      toast({
        title: "Informações pessoais salvas",
        description: "Suas informações pessoais foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Error saving personal info:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfessionalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfessionalInfo(professionalInfo)

      toast({
        title: "Informações profissionais salvas",
        description: "Suas informações profissionais foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Error saving professional info:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveFinancialInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateFinancialInfo(financialInfo)

      toast({
        title: "Informações financeiras salvas",
        description: "Suas informações financeiras foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Error saving financial info:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e profissionais</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Pessoal</TabsTrigger>
          <TabsTrigger value="professional">Profissional</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <form onSubmit={handleSavePersonalInfo}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={personalInfo.cpf}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Data de nascimento</Label>
                    <Input
                      id="birthdate"
                      type="date"
                      value={personalInfo.birthdate}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, birthdate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select
                      value={personalInfo.gender}
                      onValueChange={(value) => setPersonalInfo({ ...personalInfo, gender: value })}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Atualize suas informações profissionais e especialidades</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfessionalInfo}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                      id="crm"
                      value={professionalInfo.crm}
                      onChange={(e) => setProfessionalInfo({ ...professionalInfo, crm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation">Formação</Label>
                    <Input
                      id="graduation"
                      value={professionalInfo.graduation}
                      onChange={(e) => setProfessionalInfo({ ...professionalInfo, graduation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation-year">Ano de formação</Label>
                    <Input
                      id="graduation-year"
                      type="number"
                      value={professionalInfo.graduationYear}
                      onChange={(e) => setProfessionalInfo({ ...professionalInfo, graduationYear: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialties">Especialidade principal</Label>
                    <Select
                      value={professionalInfo.specialties[0] || ""}
                      onValueChange={(value) =>
                        setProfessionalInfo({
                          ...professionalInfo,
                          specialties: [value, ...professionalInfo.specialties.slice(1)],
                        })
                      }
                    >
                      <SelectTrigger id="specialties">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinica-geral">Clínica Geral</SelectItem>
                        <SelectItem value="cardiologia">Cardiologia</SelectItem>
                        <SelectItem value="pediatria">Pediatria</SelectItem>
                        <SelectItem value="ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="neurologia">Neurologia</SelectItem>
                        <SelectItem value="psiquiatria">Psiquiatria</SelectItem>
                        <SelectItem value="dermatologia">Dermatologia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-type">Tipo de atendimento</Label>
                    <Select
                      value={professionalInfo.serviceType}
                      onValueChange={(value) => setProfessionalInfo({ ...professionalInfo, serviceType: value })}
                    >
                      <SelectTrigger id="service-type">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="telemedicina">Telemedicina</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Anos de experiência</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={professionalInfo.experience}
                      onChange={(e) =>
                        setProfessionalInfo({
                          ...professionalInfo,
                          experience: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia profissional</Label>
                  <Textarea
                    id="bio"
                    value={professionalInfo.bio}
                    onChange={(e) => setProfessionalInfo({ ...professionalInfo, bio: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
              <CardDescription>Configure seu valor hora e informações bancárias</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveFinancialInfo}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">Valor hora (R$)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      value={financialInfo.hourlyRate}
                      onChange={(e) =>
                        setFinancialInfo({
                          ...financialInfo,
                          hourlyRate: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank">Banco</Label>
                    <Input
                      id="bank"
                      value={financialInfo.bank}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, bank: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agency">Agência</Label>
                    <Input
                      id="agency"
                      value={financialInfo.agency}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, agency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account">Conta</Label>
                    <Input
                      id="account"
                      value={financialInfo.account}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, account: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-type">Tipo de conta</Label>
                    <Select
                      value={financialInfo.accountType}
                      onValueChange={(value) => setFinancialInfo({ ...financialInfo, accountType: value })}
                    >
                      <SelectTrigger id="account-type">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Conta Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pix">Chave PIX</Label>
                    <Input
                      id="pix"
                      value={financialInfo.pix}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, pix: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

