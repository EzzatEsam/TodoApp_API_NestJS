import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EncryptionService } from './auth/encryption.service';
import { ConfigModule } from '@nestjs/config';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [AuthModule , ConfigModule.forRoot({ isGlobal: true }), TodoModule],
  controllers: [AppController],
  providers: [AppService, EncryptionService],
})
export class AppModule {}
