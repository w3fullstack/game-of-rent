import React, {useEffect, useRef} from 'react';
import './GameBoard.css';
import { makeStyles } from '@material-ui/core/styles';
import Map from './Map';
import PlayerCard from '../PlayerCard/PlayerCard';
import PlayerPopup from '../PlayerCard/PlayerPopup';
import FlippingCard from '../FlippingCard/FlippingCard';
import ReactDice from 'react-dice-complete';
import 'react-dice-complete/dist/react-dice-complete.css';
import OccupationCardBack from '../Card/img/GameOfRent_OccupationBack.jpg';
import LifeCardBack from '../Card/img/GameOfRent_LifeBack.jpg';
import NeighborhoodCardBack from '../Card/img/GameOfRent_NeighborhoodBack.jpg';
import HouseholdCardBack from '../Card/img/GameOfRent_HouseholdBack.jpg';
import MathBox from '../MathBox/MathBox'
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { useDispatch } from 'react-redux'
import { updatePlayer, removeJob, addFamily } from '../../actions/index'; //todo delete
import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks";
import PlayerIcon from '../PlayerIcon/PlayerIcon'

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
        backgroundColor: '#4CACE9',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100vw',
        height: '100vh',
    },
    playerCardSection: {
        width: '15vw',
        height: '100vh',
        overflow: 'scroll',
    },
    map: {
        width: '70vw',
        height: '100vh',
    },
    gameCardSection: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '15vw',
        height: '100vh',
    },
}));

function showCardFullscreen(ref, cardId, cardProps) {
    document.getElementById("overlay").style.display = "block"; // TODO getting by id is probably bad
    ref.startForRightCard(document.getElementById(cardId), cardProps);
}
function showPlayerCardFullscreen(ref, buttonId, cardProps) {
    document.getElementById("overlay").style.display = "block"; // TODO getting by id is probably bad
    ref.startForLeftCard(document.getElementById(buttonId), cardProps);
}
function closeFullscreenCard(ref) {
    ref.goFromCenter(() => document.getElementById("overlay").style.display = "none");
}
const GET_CITY = gql`
    query GetCity($name: String){
        city(query: { Nickname: $name }){
            lat
            long
            Nickname
        }
    }
`;

