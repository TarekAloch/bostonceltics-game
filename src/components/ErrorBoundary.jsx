import { Component } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Game Error Caught by Boundary:', error, errorInfo)

    // Store error info in state for display
    this.setState({
      errorInfo,
    })

    // You could also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
  }

  handleRestart = () => {
    // Clear error state and reload
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A1612] via-[#0d1a15] to-[#0A1612] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-gradient-to-br from-red-900/20 to-red-950/20 border-2 border-red-500/40 rounded-3xl p-8 md:p-12 shadow-[0_0_80px_rgba(220,38,38,0.3)]"
          >
            {/* Error icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-400" strokeWidth={2.5} />
              </div>
            </motion.div>

            {/* Error message */}
            <h1 className="font-['Oswald'] text-4xl md:text-5xl font-bold text-white text-center mb-4 uppercase">
              Game Error
            </h1>

            <p className="text-white/70 text-center text-lg mb-6">
              Something went wrong with the game. Don't worry, we can get you back in action.
            </p>

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-black/40 rounded-xl border border-red-500/30 max-h-48 overflow-auto">
                <p className="text-red-300 font-mono text-sm mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-red-300/70 text-xs cursor-pointer hover:text-red-300">
                      Stack Trace
                    </summary>
                    <pre className="text-red-300/50 text-xs mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={this.handleRestart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-[#007A33] to-[#005A25] hover:from-[#008A3D] hover:to-[#006A30] rounded-xl font-['Oswald'] text-xl font-bold text-white shadow-lg hover:shadow-[0_0_30px_rgba(0,122,51,0.5)] transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                Restart Game
              </motion.button>
            </div>

            {/* Help text */}
            <p className="text-white/40 text-center text-sm mt-8">
              If the error persists, try refreshing your browser or clearing your cache.
            </p>
          </motion.div>
        </div>
      )
    }

    // No error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary
