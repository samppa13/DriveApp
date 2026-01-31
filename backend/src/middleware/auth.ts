import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface AuthRequest extends Request {
    user?: JwtPayload
}

export const verifyToken = (request: AuthRequest, response: Response, next: NextFunction) => {
    const token = request.header('Authorization')?.split(' ')[1]
    if (!token) {
        response.status(401).json({ error: 'Token not found, access denied' })
        return
    }

    try {
        const verified: JwtPayload = jwt.verify(token, process.env.SECRET as string) as JwtPayload
        request.user = verified
        next()
    } catch (error) {
        response.status(401).json({ error: 'Invalid token, access denied' })
    }
}
