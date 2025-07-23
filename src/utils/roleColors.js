// Role-based color theming utility
export const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'farmer': 
      return {
        primary: '#10B981',        // Main accent color from dashboard
        secondary: '#34d399',      // Lighter variant
        light: '#d4edda',          // Background color from dashboard
        dark: '#155724',           // Text color from dashboard
        accent: '#047857'          // Darker accent
      };
    case 'merchant': 
      return {
        primary: '#d97706',        // Main accent color from dashboard
        secondary: '#f59e0b',      // Lighter variant
        light: '#fef3e2',          // Background color from dashboard
        dark: '#92400e',           // Text color from dashboard
        accent: '#b45309'          // Darker accent
      };
    case 'transporter': 
      return {
        primary: '#1976d2',        // Main accent color from dashboard
        secondary: '#42a5f5',      // Lighter variant
        light: '#e3f2fd',          // Background color from dashboard
        dark: '#1565c0',           // Text color from dashboard
        accent: '#1565c0'          // Same as dark for consistency
      };
    default: 
      return {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        light: '#f3f4f6',
        dark: '#7c3aed',
        accent: '#6d28d9'
      };
  }
};

export const getRoleGradient = (role) => {
  const colors = getRoleColor(role);
  return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
};

export const getRoleHoverGradient = (role) => {
  const colors = getRoleColor(role);
  return `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`;
};

export const getRoleBackgroundColor = (role, opacity = 0.1) => {
  const colors = getRoleColor(role);
  return `${colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};
