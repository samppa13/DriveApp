export interface IUser {
    _id: string
    username: string
}

export interface ITextDocument {
    _id?: string
    name: string
    text: string
    user?: IUser[]
    permissions?: string[]
    viewToken?: string
}
