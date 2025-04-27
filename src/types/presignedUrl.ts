export interface FileDetailsDto {
    fileName: string;
    fileSize: number;
    fileCategoryId: string;
}

export interface PresignedUrlResponseDto {
    preSignedUrl: string;
    fileKey: string;
    id: string;
    fileName: string;
    fileSize: number;
}
export interface JournalFilesPresignedUrlResponseDto extends PresignedUrlResponseDto {
    fileCategoryId: string;
}

export interface MultipleFilePresignedUrlDto {
    fileDetails: FileDetailsDto[];
    id: string | null;
}

export interface SingleFilePreSignedUrlDto {
    fileName: string;
    fileSize: number;
    id: string | null;
}