"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Home, LogOut, Menu, MessageSquare, User, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/components/auth-provider"
import { logoutUser } from "@/lib/auth-service"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await logoutUser()

      toast({
        title: "Logout realizado com sucesso",
      })

      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)

      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao sair. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/profile", label: "Meu Perfil", icon: <User className="h-5 w-5" /> },
    { href: "/dashboard/availability", label: "Disponibilidade", icon: <Calendar className="h-5 w-5" /> },
    { href: "/dashboard/proposals", label: "Propostas", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/dashboard/contracts", label: "Contratos", icon: <FileText className="h-5 w-5" /> },
    { href: "/dashboard/checkin", label: "Check-in/out", icon: <Clock className="h-5 w-5" /> },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      {isMobile && (
        <button
          className="fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? isMobileMenuOpen
              ? "fixed inset-y-0 left-0 z-40 w-64 transform translate-x-0 transition-transform duration-200 ease-in-out"
              : "fixed inset-y-0 left-0 z-40 w-64 transform -translate-x-full transition-transform duration-200 ease-in-out"
            : "w-64"
        } bg-white border-r`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary">Plantão Médico</h1>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                  }`}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-1 w-full p-4">
          <Button variant="outline" className="w-60 flex items-center gap-2 justify-center" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  )
}

