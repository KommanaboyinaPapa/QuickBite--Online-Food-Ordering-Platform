/**
 * Spacing System
 * Consistent spacing scale based on 4px base unit
 */

export const spacing = {
  // Base spacing - 4px increments
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 12,     // 12px
  lg: 16,     // 16px
  xl: 24,     // 24px
  xxl: 32,    // 32px
  xxxl: 48,   // 48px
  
  // Shortcuts for common cases
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  margin: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  padding: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  // Screen padding
  screenPaddingHorizontal: 16,
  screenPaddingVertical: 16,
  
  // Common combinations
  containerPaddingH: 16,
  containerPaddingV: 24,
  
  // Component-specific
  buttonPaddingH: 24,
  buttonPaddingV: 12,
  buttonPaddingSmallH: 16,
  buttonPaddingSmallV: 8,
  
  // Input fields
  inputPaddingH: 12,
  inputPaddingV: 10,
  
  // Card spacing
  cardPadding: 16,
  cardMargin: 12,
  cardRadius: 12,
  
  // Bottom sheet/modal
  sheetPadding: 24,
  modalPadding: 24,
};

export default spacing;
