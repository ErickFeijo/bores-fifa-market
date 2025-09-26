import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- DADOS MOCK (MOCK DATA) ---

const players = [
    { id: 1, name: "Kylian Mbappé", position: "ST", stats: { PAC: 97, SHO: 90, PAS: 80, DRI: 92, DEF: 36, PHY: 78 } },
    { id: 2, name: "Erling Haaland", position: "ST", stats: { PAC: 89, SHO: 96, PAS: 65, DRI: 80, DEF: 45, PHY: 94 } },
    { id: 3, name: "Kevin De Bruyne", position: "CAM", stats: { PAC: 72, SHO: 88, PAS: 94, DRI: 87, DEF: 64, PHY: 74 } },
    { id: 4, name: "Jude Bellingham", position: "CAM", stats: { PAC: 80, SHO: 85, PAS: 84, DRI: 91, DEF: 82, PHY: 88 } },
    { id: 5, name: "Virgil van Dijk", position: "CB", stats: { PAC: 81, SHO: 60, PAS: 71, DRI: 72, DEF: 91, PHY: 88 } },
    { id: 6, name: "Rúben Dias", position: "CB", stats: { PAC: 62, SHO: 39, PAS: 67, DRI: 69, DEF: 90, PHY: 89 } },
    { id: 7, name: "Alisson Becker", position: "GK", stats: { DIV: 89, HAN: 86, KIC: 85, REF: 91, SPD: 58, POS: 89 } },
    { id: 8, name: "Thibaut Courtois", position: "GK", stats: { DIV: 85, HAN: 89, KIC: 76, REF: 90, SPD: 46, POS: 87 } },
    { id: 9, name: "Lionel Messi", position: "CAM", stats: { PAC: 80, SHO: 87, PAS: 90, DRI: 94, DEF: 33, PHY: 64 } },
    { id: 10, name: "Cristiano Ronaldo", position: "ST", stats: { PAC: 77, SHO: 92, PAS: 75, DRI: 81, DEF: 34, PHY: 75 } },
];

const defaultWeights = {
    ST: { PAC: 0.25, SHO: 0.35, PAS: 0.05, DRI: 0.15, DEF: 0.05, PHY: 0.15 },
    CAM: { PAC: 0.15, SHO: 0.20, PAS: 0.30, DRI: 0.25, DEF: 0.05, PHY: 0.05 },
    CB: { PAC: 0.10, SHO: 0.05, PAS: 0.10, DRI: 0.10, DEF: 0.40, PHY: 0.25 },
    GK: { DIV: 0.20, HAN: 0.20, KIC: 0.10, REF: 0.25, SPD: 0.05, POS: 0.20 },
};

const STAT_NAMES = {
    PAC: "Ritmo", SHO: "Chute", PAS: "Passe", DRI: "Drible", DEF: "Defesa", PHY: "Físico",
    DIV: "Mergulho", HAN: "Manejo", KIC: "Chute (GK)", REF: "Reflexos", SPD: "Velocidade (GK)", POS: "Posicionamento",
};


// --- FUNÇÕES AUXILIARES (HELPER FUNCTIONS) ---

const calculateMarketValue = (player, weightsConfig) => {
    if (!player || !weightsConfig[player.position]) return 0;

    const baseValue = 500000;
    const positionWeights = weightsConfig[player.position];
    let weightedScore = 0;

    for (const stat in player.stats) {
        if (positionWeights[stat]) {
            weightedScore += player.stats[stat] * positionWeights[stat];
        }
    }
    
    // Formula to make the value exponential and look more realistic
    const marketValue = baseValue * Math.pow(weightedScore / 60, 4);
    
    return Math.round(marketValue / 100000) * 100000;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
};

const getStatValueClass = (value) => {
    if (value >= 90) return 'value-high';
    if (value >= 80) return 'value-mid';
    return 'value-low';
};


// --- COMPONENTES (COMPONENTS) ---

