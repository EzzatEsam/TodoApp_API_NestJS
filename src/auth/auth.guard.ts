import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { TokenPayload } from 'src/types/tokenPayload';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException('Unauthorized', 401);
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new HttpException('Invalid token', 401);
    }

    try {
      const payload: TokenPayload = await this.jwtService.verify(token);
      req.user = payload;
    } catch {
      throw new HttpException('Invalid token', 401);
    }
    return true;
  }
}
