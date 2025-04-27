import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { usersApi } from "@/api/apiService";
import { 
  CreateAuthorRequest,
  CreateEditorRequest,
  CreateReviewerRequest,
  CreatePublisherRequest,
  CreateCopyEditorRequest,
  UpdateAuthorRequest,
  UpdateEditorRequest,
} from "@/types/auth";
import { ChevronLeft } from "lucide-react";
import { User } from "@/types";

const CreateUserPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [existingUser, setExistingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Common fields
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);

  // Author fields
  const [penName, setPenName] = useState("");
  const [genre, setGenre] = useState("");

  // Editor fields
  const [yearsOfService, setYearsOfService] = useState<number>(0);
  const [researchAreas, setResearchAreas] = useState("");
  const [publications, setPublications] = useState<string[]>([]);
  const [awards, setAwards] = useState<string[]>([]);
  const [reviewedPapersCount, setReviewedPapersCount] = useState<number>(0);
  const [orcid, setOrcid] = useState("");

  // Reviewer fields
  const [affiliation, setAffiliation] = useState("");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState("Active");

  // Publisher fields
  const [associatedPublication, setAssociatedPublication] = useState("");
  const [yearsInService, setYearsInService] = useState<number>(0);

  // CopyEditor fields
  const [copyEditorPublication, setCopyEditorPublication] = useState("");
  const [copyEditorYearsInService, setCopyEditorYearsInService] = useState<number>(0);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("author");

  // Check if admin and fetch user data if in edit mode
  useEffect(() => {
    if (user?.role !== "Admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (id) {
      setIsEditMode(true);
      fetchUserDetails(id);
    }
  }, [user, navigate, id]);

  // Fetch user details when in edit mode
  const fetchUserDetails = async (userId: string) => {
    setIsLoading(true);
    try {
      const userData = await usersApi.getUserById(userId);
      
      if (userData) {
        // Store the full user object
        setExistingUser(userData);
        
        // Populate the form with data
        populateFormWithUserData(userData);
        
        // Set the current tab based on user role (lowercase for tab value)
        setCurrentTab(userData.role.toLowerCase());
      } else {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "Failed to load user details. Please try again.",
        variant: "destructive",
      });
      navigate("/admin/users");
    } finally {
      setIsLoading(false);
    }
  };

  // Populate form fields with user data
  const populateFormWithUserData = (userData: User) => {
    // Common fields
    setFullName(userData.fullName);
    setEmailAddress(userData.email);
    setPhoneNumber(userData.phoneNumber || "");
    setAddress(userData.address || "");
    
    // Set role-specific fields based on the user's role
    if (userData.role === "Author") {
      setPenName(userData.penName || "");
      setGenre(userData.genre || "");
    } else if (userData.role === "Editor") {
      setYearsOfService(userData.yearsOfService || 0);
      setResearchAreas(userData.researchAreas || "");
      setReviewedPapersCount(userData.reviewedPapersCount || 0);
      setOrcid(userData.orcid || "");
      // Set publications and awards if available
      if (userData.publications) setPublications(userData.publications);
      if (userData.awards) setAwards(userData.awards);
    } else if (userData.role === "Reviewer") {
      setAffiliation(userData.affiliation || "");
      setExpertise(userData.expertise || "");
      setBio(userData.bio || "");
      setStatus(userData.status || "Active");
      if (userData.dateOfJoining) setDateOfJoining(new Date(userData.dateOfJoining));
    } else if (userData.role === "Publisher") {
      setAssociatedPublication(userData.associatedPublication || "");
      setYearsInService(userData.yearsInService || 0);
    } else if (userData.role === "CopyEditor") {
      setCopyEditorPublication(userData.associatedPublication || "");
      setCopyEditorYearsInService(userData.yearsInService || 0);
    }

    // Set date of birth if available
    if (userData.dateOfBirth) setDateOfBirth(new Date(userData.dateOfBirth));
  };

  // Field validation
  const validateCommonFields = () => {
    if (!fullName.trim()) return "Full name is required";
    if (!emailAddress.trim()) return "Email address is required";
    if (!isEditMode && !password.trim()) return "Password is required";
    if (!isEditMode && password !== confirmPassword) return "Passwords don't match";
    return null;
  };

  const handleCreateAuthor = async () => {
    const validationError = validateCommonFields();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (isEditMode && existingUser) {
        // Use update method for existing user
        const payload: Partial<CreateAuthorRequest> = {
          fullName,
          emailAddress,
          penName,
          genere: genre,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Author",
          dateOfBirth: dateOfBirth || new Date(),
          // Only include password fields if they are provided
          ...(password ? { password, confirmPassword } : {}),
          // Include the user ID for update
          userId: existingUser.userId
        };
        
        response = await usersApi.updateAuthor(payload);
        toast({
          title: "Success",
          description: "Author updated successfully",
        });
      } else {
        // Use create method for new user
        const payload: CreateAuthorRequest = {
          fullName,
          emailAddress,
          password,
          confirmPassword,
          penName,
          genere: genre,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Author",
          dateOfBirth: dateOfBirth || new Date(),
        };
        
        response = await usersApi.createAuthor(payload);
        toast({
          title: "Success",
          description: "Author created successfully",
        });
      }
      
      navigate("/admin/users");
    } catch (error) {
      console.error("Error creating/updating author:", error);
      toast({
        title: "Error",
        description: "Failed to save author",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEditor = async () => {
    const validationError = validateCommonFields();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (isEditMode && existingUser) {
        // Use update method for existing user
        const payload: Partial<CreateEditorRequest> = {
          fullName,
          emailAddress,
          yearsOfService,
          researchAreas,
          publications,
          awards,
          reviewedPapersCount,
          orcid,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Editor",
          dateOfBirth: dateOfBirth || new Date(),
          // Only include password fields if they are provided
          ...(password ? { password, confirmPassword } : {}),
          // Include the user ID for update
          userId: existingUser.userId
        };
        
        response = await usersApi.updateEditor(payload);
        toast({
          title: "Success",
          description: "Editor updated successfully",
        });
      } else {
        // Use create method for new user
        const payload: CreateEditorRequest = {
          fullName,
          emailAddress,
          password,
          confirmPassword,
          yearsOfService,
          researchAreas,
          publications,
          awards,
          reviewedPapersCount,
          orcid,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Editor",
          dateOfBirth: dateOfBirth || new Date(),
        };
        
        response = await usersApi.createEditor(payload);
        toast({
          title: "Success",
          description: "Editor created successfully",
        });
      }
      
      navigate("/admin/users");
    } catch (error) {
      console.error("Error creating/updating editor:", error);
      toast({
        title: "Error",
        description: "Failed to save editor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReviewer = async () => {
    const validationError = validateCommonFields();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (isEditMode && existingUser) {
        // Use update method for existing user
        const payload: Partial<CreateReviewerRequest> = {
          fullName,
          emailAddress,
          affiliation,
          expertise,
          bio,
          dateOfJoining: dateOfJoining || new Date(),
          status,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Reviewer",
          dateOfBirth: dateOfBirth || new Date(),
          // Only include password fields if they are provided
          ...(password ? { password, confirmPassword } : {}),
          // Include the user ID for update
          userId: existingUser.userId
        };
        
        response = await usersApi.updateReviewer(payload);
        toast({
          title: "Success",
          description: "Reviewer updated successfully",
        });
      } else {
        // Use create method for new user
        const payload: CreateReviewerRequest = {
          fullName,
          emailAddress,
          password,
          confirmPassword,
          affiliation,
          expertise,
          bio,
          dateOfJoining: dateOfJoining || new Date(),
          status,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Reviewer",
          dateOfBirth: dateOfBirth || new Date(),
        };
        
        response = await usersApi.createReviewer(payload);
        toast({
          title: "Success",
          description: "Reviewer created successfully",
        });
      }
      
      navigate("/admin/users");
    } catch (error) {
      console.error("Error creating/updating reviewer:", error);
      toast({
        title: "Error",
        description: "Failed to save reviewer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePublisher = async () => {
    const validationError = validateCommonFields();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (isEditMode && existingUser) {
        // Use update method for existing user
        const payload: Partial<CreatePublisherRequest> = {
          fullName,
          emailAddress,
          associatedPublication,
          yearsInService,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Publisher",
          dateOfBirth: dateOfBirth || new Date(),
          // Only include password fields if they are provided
          ...(password ? { password, confirmPassword } : {}),
          // Include the user ID for update
          userId: existingUser.userId
        };
        
        response = await usersApi.updatePublisher(payload);
        toast({
          title: "Success",
          description: "Publisher updated successfully",
        });
      } else {
        // Use create method for new user
        const payload: CreatePublisherRequest = {
          fullName,
          emailAddress,
          password,
          confirmPassword,
          associatedPublication,
          yearsInService,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "Publisher",
          dateOfBirth: dateOfBirth || new Date(),
        };
        
        response = await usersApi.createPublisher(payload);
        toast({
          title: "Success",
          description: "Publisher created successfully",
        });
      }
      
      navigate("/admin/users");
    } catch (error) {
      console.error("Error creating/updating publisher:", error);
      toast({
        title: "Error",
        description: "Failed to save publisher",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCopyEditor = async () => {
    const validationError = validateCommonFields();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (isEditMode && existingUser) {
        // Use update method for existing user
        const payload: Partial<CreateCopyEditorRequest> = {
          fullName,
          emailAddress,
          associatedPublication: copyEditorPublication,
          yearsInService: copyEditorYearsInService,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "CopyEditor",
          dateOfBirth: dateOfBirth || new Date(),
          // Only include password fields if they are provided
          ...(password ? { password, confirmPassword } : {}),
          // Include the user ID for update
          userId: existingUser.userId
        };
        
        response = await usersApi.updateCopyEditor(payload);
        toast({
          title: "Success",
          description: "Copy Editor updated successfully",
        });
      } else {
        // Use create method for new user
        const payload: CreateCopyEditorRequest = {
          fullName,
          emailAddress,
          password,
          confirmPassword,
          associatedPublication: copyEditorPublication,
          yearsInService: copyEditorYearsInService,
          phoneNumber: phoneNumber || "",
          address: address || "",
          categoryId: "",
          roleName: "CopyEditor",
          dateOfBirth: dateOfBirth || new Date(),
        };
        
        response = await usersApi.createCopyEditor(payload);
        toast({
          title: "Success",
          description: "Copy Editor created successfully",
        });
      }
      
      navigate("/admin/users");
    } catch (error) {
      console.error("Error creating/updating copy editor:", error);
      toast({
        title: "Error",
        description: "Failed to save copy editor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle the submit action based on the current tab
  const handleSubmit = () => {
    switch (currentTab) {
      case "author":
        handleCreateAuthor();
        break;
      case "editor":
        handleCreateEditor();
        break;
      case "reviewer":
        handleCreateReviewer();
        break;
      case "publisher":
        handleCreatePublisher();
        break;
      case "copyeditor":
        handleCreateCopyEditor();
        break;
      default:
        handleCreateAuthor();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => navigate("/admin/users")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">{isEditMode ? "Edit User" : "Create New User"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit User Details" : "User Details"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update user information by modifying the fields below." 
              : "Create a new user by selecting their role and providing the required information."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="author">Author</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="reviewer">Reviewer</TabsTrigger>
              <TabsTrigger value="publisher">Publisher</TabsTrigger>
              <TabsTrigger value="copyeditor">Copy Editor</TabsTrigger>
            </TabsList>

            {/* Common fields section */}
            <div className="mb-8 space-y-4 border-b pb-6">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password {!isEditMode && "*"}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password {!isEditMode && "*"}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isEditMode ? "Leave blank to keep current password" : "Confirm password"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <DatePicker
                    date={dateOfBirth}
                    setDate={setDateOfBirth}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Role-specific fields sections */}
            <TabsContent value="author" className="space-y-4">
              <h3 className="text-lg font-medium">Author Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="penName">Pen Name</Label>
                  <Input
                    id="penName"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="Enter pen name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Enter preferred genre"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <h3 className="text-lg font-medium">Editor Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearsOfService">Years of Service</Label>
                  <Input
                    id="yearsOfService"
                    type="number"
                    value={yearsOfService.toString()}
                    onChange={(e) => setYearsOfService(parseInt(e.target.value) || 0)}
                    placeholder="Enter years of service"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewedPapersCount">Reviewed Papers Count</Label>
                  <Input
                    id="reviewedPapersCount"
                    type="number"
                    value={reviewedPapersCount.toString()}
                    onChange={(e) => setReviewedPapersCount(parseInt(e.target.value) || 0)}
                    placeholder="Enter number of papers reviewed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orcid">ORCID ID</Label>
                  <Input
                    id="orcid"
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                    placeholder="Enter ORCID identifier"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="researchAreas">Research Areas</Label>
                  <Textarea
                    id="researchAreas"
                    value={researchAreas}
                    onChange={(e) => setResearchAreas(e.target.value)}
                    placeholder="Enter research areas (comma separated)"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviewer" className="space-y-4">
              <h3 className="text-lg font-medium">Reviewer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation</Label>
                  <Input
                    id="affiliation"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder="Enter affiliation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <DatePicker
                    date={dateOfJoining}
                    setDate={setDateOfJoining}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="expertise">Expertise</Label>
                  <Textarea
                    id="expertise"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="Enter areas of expertise"
                    rows={2}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Enter biographical information"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="publisher" className="space-y-4">
              <h3 className="text-lg font-medium">Publisher Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="associatedPublication">Associated Publication</Label>
                  <Input
                    id="associatedPublication"
                    value={associatedPublication}
                    onChange={(e) => setAssociatedPublication(e.target.value)}
                    placeholder="Enter associated publication"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsInService">Years in Service</Label>
                  <Input
                    id="yearsInService"
                    type="number"
                    value={yearsInService.toString()}
                    onChange={(e) => setYearsInService(parseInt(e.target.value) || 0)}
                    placeholder="Enter years in service"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="copyeditor" className="space-y-4">
              <h3 className="text-lg font-medium">Copy Editor Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="copyEditorPublication">Associated Publication</Label>
                  <Input
                    id="copyEditorPublication"
                    value={copyEditorPublication}
                    onChange={(e) => setCopyEditorPublication(e.target.value)}
                    placeholder="Enter associated publication"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="copyEditorYearsInService">Years in Service</Label>
                  <Input
                    id="copyEditorYearsInService"
                    type="number"
                    value={copyEditorYearsInService.toString()}
                    onChange={(e) => setCopyEditorYearsInService(parseInt(e.target.value) || 0)}
                    placeholder="Enter years in service"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/users")}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateUserPage;