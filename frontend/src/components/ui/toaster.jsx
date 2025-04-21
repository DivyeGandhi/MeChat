'use client'

import React from 'react'
import { createPortal } from 'react-dom'

export const toaster = {
  toasts: [],
  listeners: new Set(),
  
  addToast(toast) {
    this.toasts = [...this.toasts, toast]
    this.notify()
  },
  
  removeToast(id) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  },
  
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  },
  
  notify() {
    this.listeners.forEach(listener => listener(this.toasts))
  }
}

export const Toaster = () => {
  const [toasts, setToasts] = React.useState([])

  React.useEffect(() => {
    return toaster.subscribe(setToasts)
  }, [])

  if (typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white rounded-lg shadow-lg p-4 max-w-sm flex items-start space-x-3"
        >
          {toast.type === 'loading' ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className={`w-2 h-2 rounded-full ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
          )}
          <div className="flex-1">
            {toast.title && (
              <h3 className="font-medium text-gray-900">{toast.title}</h3>
            )}
            {toast.description && (
              <p className="text-sm text-gray-500">{toast.description}</p>
            )}
          </div>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {toast.action.label}
            </button>
          )}
          {toast.meta?.closable && (
            <button
              onClick={() => toaster.removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>,
    document.body
  )
}
