// Define the permission types
export interface Permission {
  module: string;
  action: string;
}

// Helper function to check if a user has a specific permission
export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.some(
    permission =>
      permission.module === requiredPermission.module &&
      permission.action === requiredPermission.action
  );
}

// Helper function to check if a user has any of the required permissions
export function hasAnyPermission(userPermissions: Permission[], module: string): boolean {
  return userPermissions.some(permission => permission.module === module);
}

// Helper function to check if a user has all of the required permissions
export function hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(required =>
    userPermissions.some(
      permission =>
        permission.module === required.module &&
        permission.action === required.action
    )
  );
} 