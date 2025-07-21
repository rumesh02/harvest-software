// Console warning suppression for MUI Grid v1 deprecation warnings
// This is a temporary solution until MUI Grid v2 migration

const originalConsoleWarn = console.warn;

console.warn = function(...args) {
  // Suppress MUI Grid deprecation warnings
  const message = args.join(' ');
  if (
    message.includes('MUI Grid: The `item` prop has been removed') ||
    message.includes('MUI Grid: The `xs` prop has been removed') ||
    message.includes('MUI Grid: The `sm` prop has been removed') ||
    message.includes('MUI Grid: The `md` prop has been removed') ||
    message.includes('MUI Grid: The `lg` prop has been removed') ||
    message.includes('MUI Grid: The `xl` prop has been removed')
  ) {
    // Don't log these specific warnings
    return;
  }
  
  // Log all other warnings normally
  originalConsoleWarn.apply(console, args);
};

export { originalConsoleWarn };
