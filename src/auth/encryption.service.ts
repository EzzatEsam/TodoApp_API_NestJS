import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';


const saltRounds = 10;

@Injectable()
export class EncryptionService {

    async hashPassword(password: string): Promise<string> {
        
        return bcrypt.hash(password, saltRounds);
    }
    
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}