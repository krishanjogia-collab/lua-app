'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Share2, Link as LinkIcon, MessageCircle, Facebook, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'

interface ShareButtonProps {
  title: string
  text: string
  url: string
  className?: string
  lang?: 'en' | 'pt'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export function ShareButton({ title, text, url, className, lang = 'en', variant = 'secondary' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if the current environment supports the Web Share API
    // Need to wrapped in useEffect to run on client
    setCanNativeShare(!!(navigator && navigator.share))
    
    // Click outside handler for custom dropdown
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleShareClick = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        // User cancelled share or other error, fallback to menu
        if (err instanceof Error && err.name !== 'AbortError') {
          setIsOpen(true)
        }
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(`${title}\n\n${text}`)

  return (
    <div className={`relative inline-block ${className || ''}`} ref={menuRef}>
      <Button 
        onClick={handleShareClick} 
        variant={variant}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        {lang === 'en' ? 'Share' : 'Compartilhar'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-xl border border-cream-200 py-2 z-50 overflow-hidden"
          >
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cream-50 transition font-inter text-sm text-sage-700"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <LinkIcon className="w-4 h-4 text-sage-400" />
              )}
              {copied 
                ? (lang === 'en' ? 'Link Copied!' : 'Link Copiado!')
                : (lang === 'en' ? 'Copy Link' : 'Copiar Link')}
            </button>

            <div className="h-px bg-cream-100 my-1 mx-4" />

            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cream-50 transition font-inter text-sm text-sage-700"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cream-50 transition font-inter text-sm text-sage-700"
            >
              <Facebook className="w-4 h-4 text-blue-500" />
              Facebook
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
