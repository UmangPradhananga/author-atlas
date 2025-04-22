
import { Button } from "@/components/ui/button";
import { Submission } from "@/types";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";

interface DeskDecisionButtonsProps {
  submission: Submission;
  onDeskDecision: (decision: 'accept' | 'reject' | 'review') => void;
}

const DeskDecisionButtons = ({ submission, onDeskDecision }: DeskDecisionButtonsProps) => {
  return (
    <div className="flex gap-2 mt-4">
      <Button 
        variant="outline" 
        className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
        onClick={() => onDeskDecision('accept')}
      >
        <ThumbsUp className="h-4 w-4 mr-2" /> Desk Accept
      </Button>
      <Button 
        variant="outline"
        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
        onClick={() => onDeskDecision('reject')}
      >
        <ThumbsDown className="h-4 w-4 mr-2" /> Desk Reject
      </Button>
      <Button
        className="flex-1"
        onClick={() => onDeskDecision('review')}
      >
        <Send className="h-4 w-4 mr-2" /> Submit for Review
      </Button>
    </div>
  );
};

export default DeskDecisionButtons;
