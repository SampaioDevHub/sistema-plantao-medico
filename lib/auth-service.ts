import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase"

export type UserType = "doctor" | "hospital"

export interface UserData {
  uid: string
  email: string
  name: string
  userType: UserType
  createdAt: Date
  updatedAt: Date
  crm?: string // Opcional para médicos
  cnpj?: string // Opcional para empresas
}

// Register a new user
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  userType: UserType,
  additionalData: { crm?: string; cnpj?: string } = {} // Dados adicionais opcionais
): Promise<UserData> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with name
    await updateProfile(user, { displayName: name })

    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email || email,
      name,
      userType,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(additionalData.crm && { crm: additionalData.crm }), // Adiciona CRM se presente
      ...(additionalData.cnpj && { cnpj: additionalData.cnpj }), // Adiciona CNPJ se presente
    }

    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return userData
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Login user
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error logging in:", error)
    throw error
  }
}

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error logging out:", error)
    throw error
  }
}

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}

// Get current user data from Firestore
export const getCurrentUserData = async (): Promise<UserData | null> => {
  try {
    const user = auth.currentUser
    if (!user) return null

    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }

    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}