import React from "react";
import ErrorFallback from "./ErrorFallback";
import Navbar from "./Navbar";

export class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null, errorInfo: null };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
        this.setState({
          error, errorInfo
        })
    }
  
    render() {
      if (this.state.errorInfo) {
        const { error, errorInfo } = this.state;
        const firstStack = errorInfo.componentStack.split('\n')[1];
        const secondStack = errorInfo.componentStack.split('\n')[2];

        return (
          <> 
            <ErrorFallback hasErrorBondary={this.state.hasError} error={error} errorInfo={errorInfo} firstStack={firstStack} secondStack={secondStack}
              stack={errorInfo.componentStack.split('\n')}/>
          </>
        )
      }
  
      return this.props.children; 
    }
  }

export default ErrorBoundary