import React, { useRef } from 'react'

const placeholder = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

const MatchEventPlayer: React.FC<{ start?: number }> = ({ start = 0 }) => {
    // Kept for backward compatibility; prefer the central MatchPlayer usage in MatchDetail
    const ref = useRef<HTMLVideoElement | null>(null)

    const handlePlayAt = () => {
        const v = ref.current
        if (!v) return
        try {
            v.currentTime = Number(start || 0)
            v.play()
        } catch (err) {
            v.play()
        }
    }

    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <video ref={ref} src={placeholder} width={320} controls style={{ borderRadius: 6 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button onClick={handlePlayAt} style={{ padding: '6px 10px', borderRadius: 6 }}>Play at {start}s</button>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Starts at {start}s</div>
            </div>
        </div>
    )
}

export default MatchEventPlayer
