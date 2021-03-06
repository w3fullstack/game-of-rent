import React from 'react';
import './MathBox.css'

function MathBox (props) {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     income: 5715,
  //     allowance: 1714,
  //     bedrooms: 2,
  //     rent: 1100,
  //     neighborhoodCards: 3,
  //     commuteDistance: 4,
  //   };
  // }


    // const allowanceMinusRentOver100 = Math.floor((this.state.allowance - this.state.rent) / 100);
    return (
        <div className='background'>
            <div className='panel'>
                <h2>Game Setup</h2>
                <div className='game-setup-section'>
                    <p>Total Household Monthly Income: ${props.info.householdMonthlyIncome}</p>
                    <p>Monthly Housing Allowance: ${props.info.monthlyHousingAllowance}</p>
                    <p>Minimum Number of Bedrooms: {props.info.minimumNumBedrooms}</p>
                    <p>(click to close)</p>
                </div>
            </div>
        </div>
    );

}

export default MathBox;
