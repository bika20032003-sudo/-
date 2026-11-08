import React from 'react';

/**
 * ErrorBoundary: Silent and seamless error handling without any intrusive fallback screen.
 * تم إلغاء شاشة الاستعادة المزعجة بالكامل بناءً على طلب المستخدم، بحيث يمرر المحتوى مباشرة دون انقطاع.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.warn('ErrorBoundary silently absorbed rendering issue:', error);
    return { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ErrorBoundary captured rendering notice:', error, errorInfo);
  }

  render() {
    // Do not show any intermediate / recovery screen under any circumstances
    return this.props.children;
  }
}

export default ErrorBoundary;
