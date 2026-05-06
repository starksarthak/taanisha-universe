const { motion, AnimatePresence } = window.Motion;
const { useState, useEffect, useRef, useMemo } = React;

// --- ADVANCED AUDIO ENGINE (Howler.js) ---
const audioManager = {
    tracks: {
        raabta: new Howl({ src: ['raabta.mp3'], loop: true, sprite: { main: [8000, 34000] }, volume: 1.0 }),
        ilikemebetter: new Howl({ src: ['ilikemebetter.mp3'], loop: true, sprite: { main: [12000, 28000] }, volume: 0.25 }),
        untilifoundyou: new Howl({ src: ['her.mp3'], loop: true, sprite: { main: [27000, 60000] }, volume: 1.0 }),
        perfect: new Howl({ src: ['sanchez.mp3'], loop: true, sprite: { main: [30000, 60000] }, volume: 0.5 }),
        kesariya: new Howl({ src: ['kesariya.mp3'], loop: true, sprite: { main: [18000, 27000] }, volume: 0.15 }),
        tumhiho: new Howl({ src: ['kannathil_muthamittal.mp3'], loop: false, sprite: { main: [36000, 60000] }, volume: 1.0 })
    },
    sfx: {
        whoosh: new Howl({ src: ['whoosh.mp3'], volume: 0.5 }),
        sparkle: new Howl({ src: ['sparkle.mp3'], volume: 0.7 }),
        chime: new Howl({ src: ['chime.mp3'], volume: 0.8 }),
        heartbeat: new Howl({ src: ['heartbeat.mp3'], volume: 1.0 })
    },
    currentTrack: null,
    isPlaying: false,

    getTargetVolume: function(trackName) {
        if (trackName === 'ilikemebetter') return 0.25;
        if (trackName === 'kesariya') return 0.15;
        if (trackName === 'perfect') return 0.5;
        return 1.0;
    },

    playTrack: function(trackName) {
        if (!this.isPlaying) {
            this.currentTrack = trackName;
            return;
        }
        
        if (this.currentTrack === trackName) return;

        // Fade out current track
        if (this.currentTrack && this.tracks[this.currentTrack]) {
            const oldTrack = this.tracks[this.currentTrack];
            oldTrack.fade(oldTrack.volume(), 0, 2000);
            setTimeout(() => oldTrack.stop(), 2000);
        }

        this.currentTrack = trackName;
        
        if (trackName === 'silence') return;

        // Fade in new track
        const newTrack = this.tracks[trackName];
        if (newTrack) {
            newTrack.volume(0);
            newTrack.play('main');
            newTrack.fade(0, this.getTargetVolume(trackName), 2000);
        }
    },
    
    toggleGlobalPlay: function() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying && this.currentTrack && this.currentTrack !== 'silence') {
            const track = this.tracks[this.currentTrack];
            track.volume(0);
            track.play('main');
            track.fade(0, this.getTargetVolume(this.currentTrack), 2000);
        } else {
            Howler.stop(); // Stop everything
        }
        return this.isPlaying;
    },

    playSFX: function(name) {
        if (this.isPlaying && this.sfx[name]) {
            this.sfx[name].play();
        }
    },

    dipVolume: function(trackName, dipDurationMs) {
        if (!this.isPlaying || this.currentTrack !== trackName) return;
        const track = this.tracks[trackName];
        if (track) {
            const target = this.getTargetVolume(trackName);
            track.fade(target, target * 0.3, 1000); // Dip down
            setTimeout(() => {
                track.fade(track.volume(), target, 1000); // Restore
            }, dipDurationMs);
        }
    },

    riseVolume: function(trackName, newVolume) {
        if (!this.isPlaying || this.currentTrack !== trackName) return;
        const track = this.tracks[trackName];
        if (track) {
            track.fade(track.volume(), newVolume, 2000);
        }
    }
};

const AudioToggle = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        setIsPlaying(audioManager.toggleGlobalPlay());
    };

    return (
        <button 
            onClick={togglePlay}
            className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-sans text-sm hover:bg-white/20 transition-colors"
        >
            {isPlaying ? '🔊 Playing' : '🔇 Muted'}
        </button>
    );
};

