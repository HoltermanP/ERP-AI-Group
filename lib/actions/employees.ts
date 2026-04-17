"use server"

import { db } from "@/lib/db"
import { employees, type NewEmployee } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getEmployees() {
  try {
    return await db.query.employees.findMany({
      orderBy: (e, { asc }) => [asc(e.name)],
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    throw new Error("Kon medewerkers niet ophalen")
  }
}

export async function getEmployee(id: number) {
  try {
    return await db.query.employees.findFirst({
      where: eq(employees.id, id),
    })
  } catch (error) {
    console.error("Error fetching employee:", error)
    throw new Error("Kon medewerker niet ophalen")
  }
}

export async function createEmployee(data: NewEmployee) {
  try {
    const result = await db.insert(employees).values(data).returning()
    revalidatePath("/employees")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating employee:", error)
    return { success: false, error: "Kon medewerker niet aanmaken" }
  }
}

export async function updateEmployee(id: number, data: Partial<NewEmployee>) {
  try {
    const result = await db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning()
    revalidatePath("/employees")
    revalidatePath(`/employees/${id}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating employee:", error)
    return { success: false, error: "Kon medewerker niet bijwerken" }
  }
}

export async function deleteEmployee(id: number) {
  try {
    await db.delete(employees).where(eq(employees.id, id))
    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    console.error("Error deleting employee:", error)
    return { success: false, error: "Kon medewerker niet verwijderen" }
  }
}
