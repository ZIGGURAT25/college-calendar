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
  type AdminStudent,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  departments,
  isValidRegisterNo,
  isValidEmail,
} from "@/lib/admin-data";

const EMPTY_STUDENT: Omit<AdminStudent, "id"> = {
  registerNo: "",
  fullName: "",
  department: "Computer Science",
  year: 1,
  email: "",
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Omit<AdminStudent, "id">>(EMPTY_STUDENT);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AdminStudent, string>>>({});

  // Load students on mount
  useEffect(() => {
    setStudents(getAllStudents());
  }, []);

  // Effect to reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setCurrentStudent(EMPTY_STUDENT);
      setIsEditMode(false);
      setFormErrors({});
    }
  }, [isDialogOpen]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AdminStudent, string>> = {};

    if (!currentStudent.registerNo) {
      errors.registerNo = "Register number is required";
    } else if (!isValidRegisterNo(currentStudent.registerNo)) {
      errors.registerNo = "Invalid register number format (9 digits required)";
    }

    if (!currentStudent.fullName) {
      errors.fullName = "Name is required";
    }

    if (!currentStudent.email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(currentStudent.email)) {
      errors.email = "Invalid email format";
    }

    if (!currentStudent.department) {
      errors.department = "Department is required";
    }

    if (!currentStudent.year || currentStudent.year < 1 || currentStudent.year > 5) {
      errors.year = "Year must be between 1 and 5";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStudent = () => {
    setIsEditMode(false);
    setCurrentStudent(EMPTY_STUDENT);
    setIsDialogOpen(true);
  };

  const handleEditStudent = (student: AdminStudent) => {
    setIsEditMode(true);
    setCurrentStudent({
      registerNo: student.registerNo,
      fullName: student.fullName,
      department: student.department,
      year: student.year,
      email: student.email,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = async (student: AdminStudent) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const success = deleteStudent(student.id);
      if (success) {
        setStudents(getAllStudents());
        toast({
          title: "Student Deleted",
          description: `${student.fullName} has been removed.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete student.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormChange = (
    name: keyof typeof currentStudent,
    value: string | number
  ) => {
    setCurrentStudent((prev) => ({
      ...prev,
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        const updatedStudent = updateStudent(
          (students.find(s => s.registerNo === currentStudent.registerNo)?.id || 0),
          currentStudent
        );
        if (updatedStudent) {
          setStudents(getAllStudents());
          toast({
            title: "Success",
            description: "Student updated successfully.",
          });
        }
      } else {
        const newStudent = addStudent(currentStudent);
        setStudents(getAllStudents());
        toast({
          title: "Success",
          description: "New student added successfully.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save student.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout isAdmin={true}>
      <div className="space-y-2 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
          <p className="text-muted-foreground">
            Add, edit, view, and delete student records.
          </p>
        </div>
        <Button onClick={handleAddStudent}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reg. No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.registerNo}</TableCell>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{student.email}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteStudent(student)}
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
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {students.length > 0 ? (
              students.map((student) => (
                <Card key={student.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{student.fullName}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteStudent(student)}
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
                      <dt className="font-medium">Reg. No.</dt>
                      <dd>{student.registerNo}</dd>
                      <dt className="font-medium">Department</dt>
                      <dd>{student.department}</dd>
                      <dt className="font-medium">Year</dt>
                      <dd>{student.year}</dd>
                      <dt className="font-medium">Email</dt>
                      <dd className="truncate">{student.email}</dd>
                    </dl>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center h-24 flex items-center justify-center text-muted-foreground">
                  No students found.
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the student's details."
                : "Fill in the details for the new student."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="registerNo" className="text-right">
                  Reg. Number
                </Label>
                <div className="col-span-3">
                  <Input
                    id="registerNo"
                    value={currentStudent.registerNo}
                    onChange={(e) => handleFormChange("registerNo", e.target.value)}
                    className={formErrors.registerNo ? "border-red-500" : ""}
                    disabled={isEditMode}
                  />
                  {formErrors.registerNo && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.registerNo}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="fullName"
                    value={currentStudent.fullName}
                    onChange={(e) => handleFormChange("fullName", e.target.value)}
                    className={formErrors.fullName ? "border-red-500" : ""}
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentStudent.department}
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
                <Label htmlFor="year" className="text-right">
                  Year
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentStudent.year.toString()}
                    onValueChange={(value) => handleFormChange("year", parseInt(value))}
                  >
                    <SelectTrigger className={formErrors.year ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.year && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.year}</p>
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
                    value={currentStudent.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? "Save Changes" : "Add Student"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 