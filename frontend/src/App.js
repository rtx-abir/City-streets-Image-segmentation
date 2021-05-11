import React, { useState, useEffect } from "react";
import axios from 'axios';

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
    
    let form_data = new FormData();

    form_data.append('image', image.raw);

    let url = 'http://localhost:5000/predict_multi';

    axios.post(url, form_data, {
      headers: {
        'content-type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
      },
      responseType: 'blob'
    })
        .then(res => {
          setPredictedImage({url: res.data})
          
        })
        .catch(err => console.log(err))
    console.log(predictedImage)
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
        <img src={image.preview} alt="dummy" width="800" height="400" />
        ) : (
        <>
          <h5 className="text-center">Upload your photo</h5>
        </>
      )}
      <div className="original-text">
        Predicted
      </div>

      {predictedImage.url ? (
        <div className="predicted-trim">
          <img src={URL.createObjectURL(predictedImage.url)} alt="dummy" className="pred-img"/>
        </div>
        ) : (
        <>
          <h5 className="text-center">Waiting for prediction</h5>
        </>
      )}
    </div>
  );
}

export default App;
