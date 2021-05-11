import React, { useState, useEffect } from "react";
import axios from 'axios';

import './App.css';

function App() {

  const [image, setImage] = useState({ preview: "", raw: "" });
  const [predictedImage, setPredictedImage] = useState({url: ""});
  const [loading, setLoading] = useState(false);
  const [modelType, setModelType] = useState("model_fpn");
  const [errMesg, setErrMesg] = useState("");
  const sidebarRef = React.useRef(null)

  const handleImageChange = e => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
    }
  };

  const handleSideBarClick = e => {
    sidebarRef.current.click()
  }

  const handleDropdownChange = e => {
    setModelType(e.target.value)
  }

  const handlePrediction = e => {
    e.preventDefault();
    handleSideBarClick()
    setErrMesg("");
    setLoading(true); 

    let form_data = new FormData();

    form_data.append('image', image.raw);

    let url = 'http://localhost:5000/predict';

    if(modelType == "model_fpn_multi")
      url = url + "_multi"

    else if(modelType == "model_unet")
      url = url + "_unet"

    else if(modelType == "model_fpn")
      url = url + "_fpn"

    else
      url = url + "_linknet"

    axios
      .post(url, form_data, {
        headers: {
          'content-type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*',
        },
        responseType: 'blob'
      })
      .then(res => {
        setPredictedImage({url: res.data});  
        setErrMesg("");
        setLoading(false);      
      })
      .catch(err => {
        setErrMesg("Failed to predict");
        setLoading(false);
      });
  }

  return (
    <div className="App">
        <input type="checkbox" class="openSidebarMenu" id="openSidebarMenu" onClick={handleSideBarClick}/>
          <label for="openSidebarMenu" class="sidebarIconToggle" ref={sidebarRef}>
            <div class="spinner diagonal part-1"></div>
            <div class="spinner horizontal"></div>
            <div class="spinner diagonal part-2"></div>
          </label>
            <div id="sidebarMenu">
              <ul class="sidebarMenuInner">
                <li>
                  <input className="fileInput" 
                    type="file" 
                    onChange={handleImageChange} 
                  />
              </li>
                <li>
                  <div className="model-type-text">
                    Model Type
                  </div>
                  <select name="model_type" onChange={handleDropdownChange} className="model-type-drpdwn">
                    <option value="model_fpn">FPN Binary</option>
                    <option value="model_unet">UNET Binary</option>
                    <option value="model_linknet">LINKET Binary</option>
                    <option value="model_fpn_multi">FPN Multiclass</option>
                  </select>
                </li>
                <li>
                  <button className="submit-btn" 
                    type="submit" 
                    onClick={handlePrediction}>
                      Run Prediction
                  </button>
                </li>
              </ul>
            </div>
            {image.preview? 
            (null) 
            : 
            (<div className="Title">
              Test Our Segmentation Model 
            </div>)
            }
      <div className="Middle-bar" style={image.preview ? {width:'900px', margin:'auto', background: 'rgba(252, 252, 252, 0.5)', height: '100vh'}: null}>
        <button onClick={handleSideBarClick} className="start-pred-button">
          <div className="start-pred-text">
            Start Prediction
          </div>
        </button>
        {loading ? (
           <div className="Loading-Mesg">
             Processing
           </div>
           ) : (
           <>
           </>
        )}
        {errMesg ? (
           <div className="Err-Mesg">
             {errMesg}
           </div>
           ) : (
           <>
           </>
        )}
        {image.preview ? (
          <div className="preview-img">
            <img src={image.preview} alt="dummy" width="800" height="400" />
          </div>
          ) : (
          <>
          </>
        )}
        {predictedImage.url ? (
          <div className="predicted-trim">
            <img src={URL.createObjectURL(predictedImage.url)} alt="dummy" className="pred-img"/>
          </div>
          ) : (
          <>
          </>
        )}
      </div>
    </div>
  );
}

export default App;


// {errMesg ? (
//   <div className="Err-Mesg">
//     {errMesg}
//   </div>
//   ) : (
//   <>
//   </>
// )}
// {loading ? (
//   <div className="Loading-Mesg">
//     Processing
//   </div>
//   ) : (
//   <>
//   </>
// )}
// <div className="original-text">
//   Original
// </div>
// {image.preview ? (
//   <img src={image.preview} alt="dummy" width="800" height="400" />
//   ) : (
//   <>
//     <h5 className="text-center">Upload your photo</h5>
//   </>
// )}
// <div className="original-text">
//   Predicted
// </div>
// {predictedImage.url ? (
//   <div className="predicted-trim">
//     <img src={URL.createObjectURL(predictedImage.url)} alt="dummy" className="pred-img"/>
//   </div>
//   ) : (
//   <>
//     <h5 className="text-center">Waiting for prediction</h5>
//   </>
// )}