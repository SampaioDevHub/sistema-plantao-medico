import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, FileText, User } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Plantão Médico</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold mb-4">Conectando médicos e oportunidades de plantão</h2>
              <p className="text-xl mb-8">
                Cadastre sua disponibilidade, especialidades e valor hora para receber propostas de trabalho compatíveis
                com seu perfil.
              </p>
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Comece agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cadastre seu perfil</h3>
                <p>Crie sua conta e preencha suas informações profissionais e especialidades.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Informe sua disponibilidade</h3>
                <p>Preencha o calendário com os dias e horários que você pode trabalhar.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Receba propostas</h3>
                <p>Receba propostas de trabalho compatíveis com seu perfil e disponibilidade.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Assine contratos</h3>
                <p>Aceite propostas e assine contratos digitais para confirmar a contratação.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Sistema Plantão Médico. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

