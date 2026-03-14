'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 rounded-3xl border border-terracotta-200 bg-terracotta-50 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-terracotta-500 mb-4" strokeWidth={1.5} />
          <h3 className="font-lexend font-semibold text-terracotta-900 text-lg mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-terracotta-700 font-inter mb-6 max-w-sm">
            {this.state.error?.message || 'We encountered an unexpected error while loading this component.'}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            variant="secondary"
            className="border-terracotta-300 text-terracotta-700 hover:bg-terracotta-100"
          >
            <RefreshCcw className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
