"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Trash2, X, RotateCcw } from "lucide-react"
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
  const [dates, setDates] = useState<Date[]>([])
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("18:00")
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [timeError, setTimeError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await getTimeSlots();
        setTimeSlots(slots.sort((a, b) => a.date.getTime() - b.date.getTime()));
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar sua disponibilidade.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };
    fetchTimeSlots()
  }, [toast])

  const checkTimeConflict = (newDate: Date, newStart: string, newEnd: string) => {
    return timeSlots.some((slot) => {
      const slotDate = slot.date.toDateString()
      const newDateStr = newDate.toDateString()
      if (slotDate !== newDateStr) return false
      return (
        (newStart >= slot.startTime && newStart < slot.endTime) ||
        (newEnd > slot.startTime && newEnd <= slot.endTime) ||
        (newStart <= slot.startTime && newEnd >= slot.endTime)
      )
    })
  }

  const handleSelectDate = (newDate: Date) => {
    if (dates.length === 0) {
      // Se nenhuma data estiver selecionada, adiciona a primeira data
      setDates([newDate])
    } else if (dates.length === 1) {
      // Se já houver uma data selecionada, assume que é a data inicial e seleciona todas no intervalo
      const startDate = dates[0]
      const endDate = newDate
  
      if (startDate.getTime() > endDate.getTime()) {
        // Garante que a data inicial seja antes da final
        setDates([endDate, startDate])
      } else {
        const range = []
        let currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          range.push(new Date(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }
        setDates(range)
      }
    } else {
      // Se já houver um intervalo selecionado, redefinir para começar de novo
      setDates([newDate])
    }
  }

  const handleRemoveTimeSlot = async (id: string) => {
    setIsLoading(true)
    try {
      await deleteTimeSlot(id)
      setTimeSlots(timeSlots.filter((slot) => slot.id !== id))
      toast({
        title: "Disponibilidade removida",
        description: "Removida com sucesso.",
      })
    } catch (error) {
      console.error("Error removing time slot:", error)
      toast({
        title: "Erro ao remover",
        description: "Falha ao remover disponibilidade.",
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

  const resetForm = () => {
    setDates([])
    setStartTime("08:00")
    setEndTime("18:00")
    setSelectedSpecialties([])
    setTimeError(null)
  }

  const applyQuickTime = (start: string, end: string) => {
    setStartTime(start)
    setEndTime(end)
    setTimeError(null)
  }

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    return `${hour.toString().padStart(2, "0")}:${minute}`
  })

  const filteredSpecialties = medicalSpecialties.filter(
    (specialty) =>
      specialty.toLowerCase().includes(searchValue.toLowerCase()) && !selectedSpecialties.includes(specialty),
  )

  if (isLoadingTimeSlots) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Disponibilidade</h1>
        <p className="text-gray-600 text-sm sm:text-base">Gerencie seus horários para receber propostas de plantão</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Adicionar Disponibilidade */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg sm:text-xl">Adicionar Disponibilidade</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Escolha datas, horários e especialidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-700 text-sm sm:text-base">Datas</Label>
              <div className="overflow-x-auto">
                <Calendar
                  mode="multiple"
                  selected={dates}
                  onSelect={(newDates) => setDates(newDates || [])}
                  className="border-blue-200 rounded-md p-3 bg-white w-full sm:w-auto text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm sm:text-base">Horários Rápidos</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickTime("08:00", "12:00")}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                >
                  Manhã
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickTime("14:00", "18:00")}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                >
                  Tarde
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickTime("18:00", "22:00")}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                >
                  Noite
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-gray-700 text-sm sm:text-base">Início</Label>
                <Select value={startTime} onValueChange={(val) => {
                  setStartTime(val)
                  if (val >= endTime) setTimeError("O início deve ser anterior ao término.")
                  else setTimeError(null)
                }}>
                  <SelectTrigger id="start-time" className={cn("border-blue-200 focus:ring-blue-500 text-sm", timeError && "border-red-500")}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time} className="text-sm">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-gray-700 text-sm sm:text-base">Término</Label>
                <Select value={endTime} onValueChange={(val) => {
                  setEndTime(val)
                  if (startTime >= val) setTimeError("O início deve ser anterior ao término.")
                  else setTimeError(null)
                }}>
                  <SelectTrigger id="end-time" className={cn("border-blue-200 focus:ring-blue-500 text-sm", timeError && "border-red-500")}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time} className="text-sm">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {timeError && <p className="text-red-600 text-xs sm:text-sm col-span-1 sm:col-span-2">{timeError}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm sm:text-base">Especialidades</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-blue-200 text-gray-700 hover:bg-blue-50 text-sm"
                  >
                    {selectedSpecialties.length > 0
                      ? `${selectedSpecialties.length} selecionada(s)`
                      : "Selecione especialidades"}
                    <Plus className="ml-2 h-4 w-4 text-blue-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto">
                  <Command>
                    <CommandInput
                      placeholder="Buscar especialidade..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="text-sm"
                    />
                    <CommandList>
                      <CommandEmpty className="text-sm">Nenhuma especialidade encontrada</CommandEmpty>
                      <CommandGroup>
                        {filteredSpecialties.map((specialty) => (
                          <CommandItem
                            key={specialty}
                            value={specialty}
                            onSelect={() => {
                              handleSelectSpecialty(specialty)
                              setOpen(false)
                            }}
                            className="text-sm"
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
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                  {selectedSpecialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      className="bg-blue-100 text-blue-800 flex items-center gap-1 text-xs sm:text-sm"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm sm:text-base"
                disabled={isLoading || !!timeError}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isLoading ? "Adicionando..." : "Adicionar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50 text-sm sm:text-base"
                onClick={resetForm}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Limpar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disponibilidade Cadastrada */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg sm:text-xl">Disponibilidade Cadastrada</CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Veja os horários registrados (ordenados por data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {timeSlots.length === 0 ? (
                <p className="text-center text-gray-600 py-6 text-sm">Nenhuma disponibilidade cadastrada</p>
              ) : (
                timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-blue-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {slot.date.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                        <Clock className="h-3 w-3" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {slot.specialties && slot.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {slot.specialties.map((specialty) => (
                            <Badge key={specialty} className="bg-blue-100 text-blue-800 text-xs">
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
                      className="text-gray-600 hover:text-red-600 mt-2 sm:mt-0"
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

      {/* Resumo de Disponibilidade */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-gray-900 text-lg sm:text-xl">Resumo do Mês</CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Visão geral da sua disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {timeSlots.length === 0 ? (
              <p className="text-gray-600 text-sm">Nenhuma disponibilidade registrada</p>
            ) : (
              timeSlots.map((slot) => (
                <Badge
                  key={slot.id}
                  className="bg-blue-50 text-blue-700 border-blue-200 py-1 px-2 text-xs sm:text-sm"
                >
                  {slot.date.toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  ({slot.startTime} - {slot.endTime})
                  {slot.specialties && slot.specialties.length > 0 && (
                    <span className="ml-1 text-xs">({slot.specialties.length})</span>
                  )}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}