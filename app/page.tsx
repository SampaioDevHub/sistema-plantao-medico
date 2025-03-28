"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, FileText, User } from "lucide-react"
import Logo from "@/public/logo-fht.svg"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Image src={Logo} alt="FHT Soluções Hospitalares" width={150} height={50} />
          <nav className="flex gap-6">
            <Link href="/login">
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Cadastrar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-r from-blue-50 to-white py-20">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Conectando médicos e hospitais com eficiência
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Cadastre-se na plataforma FHT e encontre oportunidades de plantão que combinam com sua especialidade e disponibilidade.
              </p>
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  Comece Agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <Image 
                src="https://res.cloudinary.com/dm8vb9gkj/image/upload/v1743168879/medical-banner-with-doctor-working-laptop_xwmwbo.jpg" // Substitua por uma imagem real relacionada à clínica
                alt="Médico em ação"
                width={500}
                height={300}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Como funciona a plataforma FHT
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-4 hover:bg-blue-50 rounded-lg transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Crie seu perfil</h3>
                <p className="text-gray-600">
                  Informe suas especialidades e dados profissionais em poucos passos.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 hover:bg-blue-50 rounded-lg transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Defina sua agenda</h3>
                <p className="text-gray-600">
                  Escolha os horários em que você está disponível para plantões.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 hover:bg-blue-50 rounded-lg transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Receba propostas</h3>
                <p className="text-gray-600">
                  Veja oportunidades que se encaixam no seu perfil e horário.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 hover:bg-blue-50 rounded-lg transition-colors">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Formalize contratos</h3>
                <p className="text-gray-600">
                  Aceite plantões e assine contratos digitais com segurança.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 py-8 text-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            © 2025 FHT Soluções Hospitalares. Todos os direitos reservados.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/sobre" className="hover:underline">Sobre Nós</Link>
            <Link href="/contato" className="hover:underline">Contato</Link>
            <Link href="/termos" className="hover:underline">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}