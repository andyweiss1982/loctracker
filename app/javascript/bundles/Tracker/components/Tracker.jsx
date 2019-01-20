import React, { Component } from 'react'
import axios from 'axios'

const token       = document
                      .querySelector('meta[name="csrf-token"]')
                      .getAttribute('content')

const csrfHeaders = {
                      'X-Requested-With': 'XMLHttpRequest',
                      'X-CSRF-TOKEN':     token
                    }

class Tracker extends Component {
  state = { latitude: 0, longitude: 0 }

  componentDidMount(){
    this.trackLocation()
    this.interval = setInterval(this.trackLocation, 60000);
    window.addEventListener('beforeunload', this.handleLeavePage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('beforeunload', this.handleLeavePage)
    clearInterval(this.interval)
  }

  handleLeavePage = () => {
    clearInterval(this.interval)
    axios.post(
      '/locations',
      { location: { latitude: null, longitude: null }},
      { headers: csrfHeaders }
    )
  }

  trackLocation = () => {
    const options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 27000
    }
    const success = pos => {
      const { latitude, longitude } = pos.coords
      axios.post(
        '/locations',
        { location: { latitude, longitude } },
        { headers: csrfHeaders }
      ).then( response => {
        this.setState({
          latitude:   response.data.latitude,
          longitude: response.data.longitude
        })
      })
    }
    const error = err => {
      console.warn(`ERROR(${err.code}): ${err.message}`)
    }
    navigator.geolocation.getCurrentPosition(success, error, options)
  }

  render(){
    const { latitude, longitude } = this.state
    return(
      latitude !== 0 && longitude !== 0 &&
      <p>You are calling from {latitude}, {longitude}</p>
    )
  }

}

export default Tracker
