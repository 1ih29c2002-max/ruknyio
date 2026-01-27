import React from 'react'
import { motion } from 'framer-motion'
import { CircleCheck, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  onBack?: () => void
  onContinue?: () => void
  isLoading?: boolean
  isBackVisible?: boolean
  continueLabel?: string
  backLabel?: string
  finishLabel?: string
  disabled?: boolean
}

const ProgressIndicator = ({
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  isLoading = false,
  isBackVisible = true,
  continueLabel = 'استمرار',
  backLabel = 'رجوع',
  finishLabel = 'إنهاء',
  disabled = false,
}: ProgressIndicatorProps) => {
  const isLastStep = currentStep === totalSteps
  const showBackButton = isBackVisible && currentStep > 1

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {/* Progress Dots */}
      <div className="flex items-center gap-4 relative">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((dot) => (
          <div
            key={dot}
            className={cn(
              "w-2 h-2 rounded-full relative z-10 transition-colors duration-300",
              dot <= currentStep ? "bg-foreground" : "bg-muted-foreground/30"
            )}
          />
        ))}

        {/* Green progress overlay */}
        <motion.div
          initial={{ width: '16px' }}
          animate={{
            width: `${16 + (currentStep - 1) * 24}px`,
          }}
          className="absolute -right-[4px] top-1/2 -translate-y-1/2 h-5 bg-gray-200 rounded-full -z-0"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8,
            bounce: 0.25,
            duration: 0.6
          }}
        />
      </div>

      {/* Step indicator text */}
      <p className="text-xs text-muted-foreground">
        الخطوة {currentStep} من {totalSteps}
      </p>

      {/* Buttons container */}
      <div className="w-full">
        <motion.div
          className="flex items-center gap-2"
          animate={{
            justifyContent: showBackButton ? 'space-between' : 'stretch'
          }}
        >
          {showBackButton && (
            <motion.button
              type="button"
              initial={{ opacity: 0, width: 0, scale: 0.8 }}
              animate={{ opacity: 1, width: "auto", scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                mass: 0.8,
                bounce: 0.25,
                duration: 0.6,
                opacity: { duration: 0.2 }
              }}
              onClick={onBack}
              disabled={isLoading}
              className="px-6 py-3 text-foreground flex items-center justify-center gap-2 bg-muted/50 font-medium rounded-full hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="text-sm">{backLabel}</span>
            </motion.button>
          )}
          
          <motion.button
            type="button"
            onClick={onContinue}
            disabled={disabled || isLoading}
            animate={{
              flex: showBackButton ? 'initial' : 1,
            }}
            className={cn(
              "px-6 py-3 rounded-full text-background bg-foreground font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
              showBackButton ? 'flex-1' : 'w-full'
            )}
          >
            <div className="flex items-center font-medium justify-center gap-2 text-sm">
              {isLastStep && !isLoading && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    mass: 0.5,
                    bounce: 0.4
                  }}
                >
                  <CircleCheck className="h-4 w-4" />
                </motion.div>
              )}
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full"
                  />
                  جاري المعالجة...
                </span>
              ) : (
                isLastStep ? finishLabel : continueLabel
              )}
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default ProgressIndicator
