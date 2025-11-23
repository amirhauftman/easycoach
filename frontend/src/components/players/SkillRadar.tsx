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

export interface SkillData {
    [key: string]: number;
}

interface SkillRadarProps {
    skills: SkillData;
    averages?: SkillData;
    editable?: boolean;
    onSave?: (skills: SkillData) => Promise<void>;
    compare?: SkillData | null;
    isLoading?: boolean;
    isSaving?: boolean;
    showComparison?: boolean;
    comparisonMode?: 'overlay' | 'sideBySide';
}

const SkillRadar: React.FC<SkillRadarProps> = ({
    skills,
    averages,
    editable = false,
    onSave,
    compare = null,
    isLoading = false,
    isSaving = false,
    showComparison = false,
    comparisonMode = 'overlay'
}) => {
    const [editableSkills, setEditableSkills] = useState<SkillData>(skills);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        // Only reset editable skills if we're not currently editing (no unsaved changes)
        // This prevents losing the unsaved flag when parent re-renders
        if (!hasUnsavedChanges) {
            setEditableSkills(skills);
        }
    }, [skills, hasUnsavedChanges]);

    const handleSkillChange = (skill: string, value: number) => {
        console.log(`Skill changed: ${skill} = ${value}`);
        const next = { ...editableSkills, [skill]: value };
        setEditableSkills(next);
        setHasUnsavedChanges(true);
        console.log('Has unsaved changes set to true');
        // Don't call onChange during editing - only call it on reset to sync with parent
    };

    const handleSave = async () => {
        console.log('Save button clicked. Has unsaved changes:', hasUnsavedChanges);
        if (onSave && hasUnsavedChanges) {
            try {
                console.log('Attempting to save skills:', editableSkills);
                await onSave(editableSkills);
                setHasUnsavedChanges(false);
                console.log('Skills saved successfully');
            } catch (error) {
                console.error('Failed to save skills:', error);
            }
        } else if (!hasUnsavedChanges) {
            console.log('No changes to save');
        } else if (!onSave) {
            console.log('No onSave function provided');
        }
    };

    const labels = Object.keys(editableSkills);

    // Create the player dataset
    const playerDataset = {
        label: 'Player Skills',
        data: Object.values(editableSkills),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
    };

    // Create comparison dataset
    const comparisonData = compare || averages;
    const datasets: any[] = [playerDataset];

    if (showComparison && comparisonData && Object.keys(comparisonData).length > 0) {
        const comparisonValues = labels.map((k) => comparisonData[k] ?? 0);
        datasets.push({
            label: 'League Average',
            data: comparisonValues,
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
        });
    }

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 1,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                pointLabels: {
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: showComparison && datasets.length > 1,
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `${context.dataset.label}: ${context.raw}/10`;
                    },
                },
            },
        },
    };

    const radarData = { labels, datasets };

    if (isLoading) {
        return (
            <div className="skill-radar">
                <div className="loading-placeholder">Loading skills...</div>
            </div>
        );
    }

    return (
        <div className="skill-radar">
            {comparisonMode === 'sideBySide' && showComparison && comparisonData ? (
                <div className="radar-comparison">
                    <div className="radar-section">
                        <h4>Player Skills</h4>
                        <div className="radar-container">
                            <Radar
                                data={{
                                    labels,
                                    datasets: [playerDataset]
                                }}
                                options={radarOptions}
                            />
                        </div>
                    </div>
                    <div className="radar-section">
                        <h4>League Average</h4>
                        <div className="radar-container">
                            <Radar
                                data={{
                                    labels,
                                    datasets: [{
                                        ...datasets[1],
                                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    }]
                                }}
                                options={radarOptions}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="radar-container">
                    <Radar data={radarData} options={radarOptions} />
                </div>
            )}

            {editable && (
                <div className="skill-controls">
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
                                    disabled={isSaving}
                                />
                                <div className="skill-value">{editableSkills[skill]}</div>
                            </div>
                        ))}
                    </div>

                    {onSave && (
                        <div className="skill-actions">
                            <button
                                onClick={() => {
                                    console.log('Save button clicked. State:', {
                                        hasUnsavedChanges,
                                        isSaving,
                                        onSave: !!onSave,
                                        buttonDisabled: !hasUnsavedChanges || isSaving
                                    });
                                    handleSave();
                                }}
                                disabled={!hasUnsavedChanges || isSaving}
                                className={`save-btn ${hasUnsavedChanges ? 'has-changes' : ''}`}
                            >
                                {isSaving ? 'Saving...' : 'Save Skills'}
                            </button>
                            {hasUnsavedChanges && (
                                <span className="unsaved-indicator">● Unsaved changes</span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SkillRadar;