function ConnectedGameBoard({playerList, city, jobList, householdList, lifeList}) {
    const classes = useStyles();
    const dispatch = useDispatch(); //todo delete

    // LOCAL STATE
    const [playerTurn, setPlayerTurn] = React.useState(0); // player 1's turn is presented by a 0
    const [diceRoll, setDiceRoll] = React.useState(0);
    const [lifeCount, setLifeCount] = React.useState(1);
    const [instructionLocation, setInstructionLocation] = React.useState(0);

    const [playerPopupLocation, setPlayerPopupLocation] = React.useState();

    const [showPlayerPopup, setShowPlayerPopup] = React.useState(false)
    const [showInstBox, setShowInstBox] = React.useState(true);
    const [showMathBox, setShowMathBox] = React.useState(false);
    const [showGameBox, setShowGameBox] = React.useState(false);

    //INSTRUCTIONS
    const nextInstruction = (type) => {
        switch (type) {
            case 'solo':
                setInstructionLocation(6);
                break;
            case 'working':
                setInstructionLocation(4)
                break;
            case 'familyDone':
                setInstructionLocation(5)
                break;
            case 'family':
                setInstructionLocation(3)
                break;
            case 'life':
                setInstructionLocation(7)
                break;
            case 'done':
                setInstructionLocation(8)
                calcInfo();
                break;
            default:
                setInstructionLocation(instructionLocation + 1);
        }


        //todo can make next instruction have an optional parameter, and switch case to determine what message is output

    }
    const InstructionText = [
        `Welcome to the Game of Rent! You will now take on the role of a person in ${city} searching for affordable housing. It is your job to find the best housing for you and your family considering all your circumstances. Let's find out more about your character; click on the yellow card to discover your occupation!`,
        "Now that you have your occupation, it's time to determine your household! Click on the die to roll for the number of family members you'll have.",
        `That means you have ${diceRoll} other family member(s) in your household. Draw a household card and an occupation card if that family member is of working age.`,
        `You have ${diceRoll} member(s) left. Please draw a household card for your next family member.`,
        'Please draw an occupation card for this family member.',
        'Your family is complete, but everyone has unforeseen circumstances arise in their lives. Draw a life card for each adult in your household including yourself!',
        'You\'re the only member of your household! Everyone has unforeseen circumstances arise in their lives. Draw a life card for yourself.',
        'Please draw another life card.',
        'Your household is finally set! Now click on the calculator icon to find out your monthly housing allowance. This is how much you can afford to spending on housing each month.',

    ];

    //CARD FLIPPING
    const xFunction = () => flippingCardRef.current.goFromCenter(() => document.getElementById("overlay").style.display = "none");
    const flippingCardRef = React.createRef();

    const togglePlayerPopup = (playerIndex) => {
        if(!showPlayerPopup){
            document.getElementById("overlay").style.display = "block";
            setPlayerPopupLocation(playerIndex);
            setShowPlayerPopup(true);
        } else {
            document.getElementById("overlay").style.display = "none";
            setShowPlayerPopup(false);
        }
    }

    //GAMEPLAY HANDLERS
    const handleDiceRoll = (num) => {
        if(instructionLocation === 1){
            setDiceRoll(num - 1);
            if(num === 1){
                nextInstruction('solo')
            } else {
                nextInstruction()
            }
        }
    }
    const handleCardDraw = (type) => {
        switch (type) {
            case 'occupation':
                const index = Math.floor(Math.random() * jobList.length)
                const job = jobList.splice(index, 1)[0]; //todo get rid of these when done testing
                showCardFullscreen(flippingCardRef.current, "occupationCardBack",  ["Occupation", job] /*["Occupation", job.title, "Monthly Income:", job.income, "A", 1]*/);
                if(instructionLocation === 0) {

                    // const job = jobList.splice(index, 1)[0];
                    // showCardFullscreen(flippingCardRef.current, "occupationCardBack",   ["Occupation", job.title, "Monthly Income:", job.income, "A", 1]);
                    nextInstruction();
                    playerList[playerTurn].job = job;

                } else if( instructionLocation === 4) {

                    // const job = jobList.splice(index, 1)[0];
                    // showCardFullscreen(flippingCardRef.current, "occupationCardBack",   ["Occupation", job.title, "Monthly Income:", job.income, "A", 1]);
                    const end = playerList[playerTurn].family.length - 1;
                    playerList[playerTurn].family[end].job = job;

                    if(diceRoll <= 0) {
                        nextInstruction('familyDone')
                    } else {
                        nextInstruction('family')
                    }
                }

                break;
            case 'household':
                if(instructionLocation === 2 || instructionLocation === 3){
                    setDiceRoll(diceRoll - 1);

                    const index = Math.floor(Math.random() * householdList.length)
                    const member = householdList.splice(index, 1)[0];
                    showCardFullscreen(flippingCardRef.current, "householdCardBack",   ["Household", member]);

                    if(member.wage === 'draw'){
                        nextInstruction('working')
                    } else if(diceRoll <= 1) {
                        nextInstruction('familyDone')
                    } else {
                        nextInstruction('family')
                    }

                    if(member.adult) setLifeCount(lifeCount + 1);
                    playerList[playerTurn].family.push(member);
                }

                break;
            case 'life':
                if(instructionLocation === 5 || instructionLocation === 6 || instructionLocation === 7){
                    setLifeCount(lifeCount - 1);

                    const index = Math.floor(Math.random() * lifeList.length)
                    const life = lifeList.splice(index, 1)[0];
                    showCardFullscreen(flippingCardRef.current, "lifeCardBack",   ["Life", life]);

                    playerList[playerTurn].life.push(life);

                    if(lifeCount === 1){
                        nextInstruction('done')
                    } else {
                        nextInstruction('life')
                    }
                }

                break;
        }
    }
    const handleCalculatorButton = () => {
        if(instructionLocation === 8){
            setShowInstBox(false)
            setShowMathBox(true);
        }
    }
    const closeMathBox = () => {
        setShowMathBox(false);
        nextPlayerSetup();
    }
    const calcInfo = () =>{
        let householdMonthlyIncome = playerList[playerTurn].job.income;
        let adultCount = 1
        let kidCount = 0;

        playerList[playerTurn].family.forEach((member) => {
            if(member.adult){
                adultCount++;
            } else {
                kidCount++;
            }
            if(member.job) {
                householdMonthlyIncome += member.job.income
            } else {
                householdMonthlyIncome += member.wage;
            }
        })

        //todo add life cards into effect

        let minimumNumBedrooms = Math.ceil(adultCount/2) + Math.ceil(kidCount/3)

        playerList[playerTurn].info = {
            householdMonthlyIncome: householdMonthlyIncome,
            monthlyHousingAllowance: householdMonthlyIncome * .3,
            minimumNumBedrooms: minimumNumBedrooms
        }
    }
    const nextPlayerSetup = () => {
        if(playerTurn === playerList.length - 1){
            setPlayerTurn(0);
            setShowGameBox(true);

        } else {
            setInstructionLocation(0)
            setShowInstBox(true);
            setPlayerTurn(playerTurn + 1);
            setDiceRoll(null);
            setLifeCount(1);
        }
    }

    const nextPlayerGame = () => {
        //todo stuff for game loop goes here
    }

    //DATABASE
    const { loading, error, data } = useQuery(GET_CITY, {
        variables: { name: city }
    });

    return (
        <div className={classes.root}>

            {showInstBox &&
                <div>
                    <ReactCSSTransitionGroup
                        transitionName='fade'
                        transitionAppear={true}
                        transitionAppearTimeout={5000}>

                        <div className='instruction-section'>
                            <h3>{playerList[playerTurn].playerName}</h3>
                            <div>
                                <p>{InstructionText[instructionLocation]}</p>
                            </div>
                        </div>
                    </ReactCSSTransitionGroup>
                </div>
            }

            {showPlayerPopup &&
                <div className='player-popup'>
                    <PlayerPopup player={playerList[playerPopupLocation]} onClick={() => togglePlayerPopup()}/>
                </div>

            }


            <div className='dice-section'>
                <ReactDice
                    numDice={1}
                    faceColor="#ffffff"
                    dotColor="#000000"
                    rollDone={num => handleDiceRoll(num)}
                    className='dice'
                />
            </div>

            <div className='calculator-section' onClick={handleCalculatorButton}>
                // todo image goes here
            </div>

            {showMathBox &&
                <div className='calculator-panel' onClick={closeMathBox}>
                    <MathBox info={playerList[playerTurn].info}/>
                </div>
            }

            {/*todo need to eventually move this styling out of here*/}
            <div id="overlay" style={{height:"100%", width:"100%", backgroundColor:"rgba(0,0,0, 0.5)", zIndex:1, position:"fixed", display:"none"}}>
                {!showPlayerPopup &&
                    <p onClick={xFunction} style={{position:"fixed",left:"90%",color:"white",fontWeight:"bold",cursor:"pointer",fontSize:40}}>X</p>
                }
                <FlippingCard ref={flippingCardRef} startSize={[0, 0]} startXY={[0, 0]} />
            </div>

            <div className={classes.playerCardSection}>
                {/*todo will need to eventually go back and make these work for each individual player*/}

                {playerList.map((player, index) => (
                    <div className={(playerTurn === index) ? 'current-player' : '' }>
                        {/*<PlayerCard btnId="info1" playerName={player.playerName} avatar={player.avatar} onClick={() => showPlayerCardFullscreen(flippingCardRef.current, "info1", [0, "Person A", 111, "card1", "card2", "card3", "card4", "card5"])}/>*/}
                        <PlayerCard btnId="info1" playerName={player.playerName} avatar={player.avatar} onClick={() => togglePlayerPopup(index)}/>

                    </div>

                ))}
            </div>

            <div className={classes.map}>
                <Map lat={data && data.city &&  data.city.lat} long={data && data.city && data.city.long}/>
            </div>

            <div className={classes.gameCardSection}>
                <img style={{ height: '20vh'}} id="occupationCardBack"   src={OccupationCardBack}  className="card" alt="OccupationCardBack" onClick={() => handleCardDraw('occupation')} />
                <img style={{ height: '20vh'}} id="householdCardBack"   src={HouseholdCardBack}  className="card" alt="HouseholdCardBack" onClick={() =>  handleCardDraw('household')} />
                <img style={{ height: '20vh'}} id="lifeCardBack"  src={LifeCardBack}  className="card" alt="LifeCardBack" onClick={() => handleCardDraw('life')} />

                <img style={{ height: '20vh'}} id="neighborhoodCardBack" src={NeighborhoodCardBack} className="card" alt="NeighborhoodCardBack" onClick={() => showCardFullscreen(flippingCardRef.current, "neighborhoodCardBack", ["Neighborhood", "Filler text C", "Lorem ipsum", "dolor sit amet", "D", 4])} />
            </div>

        </div>
    );
}

const mapStateToProps= state => {
    return {
        playerList: state.players,
        city: state.city,
        jobList: state.jobs,
        householdList: state.household,
        lifeList: state.life
    }
}

const GameBoard = connect(
    mapStateToProps,
)(ConnectedGameBoard);



export default GameBoard;
