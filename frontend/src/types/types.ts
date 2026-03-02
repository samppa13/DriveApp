// Interface representing a lock on a document by a user
interface ILock {
    user: string
    lockTime: Date
}

// Interface for a slide in a presentation document
export interface ISlide {
    title: string
    bullets: string[]
}

// Interface for a user
export interface IUser {
    _id: string
    username: string
    profileImage?: string | null
}

// Interface for a document (can be text, presentation, spreadsheet, or image)
export interface IDocument {
    _id: string
    name: string
    type: string
    text?: string
    slides?: ISlide[]
    cells?: string[][]
    path?: string
    originalName?: string
    user?: IUser
    permissions?: string[]
    viewToken?: string
    createdAt?: Date
    updatedAt?: Date
    lock?: ILock
    isDeleted?: boolean
}

// Interface for creating or updating a document
export interface INewDocument {
    _id?: string
    name: string
    type: string
    text?: string
    slides?: ISlide[]
    cells?: string[][]
    user?: IUser
    permissions?: string[]
    viewToken?: string
    createdAt?: Date
    updatedAt?: Date
    lock?: ILock
    isDeleted?: boolean
}
