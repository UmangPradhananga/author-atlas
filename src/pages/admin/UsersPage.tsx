import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Role } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { usersApi } from "@/api/apiService";
import { Pencil, Trash2, UserPlus, Filter, Search } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CreateAuthorRequest,
  CreateEditorRequest,
  CreateReviewerRequest,
  CreatePublisherRequest,
  CreateCopyEditorRequest,
} from "@/types/auth";

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredRole, setFilteredRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Reader");
  const [penName, setPenName] = useState(""); 
  const [genre, setGenre] = useState("");
  const [yearsOfService, setYearsOfService] = useState("");

  useEffect(() => {
    if (user && user.role !== "Admin") {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await usersApi.getAllUsers();
        
        // Map API response to match our User interface if needed
        const formattedUsers = fetchedUsers.map(user => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          // Ensure other optional fields are included if available
          ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
          ...(user.address && { address: user.address }),
          ...(user.dateOfBirth && { dateOfBirth: user.dateOfBirth }),
          // Role-specific fields
          ...(user.penName && { penName: user.penName }),
          ...(user.genre && { genre: user.genre }),
          ...(user.yearsOfService && { yearsOfService: user.yearsOfService }),
          ...(user.associatedPublication && { associatedPublication: user.associatedPublication }),
        }));
        
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    let result = [...users];
    
    if (filteredRole) {
      result = result.filter(user => user.role === filteredRole);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.fullName.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query) 
      );
    }
    
    result.sort((a, b) => {
      let fieldA, fieldB;
      
      switch (sortField) {
        case "name":
          fieldA = a.fullName.toLowerCase();
          fieldB = b.fullName.toLowerCase();
          break;
        case "email":
          fieldA = a.email.toLowerCase();
          fieldB = b.email.toLowerCase();
          break;
        case "role":
          fieldA = a.role;
          fieldB = b.role;
          break;
        default:
          fieldA = a.fullName.toLowerCase();
          fieldB = b.fullName.toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
      } else {
        return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
      }
    });
    
    setFilteredUsers(result);
  }, [users, filteredRole, searchQuery, sortField, sortDirection]);

  const handleCreateUser = async (role : Role) => {
    try {
      let newUser;
      let response;
      if (role === "Author") {
        const payload: CreateAuthorRequest = {
          fullName: name,
          emailAddress: email,
          password,
          penName,
          genere: genre,
          phoneNumber: "",
          address: "",
          categoryId: "",
          roleName: "Author",
          confirmPassword: password,
          dateOfBirth: new Date(),
        };
        response = await usersApi.createAuthor(payload);
        newUser = {
          id: response.data?.userId || email,
          name,
          email,
          role: "Author",
        };
      } else if (role === "Editor") {
        const payload: CreateEditorRequest = {
          fullName: name,
          emailAddress: email,
          password,
          yearsOfService: Number(yearsOfService) || 0,
          researchAreas: "",
          publications: [],
          awards: [],
          reviewedPapersCount: 0,
          orcid: "",
          phoneNumber: "",
          address: "",
          categoryId: "",
          roleName: "Editor",
          confirmPassword: password,
          dateOfBirth: new Date(),
        };
        response = await usersApi.createEditor(payload);
        newUser = {
          id: response.data?.userId || email,
          name,
          email,
          role: "Editor",
        };
      } else if (role === "Reviewer") {
        const payload: CreateReviewerRequest = {
          fullName: name,
          emailAddress: email,
          password,
          affiliation: "",
          expertise: "",
          bio: "",
          dateOfJoining: new Date(),
          status: "Active",
          phoneNumber: "",
          address: "",
          categoryId: "",
          roleName: "Reviewer",
          confirmPassword: password,
          dateOfBirth: new Date(),
        };
        response = await usersApi.createReviewer(payload);
        newUser = {
          id: response.data?.userId || email,
          name,
          email,
          role: "Reviewer",
        };
      } else if (role === "Publisher") {
        const payload: CreatePublisherRequest = {
          fullName: name,
          emailAddress: email,
          password,
          associatedPublication: "",
          yearsInService: Number(yearsOfService) || 0,
          phoneNumber: "",
          address: "",
          categoryId: "",
          roleName: "Publisher",
          confirmPassword: password,
          dateOfBirth: new Date(),
        };
        response = await usersApi.createPublisher(payload);
        newUser = {
          id: response.data?.userId || email,
          name,
          email,
          role: "Publisher",
        };
      } else {
        // Default to reader (or fallback)
        newUser = {
          id: email,
          name,
          email,
          role: "Reader",
        };
      }
      setUsers(prev => [...prev, newUser]);
      toast({
        title: "Success",
        description: `User ${name} created successfully`,
      });
      resetForm();
      setNewUserOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!currentUser) return;
    try {
      let updatedUser;
      let response;
      if (role === "Author") {
        response = await usersApi.updateAuthor({
          fullName: name,
          emailAddress: email,
          ...(password ? { password } : {}),
          penName,
          genere: genre,
          roleName: "Author",
        });
        updatedUser = { ...currentUser, name, email, role: "author" };
      } else if (role === "Editor") {
        response = await usersApi.updateEditor({
          fullName: name,
          emailAddress: email,
          ...(password ? { password } : {}),
          yearsOfService: Number(yearsOfService) || 0,
          roleName: "Editor",
        });
        updatedUser = { ...currentUser, name, email, role: "editor" };
      } else if (role === "Reviewer") {
        response = await usersApi.updateReviewer({
          fullName: name,
          emailAddress: email,
          ...(password ? { password } : {}),
          // Remove yearsOfService as it's not part of the CreateReviewerRequest type
          roleName: "Reviewer",
        });
        updatedUser = { ...currentUser, name, email, role: "reviewer" };
          } else if (role === "Publisher") {
        response = await usersApi.updatePublisher({
          fullName: name,
          emailAddress: email,
          ...(password ? { password } : {}),
          yearsInService: Number(yearsOfService) || 0,
          roleName: "Publisher",
        });
        updatedUser = { ...currentUser, name, email, role: "publisher" };
      } else {
        updatedUser = { ...currentUser, name, email, role: "reader" };
      }
      setUsers(prev => prev.map(u => u.userId === currentUser.userId ? updatedUser : u));
      toast({
        title: "Success",
        description: `User ${name} updated successfully`,
      });
      resetForm();
      setEditUserOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const userToDelete = users.find(u => u.userId === userId);
      if (!userToDelete) return;
      if (userToDelete.role === "Author") {
        await usersApi.deleteAuthor(userId);
      } else if (userToDelete.role === "Editor") {
        await usersApi.deleteEditor(userId);
      } else if (userToDelete.role === "Reviewer") {
        await usersApi.deleteReviewer(userId);
      } else if (userToDelete.role === "Publisher") {
        await usersApi.deletePublisher(userId);
      } else {
        // No delete for reader
      }
      setUsers(prev => prev.filter(u => u.userId !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setName(user.fullName);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setEditUserOpen(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("Reader");
    setCurrentUser(null);
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "Admin":
        return "bg-red-500";
      case "Editor":
        return "bg-blue-500";
      case "Reviewer":
        return "bg-amber-500";
      case "Author":
        return "bg-green-500";
      case "Reader":
      default:
        return "bg-slate-500";
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = Math.min(maxPagesToShow - 1, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2));
      }
      
      if (startPage > 2) {
        pageNumbers.push('ellipsis');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/admin/create-user")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create New User
          </Button>
          <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Quick Add User
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Total users: {filteredUsers.length}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Options</h4>
                    <div className="space-y-2">
                      <Label htmlFor="role-filter">Role</Label>
                      <Select 
                        value={filteredRole || "all"} 
                        onValueChange={(value) => setFilteredRole(value === "all" ? null : value)}
                      >
                        <SelectTrigger id="role-filter">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="author">Author</SelectItem>
                          <SelectItem value="reader">Reader</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="items-per-page">Items per page</Label>
                      <Select 
                        value={itemsPerPage.toString()} 
                        onValueChange={(value) => {
                          setItemsPerPage(parseInt(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger id="items-per-page">
                          <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                  Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead onClick={() => handleSort("role")} className="cursor-pointer">
                  Role {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getPaginatedData().map((userItem) => (
                <TableRow key={userItem.userId}>
                  <TableCell className="font-medium">{userItem.fullName}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(userItem.role)}>
                      {userItem.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(userItem)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteUser(userItem.userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {getPaginatedData().length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {filteredUsers.length > 0 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((pageNum, index) => (
                    <PaginationItem key={index}>
                      {pageNum === 'ellipsis' ? (
                        <span className="flex h-9 w-9 items-center justify-center">...</span>
                      ) : (
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
