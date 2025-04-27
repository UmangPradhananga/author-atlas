export interface CreateJournalRequest {
    Title: string;
    Abstraction: string;
    Manuscripts?: MultipleManuscriptUploadDto;
    Keywords: string[];
    CategoryId: string;
    AuthorIds: string[];
    CoverLetter: string;
}
export interface MultipleManuscriptUploadDto
{
    JournalId?: string;
    Files: UploadManuscriptDto[];
} 
export interface UploadManuscriptDto
{
    FileName: string;
    FileSize: number;
    FileUrl: string;
    FileCategoryId: string;
    Id: string;
}
export interface UpdateJournalRequest 
{
    Id: string;
    Title?: string;
    Abstraction?: string;
    Manuscripts?: MultipleManuscriptUploadDto;
    Keywords?: string[];
    CategoryId?: string;
    AuthorIds?: string[];
    CoverLetter?: string;
}