// --- SECRET UNIVERSE (Easter Egg) ---
const SecretUniverse = ({ onClose, stage }) => {
    useEffect(() => {
        audioManager.playTrack('silence'); // Faint/no music for secret
        return () => {
            // Restore previous track when closing
            const tracks = ['raabta', 'ilikemebetter', 'untilifoundyou', 'perfect', 'kesariya', 'tumhiho'];
            audioManager.playTrack(tracks[stage] || 'raabta');
        };
    }, [stage]);

    const messages = [
        "Even before the magic started, you were my spark. ✨",
        "You melted my walls before I even knew they were there. ❄️",
        "In an ocean of people, my eyes always look for you. 🌊",
        "True magic isn't in castles, it's in the way you smile at me. 🌹",
        "Of all the stars in all the skies, you're the only one I wish upon. 🌟",
        "Behind all the magic, all the lights, and all the universes... it's always just been you. ❤️"
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 cursor-default"
        >
            <div className="max-w-2xl text-center space-y-8">
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 2 }}
                    className="text-white/90 font-serif text-3xl italic tracking-wide leading-relaxed text-magic"
                >
                    "{messages[stage]}"
                </motion.p>
                
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 4 }}
                    onClick={onClose}
                    className="mt-12 text-white/40 hover:text-white transition-colors text-sm border-b border-white/20 pb-1"
                >
                    Return to the magic
                </motion.button>
            </div>
        </motion.div>
    );
};

