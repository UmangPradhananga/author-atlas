export interface LoginResponse{
    userId: string;
    isTwoFAEnabled: boolean;
    accessToken: string;
    fullName: string;
    emailAddress: string;
    roleNames: string[];
}
export interface LoginRequest{
    emailAddress: string; 
    password: string;
}
export interface TwoFARequest{
    emailAddress: string; 
    password: string;
    twoFACode: string;
}
export interface CreateUserRequest{
    emailAddress: string; 
    password: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    categoryId: string;
    roleName: string;
    confirmPassword: string;
    dateOfBirth: Date;
}
export interface CreateAuthorRequest extends CreateUserRequest
{
    penName: string;
    genere: string;
}
export interface CreateEditorRequest extends CreateUserRequest
{
    yearsOfService: number;
    researchAreas: string;
    publications: string[];
    awards: string[];
    reviewedPapersCount: number;
    orcid: string;
}
export interface CreateReviewerRequest extends CreateUserRequest
{
    affiliation: string;
    expertise: string;
    bio: string;
    dateOfJoining: Date;
    status: string;
}
export interface CreatePublisherRequest extends CreateUserRequest
{
    associatedPublication: string;
    yearsInService: number;
}
export interface CreateCopyEditorRequest extends CreateUserRequest
{
    associatedPublication: string;
    yearsInService: number;
}
export interface UpdateUserRequest{
    id: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    categoryId: string;
    roleName: string;
    confirmPassword: string;
    dateOfBirth: Date;
}
export interface UpdateAuthorRequest extends UpdateUserRequest
{
    penName: string;
    genere: string;
}
export interface UpdateEditorRequest extends UpdateUserRequest
{
    yearsOfService: number;
    researchAreas: string;
    publications: string[];
    awards: string[];
    reviewedPapersCount: number;
    orcid: string;
}
export interface UpdateReviewerRequest extends UpdateUserRequest
{
    affiliation: string;
    expertise: string;
    bio: string;
    dateOfJoining: Date;
    status: string;
}
export interface UpdatePublisherRequest extends UpdateUserRequest
{
    associatedPublication: string;
    yearsInService: number;
}
export interface UpdateCopyEditorRequest extends UpdateUserRequest
{
    associatedPublication: string;
    yearsInService: number;
}
