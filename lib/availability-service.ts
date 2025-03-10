import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "./firebase"

export interface TimeSlot {
  id?: string
  doctorId: string
  date: Date
  startTime: string
  endTime: string
  specialties: string[] // Adicionando especialidades
  createdAt?: Date
  updatedAt?: Date
}

// Add a new time slot
export const addTimeSlot = async (
  timeSlot: Omit<TimeSlot, "id" | "doctorId" | "createdAt" | "updatedAt">,
): Promise<string> => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("User not authenticated")

    const docRef = await addDoc(collection(db, "timeSlots"), {
      doctorId: uid,
      date: timeSlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      specialties: timeSlot.specialties || [], // Garantir que sempre tenha um array
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    console.error("Error adding time slot:", error)
    throw error
  }
}

// Update a time slot
export const updateTimeSlot = async (id: string, timeSlot: Partial<TimeSlot>): Promise<void> => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("User not authenticated")

    await updateDoc(doc(db, "timeSlots", id), {
      ...timeSlot,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating time slot:", error)
    throw error
  }
}

// Delete a time slot
export const deleteTimeSlot = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "timeSlots", id))
  } catch (error) {
    console.error("Error deleting time slot:", error)
    throw error
  }
}

// Get all time slots for the current doctor
export const getTimeSlots = async (): Promise<TimeSlot[]> => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("User not authenticated")

    const q = query(collection(db, "timeSlots"), where("doctorId", "==", uid))
    const querySnapshot = await getDocs(q)

    const timeSlots: TimeSlot[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      timeSlots.push({
        id: doc.id,
        doctorId: data.doctorId,
        date: data.date.toDate(),
        startTime: data.startTime,
        endTime: data.endTime,
        specialties: data.specialties || [],
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      })
    })

    return timeSlots
  } catch (error) {
    console.error("Error getting time slots:", error)
    throw error
  }
}

// Lista de especialidades médicas comuns
export const medicalSpecialties = [
  "Acupuntura",
  "Alergia e Imunologia",
  "Anestesiologia",
  "Angiologia",
  "Cardiologia",
  "Cirurgia Cardiovascular",
  "Cirurgia da Mão",
  "Cirurgia de Cabeça e Pescoço",
  "Cirurgia do Aparelho Digestivo",
  "Cirurgia Geral",
  "Cirurgia Oncológica",
  "Cirurgia Pediátrica",
  "Cirurgia Plástica",
  "Cirurgia Torácica",
  "Cirurgia Vascular",
  "Clínica Médica",
  "Coloproctologia",
  "Dermatologia",
  "Endocrinologia e Metabologia",
  "Endoscopia",
  "Gastroenterologia",
  "Genética Médica",
  "Geriatria",
  "Ginecologia e Obstetrícia",
  "Hematologia e Hemoterapia",
  "Homeopatia",
  "Infectologia",
  "Mastologia",
  "Medicina de Emergência",
  "Medicina de Família e Comunidade",
  "Medicina do Trabalho",
  "Medicina do Tráfego",
  "Medicina Esportiva",
  "Medicina Física e Reabilitação",
  "Medicina Intensiva",
  "Medicina Legal e Perícia Médica",
  "Medicina Nuclear",
  "Medicina Preventiva e Social",
  "Nefrologia",
  "Neurocirurgia",
  "Neurologia",
  "Nutrologia",
  "Oftalmologia",
  "Oncologia Clínica",
  "Ortopedia e Traumatologia",
  "Otorrinolaringologia",
  "Patologia",
  "Patologia Clínica/Medicina Laboratorial",
  "Pediatria",
  "Pneumologia",
  "Psiquiatria",
  "Radiologia e Diagnóstico por Imagem",
  "Radioterapia",
  "Reumatologia",
  "Urologia",
]

