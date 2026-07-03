import Button from './ui/Button'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallAppButton({ size = 'sm', className = '' }) {
  const { canInstall, isIosManualInstall, promptInstall } = useInstallPrompt()

  if (canInstall) {
    return (
      <Button variant="outline" size={size} onClick={promptInstall} className={className}>
        ⬇ Install App
      </Button>
    )
  }

  if (isIosManualInstall) {
    return (
      <span className={`text-xs text-gray-500 ${className}`}>
        Install: Share ⬆ → Add to Home Screen
      </span>
    )
  }

  return null
}
