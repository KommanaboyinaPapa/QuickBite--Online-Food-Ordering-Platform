/**
 * Patch for React 19 + react-native-web Text constructor issue
 * This fixes the "Failed to construct 'Text': Please use the 'new' operator" error
 */

if (typeof window !== 'undefined') {
  // Store the original Text constructor
  const OriginalText = window.Text;
  
  // Create a wrapper that can be called with or without 'new'
  window.Text = function TextWrapper(...args) {
    if (new.target) {
      // Called with 'new' operator
      return Reflect.construct(OriginalText, args, new.target);
    } else {
      // Called as a function - convert to constructor call
      return new OriginalText(...args);
    }
  };
  
  // Copy properties from original
  Object.setPrototypeOf(window.Text, OriginalText);
  Object.setPrototypeOf(window.Text.prototype, OriginalText.prototype);
}
