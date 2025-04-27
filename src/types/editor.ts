import { ReviewType, EditorDecision, EditorCopyEditionDecision } from ".";

export interface AssignReviewerRequest
{
    journalId: string;
    reviewerIds: string[];
    reviewType: ReviewType;
    status: EditorDecision; 
    editorComment: string;
}
export interface AssignCopyEditorRequest {
    copyEditorId: string;
    journalId: string;
    manuscriptId: string;
}

export interface EditorDecisionInReview {
    journalId: string;
    decision: EditorDecision;
    reviewerIds?: string[];
    editorComment?: string;
}

export interface EditorDecisionInCopyEdition {
    manuscriptId: string;
    copyEditorId: string;
    publisherId?: string;
    decision: EditorCopyEditionDecision;
}

export { ReviewType, EditorDecision, EditorCopyEditionDecision };
