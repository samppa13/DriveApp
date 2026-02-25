interface ILock {
    user: string
    lockTime: Date
}

export interface ISlide {
    title: string
    bullets: string[]
}

export interface IUser {
    _id: string
    username: string
}

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
