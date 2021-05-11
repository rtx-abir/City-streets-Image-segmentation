import React, { useState, useEffect } from "react";
import axios from 'axios';

import './App.css';

function App() {

  const [image, setImage] = useState({ preview: "", raw: "" });
  const [predictedImage, setPredictedImage] = useState({url: ""});
  const [loading, setLoading] = useState(false);
  const [modelType, setModelType] = useState("model_fpn");

  const handleImageChange = e => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
    }
  };

  const handleDropdownChange = e => {
    setModelType(e.target.value)
  }

  const handlePrediction = e => {
    e.preventDefault();
    
    let form_data = new FormData();

    form_data.append('image', image.raw);

    let url = 'http://localhost:5000/predict_multi';

    if(modelType == "model_fpn_multi")
      url = url + "_multi"

    else if(modelType == "model_unet")
      url = url + "_unet"

    else if(modelType == "model_fpn")
      url = url + "_fpn"

    else
      url = url + "_linknet"

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
        <label for="model_type" className="model-type-label">Model Type:</label>
        <select name="model_type" onChange={handleDropdownChange}>
          <option value="model_fpn">FPN</option>
          <option value="model_unet">UNET</option>
          <option value="model_linknet">LINKET</option>
          <option value="model_fpn_multi">FPN Multiclass</option>
        </select>
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
