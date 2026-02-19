import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // ↑ This tells Passport: "Look for token in Authorization: Bearer <token>"
            
            ignoreExpiration: false,
            // ↑ If token is expired, reject it
            
            secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
            // ↑ Use the same secret we used to SIGN the token
        });
    }

    async validate(payload: any) {
        // This runs AFTER the token is verified
        // 'payload' is the decoded JWT data: { sub: 5, email: "...", username: "..." }
        
        // Whatever we return here will be attached to req.user
        return {
            userId: payload.sub,      // Extract user ID
            email: payload.email,
            username: payload.username,
        };
    }
}