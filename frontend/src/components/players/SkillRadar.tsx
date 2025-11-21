import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import './SkillRadar.css';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface SkillRadarProps {
    skills: { [key: string]: number };
    averages?: { [key: string]: number };
    editable?: boolean;
    onChange?: (skills: { [key: string]: number }) => void;
    compare?: { [key: string]: number } | null;
}

const SkillRadar: React.FC<SkillRadarProps> = ({ skills, averages, editable = false, onChange, compare = null }) => {
    const [editableSkills, setEditableSkills] = useState<Record<string, number>>(skills);

    useEffect(() => {
        setEditableSkills(skills);
    }, [skills]);

    const handleSkillChange = (skill: string, value: number) => {
        const next = { ...editableSkills, [skill]: value };
        setEditableSkills(next);
        if (onChange) onChange(next);
    };

    const labels = Object.keys(editableSkills);
    const playerDataset = {
        label: 'Player Skills',
        data: Object.values(editableSkills),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
    };

    const avgValues = labels.map((k) => (averages?.[k] ?? compare?.[k] ?? 0));
    const datasets: any[] = [playerDataset];
    if ((averages && Object.keys(averages).length) || (compare && Object.keys(compare).length)) {
        datasets.push({
            label: 'Average Skills',
            data: avgValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
        });
    }

    const radarData = { labels, datasets };

    return (
        <div className="skill-radar">
            <div style={{ maxWidth: 520, width: '100%' }}>
                <Radar data={radarData} />
            </div>
            {editable && (
                <div className="skill-sliders">
                    {Object.keys(editableSkills).map((skill) => (
                        <div key={skill} className="skill-slider">
                            <label htmlFor={skill}>{skill}</label>
                            <input
                                id={skill}
                                type="range"
                                min={1}
                                max={10}
                                value={editableSkills[skill]}
                                onChange={(e) => handleSkillChange(skill, Number(e.target.value))}
                                aria-label={`${skill} skill`}
                                aria-valuemin={1}
                                aria-valuemax={10}
                                aria-valuenow={editableSkills[skill]}
                                tabIndex={0}
                            />
                            <div className="skill-value">{editableSkills[skill]}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillRadar;
