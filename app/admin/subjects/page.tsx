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
  type AdminSubject,
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  departments,
  isValidSubjectCode,
  getAllFaculty,
  type AdminFaculty,
} from "@/lib/admin-data";

const EMPTY_SUBJECT: Omit<AdminSubject, "id"> = {
  subjectCode: "",
  subjectName: "",
  facultyId: 0,
  type: "Theory",
  credits: 3,
  semester: 1,
  department: "Computer Science",
};

const subjectTypes = ["Theory", "Lab", "Elective", "Combined"] as const;
const semesters = Array.from({ length: 8 }, (_, i) => i + 1);
const creditOptions = [1, 2, 3, 4];

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [faculty, setFaculty] = useState<AdminFaculty[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Omit<AdminSubject, "id">>(EMPTY_SUBJECT);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AdminSubject, string>>>({});

  // Load subjects and faculty on mount
  useEffect(() => {
    setSubjects(getAllSubjects());
    setFaculty(getAllFaculty());
  }, []);

  // Effect to reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setCurrentSubject(EMPTY_SUBJECT);
      setIsEditMode(false);
      setFormErrors({});
    }
  }, [isDialogOpen]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AdminSubject, string>> = {};

    if (!currentSubject.subjectCode) {
      errors.subjectCode = "Subject code is required";
    } else if (!isValidSubjectCode(currentSubject.subjectCode)) {
      errors.subjectCode = "Invalid subject code format (e.g., CS101)";
    }

    if (!currentSubject.subjectName) {
      errors.subjectName = "Subject name is required";
    }

    if (!currentSubject.facultyId) {
      errors.facultyId = "Faculty is required";
    }

    if (!currentSubject.type) {
      errors.type = "Subject type is required";
    }

    if (!currentSubject.department) {
      errors.department = "Department is required";
    }

    if (!currentSubject.semester || currentSubject.semester < 1 || currentSubject.semester > 8) {
      errors.semester = "Semester must be between 1 and 8";
    }

    if (!currentSubject.credits || currentSubject.credits < 1 || currentSubject.credits > 4) {
      errors.credits = "Credits must be between 1 and 4";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubject = () => {
    setIsEditMode(false);
    setCurrentSubject(EMPTY_SUBJECT);
    setIsDialogOpen(true);
  };

  const handleEditSubject = (subject: AdminSubject) => {
    setIsEditMode(true);
    setCurrentSubject({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      facultyId: subject.facultyId,
      type: subject.type,
      credits: subject.credits,
      semester: subject.semester,
      department: subject.department,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSubject = async (subject: AdminSubject) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      const success = deleteSubject(subject.id);
      if (success) {
        setSubjects(getAllSubjects());
        toast({
          title: "Subject Deleted",
          description: `${subject.subjectName} has been removed.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete subject.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormChange = (
    name: keyof typeof currentSubject,
    value: string | number
  ) => {
    setCurrentSubject((prev) => ({
      ...prev,
      [name]: ["facultyId", "semester", "credits"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        const updatedSubject = updateSubject(
          (subjects.find(s => s.subjectCode === currentSubject.subjectCode)?.id || 0),
          currentSubject
        );
        if (updatedSubject) {
          setSubjects(getAllSubjects());
          toast({
            title: "Success",
            description: "Subject updated successfully.",
          });
        }
      } else {
        const newSubject = addSubject(currentSubject);
        setSubjects(getAllSubjects());
        toast({
          title: "Success",
          description: "New subject added successfully.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save subject.",
        variant: "destructive",
      });
    }
  };

  const getFacultyName = (facultyId: number) => {
    return faculty.find(f => f.id === facultyId)?.name || "Unknown";
  };

  return (
    <MainLayout isAdmin={true}>
      <div className="space-y-2 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subjects</h1>
          <p className="text-muted-foreground">
            Add, edit, view, and delete subject records.
          </p>
        </div>
        <Button onClick={handleAddSubject}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.subjectCode}</TableCell>
                      <TableCell className="font-medium">{subject.subjectName}</TableCell>
                      <TableCell>{subject.type}</TableCell>
                      <TableCell>{getFacultyName(subject.facultyId)}</TableCell>
                      <TableCell>{subject.department}</TableCell>
                      <TableCell>{subject.semester}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteSubject(subject)}
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
                    <TableCell colSpan={8} className="text-center h-24">
                      No subjects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{subject.subjectCode}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSubject(subject)}
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
                      <dt className="font-medium">Type</dt>
                      <dd>{subject.type}</dd>
                      <dt className="font-medium">Faculty</dt>
                      <dd>{getFacultyName(subject.facultyId)}</dd>
                      <dt className="font-medium">Department</dt>
                      <dd>{subject.department}</dd>
                      <dt className="font-medium">Semester</dt>
                      <dd>{subject.semester}</dd>
                      <dt className="font-medium">Credits</dt>
                      <dd>{subject.credits}</dd>
                    </dl>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center h-24 flex items-center justify-center text-muted-foreground">
                  No subjects found.
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
              {isEditMode ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the subject's details."
                : "Fill in the details for the new subject."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subjectCode" className="text-right">
                  Code
                </Label>
                <div className="col-span-3">
                  <Input
                    id="subjectCode"
                    value={currentSubject.subjectCode}
                    onChange={(e) => handleFormChange("subjectCode", e.target.value)}
                    className={formErrors.subjectCode ? "border-red-500" : ""}
                    disabled={isEditMode}
                    placeholder="CS101"
                  />
                  {formErrors.subjectCode && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.subjectCode}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subjectName" className="text-right">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="subjectName"
                    value={currentSubject.subjectName}
                    onChange={(e) => handleFormChange("subjectName", e.target.value)}
                    className={formErrors.subjectName ? "border-red-500" : ""}
                  />
                  {formErrors.subjectName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.subjectName}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentSubject.type}
                    onValueChange={(value) => handleFormChange("type", value)}
                  >
                    <SelectTrigger className={formErrors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.type && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="facultyId" className="text-right">
                  Faculty
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentSubject.facultyId.toString()}
                    onValueChange={(value) => handleFormChange("facultyId", parseInt(value))}
                  >
                    <SelectTrigger className={formErrors.facultyId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.facultyId && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.facultyId}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentSubject.department}
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
                <Label htmlFor="semester" className="text-right">
                  Semester
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentSubject.semester.toString()}
                    onValueChange={(value) => handleFormChange("semester", parseInt(value))}
                  >
                    <SelectTrigger className={formErrors.semester ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.semester && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.semester}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">
                  Credits
                </Label>
                <div className="col-span-3">
                  <Select
                    value={currentSubject.credits.toString()}
                    onValueChange={(value) => handleFormChange("credits", parseInt(value))}
                  >
                    <SelectTrigger className={formErrors.credits ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select credits" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditOptions.map((credit) => (
                        <SelectItem key={credit} value={credit.toString()}>
                          {credit} {credit === 1 ? "Credit" : "Credits"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.credits && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.credits}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Save Changes" : "Add Subject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 