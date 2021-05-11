import React, { useState, useEffect } from "react";

import './App.css';

function App() {

  const [image, setImage] = useState({ preview: "", raw: "" });
  const [predictedImage, setPredictedImage] = useState({url: ""});
  const [loading, setLoading] = useState(false)

  const handleImageChange = e => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
    }
  };

  const handlePrediction = e => {
    e.preventDefault();

    setPredictedImage(
      {url: URL.createObjectURL(image.raw)}
    ) 

    //MAKE FLASK POST REQ HERE//
  }

  return (

    <div className="App">
      <div className="Title">
        Test Our Model
      </div>
      <div className="Input-box">
        <input className="fileInput" 
          type="file" 
          onChange={handleImageChange} 
        />
        <button className="submitButton" 
          type="submit" 
          onClick={handlePrediction}>
            Run Prediction
        </button>
      </div>
      <div className="original-text">
        Original
      </div>
      {image.preview ? (
        <img src={image.preview} alt="dummy" width="512" height="256" />
        ) : (
        <>
          <h5 className="text-center">Upload your photo</h5>
        </>
      )}
      <div className="original-text">
        Predicted
      </div>

      {predictedImage.url ? (
        <img src={predictedImage.url} alt="dummy" width="512" height="256" />
        ) : (
        <>
          <h5 className="text-center">Waiting for prediction</h5>
        </>
      )}
    </div>
  );
}

export default App;
