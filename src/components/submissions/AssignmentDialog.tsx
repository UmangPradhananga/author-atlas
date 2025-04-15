
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usersApi } from "@/api/apiService";
import { User, Submission } from "@/types";
import { Search, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  submission: Submission;
  onAssign: (userIds: string[], role: string) => Promise<void>;
  role: 'reviewer' | 'copyeditor' | 'publisher';
  title?: string;
  currentAssignees?: string[];
}

const AssignmentDialog = ({
  open,
  onClose,
  submission,
  onAssign,
  role,
  title,
  currentAssignees = [],
}: AssignmentDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(currentAssignees);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await usersApi.getUsersByRole(role);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: `Failed to load ${role}s. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open, role, toast]);

  useEffect(() => {
    // Update selected users when currentAssignees changes
    if (currentAssignees) {
      setSelectedUserIds(currentAssignees);
    }
  }, [currentAssignees]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await onAssign(selectedUserIds, role);
      toast({
        title: "Assignment Updated",
        description: `Successfully assigned ${selectedUserIds.length} ${role}s to this submission.`,
      });
      onClose();
    } catch (error) {
      console.error(`Failed to assign ${role}s:`, error);
      toast({
        title: "Error",
        description: `Failed to assign ${role}s. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.affiliation?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Assign {title || role}s
          </DialogTitle>
          <DialogDescription>
            Assign {role}s to the submission: <strong>{submission.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${role}s...`}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-0.5"
            >
              Clear
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {filteredUsers.map((user) => {
                  const isAssigned = currentAssignees?.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center space-x-2 p-2 rounded ${
                        selectedUserIds.includes(user.id)
                          ? "bg-accent"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                      <div className="flex-1 grid gap-0.5">
                        <Label
                          htmlFor={`user-${user.id}`}
                          className="cursor-pointer font-medium flex items-center"
                        >
                          {user.name}
                          {isAssigned && (
                            <span className="ml-2 inline-flex items-center text-xs text-green-600 font-medium">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Already assigned
                            </span>
                          )}
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                          {user.affiliation && ` • ${user.affiliation}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedUserIds.length} users selected
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUserIds([])}
              disabled={selectedUserIds.length === 0}
            >
              Deselect All
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting || selectedUserIds.length === 0}>
            {submitting ? "Saving..." : "Assign Users"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;
