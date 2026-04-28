import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

@Injectable()
export class Intra42Strategy extends PassportStrategy(Strategy, '42') {
    
    constructor() {
        console.log('42 OAuth Config:');
        console.log('Client ID:', process.env.INTRA42_CLIENT_ID);
        console.log('Callback URL:', process.env.INTRA42_CALLBACK_URL);
        // Don't log the secret!
        
        super({
            clientID: process.env.INTRA42_CLIENT_ID,
            clientSecret: process.env.INTRA42_CLIENT_SECRET,
            callbackURL: process.env.INTRA42_CALLBACK_URL,
            scope: ['public'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        // This function is called after successful OAuth authentication
        // 'profile' contains user data from 42 API
        
        const { id, username, emails, displayName, name } = profile;
        
        // Extract user info
        const user = {
            intra42Id: id,
            email: emails && emails[0] ? emails[0].value : null,
            username: username,
            firstName: name?.givenName || null,
            lastName: name?.familyName || null,
        };

        return user;
    }
}