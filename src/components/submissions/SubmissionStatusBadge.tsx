
import { SubmissionStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

const SubmissionStatusBadge = ({ status, className }: SubmissionStatusBadgeProps) => {
  const getStatusColors = () => {
    switch (status) {
      case 'draft':
        return 'bg-slate-200 text-slate-800 hover:bg-slate-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'revision_required':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'published':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'revision_required':
        return 'Revision Required';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'published':
        return 'Published';
      default:
        return status;
    }
  };

  return (
    <Badge className={cn('font-medium capitalize', getStatusColors(), className)}>
      {getStatusDisplay()}
    </Badge>
  );
};

export default SubmissionStatusBadge;
