import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[] | undefined;
  const currentUser = authService.currentUser();

  // If no roles specified, allow access (authGuard already verified authentication)
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has one of the required roles
  if (currentUser && requiredRoles.includes(currentUser.role)) {
    return true;
  }

  // User lacks required role - redirect to access denied
  return router.createUrlTree(['/access-denied']);
};
