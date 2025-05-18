"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
  Settings,
  Users,
  UserCircle,
  ShieldCheck,
  Menu,
  X,
  BookOpen,
  GraduationCap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SidebarProps = {
  userRole: "student" | "admin"
  onToggleView: () => void
  onOpenAdminAuth: () => void
}

export function Sidebar({ userRole, onToggleView, onOpenAdminAuth }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isManagementOpen, setIsManagementOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const toggleManagement = () => {
    setIsManagementOpen(!isManagementOpen)
  }

  const handleViewToggle = () => {
    if (userRole === "student") {
      // If currently in student view, open admin auth dialog
      onOpenAdminAuth()
    } else {
      // If currently in admin view, switch directly to student view
      onToggleView()
    }
    closeSidebar()
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-primary">College Calendar</h2>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close Menu</span>
          </Button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* Admin View Navigation */}
          {userRole === "admin" && (
            <>
              <div className="space-y-1">
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/admin/dashboard") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>

                <div className="space-y-1">
                  <button
                    className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-secondary"
                    onClick={toggleManagement}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      <span>Management</span>
                    </div>
                    {isManagementOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {isManagementOpen && (
                    <div className="pl-8 space-y-1">
                      <Link
                        href="/admin/subjects"
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                          isActive("/admin/subjects") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                        )}
                        onClick={closeSidebar}
                      >
                        Subjects
                      </Link>
                      <Link
                        href="/admin/faculty"
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                          isActive("/admin/faculty") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                        )}
                        onClick={closeSidebar}
                      >
                        Faculty
                      </Link>
                      <Link
                        href="/admin/students"
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                          isActive("/admin/students") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                        )}
                        onClick={closeSidebar}
                      >
                        Students
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/timetable"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/admin/timetable") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Timetable Editor
                </Link>

                <Link
                  href="/admin/exams"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/admin/exams") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Exam Editor
                </Link>

                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/admin/settings") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Link>
              </div>
            </>
          )}

          {/* Student View Navigation */}
          {userRole === "student" && (
            <>
              <div className="space-y-1">
                <Link
                  href="/"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Home
                </Link>

                <Link
                  href="/timetable"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/timetable") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Timetable
                </Link>

                <Link
                  href="/exams"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/exams") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Exam Schedule
                </Link>

                <Link
                  href="/subjects"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive("/subjects") ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                  onClick={closeSidebar}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Subjects
                </Link>
              </div>
            </>
          )}

          {/* View switcher - always visible */}
          <div className="pt-4 border-t">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Switch View</h3>
            <div className="mt-2 space-y-1">
              <Button
                variant={userRole === "student" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={userRole === "admin" ? handleViewToggle : undefined}
                disabled={userRole === "student"}
              >
                <UserCircle className="mr-2 h-5 w-5" />
                Student View
              </Button>
              <Button
                variant={userRole === "admin" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={userRole === "student" ? handleViewToggle : undefined}
                disabled={userRole === "admin"}
              >
                <ShieldCheck className="mr-2 h-5 w-5" />
                Admin View
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={closeSidebar} />}
    </>
  )
}
