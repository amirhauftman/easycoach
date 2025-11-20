import React, { useMemo } from 'react';

type Props = {
    skills?: Record<string, number>
    editable?: boolean
    onChange?: (s: Record<string, number>) => void
    compare?: Record<string, number>
}

// Simple SVG Radar chart implementation (no external deps)
export const SkillRadar: React.FC<Props> = ({ skills = {}, editable = false, onChange, compare = {} }) => {
    const entries = Object.entries(skills)
    if (entries.length === 0) return <div className="muted">No skills</div>

    const labels = entries.map(([k]) => k)
    const values = entries.map(([, v]) => Math.max(0, Math.min(10, Number(v))))

    const size = 220
    const cx = size / 2
    const cy = size / 2
    const radius = 80
    const angleStep = (Math.PI * 2) / labels.length

    const points = values.map((val, i) => {
        const ratio = val / 10
        const ang = -Math.PI / 2 + i * angleStep
        return [cx + Math.cos(ang) * radius * ratio, cy + Math.sin(ang) * radius * ratio]
    })

    const compareValues = labels.map(l => compare[l] ?? 0)
    const comparePoints = compareValues.map((val, i) => {
        const ratio = val / 10
        const ang = -Math.PI / 2 + i * angleStep
        return [cx + Math.cos(ang) * radius * ratio, cy + Math.sin(ang) * radius * ratio]
    })

    const polygon = points.map(p => p.join(',')).join(' ')
    const comparePolygon = comparePoints.map(p => p.join(',')).join(' ')

    const handleSlider = (key: string, v: number) => {
        if (!onChange) return
        const next = { ...skills, [key]: v }
        onChange(next)
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12, alignItems: 'start' }}>
            <svg width={size} height={size}>
                {/* background concentric polygons */}
                {[0.25, 0.5, 0.75, 1].map((r, idx) => (
                    <polygon key={idx} points={labels.map((_, i) => {
                        const ang = -Math.PI / 2 + i * angleStep
                        return [cx + Math.cos(ang) * radius * r, cy + Math.sin(ang) * radius * r].join(',')
                    }).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" />
                ))}

                {/* compare polygon */}
                <polygon points={comparePolygon} fill="rgba(90,200,120,0.08)" stroke="rgba(90,200,120,0.6)" />

                {/* player polygon */}
                <polygon points={polygon} fill="rgba(91,140,255,0.12)" stroke="rgba(91,140,255,0.9)" />

                {/* labels */}
                {labels.map((lab, i) => {
                    const ang = -Math.PI / 2 + i * angleStep
                    const lx = cx + Math.cos(ang) * (radius + 26)
                    const ly = cy + Math.sin(ang) * (radius + 26)
                    return (
                        <text key={lab} x={lx} y={ly} fontSize={11} fill="#cfe0ff" textAnchor={Math.cos(ang) > 0.1 ? 'start' : Math.cos(ang) < -0.1 ? 'end' : 'middle'} alignmentBaseline="middle">{lab}</text>
                    )
                })}
            </svg>

            <div>
                {entries.map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 700 }}>{k}</div>
                            <div className="muted">{Math.round(Number(v) * 10) / 10}</div>
                        </div>
                        {editable ? (
                            <input type="range" min={0} max={10} value={Number(v)} onChange={(ev) => handleSlider(k, Number(ev.target.value))} />
                        ) : (
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                                <div style={{ width: `${(Number(v) / 10) * 100}%`, height: 6, background: 'linear-gradient(90deg,#5b8cff,#4a6ef0)', borderRadius: 6 }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SkillRadar
