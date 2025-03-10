"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Trash2, X } from "lucide-react"
import {
  getTimeSlots,
  addTimeSlot,
  deleteTimeSlot,
  medicalSpecialties,
  type TimeSlot,
} from "@/lib/availability-service"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export default function AvailabilityPage() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("18:00")
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await getTimeSlots()
        setTimeSlots(slots)
      } catch (error) {
        console.error("Error fetching time slots:", error)
        toast({
          title: "Erro ao carregar disponibilidade",
          description: "Não foi possível carregar sua disponibilidade. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTimeSlots(false)
      }
    }

    fetchTimeSlots()
  }, [toast])

  const handleAddTimeSlot = async () => {
    if (!date) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para adicionar disponibilidade.",
        variant: "destructive",
      })
      return
    }

    if (startTime >= endTime) {
      toast({
        title: "Horário inválido",
        description: "O horário de início deve ser anterior ao horário de término.",
        variant: "destructive",
      })
      return
    }

    if (selectedSpecialties.length === 0) {
      toast({
        title: "Selecione especialidades",
        description: "Por favor, selecione pelo menos uma especialidade.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newSlotId = await addTimeSlot({
        date: new Date(date),
        startTime,
        endTime,
        specialties: selectedSpecialties,
      })

      // Add the new time slot to the state
      setTimeSlots([
        ...timeSlots,
        {
          id: newSlotId,
          doctorId: "", // This will be set by the backend
          date: new Date(date),
          startTime,
          endTime,
          specialties: selectedSpecialties,
        },
      ])

      // Reset selected specialties
      setSelectedSpecialties([])

      toast({
        title: "Disponibilidade adicionada",
        description: `Disponibilidade adicionada para ${date.toLocaleDateString()} das ${startTime} às ${endTime}.`,
      })
    } catch (error) {
      console.error("Error adding time slot:", error)
      toast({
        title: "Erro ao adicionar disponibilidade",
        description: "Ocorreu um erro ao adicionar sua disponibilidade. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveTimeSlot = async (id: string) => {
    setIsLoading(true)

    try {
      await deleteTimeSlot(id)

      // Remove the time slot from the state
      setTimeSlots(timeSlots.filter((slot) => slot.id !== id))

      toast({
        title: "Disponibilidade removida",
        description: "A disponibilidade foi removida com sucesso.",
      })
    } catch (error) {
      console.error("Error removing time slot:", error)
      toast({
        title: "Erro ao remover disponibilidade",
        description: "Ocorreu um erro ao remover sua disponibilidade. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSpecialty = (specialty: string) => {
    if (!selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties([...selectedSpecialties, specialty])
    }
    setSearchValue("")
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setSelectedSpecialties(selectedSpecialties.filter((s) => s !== specialty))
  }

  // Generate time options from 00:00 to 23:30 in 30-minute intervals
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    return `${hour.toString().padStart(2, "0")}:${minute}`
  })

  // Filter specialties based on search
  const filteredSpecialties = medicalSpecialties.filter(
    (specialty) =>
      specialty.toLowerCase().includes(searchValue.toLowerCase()) && !selectedSpecialties.includes(specialty),
  )

  if (isLoadingTimeSlots) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Disponibilidade</h1>
        <p className="text-muted-foreground">Gerencie sua disponibilidade para receber propostas de trabalho</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar disponibilidade</CardTitle>
            <CardDescription>
              Selecione as datas, horários e especialidades em que você está disponível para trabalhar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Selecione a data</Label>
              <Calendar mode="single" selected={date} onSelect={setDate} className="border rounded-md p-3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Horário de início</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Horário de término</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Especialidades</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    Selecione especialidades
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar especialidade..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhuma especialidade encontrada.</CommandEmpty>
                      <CommandGroup>
                        {filteredSpecialties.map((specialty) => (
                          <CommandItem
                            key={specialty}
                            value={specialty}
                            onSelect={() => {
                              handleSelectSpecialty(specialty)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSpecialties.includes(specialty) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {specialty}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedSpecialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSpecialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="rounded-full hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleAddTimeSlot}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              {isLoading ? "Adicionando..." : "Adicionar disponibilidade"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade cadastrada</CardTitle>
            <CardDescription>Sua disponibilidade atual para receber propostas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeSlots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma disponibilidade cadastrada</p>
              ) : (
                timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {slot.date.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {slot.specialties && slot.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {slot.specialties.map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => slot.id && handleRemoveTimeSlot(slot.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de disponibilidade</CardTitle>
          <CardDescription>Visão geral da sua disponibilidade para o mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <Badge key={slot.id} variant="outline" className="py-2">
                {slot.date.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                ({slot.startTime} - {slot.endTime})
                {slot.specialties && slot.specialties.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">({slot.specialties.length} especialidades)</span>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

