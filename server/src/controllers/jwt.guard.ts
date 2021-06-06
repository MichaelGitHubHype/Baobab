import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { extractJwtFromCookie } from './jwt.strategy';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private _authService: AuthService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const jwt = extractJwtFromCookie(request);
    const integrityString = request.cookies['SESSION_INT'];

    if (jwt) {
      if (!this._authService.verifyJwt(jwt, integrityString)) {
        throw new UnauthorizedException();
      }

      // handle auto renewal of session token
      const renewed = this._authService.renew(jwt);
      if (renewed) {
        response.cookie('SESSION_JWT', renewed.jwt, {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        response.cookie('SESSION_INT', renewed.integrityString, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
    }

    return super.canActivate(context);
  }
}
