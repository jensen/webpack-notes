import React, { Component } from 'react';

import '../scss/application.scss';

export default function App() {
  return (
    <div>
      <div className="tagline">
        <span className="black">Bundled</span> <span className="light">with</span>
      </div>
      <a href="https://webpack.js.org/"><img className="logo" src="/images/webpack.svg" /></a>
    </div>
  )
}
