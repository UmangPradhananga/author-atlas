
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ProfileEditFormProps {
  user: User;
  onSave: (updatedUser: User) => Promise<void>;
  onCancel: () => void;
}

const ProfileEditForm = ({ user, onSave, onCancel }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<User>({
    ...user,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewPreferenceChange = (key: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      reviewPreferences: {
        ...prev.reviewPreferences,
        [key]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReviewer = user.role === 'reviewer';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="affiliation">Affiliation</Label>
          <Input
            id="affiliation"
            name="affiliation"
            value={formData.affiliation || ""}
            onChange={handleChange}
            placeholder="University or Organization"
          />
        </div>

        <div>
          <Label htmlFor="bio">Biography</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            className="min-h-32"
          />
        </div>

        {isReviewer && (
          <div className="space-y-3 border rounded-md p-4">
            <Label className="text-base">Peer Review Preferences</Label>
            <p className="text-sm text-muted-foreground">Select which types of peer review you're willing to participate in:</p>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="acceptsOpenReview" 
                  checked={formData.reviewPreferences?.acceptsOpenReview || false}
                  onCheckedChange={(checked) => 
                    handleReviewPreferenceChange('acceptsOpenReview', checked as boolean)
                  }
                />
                <Label htmlFor="acceptsOpenReview" className="font-normal">
                  Open Review (authors and reviewers know each other's identities)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="acceptsSingleBlind" 
                  checked={formData.reviewPreferences?.acceptsSingleBlind || false}
                  onCheckedChange={(checked) => 
                    handleReviewPreferenceChange('acceptsSingleBlind', checked as boolean)
                  }
                />
                <Label htmlFor="acceptsSingleBlind" className="font-normal">
                  Single-Blind (reviewer knows author identity, but not vice versa)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="acceptsDoubleBlind" 
                  checked={formData.reviewPreferences?.acceptsDoubleBlind || false}
                  onCheckedChange={(checked) => 
                    handleReviewPreferenceChange('acceptsDoubleBlind', checked as boolean)
                  }
                />
                <Label htmlFor="acceptsDoubleBlind" className="font-normal">
                  Double-Blind (both authors and reviewers remain anonymous)
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
