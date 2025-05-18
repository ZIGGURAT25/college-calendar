"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

import { Sidebar } from "@/components/layout/app-sidebar"
import { AdminAuthDialog } from "@/components/admin/admin-auth-dialog"

interface MainLayoutProps {
  children: React.ReactNode
  isAdmin?: boolean
}

export function MainLayout({ children, isAdmin: initialIsAdmin = false }: MainLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [userRole, setUserRole] = useState<"student" | "admin">(initialIsAdmin ? "admin" : "student")
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const toggleUserRole = () => {
    setUserRole(userRole === "student" ? "admin" : "student")
  }

  const handleOpenAdminAuth = () => {
    setIsAuthDialogOpen(true)
  }

  const handleAdminAuthSuccess = () => {
    setUserRole("admin")
    setIsAuthDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={userRole} onToggleView={toggleUserRole} onOpenAdminAuth={handleOpenAdminAuth} />

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto space-y-6">{children}</div>
      </main>

      {/* Admin Authentication Dialog */}
      <AdminAuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />
    </div>
  )
}