const ConfigScreen = ({ weights, setWeights, onBack }) => {
    const [localWeights, setLocalWeights] = useState(weights);
    const [selectedPosition, setSelectedPosition] = useState(Object.keys(localWeights)[0]);

    const handleWeightChange = (stat, value) => {
        const newWeights = { ...localWeights };
        newWeights[selectedPosition][stat] = parseFloat(value);
        setLocalWeights(newWeights);
    };

    const handleSave = () => {
        setWeights(localWeights);
        onBack();
        alert("Pesos salvos com sucesso!");
    };
    
    const handleReset = () => {
        if(confirm("Tem certeza que deseja redefinir os pesos para o padrão?")) {
            setLocalWeights(defaultWeights);
        }
    }

    const currentWeights = localWeights[selectedPosition];

    return (
        <div className="app-container">
            <header className="header">
                <h1>Configurar Pesos dos Atributos</h1>
                <button className="btn" onClick={onBack}>Voltar</button>
            </header>
            <div className="config-screen">
                <div className="config-header">
                    <select 
                        className="position-selector"
                        value={selectedPosition} 
                        onChange={(e) => setSelectedPosition(e.target.value)}
                    >
                        {Object.keys(localWeights).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                    <div>
                        <button className="btn" onClick={handleReset} style={{marginRight: '1rem', backgroundColor: '#c9302c'}}>Redefinir</button>
                        <button className="btn" onClick={handleSave}>Salvar e Voltar</button>
                    </div>
                </div>

                <div className="weights-container">
                    {Object.entries(currentWeights).map(([stat, weight]) => (
                        <div key={stat} className="weight-item">
                            <label>
                                <span>{STAT_NAMES[stat]}</span>
                                {/* FIX: Explicitly convert weight to a number before multiplication to satisfy TypeScript's type checker. */}
                                <span>{(Number(weight) * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={weight}
                                onChange={(e) => handleWeightChange(stat, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PlayerScreen = ({ weights, onConfigure }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(players[0]); // Start with a player selected

    const filteredPlayers = useMemo(() => {
        if (!searchQuery) return players; // Show all if search is empty
        return players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    const marketValue = useMemo(() => {
        return selectedPlayer ? calculateMarketValue(selectedPlayer, weights) : 0;
    }, [selectedPlayer, weights]);

    return (
        <div className="app-container">
            <header className="header">
                <h1>Calculadora de Valor de Mercado</h1>
                <button className="btn" onClick={onConfigure}>Configurar Pesos</button>
            </header>
            
            <main className="player-screen">
                <div className="search-panel">
                    <input
                        type="text"
                        placeholder="Pesquisar jogador..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="search-results">
                        {filteredPlayers.map(player => (
                            <div
                                key={player.id}
                                className={`search-result-item ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPlayer(player)}
                            >
                                <p>{player.name}</p>
                                <span>{player.position}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="player-details-panel">
                    {!selectedPlayer ? (
                        <div className="placeholder">
                            <p>Pesquise e selecione um jogador para ver os detalhes</p>
                        </div>
                    ) : (
                        <div className="player-card">
                            <div className="player-card-header">
                                <h2>{selectedPlayer.name}</h2>
                                <p>{selectedPlayer.position}</p>
                            </div>

                            <div className="market-value">
                                <h3>Valor de Mercado Calculado</h3>
                                <p>{formatCurrency(marketValue)}</p>
                            </div>

                            <div className="stats-grid">
                                {Object.entries(selectedPlayer.stats).map(([stat, value]) => (
                                    <div key={stat} className="stat-item">
                                        <span className="name">{STAT_NAMES[stat]}</span>
                                        <span className={`value ${getStatValueClass(value)}`}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};


const App = () => {
    const [view, setView] = useState('player'); // 'player' or 'config'
    const [weights, setWeights] = useState(defaultWeights);

    useEffect(() => {
        const savedWeights = localStorage.getItem('fifaValueWeights');
        if (savedWeights) {
            try {
                const parsed = JSON.parse(savedWeights);
                if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
                     setWeights(parsed);
                }
            } catch (error) {
                console.error("Failed to parse weights from localStorage", error);
                localStorage.removeItem('fifaValueWeights');
            }
        }
    }, []);

    const handleSetWeights = (newWeights) => {
        setWeights(newWeights);
        localStorage.setItem('fifaValueWeights', JSON.stringify(newWeights));
    }

    if (view === 'config') {
        return <ConfigScreen 
            weights={weights}
            setWeights={handleSetWeights}
            onBack={() => setView('player')}
        />
    }

    return <PlayerScreen 
        weights={weights} 
        onConfigure={() => setView('config')}
    />;
};


// --- RENDERIZAÇÃO (RENDER) ---
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
