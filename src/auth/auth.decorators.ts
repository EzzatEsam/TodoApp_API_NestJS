// src/auth/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserPayload = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
