import { SetMetadata } from '@nestjs/common';

export const REQUIRE_AUTH_KEY = 'requireAuth';
export const RequireAuth = (roles?: string[]) => SetMetadata(REQUIRE_AUTH_KEY, roles || ['user', 'admin']);
