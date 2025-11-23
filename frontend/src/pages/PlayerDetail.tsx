import { useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import SkillRadar from '../components/players/SkillRadar';
import PlayerHeader from '../components/players/PlayerHeader';
import MatchesList from '../components/players/MatchesList';
import Toast from '../components/common/Toast';
import { usePlayer, usePlayerMatches, usePlayerSkills, useSavePlayerSkills } from '../hooks/useQueries';
import { useAppStore } from '../stores/useAppStore';
import './PlayerDetail.css';

const MOCK_AVERAGE = {
    Passing: 6,
    Dribbling: 5,
    Speed: 7,
    Strength: 6,
    Vision: 6,
    Defending: 5,
};

interface PlayerDetailProps {
    playerId?: string;
    playerName?: string;
    teamName?: string;
}

const PlayerDetail: FC<PlayerDetailProps> = ({ playerId: propPlayerId, playerName: propPlayerName, teamName: propTeamName }) => {
    const params = useParams();
    const playerId = propPlayerId ?? params.playerId;

    // Use Zustand to track the currently selected player
    const { setSelectedPlayerId } = useAppStore();

    // Use React Query hooks for data fetching
    const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(playerId || '');
    const { data: matches = [], isLoading: matchesLoading, error: matchesError } = usePlayerMatches(playerId || '');
    const { data: skillsData, isLoading: skillsLoading, error: skillsError } = usePlayerSkills(playerId || '');
    const saveSkillsMutation = useSavePlayerSkills(playerId || '');

    const [skills, setSkills] = useState<Record<string, number>>(MOCK_AVERAGE);
    const [comparisonMode, setComparisonMode] = useState<'overlay' | 'sideBySide'>('overlay');
    const [showComparison, setShowComparison] = useState(true);
    const [toastConfig, setToastConfig] = useState<{
        show: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
    }>({ show: false, type: 'success', message: '' });

    // Combine loading and error states
    const loading = playerLoading || matchesLoading;
    const error = playerError || matchesError;

    // Update global state when player changes
    useEffect(() => {
        if (playerId) {
            setSelectedPlayerId(playerId);
        }
        return () => setSelectedPlayerId(null); // Clean up on unmount
    }, [playerId, setSelectedPlayerId]);

    // Set breadcrumbs when player data is available
    const { setBreadcrumbs, selectedMatchId, selectedMatchTitle } = useAppStore();
    useEffect(() => {
        if (player) {
            const playerName = `${player.fname ?? ''} ${player.lname ?? ''}`.trim() || `Player ${playerId}`;
            const breadcrumbPath = selectedMatchId && selectedMatchTitle
                ? [
                    { label: 'Matches', path: '/matches', icon: '⚽' },
                    { label: selectedMatchTitle, path: `/matches/${selectedMatchId}`, icon: '🏆' },
                    { label: playerName, icon: '👤', isActive: true }
                ]
                : [
                    { label: 'Matches', path: '/matches', icon: '⚽' },
                    { label: playerName, icon: '👤', isActive: true }
                ];
            setBreadcrumbs(breadcrumbPath);
        } else if (playerId) {
            // Set breadcrumbs even without player data
            const playerDisplayName = propPlayerName || `Player ${playerId}`;
            const breadcrumbPath = selectedMatchId && selectedMatchTitle
                ? [
                    { label: 'Matches', path: '/matches', icon: '⚽' },
                    { label: selectedMatchTitle, path: `/matches/${selectedMatchId}`, icon: '🏆' },
                    { label: playerDisplayName, icon: '👤', isActive: true }
                ]
                : [
                    { label: 'Matches', path: '/matches', icon: '⚽' },
                    { label: playerDisplayName, icon: '👤', isActive: true }
                ];
            setBreadcrumbs(breadcrumbPath);
        }

        return () => setBreadcrumbs([]); // Clean up on unmount
    }, [player, playerId, propPlayerName, selectedMatchId, selectedMatchTitle, setBreadcrumbs]);

    // Update skills when data is loaded
    useEffect(() => {
        if (skillsData) {
            // Use skills from API if available
            setSkills(skillsData);
        } else if (player?.stats) {
            // Extract skills from player stats if available
            const next: Record<string, number> = { ...MOCK_AVERAGE };
            Object.keys(next).forEach((key) => {
                const keyLower = key.toLowerCase();
                if (player.stats[keyLower] !== undefined) {
                    next[key] = Number(player.stats[keyLower]);
                }
            });
            setSkills(next);
        } else {
            // Use default mock skills
            setSkills(MOCK_AVERAGE);
        }
    }, [skillsData, player]);

    // Handle saving skills
    const handleSaveSkills = async (skillsToSave: Record<string, number>) => {
        if (import.meta.env.DEV) {
            console.log('handleSaveSkills called with:', skillsToSave);
            console.log('saveSkillsMutation status:', {
                isPending: saveSkillsMutation.isPending,
                isError: saveSkillsMutation.isError,
                isSuccess: saveSkillsMutation.isSuccess,
            });
        }

        try {
            if (import.meta.env.DEV) {
                console.log('Calling saveSkillsMutation.mutateAsync');
            }
            const result = await saveSkillsMutation.mutateAsync(skillsToSave);
            if (import.meta.env.DEV) {
                console.log('Save result:', result);
            }

            setToastConfig({
                show: true,
                type: 'success',
                message: 'Skills saved successfully! Changes have been stored locally and will sync when the server is available.'
            });
        } catch (error) {
            console.error('Failed to save skills:', error);
            setToastConfig({
                show: true,
                type: 'error',
                message: 'Failed to save skills. Please check your connection and try again.'
            });
            throw error; // Re-throw so the component knows save failed
        }
    };

    // Handle closing toast
    const handleCloseToast = () => {
        setToastConfig(prev => ({ ...prev, show: false }));
    };

    if (loading) {
        return (
            <div className="player-detail-container">
                <div className="loading">Loading player…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="player-detail-container">
                <div className="error-message">
                    <h3>Error loading player</h3>
                    <p>{error instanceof Error ? error.message : 'Failed to load player data'}</p>
                </div>
            </div>
        );
    }

    // Fallback data if player not found
    const playerName = player
        ? `${player.fname ?? ''} ${player.lname ?? ''}`.trim()
        : (propPlayerName || `Player ${playerId}`);
    const playerPosition = player?.position || 'Unknown Position';
    const playerTeam = player?.team_label || propTeamName || 'Unknown Team';
    const playerDOB = player?.date_of_birth || player?.dob;

    return (
        <div className="player-detail-container">
            {/* Full-width header section */}
            <div className="player-header-section">
                <div className="player-header-content">
                    <PlayerHeader
                        name={playerName}
                        position={playerPosition}
                        team={playerTeam}
                        dateOfBirth={playerDOB}
                    />
                </div>
            </div>

            {/* Main content area */}
            <div className="player-content-wrapper">
                <div className="player-content">
                    {/* Skills section */}
                    <div className="content-section skills-section">
                        <div className="skills-header">
                            <h2 className="section-title">Player Skills</h2>
                            <div className="skill-controls-header">
                                <label className="toggle-container">
                                    <input
                                        type="checkbox"
                                        checked={showComparison}
                                        onChange={(e) => setShowComparison(e.target.checked)}
                                    />
                                    <span>Show League Average</span>
                                </label>
                                {showComparison && (
                                    <select
                                        value={comparisonMode}
                                        onChange={(e) => setComparisonMode(e.target.value as 'overlay' | 'sideBySide')}
                                        className="comparison-mode-select"
                                    >
                                        <option value="overlay">Overlay View</option>
                                        <option value="sideBySide">Side by Side</option>
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="skills-content">
                            <SkillRadar
                                skills={skills}
                                editable={true}
                                onSave={handleSaveSkills}
                                compare={MOCK_AVERAGE}
                                isLoading={skillsLoading}
                                isSaving={saveSkillsMutation.isPending}
                                showComparison={showComparison}
                                comparisonMode={comparisonMode}
                            />
                        </div>
                        {skillsError && (
                            <div className="skills-error">
                                <p>⚠️ Skills data could not be loaded. Using default values.</p>
                            </div>
                        )}
                    </div>

                    {/* Match History */}
                    <div className="content-section matches-section">
                        <h2 className="section-title">Match History</h2>
                        <div className="matches-content">
                            <MatchesList matches={matches} />
                        </div>
                    </div>

                    {!player && (
                        <div className="content-section">
                            <div className="no-data-message">
                                <h3>Player data not found</h3>
                                <p>Showing placeholder information with default skills.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast notifications */}
            {toastConfig.show && (
                <Toast
                    type={toastConfig.type}
                    message={toastConfig.message}
                    onClose={handleCloseToast}
                />
            )}
        </div>
    );
};

export default PlayerDetail;
