import React from 'react';

class CharterUp extends React.Component {

	constructor() {
  	super();
  	this.state = {
    	result: "",
    	info: {
        "Charter": {
          "Daily": 1000.0,
          "Hourly": 400.0,
          "Distance": 3.5
        },
        "Mini Bus": {
          "Daily": 925.0,
          "Hourly": 360.0,
          "Distance": 3.25
        },
        "Sprinter": {
          "Daily": 850.0,
          "Hourly": 320.0,
          "Distance": 3.0
        },
        "Party Bus": {
          "Daily": 775.0,
          "Hourly": 280.0,
          "Distance": 2.75
        },
        "Sedan": {
          "Daily": 700.0,
          "Hourly": 240.0,
          "Distance": 2.5
        },
        "SUV": {
          "Daily": 625.0,
          "Hourly": 200.0,
          "Distance": 2.25
        },
        "Limousine": {
          "Daily": 550.0,
          "Hourly": 160.0,
          "Distance": 2.0
        },
        "Trolley": {
          "Daily": 475.0,
          "Hourly": 120.0,
          "Distance": 1.75
        }
      }
    }
    
    this.submitForm = this.submitForm.bind(this);
  }
  
    submitForm(e) {
        e.preventDefault();
        let count = document.getElementById("Vehicle Count").value;
        let vehicle_type = document.getElementById("Vehicle Type").value;
        let rate_type = document.getElementById("Pricing Method").value;
        let rate = this.state.info[vehicle_type][rate_type];
        let duration = document.getElementById("Pricing Method Units").value;
        console.log(count);
        console.log(vehicle_type);
        console.log(rate_type);
        console.log(rate);
        console.log(duration);
        console.log(count * rate * duration);

        this.setState({ result: count * rate * duration })
    }

  render() {
    return( 
    	<div>
    	  <h1>CharterUp Engine</h1>
            <form onSubmit={this.submitForm}>
                <p>Vehicle Type:</p>
                <select id="Vehicle Type" name="Vehicle Type">
                    <option value="Charter">Charter</option>
                    <option value="Mini Bus">Mini Bus</option>
                    <option value="Sprinter">Sprinter</option>
                    <option value="Party Bus">Party Bus</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Mini Van">Mini Van</option>
                    <option value="Trolley">Trolley</option>
                </select>
                
                <p>Vehicle Count:</p>
                <input type="number" id="Vehicle Count" name="Vehicle Count" />
                
                <p>Pricing Method:</p>
                <select id="Pricing Method" name="Pricing Method">
                    <option value="Daily">Daily</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Distance">Distance</option>
                </select>
                
                <p>Duration:</p>
                <input type="number" id="Pricing Method Units" name="Pricing Method Units" />
                
                <div>
                    <button type="submit">Submit</button>
                    <p>{this.state.result}</p>
                </div>
            
            </form>
    	</div>);
  }
}

export default CharterUp;
