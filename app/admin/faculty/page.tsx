"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  type AdminFaculty,
  getAllFaculty,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  departments,
  designations,
  isValidEmail,
  isValidPhone,
} from "@/lib/admin-data";

const EMPTY_FACULTY: Omit<AdminFaculty, "id"> = {
  name: "",
  email: "",
  department: "Computer Science",
  designation: "Assistant Professor",
  phone: "",
};

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<AdminFaculty[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState<Omit<AdminFaculty, "id">>(EMPTY_FACULTY);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AdminFaculty, string>>>({});

  // Load faculty on mount
  useEffect(() => {
    setFaculty(getAllFaculty());
  }, []);

  // Effect to reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setCurrentFaculty(EMPTY_FACULTY);
      setIsEditMode(false);
      setFormErrors({});
    }
  }, [isDialogOpen]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AdminFaculty, string>> = {};

    if (!currentFaculty.name) {
      errors.name = "Name is required";
    }

    if (!currentFaculty.email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(currentFaculty.email)) {
      errors.email = "Invalid email format";
    }

    if (!currentFaculty.phone) {
      errors.phone = "Phone number is required";
    } else if (!isValidPhone(currentFaculty.phone)) {
      errors.phone = "Invalid phone number format";
    }

    if (!currentFaculty.department) {
      errors.department = "Department is required";
    }

    if (!currentFaculty.designation) {
      errors.designation = "Designation is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddFaculty = () => {
    setIsEditMode(false);
    setCurrentFaculty(EMPTY_FACULTY);
    setIsDialogOpen(true);
  };

  const handleEditFaculty = (faculty: AdminFaculty) => {
    setIsEditMode(true);
    setCurrentFaculty({
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
      designation: faculty.designation,
      phone: faculty.phone,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFaculty = async (faculty: AdminFaculty) => {
    if (window.confirm("Are you sure you want to delete this faculty member?")) {
      const success = deleteFaculty(faculty.id);
      if (success) {
        setFaculty(getAllFaculty());
        toast({
          title: "Faculty Deleted",
          description: `${faculty.name} has been removed.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete faculty member.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormChange = (
    name: keyof typeof currentFaculty,
    value: string
  ) => {
    setCurrentFaculty((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        const updatedFaculty = updateFaculty(
          (faculty.find(f => f.email === currentFaculty.email)?.id || 0),
          currentFaculty
        );
        if (updatedFaculty) {
          setFaculty(getAllFaculty());
          toast({
            title: "Success",
            description: "Faculty member updated successfully.",
          });
        }
      } else {
        const newFaculty = addFaculty(currentFaculty);
        setFaculty(getAllFaculty());
        toast({
          title: "Success",
          description: "New faculty member added successfully.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save faculty member.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout isAdmin={true}>
      <div className="space-y-2 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Faculty</h1>
          <p className="text-muted-foreground">
            Add, edit, view, and delete faculty records.
          </p>
        </div>
        <Button onClick={handleAddFaculty}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.length > 0 ? (
                  faculty.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.department}</TableCell>
                      <TableCell>{f.designation}</TableCell>
                      <TableCell>{f.email}</TableCell>
                      <TableCell>{f.phone}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditFaculty(f)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteFaculty(f)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No faculty found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {faculty.length > 0 ? (
              faculty.map((f) => (
                <Card key={f.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{f.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditFaculty(f)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFaculty(f)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-1 text-sm">
                      <dt className="font-medium">Department</dt>
                      <dd>{f.department}</dd>
                      <dt className="font-medium">Designation</dt>
                      <dd>{f.designation}</dd>
                      <dt className="font-medium">Email</dt>
                      <dd className="truncate">{f.email}</dd>
                      <dt className="font-medium">Phone</dt>
                      <dd>{f.phone}</dd>
                    </dl>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center h-24 flex items-center justify-center text-muted-foreground">
                  No faculty found.
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Faculty Member" : "Add New Faculty Member"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the faculty member's details."
                : "Fill in the details for the new faculty member."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={currentFaculty.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentFaculty.department}
                    onValueChange={(value) => handleFormChange("department", value)}
                  >
                    <SelectTrigger className={formErrors.department ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.department && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.department}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="designation" className="text-right">
                  Designation
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentFaculty.designation}
                    onValueChange={(value) => handleFormChange("designation", value)}
                  >
                    <SelectTrigger className={formErrors.designation ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.designation && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.designation}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    type="email"
                    value={currentFaculty.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className={formErrors.email ? "border-red-500" : ""}
                    disabled={isEditMode}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <div className="col-span-3">
                  <Input
                    id="phone"
                    type="tel"
                    value={currentFaculty.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className={formErrors.phone ? "border-red-500" : ""}
                    placeholder="+1234567890"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Save Changes" : "Add Faculty"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 