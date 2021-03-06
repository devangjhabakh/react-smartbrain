import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import './App.css';
import Logo from './Components/Logo/Logo'
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register'
const ApiKey = '7e89b68a3c6e400bb0b7d500f1f20252';
const app = new Clarifai.App({
  apiKey: ApiKey
});
const ParticlesOptions = {
  particles: {
    number:{
      value: 30,
      density: {
        enable: true,
        value_area: 800 
      }
    }
  }
};

class App extends Component{
  constructor(){
    super();
    this.state = {
     input : '',
     imageUrl : '',
     box: {},
     route: 'signin',
     isSignedIn: false,
     user: {
        id: '1',
        name: '',
        email: '',
        entries: 0,
        joined: ''
     }
    }
  }
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
  componentDidMount(){
    fetch('http://localhost:3000')
    .then(response => response.json())
    .then(data => console.log(data));
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({box : box});
  }
  onInputChange = (event) => {
    console.log(event.target.value);
    this.setState({input: event.target.value});
  }
  onButtonClick = (event) => {
    this.setState({imageUrl: this.state.input})
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
      .then(response => {
        if(response){
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
          console.log(count);
          this.setState(Object.assign(this.state.user, { entries: count }))
      })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
      })
      
    }
  onRouteChange = (value) => {
    if (value === 'signout'){
      this.setState({isSignedIn: false})
    } else if (value === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: value});
  }
  render(){
    return(
      <div className = 'App'>
        <Particles className = 'particles' params = {ParticlesOptions}/>
        <Navigation onRouteChange = {this.onRouteChange} isSignedIn = {this.state.isSignedIn} />
        { this.state.route === 'home'
        ?<div>
        <Logo />    
        <Rank name = {this.state.user.name} entries = {this.state.user.entries} />
        <ImageLinkForm onInputChange = {this.onInputChange} onButtonClick = {this.onButtonClick}/>
        <FaceRecognition imageUrl = {this.state.imageUrl} box = {this.state.box}/>
        </div>
        :(
          this.state.route === 'signin'
          ?<SignIn loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
          :<Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
        )
        }
      </div>
    )
  }
}

export default App;