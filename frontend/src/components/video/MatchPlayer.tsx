import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import Hls from 'hls.js'

type Props = {
    videoUrl?: string
    iframeUrl?: string
    hlsUrl?: string
}

export type MatchPlayerHandle = {
    seekTo: (seconds: number) => void
}

const MatchPlayer = forwardRef<MatchPlayerHandle, Props>(({ videoUrl, iframeUrl, hlsUrl }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const hlsRef = useRef<Hls | null>(null)
    const [iframeError, setIframeError] = useState(false)

    useImperativeHandle(ref, () => ({
        seekTo(seconds: number) {
            const v = videoRef.current
            if (!v) return
            try {
                v.currentTime = seconds
                v.play()
            } catch (err) {
                v.play()
            }
        }
    }), [])

    const handleIframeError = () => {
        console.error('Iframe failed to load:', iframeUrl)
        console.error('Iframe error details:', {
            url: iframeUrl,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        })
        setIframeError(true)
    }

    // Handle HLS video loading
    useEffect(() => {
        if (hlsUrl && videoRef.current) {
            const video = videoRef.current

            // Proxy the HLS URL to avoid CORS issues
            const proxiedHlsUrl = hlsUrl.replace('https://dn3dopmbo1yw3.cloudfront.net', '/cloudfront')

            // Check if HLS is supported natively
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                console.log('Using native HLS support')
                video.src = proxiedHlsUrl
            } else if (Hls.isSupported()) {
                // Use hls.js for other browsers
                const hls = new Hls({
                    enableWorker: false, // Disable worker for better compatibility
                })

                hlsRef.current = hls
                hls.loadSource(proxiedHlsUrl)
                hls.attachMedia(video)

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    // console.log('HLS manifest parsed successfully')
                    // video.play().catch(err => console.log('Autoplay failed:', err))
                })

                hls.on(Hls.Events.ERROR, (_, data) => {
                    console.error('HLS error:', data)
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('HLS network error')
                                hls.startLoad()
                                break
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('HLS media error')
                                hls.recoverMediaError()
                                break
                            default:
                                console.error('HLS fatal error')
                                hls.destroy()
                                break
                        }
                    }
                })

                return () => {
                    if (hlsRef.current) {
                        hlsRef.current.destroy()
                        hlsRef.current = null
                    }
                }
            } else {
                console.error('HLS is not supported in this browser')
            }
        }

        // Cleanup on unmount
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [hlsUrl])

    if (hlsUrl) {
        // console.log('Rendering HLS video player for:', hlsUrl)
        return (
            <div style={{ marginBottom: 12 }}>
                <video
                    ref={videoRef}
                    controls
                    style={{ borderRadius: 8, width: '100%', height: 420 }}
                    onError={() => console.error('HLS video failed to load:', hlsUrl)}
                // onLoadStart={() => console.log('HLS video started loading')}
                // onCanPlay={() => console.log('HLS video can play')}
                // onPlay={() => console.log('HLS video started playing')}
                />
            </div>
        )
    }

    if (iframeUrl && !iframeError) {
        console.log('Loading iframe with URL:', iframeUrl)
        return (
            <div style={{ marginBottom: 12 }}>
                <iframe
                    title="match-player"
                    src={iframeUrl}
                    width="100%"
                    height={420}
                    style={{ borderRadius: 8, border: 'none' }}
                    onError={handleIframeError}
                    onLoad={() => console.log('Iframe loaded successfully')}
                    allow="autoplay; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
                <div style={{ marginTop: 10, fontSize: '12px', color: '#666' }}>
                    Debug: {iframeUrl}
                </div>
            </div>
        )
    }

    if (iframeError) {
        return (
            <div style={{ marginBottom: 12, padding: 20, borderRadius: 8, background: 'rgba(255,0,0,0.1)', textAlign: 'center' }}>
                <p>Video player failed to load</p>
                <p style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>URL: {iframeUrl}</p>
                <div style={{ marginTop: 10 }}>
                    <button
                        onClick={() => window.open(iframeUrl, '_blank')}
                        style={{ marginRight: 10, padding: '5px 10px' }}
                    >
                        Test URL in new tab
                    </button>
                    <button onClick={() => setIframeError(false)} style={{ padding: '5px 10px' }}>
                        Retry iframe
                    </button>
                </div>
            </div>
        )
    }

    // fallback to plain video element
    return (
        <div style={{ marginBottom: 12 }}>
            {videoUrl ? (
                <video ref={videoRef} src={videoUrl} width="100%" controls style={{ borderRadius: 8 }} />
            ) : (
                <div style={{ padding: 40, borderRadius: 8, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>No video available</div>
            )}
        </div>
    )
})

export default MatchPlayer
