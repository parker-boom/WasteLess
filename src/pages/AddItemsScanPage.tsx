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
        const stream = await requestCameraStream()

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        setCameraState('ready')

        const videoEl = videoRef.current
        if (videoEl) {
          videoEl.srcObject = stream
          void videoEl.play().catch(() => {
            // Some browsers require a gesture before playback; stream is still attached.
          })
        }
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
      </header>

      <div className="scanner-frame">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`scanner-video ${cameraState === 'ready' ? 'is-visible' : 'is-hidden'}`}
        />

        {cameraState !== 'ready' ? (
          <div className="scanner-placeholder">
            {cameraState === 'loading' ? 'Starting camera...' : null}
            {cameraState === 'unsupported'
              ? 'Camera preview is not supported in this browser.'
              : null}
            {cameraState === 'denied'
              ? 'Camera access was denied. You can still continue.'
              : null}
            {cameraState === 'error'
              ? 'Camera failed to start. You can still continue.'
              : null}
          </div>
        ) : null}
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

async function requestCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
    { video: { facingMode: { ideal: 'user' } }, audio: false },
    { video: true, audio: false },
  ]

  let lastError: unknown = null

  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
      lastError = error

      const isPermissionError =
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' || error.name === 'SecurityError')

      if (isPermissionError) {
        throw error
      }
    }
  }

  throw lastError ?? new Error('Unable to initialize camera stream')
}
