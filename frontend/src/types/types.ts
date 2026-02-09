interface ILock {
    user: string
    lockTime: Date
}

export interface IUser {
    _id: string
    username: string
}

export interface ITextDocument {
    _id?: string
    name: string
    text: string
    user?: IUser
    permissions?: string[]
    viewToken?: string
    createdAt?: Date
    updatedAt?: Date
    lock?: ILock
}
