import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DatabaseService } from 'src/db/db';
import { EncryptionService } from 'src/auth/encryption.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60h' },
    }),
  ],
  controllers: [AuthController],
  providers: [DatabaseService, EncryptionService],
})
export class AuthModule {}
