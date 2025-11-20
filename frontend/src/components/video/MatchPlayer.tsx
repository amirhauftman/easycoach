import React, { forwardRef, useImperativeHandle, useRef } from 'react'

type Props = {
    videoUrl?: string
    iframeUrl?: string
}

export type MatchPlayerHandle = {
    seekTo: (seconds: number) => void
}

const MatchPlayer = forwardRef<MatchPlayerHandle, Props>(({ videoUrl, iframeUrl }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)

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

    if (iframeUrl) {
        return (
            <div style={{ marginBottom: 12 }}>
                <iframe title="match-player" src={iframeUrl} width="100%" height={420} style={{ borderRadius: 8, border: 'none' }} />
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