// --- PAGE TRANSITION WRAPPER ---
const PageWrapper = ({ children, bgClass = "bg-black", cursorClass = "cursor-default", stage = 0 }) => {
    const variants = {
        0: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 1.2, opacity: 0 } }, 
        1: { initial: { x: "100%", filter: "blur(15px)" }, animate: { x: 0, filter: "blur(0px)" }, exit: { x: "-100%", filter: "blur(15px)", opacity: 0 } }, 
        2: { initial: { y: "30%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "-30%", opacity: 0 } }, 
        3: { initial: { scale: 1.1, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 } }, 
        4: { initial: { x: "50%", scale: 0.9, opacity: 0 }, animate: { x: 0, scale: 1, opacity: 1 }, exit: { x: "-50%", scale: 1.1, opacity: 0 } }, 
        5: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }, 
    };

    const v = variants[stage] || variants[0];

    useEffect(() => {
        // Play whoosh on enter
        if(stage > 0) audioManager.playSFX('whoosh');
    }, [stage]);

    return (
        <motion.div
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }} 
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center ${bgClass} ${cursorClass} overflow-hidden`}
        >
            {children}
        </motion.div>
    );
};

// --- UNIVERSE 1: FAIRY BEGINNING (Rapunzel) ---
const Universe1 = ({ onNext, stage }) => {
    const [litLanterns, setLitLanterns] = useState([]);
    const [eggFound, setEggFound] = useState(false);
    const [panFound, setPanFound] = useState(false);
    
    useEffect(() => {
        audioManager.playTrack('raabta');
    }, []);

    const lanterns = [
        { id: 1, x: 15, y: 20 }, { id: 2, x: 80, y: 15 },
        { id: 3, x: 15, y: 70 }, { id: 4, x: 85, y: 65 }, { id: 5, x: 50, y: 85 }
    ];

    const lightLantern = (id) => {
        if (!litLanterns.includes(id)) {
            setLitLanterns([...litLanterns, id]);
            audioManager.playSFX('sparkle');
        }
        if (litLanterns.length === 4) {
            audioManager.playSFX('chime'); // Game win
        }
    };

    const handleEgg = () => {
        setEggFound(true);
        audioManager.playSFX('sparkle');
    };

    return (
        <PageWrapper stage={stage} bgClass="bg-gradient-to-br from-[#2a1b4d] to-[#120b22]" cursorClass="cursor-lantern">
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 text-center space-y-6 max-w-2xl px-6 pointer-events-none">
                <motion.h1 className="text-5xl md:text-7xl font-serif text-yellow-100 text-magic">
                    A Fairy Beginning
                </motion.h1>
                <p className="text-xl font-handwriting text-yellow-200/80">Every great story starts with a single light...</p>
                
                <div className="mt-8 pointer-events-auto">
                    {litLanterns.length < 5 ? (
                        <p className="text-sm font-sans uppercase tracking-widest text-yellow-300/50 animate-pulse">
                            Click to light the {5 - litLanterns.length} lanterns
                        </p>
                    ) : (
                        <motion.button 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            onClick={onNext}
                            className="px-8 py-3 bg-yellow-600/30 text-yellow-100 border border-yellow-400/50 rounded-full font-sans uppercase tracking-widest text-sm hover:bg-yellow-600/50 transition-colors shadow-[0_0_20px_rgba(253,224,71,0.3)]"
                        >
                            Enter Next Universe ➔
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Lanterns */}
            {lanterns.map(l => (
                <motion.div
                    key={l.id}
                    className={`absolute text-4xl transition-all duration-500 cursor-pointer ${litLanterns.includes(l.id) ? 'scale-125 drop-shadow-[0_0_15px_#fde047]' : 'scale-75 opacity-50 grayscale'}`}
                    style={{ left: `${l.x}%`, top: `${l.y}%` }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 + (l.id % 2) }}
                    onClick={() => lightLantern(l.id)}
                >
                    🏮
                </motion.div>
            ))}

            {/* Frying Pan */}
            <div className="absolute top-10 right-20 z-20">
                <motion.div 
                    onClick={() => { setPanFound(true); audioManager.playSFX('sparkle'); }}
                    className="cursor-pointer text-4xl hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                    animate={panFound ? { rotate: [0, -20, 20, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                >
                    🍳
                </motion.div>
                <AnimatePresence>
                    {panFound && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-full right-0 mt-2 bg-yellow-900/60 backdrop-blur-md px-3 py-1 rounded-lg border border-yellow-500/30 w-32 text-center"
                        >
                            <p className="text-yellow-200 font-handwriting text-sm">"My favorite weapon!"</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Easter Egg Character */}
            <div className="absolute bottom-10 right-10 z-20">
                <motion.div 
                    onClick={handleEgg}
                    className="cursor-pointer text-5xl hover:scale-110 transition-transform"
                    animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                >
                    🦎
                </motion.div>
                <AnimatePresence>
                    {eggFound && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute bottom-full right-0 mb-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 w-48 text-center"
                        >
                            <p className="text-yellow-100 font-handwriting text-lg">"Sarthak loves Taanisha so much ❤️"</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <AnimatePresence>
                {eggFound && (
                    <motion.div className="absolute inset-0 pointer-events-none" initial={{opacity:1}} animate={{opacity:0}} transition={{duration: 2}}>
                        {[...Array(10)].map((_, i) => (
                            <motion.div key={i} className="absolute text-2xl"
                                initial={{ x: '50vw', y: '50vh', scale: 0 }}
                                animate={{ x: `${Math.random()*100}vw`, y: `${Math.random()*100}vh`, scale: 2 }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            >💛</motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

// --- UNIVERSE 2: FROZEN WORLD ---
const Universe2 = ({ onNext, stage }) => {
    const [score, setScore] = useState(0);
    const [eggFound, setEggFound] = useState(false);
    const [carrotFound, setCarrotFound] = useState(false);
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        audioManager.playTrack('ilikemebetter');
    }, []);

    useEffect(() => {
        if (score >= 5) return;
        const interval = setInterval(() => {
            setHearts(prev => [...prev, { id: Date.now(), left: Math.random() * 80 + 10 }]);
        }, 800);
        return () => clearInterval(interval);
    }, [score]);

    const catchHeart = (id) => {
        setHearts(prev => prev.filter(h => h.id !== id));
        setScore(s => {
            const newScore = s + 1;
            audioManager.playSFX('sparkle');
            if (newScore === 5) audioManager.playSFX('chime'); // Game win
            return newScore;
        });
    };

    return (
        <PageWrapper stage={stage} bgClass="bg-gradient-to-b from-[#0b1b3d] to-[#1a365d]" cursorClass="cursor-snow">
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="snowflake" style={{ left: `${Math.random()*100}%`, animationDuration: `${Math.random()*3+2}s`, fontSize: `${Math.random()*0.5+0.5}rem` }}>❄</div>
                ))}
            </div>
            
            <AnimatePresence>
                {eggFound && (
                    <motion.div 
                        initial={{ opacity: 1, scale: 0.8 }} animate={{ opacity: 0, scale: 1.5 }} transition={{ duration: 1 }}
                        className="absolute inset-0 bg-blue-400/20 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="z-10 text-center space-y-6 max-w-2xl px-6 pointer-events-none">
                <motion.h1 className="text-5xl md:text-7xl font-serif text-blue-100 text-magic">Frozen World</motion.h1>
                <p className="text-xl font-handwriting text-blue-200/80">Some people are worth melting for...</p>
                
                <div className="mt-8 pointer-events-auto h-20">
                    {score < 5 ? (
                        <p className="text-sm font-sans uppercase tracking-widest text-blue-300/50 bg-black/40 px-4 py-2 rounded-full inline-block">
                            Catch the snow-hearts: {score}/5
                        </p>
                    ) : (
                        <motion.button 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={onNext}
                            className="px-8 py-3 bg-white/10 text-blue-100 border border-blue-300/50 rounded-full font-sans uppercase tracking-widest text-sm hover:bg-white/20 transition-colors backdrop-blur-md"
                        >
                            Step through the ice ➔
                        </motion.button>
                    )}
                </div>
            </div>

            {hearts.map(heart => (
                <motion.div
                    key={heart.id}
                    initial={{ top: '-10%', opacity: 0 }}
                    animate={{ top: '110%', opacity: 1 }}
                    transition={{ duration: 4, ease: 'linear' }}
                    onAnimationComplete={() => setHearts(prev => prev.filter(h => h.id !== heart.id))}
                    className="absolute text-4xl cursor-pointer z-10 hover:scale-125 transition-transform"
                    style={{ left: `${heart.left}%` }}
                    onClick={() => catchHeart(heart.id)}
                >
                    🤍
                </motion.div>
            ))}

            <div className="absolute bottom-5 right-20 z-20">
                <motion.div 
                    onClick={() => { setCarrotFound(true); audioManager.playSFX('sparkle'); }}
                    className="cursor-pointer text-4xl hover:scale-110 transition-transform opacity-70 hover:opacity-100"
                    animate={carrotFound ? { y: -30, rotate: 180 } : { y: 20 }}
                    transition={{ type: "spring" }}
                >
                    🥕
                </motion.div>
                <AnimatePresence>
                    {carrotFound && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: -40 }} exit={{ opacity: 0 }}
                            className="absolute bottom-full right-0 bg-orange-900/60 backdrop-blur-md px-3 py-1 rounded-lg border border-orange-400/30 w-32 text-center"
                        >
                            <p className="text-orange-200 font-handwriting text-sm">"Olaf says hi!"</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="absolute bottom-10 left-10 z-20">
                <motion.div 
                    onClick={() => { setEggFound(true); audioManager.playSFX('sparkle'); }}
                    className="cursor-pointer text-5xl hover:scale-110 transition-transform"
                    animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2 }}
                >
                    ⛄
                </motion.div>
                <AnimatePresence>
                    {eggFound && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute bottom-full left-0 mb-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 w-56 text-center"
                        >
                            <p className="text-blue-100 font-handwriting text-lg">"He misses you more than winter misses snow ❄️"</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

// --- UNIVERSE 3: MERMAID DREAM ---
const Universe3 = ({ onNext, stage }) => {
    const [foundShell, setFoundShell] = useState(false);
    const [eggFound, setEggFound] = useState(false);
    const [crabScuttling, setCrabScuttling] = useState(false);
    const targetShellIndex = 1;

    useEffect(() => {
        audioManager.playTrack('untilifoundyou');
        
        // Dip volume at ~15s for voice note
        const timer = setTimeout(() => {
            audioManager.dipVolume('untilifoundyou', 5000); // 5 seconds dip
        }, 15000);
        
        return () => clearTimeout(timer);
    }, []);

    const clickShell = (i) => {
        if (i === targetShellIndex) {
            setFoundShell(true);
            audioManager.playSFX('chime');
        } else {
            audioManager.playSFX('sparkle');
        }
    };

    return (
        <PageWrapper stage={stage} bgClass="bg-gradient-to-b from-[#065f7c] to-[#012836]" cursorClass="cursor-bubble">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="bubble" style={{ left: `${Math.random()*100}%`, width: `${Math.random()*30+10}px`, height: `${Math.random()*30+10}px`, animationDuration: `${Math.random()*5+3}s`, animationDelay: `${Math.random()*2}s` }}></div>
                ))}
            </div>

            <div className="z-10 text-center space-y-6 max-w-2xl px-6 pointer-events-none">
                <motion.h1 className="text-5xl md:text-7xl font-serif text-cyan-100 text-magic">Mermaid Dream</motion.h1>
                <p className="text-xl font-handwriting text-cyan-200/80">Deep down, it's always been you...</p>
                
                <div className="mt-12 flex justify-center gap-8 h-32 items-center pointer-events-auto">
                    {!foundShell ? (
                        [0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.1, y: -10 }}
                                onClick={() => clickShell(i)}
                                className="text-6xl cursor-pointer"
                            >
                                🐚
                            </motion.div>
                        ))
                    ) : (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4">
                            <div className="text-6xl animate-pulse">💖</div>
                            <button 
                                onClick={onNext}
                                className="px-8 py-3 bg-cyan-600/30 text-cyan-100 border border-cyan-400/50 rounded-full font-sans uppercase tracking-widest text-sm hover:bg-cyan-600/50 transition-colors"
                            >
                                Swim to next world ➔
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-10 left-32 z-20">
                <motion.div 
                    onClick={() => { setCrabScuttling(true); audioManager.playSFX('sparkle'); }}
                    className="cursor-pointer text-5xl hover:scale-110 transition-transform opacity-80"
                >
                    🪨
                </motion.div>
                {crabScuttling && (
                    <motion.div 
                        initial={{ x: 0, opacity: 1 }} 
                        animate={{ x: window.innerWidth + 100 }} 
                        transition={{ duration: 4, ease: "linear" }}
                        className="absolute bottom-0 left-0 text-3xl z-30"
                    >
                        🦀
                    </motion.div>
                )}
            </div>

            <div className="absolute top-20 right-10 z-20">
                <motion.div 
                    onClick={() => { setEggFound(true); audioManager.playSFX('sparkle'); }}
                    className="cursor-pointer text-5xl hover:scale-110 transition-transform"
                    animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                >
                    🧜‍♀️
                </motion.div>
                <AnimatePresence>
                    {eggFound && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-0 right-full mr-4 bg-cyan-900/40 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-400/30 w-48 text-center"
                        >
                            <p className="text-cyan-100 font-handwriting text-lg">"You are his favorite story 🌊"</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <AnimatePresence>
                {eggFound && (
                    <motion.div 
                        initial={{ opacity: 1, scale: 0 }} animate={{ opacity: 0, scale: 4 }} transition={{ duration: 1.5 }}
                        className="absolute top-20 right-10 w-32 h-32 rounded-full border-4 border-cyan-300/50 pointer-events-none"
                        style={{ transformOrigin: 'center' }}
                    />
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

// --- UNIVERSE 4: BEAUTY & LOVE (Castle) ---
const Universe4 = ({ onNext, stage }) => {
    const [spins, setSpins] = useState(0);
    const [eggFound, setEggFound] = useState(false);
    const [mirrorHovered, setMirrorHovered] = useState(false);

    useEffect(() => {
        audioManager.playTrack('perfect');
    }, []);

    const spinRose = () => {
        setSpins(s => {
            const nextSpins = s + 1;
            audioManager.playSFX('sparkle');
            if(nextSpins === 1) audioManager.playSFX('chime'); // win
            return nextSpins;
        });
    };

    return (
        <PageWrapper stage={stage} bgClass="bg-gradient-to-br from-[#4a0404] to-[#1a0000]" cursorClass="cursor-wand">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent"></div>

            <div className="z-10 text-center space-y-6 max-w-2xl px-6 pointer-events-none">
                <motion.h1 className="text-5xl md:text-7xl font-serif text-rose-200 text-magic">Beauty & Love</motion.h1>
                <p className="text-xl font-handwriting text-rose-300/80">Tale as old as time...</p>
                
                <div className="mt-12 flex flex-col items-center gap-8 h-48 justify-center pointer-events-auto">
                    <motion.div
                        animate={{ rotate: spins * 180 }}
                        transition={{ type: "spring", stiffness: 50 }}
                        onClick={spinRose}
                        className="text-8xl cursor-pointer drop-shadow-[0_0_20px_rgba(225,29,72,0.6)]"
                    >
                        🌹
                    </motion.div>
                    
                    {spins === 0 ? (
                        <p className="text-sm font-sans uppercase tracking-widest text-rose-400/50 animate-pulse">
                            Spin the rose to reveal the magic
                        </p>
                    ) : (
                        <motion.button 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onNext}
                            className="px-8 py-3 bg-rose-900/50 text-rose-100 border border-rose-500/50 rounded-full font-sans uppercase tracking-widest text-sm hover:bg-rose-800 transition-colors"
                        >
                            Open the castle doors ➔
                        </motion.button>
                    )}
                </div>
            </div>

            <div className="absolute top-20 left-20 z-20">
                <motion.div 
                    onMouseEnter={() => setMirrorHovered(true)}
                    onMouseLeave={() => setMirrorHovered(false)}
                    className="cursor-pointer text-6xl hover:scale-110 transition-transform relative"
                >
                    🪞
                    <AnimatePresence>
                        {mirrorHovered && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center text-3xl"
                            >
                                💖
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <div className="absolute bottom-10 center-x z-20" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                <div className="flex flex-col items-center">
                    <AnimatePresence>
                        {eggFound && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mb-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-rose-500/30 text-center min-w-[250px]"
                            >
                                <p className="text-rose-200 font-handwriting text-xl">"He fell for you slowly… and then all at once 🥀"</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.div 
                        onClick={() => { setEggFound(true); audioManager.playSFX('sparkle'); }}
                        className="cursor-pointer text-5xl hover:scale-110 transition-transform"
                        animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                    >
                        🕰️
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {eggFound && (
                    <motion.div className="absolute inset-0 pointer-events-none" initial={{opacity:1}} animate={{opacity:0}} transition={{duration: 2}}>
                        {[...Array(20)].map((_, i) => (
                            <motion.div key={i} className="absolute text-2xl text-rose-500"
                                initial={{ x: '50vw', y: '80vh', scale: 0, rotate: 0 }}
                                animate={{ x: `${Math.random()*100}vw`, y: `${Math.random()*100}vh`, scale: 1, rotate: 360 }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            >✿</motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

// --- UNIVERSE 5: DREAM SKY WORLD ---
const Universe5 = ({ onNext, stage }) => {
    const [connected, setConnected] = useState([]);
    const [eggFound, setEggFound] = useState(false);
    const [starShooting, setStarShooting] = useState(false);

    useEffect(() => {
        audioManager.playTrack('perfect'); // Continue playing Stephen Sanchez
    }, []);

    const stars = [
        { id: 1, x: 30, y: 30 }, { id: 2, x: 50, y: 45 }, { id: 3, x: 70, y: 30 },
        { id: 4, x: 80, y: 50 }, { id: 5, x: 50, y: 80 }, { id: 6, x: 20, y: 50 }
    ];

    const connectStar = (id) => {
        if (!connected.includes(id)) {
            const nextConnected = [...connected, id];
            setConnected(nextConnected);
            audioManager.playSFX('sparkle');
            if(nextConnected.length === stars.length) {
                audioManager.playSFX('chime');
                audioManager.playSFX('heartbeat'); // Heartbeat before final page
            }
        }
    };

    const triggerShootingStar = () => {
        if(starShooting) return;
        setStarShooting(true);
        audioManager.playSFX('whoosh');
        setTimeout(() => setStarShooting(false), 2000);
    };

    const allConnected = connected.length === stars.length;

    return (
        <PageWrapper stage={stage} bgClass="bg-[#0f172a]" cursorClass="cursor-star">
            <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwZjE3MmEiPjwvcmVjdD48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMWUyOTNiIj48L3JlY3Q+PC9zdmc+')] opacity-50"></div>

            <div className="absolute top-10 right-20 z-0">
                <motion.div 
                    onClick={triggerShootingStar}
                    className="cursor-pointer text-7xl hover:scale-105 transition-transform opacity-90 hover:opacity-100 drop-shadow-[0_0_20px_#fef08a]"
                >
                    🌕
                </motion.div>
            </div>

            {starShooting && (
                <motion.div 
                    initial={{ x: window.innerWidth, y: 0, opacity: 1, scale: 2 }}
                    animate={{ x: -200, y: window.innerHeight, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 1.5, ease: "easeIn" }}
                    className="absolute text-3xl z-0 pointer-events-none drop-shadow-[0_0_15px_#fff]"
                >
                    🌠
                </motion.div>
            )}

            <div className="z-10 text-center space-y-4 max-w-2xl px-6 absolute top-10 pointer-events-none">
                <motion.h1 className="text-5xl md:text-6xl font-serif text-indigo-200 text-magic">Dream Sky</motion.h1>
                <p className="text-lg font-handwriting text-indigo-300/80">Connect the stars...</p>
            </div>

            <div className="relative w-64 h-64 sm:w-96 sm:h-96 mt-20 z-10">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {connected.length > 1 && connected.map((id, index) => {
                        if (index === 0) return null;
                        const prev = stars.find(s => s.id === connected[index-1]);
                        const curr = stars.find(s => s.id === id);
                        return (
                            <motion.line 
                                key={`line-${id}`}
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`}
                                stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" strokeDasharray="4 4"
                            />
                        );
                    })}
                    {allConnected && (
                        <motion.line 
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            x1={`${stars.find(s => s.id === connected[connected.length-1]).x}%`} 
                            y1={`${stars.find(s => s.id === connected[connected.length-1]).y}%`} 
                            x2={`${stars.find(s => s.id === connected[0]).x}%`} 
                            y2={`${stars.find(s => s.id === connected[0]).y}%`}
                            stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" strokeDasharray="4 4"
                        />
                    )}
                </svg>

                {stars.map(star => (
                    <motion.div
                        key={star.id}
                        className={`absolute w-4 h-4 rounded-full -ml-2 -mt-2 cursor-pointer transition-all ${connected.includes(star.id) ? 'bg-yellow-300 shadow-[0_0_15px_#fde047]' : 'bg-indigo-700'}`}
                        style={{ left: `${star.x}%`, top: `${star.y}%` }}
                        onClick={() => connectStar(star.id)}
                        whileHover={{ scale: 1.5 }}
                    />
                ))}
            </div>

            <div className="absolute bottom-20 z-10">
                <AnimatePresence>
                    {allConnected && (
                        <motion.button 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            onClick={onNext}
                            className="px-8 py-3 bg-indigo-900/50 text-indigo-100 border border-indigo-500/50 rounded-full font-sans uppercase tracking-widest text-sm hover:bg-indigo-800 transition-colors shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                        >
                            Journey to the end ➔
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="absolute top-20 left-10 z-20">
                <motion.div 
                    onClick={() => { setEggFound(true); audioManager.playSFX('sparkle'); }}
                    className="cursor-pointer text-5xl hover:scale-110 transition-transform opacity-70 hover:opacity-100"
                    animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 4 }}
                >
                    🧚‍♀️
                </motion.div>
                <AnimatePresence>
                    {eggFound && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-0 left-full ml-4 bg-indigo-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-400/30 w-56 text-center"
                        >
                            <p className="text-indigo-200 font-handwriting text-lg">"Every universe leads to you ✨"</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

// --- PROPOSAL: FINAL UNIVERSE ---
const Proposal = ({ stage }) => {
    const [step, setStep] = useState(0);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        audioManager.playTrack('tumhiho');
        // Volume rise at 0:40 (approx 20 seconds after 0:20 start)
        const vTimer = setTimeout(() => {
            audioManager.riseVolume('tumhiho', 1.0);
        }, 20000);

        return () => clearTimeout(vTimer);
    }, []);

    useEffect(() => {
        if (step < 3) {
            const timer = setTimeout(() => setStep(s => s + 1), 3500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleAccept = () => {
        setAccepted(true);
        audioManager.playSFX('chime');
        audioManager.playSFX('sparkle');
        audioManager.playTrack('raabta'); // After YES
    };

    return (
        <PageWrapper stage={stage} bgClass="bg-black" cursorClass="cursor-default">
            <div className="absolute inset-0 opacity-30 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px]">
                    <path d="M100,170 C40,110 20,70 50,40 C70,20 100,40 100,60 C100,40 130,20 150,40 C180,70 160,110 100,170 Z" 
                          fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2, 6" />
                </svg>
            </div>

            <div className="z-10 flex flex-col items-center justify-center h-full max-w-3xl text-center px-6">
                <AnimatePresence mode="wait">
                    {!accepted ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px]">
                            {step >= 0 && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="text-2xl font-serif text-white/70 mb-4">
                                    Across every world... every story... every universe...
                                </motion.p>
                            )}
                            {step >= 1 && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="text-3xl font-serif text-white/90 mb-12">
                                    I kept finding you.
                                </motion.p>
                            )}
                            
                            {step >= 2 && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }}>
                                    <h1 className="text-5xl md:text-7xl font-handwriting text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)] mb-16 mt-8">
                                        Taanisha... will you be mine forever?
                                    </h1>
                                    
                                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                        <button 
                                            onClick={handleAccept}
                                            className="px-10 py-4 bg-white/5 text-white rounded-full font-sans uppercase tracking-widest border border-white/30 hover:bg-white/20 transition-all text-sm backdrop-blur-sm"
                                        >
                                            YES ❤️
                                        </button>
                                        <button 
                                            onClick={handleAccept}
                                            className="px-10 py-4 bg-pink-600 text-white rounded-full font-sans uppercase tracking-widest shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:bg-pink-500 transition-all text-sm scale-105"
                                        >
                                            FOREVER YES 💍
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="flex flex-col items-center"
                        >
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                {[...Array(40)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                                        animate={{ 
                                            x: (Math.random() - 0.5) * 1000, 
                                            y: (Math.random() - 0.5) * 1000,
                                            opacity: 0,
                                            scale: Math.random() * 2 + 1,
                                            rotate: Math.random() * 360
                                        }}
                                        transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
                                        className="absolute text-5xl"
                                    >
                                        {['❤️', '💖', '💍', '✨', '🌸'][Math.floor(Math.random() * 5)]}
                                    </motion.div>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                                You just made my universe complete.
                            </h1>
                            <p className="text-2xl font-handwriting text-pink-300">I love you, forever. ✨</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const [currentStage, setCurrentStage] = useState(0);
    const [showSecret, setShowSecret] = useState(false);
    
    useEffect(() => {
        let typed = "";
        const target = "taanisha";
        
        const handleKeyDown = (e) => {
            typed += e.key.toLowerCase();
            if (typed.length > target.length) {
                typed = typed.slice(-target.length);
            }
            if (typed === target) {
                setShowSecret(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const nextStage = () => {
        setCurrentStage(prev => Math.min(prev + 1, 5));
    };

    const stages = [
        <Universe1 key="1" stage={0} onNext={nextStage} />,
        <Universe2 key="2" stage={1} onNext={nextStage} />,
        <Universe3 key="3" stage={2} onNext={nextStage} />,
        <Universe4 key="4" stage={3} onNext={nextStage} />,
        <Universe5 key="5" stage={4} onNext={nextStage} />,
        <Proposal key="6" stage={5} />
    ];

    return (
        <div className="w-screen h-screen overflow-hidden bg-black font-sans relative">
            <AudioToggle />
            
            <AnimatePresence mode="wait">
                {stages[currentStage]}
            </AnimatePresence>

            <AnimatePresence>
                {showSecret && <SecretUniverse stage={currentStage} onClose={() => setShowSecret(false)} />}
            </AnimatePresence>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
