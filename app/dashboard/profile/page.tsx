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
import { db, storage, auth } from "@/lib/firebase" // Certifique-se de importar o auth
import { collection, addDoc, getDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { onAuthStateChanged } from "firebase/auth" // Para monitorar o usuário autenticado
import { getCurrentUserData } from "@/lib/auth-service" // Importar função para pegar dados do usuário
import { CheckCircle, XCircle } from "lucide-react" // Ícones para feedback
import { motion, AnimatePresence } from "framer-motion" // Para animações

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthdate: "",
    gender: "",
    address: "",
    rg: "",
    complement: "",
    neighborhood: "",
    cityState: "",
    cep: "",
  })

  // Professional info state
  const [professionalInfo, setProfessionalInfo] = useState({
    crm: "",
    graduation: "",
    graduationYear: "",
    specialties: [],
    serviceType: "",
    experience: 0,
    bio: "",
    rqe: "",
    specialty: "",
    cnpj: "", // Adicionado para hospitais
  })

  // Financial info state
  const [financialInfo, setFinancialInfo] = useState({
    hourlyRate: 0,
    bank: "",
    agency: "",
    account: "",
    accountType: "",
    pix: "",
  })

  // Document upload state
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("hapvida-documents")
    return saved
      ? JSON.parse(saved)
      : {
          rgFile: null,
          cpfFile: null,
          crmFile: null,
          photo: null,
          curriculum: null,
          criminalRecord: null,
          ethicalRecord: null,
          debtRecord: null,
          proofOfResidence: null,
          graduationCertificate: null,
          rqeFile: null,
          postGradCertificate: null,
          specialistTitle: null,
          recommendationLetter: null,
        }
  })

  // Stepper state
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    { label: "Documentos Pessoais", required: true },
    { label: "Documentos Profissionais", required: true },
    { label: "Documentos de Especialista", required: false },
  ]

  // Carregar dados do usuário autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await getCurrentUserData()
          if (userData) {
            setPersonalInfo((prev) => ({
              ...prev,
              name: userData.name || "",
              email: userData.email || "",
            }))
            setProfessionalInfo((prev) => ({
              ...prev,
              crm: userData.crm || "",
              cnpj: userData.cnpj || "",
            }))
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar seus dados. Tente novamente.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingProfile(false)
        }
      } else {
        setIsLoadingProfile(false)
        toast({
          title: "Usuário não autenticado",
          description: "Por favor, faça login para acessar seu perfil.",
          variant: "destructive",
        })
      }
    })

    return () => unsubscribe() // Limpeza do listener
  }, [toast])

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("hapvida-documents", JSON.stringify(documents))
  }, [documents])

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("Usuário não autenticado")

      await addDoc(collection(db, "users"), {
        personal: personalInfo,
        uid: user.uid,
        timestamp: new Date(),
      })

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
      const user = auth.currentUser
      if (!user) throw new Error("Usuário não autenticado")

      await addDoc(collection(db, "users"), {
        professional: professionalInfo,
        uid: user.uid,
        timestamp: new Date(),
      })

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
      const user = auth.currentUser
      if (!user) throw new Error("Usuário não autenticado")

      await addDoc(collection(db, "users"), {
        financial: financialInfo,
        uid: user.uid,
        timestamp: new Date(),
      })

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

  const handleSaveDocuments = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("Usuário não autenticado")

      const fileUrls: { [key: string]: string } = {}
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          const storageRef = ref(storage, `documents/${user.uid}/${key}`)
          if (file instanceof File) {
            await uploadBytes(storageRef, file)
            const url = await getDownloadURL(storageRef)
            fileUrls[key] = url
          }
        }
      }

      await addDoc(collection(db, "users"), {
        documents: fileUrls,
        uid: user.uid,
        timestamp: new Date(),
      })

      toast({
        title: "Documentos salvos",
        description: "Seus documentos foram enviados com sucesso.",
      })

      setCurrentStep(0)
      setDocuments({
        rgFile: null,
        cpfFile: null,
        crmFile: null,
        photo: null,
        curriculum: null,
        criminalRecord: null,
        ethicalRecord: null,
        debtRecord: null,
        proofOfResidence: null,
        graduationCertificate: null,
        rqeFile: null,
        postGradCertificate: null,
        specialistTitle: null,
        recommendationLetter: null,
      })
      localStorage.removeItem("hapvida-documents")
    } catch (error) {
      console.error("Error saving documents:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar seus documentos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    const file = files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter menos de 5MB.",
          variant: "destructive",
        })
        return
      }
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie um arquivo PDF, JPEG ou PNG.",
          variant: "destructive",
        })
        return
      }
      setDocuments((prev) => ({ ...prev, [name]: file }))
    }
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 0) {
        if (!documents.rgFile || !documents.cpfFile || !documents.photo || !documents.proofOfResidence) {
          toast({
            title: "Documentos obrigatórios",
            description: "Por favor, envie todos os documentos pessoais obrigatórios antes de prosseguir.",
            variant: "destructive",
          })
          return
        }
      } else if (currentStep === 1) {
        if (
          !documents.crmFile ||
          !documents.curriculum ||
          !documents.criminalRecord ||
          !documents.ethicalRecord ||
          !documents.debtRecord ||
          !documents.graduationCertificate
        ) {
          toast({
            title: "Documentos obrigatórios",
            description: "Por favor, envie todos os documentos profissionais obrigatórios antes de prosseguir.",
            variant: "destructive",
          })
          return
        }
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinishEarly = () => {
    const requiredDocs = [
      documents.rgFile,
      documents.cpfFile,
      documents.photo,
      documents.proofOfResidence,
      documents.crmFile,
      documents.curriculum,
      documents.criminalRecord,
      documents.ethicalRecord,
      documents.debtRecord,
      documents.graduationCertificate,
    ]
    if (requiredDocs.every((doc) => doc !== null)) {
      handleSaveDocuments({ preventDefault: () => {} } as React.FormEvent)
    } else {
      toast({
        title: "Documentos obrigatórios",
        description: "Por favor, envie todos os documentos obrigatórios antes de finalizar.",
        variant: "destructive",
      })
    }
  }

  const renderFilePreview = (file: File | null) => {
    if (!file) return null
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        {file.type.startsWith("image/") ? (
          <img src={URL.createObjectURL(file)} alt="Preview" className="w-10 h-10 object-cover rounded" />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded">
            <span className="text-xs">PDF</span>
          </div>
        )}
        <span>{file.name}</span>
        <CheckCircle className="w-4 h-4 text-green-500" />
      </div>
    )
  }

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais, profissionais e documentos</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Pessoal</TabsTrigger>
          <TabsTrigger value="professional">Profissional</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
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
                      disabled // Campo vindo do cadastro, não editável
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      disabled // Campo vindo do cadastro, não editável
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
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={personalInfo.rg}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, rg: e.target.value })}
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
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço + Nº</Label>
                    <Input
                      id="address"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={personalInfo.complement}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, complement: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={personalInfo.neighborhood}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, neighborhood: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cityState">Cidade + UF</Label>
                    <Input
                      id="cityState"
                      value={personalInfo.cityState}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, cityState: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={personalInfo.cep}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, cep: e.target.value })}
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

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Atualize suas informações profissionais e especialidades</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfessionalInfo}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionalInfo.crm && (
                    <div className="space-y-2">
                      <Label htmlFor="crm">CRM</Label>
                      <Input
                        id="crm"
                        value={professionalInfo.crm}
                        onChange={(e) => setProfessionalInfo({ ...professionalInfo, crm: e.target.value })}
                        disabled // Campo vindo do cadastro, não editável
                      />
                    </div>
                  )}
                  {professionalInfo.cnpj && (
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={professionalInfo.cnpj}
                        onChange={(e) => setProfessionalInfo({ ...professionalInfo, cnpj: e.target.value })}
                        disabled // Campo vindo do cadastro, não editável
                      />
                    </div>
                  )}
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
                          specialty: value,
                        })
                      }
                    >
                      <SelectTrigger id="specialties">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinica-medica">Clínica Médica</SelectItem>
                        <SelectItem value="cardiologia">Cardiologia</SelectItem>
                        <SelectItem value="pneumologia">Pneumologia</SelectItem>
                        <SelectItem value="nefrologia">Nefrologia</SelectItem>
                        <SelectItem value="infectologia">Infectologia</SelectItem>
                        <SelectItem value="reumatologia">Reumatologia</SelectItem>
                        <SelectItem value="hematologia">Hematologia</SelectItem>
                        <SelectItem value="oncologia-clinica">Oncologia Clínica</SelectItem>
                        <SelectItem value="terapia-intensiva">Terapia Intensiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rqe">RQE (para especialistas)</Label>
                    <Input
                      id="rqe"
                      value={professionalInfo.rqe}
                      onChange={(e) => setProfessionalInfo({ ...professionalInfo, rqe: e.target.value })}
                    />
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

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Envie os documentos necessários para o cadastro FHT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep >= index ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm mt-1">{step.label}</span>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Documentos Pessoais</h3>
                      <p className="text-sm text-gray-500">Todos os documentos nesta etapa são obrigatórios.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rgFile">RG *</Label>
                          <Input type="file" id="rgFile" name="rgFile" onChange={handleFileChange} />
                          {renderFilePreview(documents.rgFile)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpfFile">CPF *</Label>
                          <Input type="file" id="cpfFile" name="cpfFile" onChange={handleFileChange} />
                          {renderFilePreview(documents.cpfFile)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="photo">Foto 3x4 *</Label>
                          <Input type="file" id="photo" name="photo" onChange={handleFileChange} />
                          {renderFilePreview(documents.photo)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proofOfResidence">Comprovante de Residência *</Label>
                          <Input type="file" id="proofOfResidence" name="proofOfResidence" onChange={handleFileChange} />
                          {renderFilePreview(documents.proofOfResidence)}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Documentos Profissionais</h3>
                      <p className="text-sm text-gray-500">Todos os documentos nesta etapa são obrigatórios.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="crmFile">CRM *</Label>
                          <Input type="file" id="crmFile" name="crmFile" onChange={handleFileChange} />
                          {renderFilePreview(documents.crmFile)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="curriculum">Currículo *</Label>
                          <Input type="file" id="curriculum" name="curriculum" onChange={handleFileChange} />
                          {renderFilePreview(documents.curriculum)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="criminalRecord">Certidão de Antecedentes Criminais *</Label>
                          <Input type="file" id="criminalRecord" name="criminalRecord" onChange={handleFileChange} />
                          {renderFilePreview(documents.criminalRecord)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ethicalRecord">Certidão Ético Profissional *</Label>
                          <Input type="file" id="ethicalRecord" name="ethicalRecord" onChange={handleFileChange} />
                          {renderFilePreview(documents.ethicalRecord)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debtRecord">Certidão Negativa de Débitos *</Label>
                          <Input type="file" id="debtRecord" name="debtRecord" onChange={handleFileChange} />
                          {renderFilePreview(documents.debtRecord)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationCertificate">Certificado de Graduação *</Label>
                          <Input type="file" id="graduationCertificate" name="graduationCertificate" onChange={handleFileChange} />
                          {renderFilePreview(documents.graduationCertificate)}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Documentos de Especialista (Opcional)</h3>
                      <p className="text-sm text-gray-500">Estes documentos são opcionais, mas recomendados se você for especialista.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rqeFile">RQE</Label>
                          <Input type="file" id="rqeFile" name="rqeFile" onChange={handleFileChange} />
                          {renderFilePreview(documents.rqeFile)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postGradCertificate">Certificado de Pós-Graduação</Label>
                          <Input type="file" id="postGradCertificate" name="postGradCertificate" onChange={handleFileChange} />
                          {renderFilePreview(documents.postGradCertificate)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialistTitle">Título de Especialista</Label>
                          <Input type="file" id="specialistTitle" name="specialistTitle" onChange={handleFileChange} />
                          {renderFilePreview(documents.specialistTitle)}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recommendationLetter">Carta de Recomendação</Label>
                          <Input type="file" id="recommendationLetter" name="recommendationLetter" onChange={handleFileChange} />
                          {renderFilePreview(documents.recommendationLetter)}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePreviousStep} disabled={isLoading}>
                  Anterior
                </Button>
              )}
              <div className="flex space-x-2">
                {currentStep === 2 && (
                  <Button variant="outline" onClick={handleFinishEarly} disabled={isLoading}>
                    Finalizar sem Especialista
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNextStep} disabled={isLoading}>
                    Próximo
                  </Button>
                ) : (
                  <Button onClick={handleSaveDocuments} disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar Documentos"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}