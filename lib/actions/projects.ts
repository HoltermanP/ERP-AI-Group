"use server"

import { db } from "@/lib/db"
import {
  projects,
  projectEmployees,
  projectHours,
  projectCosts,
  projectRevenue,
  type NewProject,
  type NewProjectEmployee,
  type NewProjectHour,
  type NewProjectCost,
  type NewProjectRevenue,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateProjectNumber } from "@/lib/utils/numbering"

export async function getProjects() {
  try {
    return await db.query.projects.findMany({
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      with: { customer: true },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    throw new Error("Kon projecten niet ophalen")
  }
}

export async function getProject(id: number) {
  try {
    return await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        customer: true,
        projectEmployees: {
          with: { employee: true },
          orderBy: (pe, { asc }) => [asc(pe.addedAt)],
        },
        hours: {
          with: { employee: true },
          orderBy: (h, { desc }) => [desc(h.date)],
        },
        costs: {
          orderBy: (c, { desc }) => [desc(c.date)],
        },
        revenue: {
          orderBy: (r, { desc }) => [desc(r.date)],
        },
      },
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    throw new Error("Kon project niet ophalen")
  }
}

export async function getProjectsByCustomer(customerId: number) {
  try {
    return await db.query.projects.findMany({
      where: eq(projects.customerId, customerId),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    })
  } catch (error) {
    console.error("Error fetching projects by customer:", error)
    throw new Error("Kon projecten niet ophalen")
  }
}

export async function createProject(data: Omit<NewProject, "projectNumber">) {
  try {
    const projectNumber = await generateProjectNumber()
    const result = await db.insert(projects).values({ ...data, projectNumber }).returning()
    revalidatePath("/projects")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating project:", error)
    return { success: false, error: "Kon project niet aanmaken" }
  }
}

export async function updateProject(id: number, data: Partial<NewProject>) {
  try {
    const result = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()
    revalidatePath("/projects")
    revalidatePath(`/projects/${id}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating project:", error)
    return { success: false, error: "Kon project niet bijwerken" }
  }
}

export async function deleteProject(id: number) {
  try {
    await db.delete(projects).where(eq(projects.id, id))
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("Error deleting project:", error)
    return { success: false, error: "Kon project niet verwijderen" }
  }
}

// --- Project employees ---

export async function addProjectEmployee(data: NewProjectEmployee) {
  try {
    const result = await db.insert(projectEmployees).values(data).returning()
    revalidatePath(`/projects/${data.projectId}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error adding project employee:", error)
    return { success: false, error: "Kon medewerker niet toevoegen aan project" }
  }
}

export async function removeProjectEmployee(id: number, projectId: number) {
  try {
    await db.delete(projectEmployees).where(eq(projectEmployees.id, id))
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing project employee:", error)
    return { success: false, error: "Kon medewerker niet verwijderen van project" }
  }
}

// --- Hours ---

export async function addProjectHour(data: NewProjectHour) {
  try {
    const result = await db.insert(projectHours).values(data).returning()
    revalidatePath(`/projects/${data.projectId}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error adding project hour:", error)
    return { success: false, error: "Kon uren niet registreren" }
  }
}

export async function addProjectHoursBulk(projectId: number, entries: Omit<NewProjectHour, "projectId">[]) {
  try {
    const rows = entries.filter((e) => parseFloat(String(e.hours)) > 0)
    if (rows.length === 0) return { success: true, data: [] }
    const result = await db
      .insert(projectHours)
      .values(rows.map((e) => ({ ...e, projectId })))
      .returning()
    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error bulk adding project hours:", error)
    return { success: false, error: "Kon uren niet registreren" }
  }
}

export async function updateProjectHour(id: number, projectId: number, data: Partial<NewProjectHour>) {
  try {
    const result = await db.update(projectHours).set(data).where(eq(projectHours.id, id)).returning()
    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating project hour:", error)
    return { success: false, error: "Kon urenregel niet bijwerken" }
  }
}

export async function deleteProjectHour(id: number, projectId: number) {
  try {
    await db.delete(projectHours).where(eq(projectHours.id, id))
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting project hour:", error)
    return { success: false, error: "Kon urenregel niet verwijderen" }
  }
}

// --- Costs ---

export async function addProjectCost(data: NewProjectCost) {
  try {
    const result = await db.insert(projectCosts).values(data).returning()
    revalidatePath(`/projects/${data.projectId}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error adding project cost:", error)
    return { success: false, error: "Kon kosten niet registreren" }
  }
}

export async function updateProjectCost(id: number, projectId: number, data: Partial<NewProjectCost>) {
  try {
    const result = await db.update(projectCosts).set(data).where(eq(projectCosts.id, id)).returning()
    revalidatePath(`/projects/${projectId}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating project cost:", error)
    return { success: false, error: "Kon kostenregel niet bijwerken" }
  }
}

export async function deleteProjectCost(id: number, projectId: number) {
  try {
    await db.delete(projectCosts).where(eq(projectCosts.id, id))
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting project cost:", error)
    return { success: false, error: "Kon kostenregel niet verwijderen" }
  }
}

// --- Revenue ---

export async function addProjectRevenue(data: NewProjectRevenue) {
  try {
    const result = await db.insert(projectRevenue).values(data).returning()
    revalidatePath(`/projects/${data.projectId}`)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error adding project revenue:", error)
    return { success: false, error: "Kon omzet niet registreren" }
  }
}

export async function deleteProjectRevenue(id: number, projectId: number) {
  try {
    await db.delete(projectRevenue).where(eq(projectRevenue.id, id))
    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting project revenue:", error)
    return { success: false, error: "Kon omzetregel niet verwijderen" }
  }
}
