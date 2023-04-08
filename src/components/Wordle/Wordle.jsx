import { useState, useEffect } from 'react';
import './Wordle.css';

const WORDLE_WORDS_API = 'https://random-word-api.vercel.app/api?words=300&length=5';
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export default function Wordle() {
    const [goalWord, setGoalWord] = useState(null);
    const [guesses, setGuesses] = useState(Array(MAX_GUESSES).fill(null));
    const [currGuess, setCurrGuess] = useState('');
    const foundWord = guesses.includes(goalWord);

    useEffect(() => {
        const getWords = async () => {
            const response = await fetch(WORDLE_WORDS_API);
            const words = await response.json()
            
            setGoalWord(words[Math.floor(Math.random() * words.length)]);
        }

        getWords();
    }, []);

    useEffect(() => {
        if (goalWord == null) return;

        const onKeyPress = event => {
            if (guesses[MAX_GUESSES-1] != null || guesses.includes(goalWord)) return;

            
            const charCode = event.key.charCodeAt(0);
            const isLetter = event.key.length === 1 && 
                charCode >= "a".charCodeAt(0) && 
                charCode <= "z".charCodeAt(0);

            setCurrGuess(guessSoFar => {
                if(event.key === "Backspace"){
                    return guessSoFar.slice(0,-1);
                } else if (event.key ==="Enter" && guessSoFar.length === WORD_LENGTH){
                    const currGuessIndex = guesses.findIndex(guess => guess == null)
                    const rerenderedArray = [...guesses];
                    rerenderedArray[currGuessIndex] = guessSoFar; 
                    setGuesses(rerenderedArray)
                    return '';
                }else if (guessSoFar.length < WORD_LENGTH && isLetter){
                    return guessSoFar + event.key;
                }
    
                return guessSoFar
            })
        }
        
        window.addEventListener('keydown', onKeyPress);
        return () => window.removeEventListener('keydown', onKeyPress);
        
    }, [guesses, goalWord]);

    function restartGame() {
        setGuesses(Array(MAX_GUESSES).fill(null));
        setCurrGuess('');
        
        const getWords = async () => {
            const response = await fetch(WORDLE_WORDS_API);
            const words = await response.json()
            
            setGoalWord(words[Math.floor(Math.random() * words.length)]);
        }

        getWords();
    }

    const currGuessIndex = guesses.findIndex(guess => guess == null);
    
    return (
        <>
            <div className='board'>
                {guesses.map((guess,i) => {
                    return (
                        <GuessLine 
                            key={i}
                            guess={(i === currGuessIndex ? currGuess : guess ?? '').padEnd(WORD_LENGTH)}
                            isFinal={currGuessIndex > i || currGuessIndex === -1}
                            goalWord={goalWord}
                        />
                    )
                })}
                
                {guesses[MAX_GUESSES-1] != null && <div id="correct_word">Correct Word: {goalWord.toUpperCase()}</div>}
                {(foundWord || guesses[MAX_GUESSES-1] != null) && <button onClick={() => restartGame()} >Restart</button>}
            </div>
        </>
            
    );
}

function GuessLine({guess, isFinal, goalWord}) {
    return (
        <div className='line'>
            {guess.split("").map((char,i) => {
                let className = 'tile';

                if (isFinal){
                    if (goalWord[i] === char){
                        className += ' correct'
                    } else if (goalWord.includes(char)){
                        className += ' close'
                    } else {
                        className += ' incorrect'
                    }
                }

                return  <div
                        key={i}
                        className={className}
                    >
                        {char}
                    </div>
                
            })}
        </div>
    )
    
}