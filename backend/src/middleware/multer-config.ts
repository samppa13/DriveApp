import { Request } from 'express'
import multer, { Multer, StorageEngine } from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { JwtPayload } from 'jsonwebtoken'

interface AuthRequest extends Request {
    user?: JwtPayload
}

const storage: StorageEngine = multer.diskStorage({
    destination: async (request: AuthRequest, file, callback) => {
        const userDir = path.join('./public/images', request.user?.id)

        try {
            await fs.promises.access(userDir)
        } catch (error) {
            await fs.promises.mkdir(userDir, { recursive: true })
        }
        
        callback(null, userDir)
    },
    filename: (request, file, callback) => {
        const originalname: string = path.parse(file.originalname).name
        const id: string = uuidv4()
        const extension: string = path.extname(file.originalname)
        callback(null, `${originalname}_${id}${extension}`)
    }
})

const upload: Multer = multer({ storage: storage })

export default upload
