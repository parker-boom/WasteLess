import { useEffect, useRef, useState } from 'react'

type CameraState = 'loading' | 'ready' | 'unsupported' | 'denied' | 'error'

type AddItemsScanPageProps = {
  onBack: () => void
  onDone: () => void
}

export function AddItemsScanPage({ onBack, onDone }: AddItemsScanPageProps) {
  const [cameraState, setCameraState] = useState<CameraState>('loading')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let cancelled = false

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('unsupported')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setCameraState('ready')
      } catch (error) {
        const denied =
          error instanceof DOMException &&
          (error.name === 'NotAllowedError' || error.name === 'SecurityError')

        setCameraState(denied ? 'denied' : 'error')
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <section className="screen scan-screen">
      <header className="screen-header">
        <p className="screen-overline">Add Items</p>
        <h1 className="screen-title">Capture barcode(s)</h1>
        <p className="inventory-meta">
          Demo mode is active. Press done to continue with mock scanned items.
        </p>
      </header>

      <div className="scanner-frame">
        {cameraState === 'ready' ? (
          <video ref={videoRef} muted playsInline className="scanner-video" />
        ) : (
          <div className="scanner-placeholder">
            {cameraState === 'loading' ? 'Starting camera...' : null}
            {cameraState === 'unsupported'
              ? 'Camera preview is not supported in this browser.'
              : null}
            {cameraState === 'denied'
              ? 'Camera access was denied. You can still continue in demo mode.'
              : null}
            {cameraState === 'error'
              ? 'Camera failed to start. Continue with demo mode.'
              : null}
          </div>
        )}
      </div>

      <div className="split-actions">
        <button type="button" className="ghost-button" onClick={onBack}>
          back
        </button>
        <button type="button" className="primary-button" onClick={onDone}>
          done
        </button>
      </div>
    </section>
  )
}
