"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, FileText, MessageSquare } from "lucide-react"
import { getTimeSlots } from "@/lib/availability-service"
import { getProposals } from "@/lib/proposal-service"
import { getContracts } from "@/lib/contract-service"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    availableDays: 0,
    newProposals: 0,
    activeContracts: 0,
    hoursWorked: 0,
    upcomingShifts: [],
    recentProposals: [],
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data in parallel
        const [timeSlots, proposals, contracts] = await Promise.all([getTimeSlots(), getProposals(), getContracts()])

        // Calculate dashboard metrics
        const availableDays = timeSlots.length
        const newProposals = proposals.filter((p) => p.status === "pending").length
        const activeContracts = contracts.filter((c) => c.status === "upcoming").length

        // Calculate hours worked (from completed contracts)
        let hoursWorked = 0
        contracts
          .filter((c) => c.status === "completed")
          .forEach((contract) => {
            // Extract hours from duration (e.g., "12h" -> 12)
            const hours = Number.parseInt(contract.duration)
            if (!isNaN(hours)) {
              hoursWorked += hours
            }
          })

        // Get upcoming shifts
        const upcomingShifts = contracts
          .filter((c) => c.status === "upcoming")
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 2)

        // Get recent proposals
        const recentProposals = proposals
          .filter((p) => p.status === "pending")
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 3)

        setDashboardData({
          availableDays,
          newProposals,
          activeContracts,
          hoursWorked,
          upcomingShifts,
          recentProposals,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.availableDays}</div>
            <p className="text-xs text-muted-foreground">Dias disponíveis este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Propostas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.newProposals}</div>
            <p className="text-xs text-muted-foreground">Novas propostas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeContracts}</div>
            <p className="text-xs text-muted-foreground">Contratos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.hoursWorked}h</div>
            <p className="text-xs text-muted-foreground">Horas trabalhadas este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos plantões</CardTitle>
            <CardDescription>Seus próximos plantões agendados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingShifts.length > 0 ? (
                dashboardData.upcomingShifts.map((shift, index) => (
                  <div
                    key={shift.id}
                    className={`flex items-center justify-between ${index < dashboardData.upcomingShifts.length - 1 ? "border-b pb-4" : ""}`}
                  >
                    <div>
                      <p className="font-medium">{shift.hospital}</p>
                      <p className="text-sm text-muted-foreground">{shift.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{shift.date.toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{shift.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhum plantão agendado</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propostas recentes</CardTitle>
            <CardDescription>Propostas que você recebeu recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentProposals.length > 0 ? (
                dashboardData.recentProposals.map((proposal, index) => (
                  <div
                    key={proposal.id}
                    className={`flex items-center justify-between ${index < dashboardData.recentProposals.length - 1 ? "border-b pb-4" : ""}`}
                  >
                    <div>
                      <p className="font-medium">{proposal.hospital}</p>
                      <p className="text-sm text-muted-foreground">{proposal.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{proposal.date.toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{proposal.duration} (plantão)</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma proposta recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

