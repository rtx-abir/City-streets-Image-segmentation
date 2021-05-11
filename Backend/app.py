import numpy as np
from flask import Flask, request, jsonify, send_file
import tensorflow
from tensorflow.keras.models import load_model
import efficientnet.keras as efn
import matplotlib.pyplot as plt
import cv2
from PIL import Image
from flask_cors import CORS, cross_origin
import io


app = Flask(__name__)
CORS(app)

"""
These .h5 files are recieved by running the models from our collab notebook. As we didn't have sufficient
GPU power, we used collab to run and save the model and unloaded here.
"""
model_fpn = load_model('fpn_model.h5',compile = False)
model_multi = load_model('fpn_multi_model.h5',compile = False)
model_linknet = load_model('linknet_model.h5', compile = False)

model_fpn.compile()
model_multi.compile()
model_linknet.compile()

def visualize_superimpose_arrs(*args, plot_title, show_axis_labels = True):
  """
  Superimposes the prediction image made by request_procedure() function on top of
  the orignal picture sent by the user. Takes a snapshot of the matplotlib picture using
  plt.gcf() and then returns that figure so it can be turned into a pillow object.
  """
  fig, axes = plt.subplots(nrows=1, ncols=1, figsize=(8, 8))
  fig.subplots_adjust(top=1, bottom=0, left=0, right=1)
  axes.imshow(cv2.cvtColor(args[0], cv2.COLOR_BGR2RGB))
  axes.imshow(args[1], alpha=.4)
  axes.get_xaxis().set_visible(show_axis_labels)
  axes.get_yaxis().set_visible(show_axis_labels)
  plt.axis('off')
  fig = plt.gcf()
  return fig

def fig2img(fig):
    """Convert a Matplotlib figure to a PIL Image and return it"""

    buf = io.BytesIO()
    fig.savefig(buf, bbox_inches='tight',pad_inches=0)
    buf.seek(0)
    img = Image.open(buf)
    return img

def request_procedure(model, name):
    """
    This function takes in the file recieved from post request using opencv decodes it and turns
    it into an array. Once an array image pixels are than resized to 256 by 512 and normalized.
    The model then makes the prediction and passes it into the visualize_superimpose() function
    to superimpose the prediction over the original image. 
    Then the fig2img takes the matplotimage and turns it into a pillow file which is then send to 
    the user as a png using send_file() function built into flask
    """
    try:
        # Getting the image
        imagefile = request.files['image'].read()
        print("image successfully uploaded")
        print('running fpn')
        img = cv2.imdecode(np.frombuffer(imagefile, np.uint8), cv2.IMREAD_UNCHANGED)
        print(img.shape)

        #changing the shape, if 4 channel make 3 channel
        if img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

        #resizing the image to 256,512,3 and appending to an np array   
        img_resized = cv2.resize(img, (512,256))
        img_arr = np.zeros((1, 256, 512, 3), dtype=np.float32)
        #normalizing array
        img_arr[0] = img_resized / 255
        #prediction made by the specific model passed in params
        predictions = model.predict(img_arr, verbose = 1).round()

        # if multi use np.argmax else use squeeze
        if name == 'multi':
            new_img = visualize_superimpose_arrs(
                img_arr[0],
                np.argmax(predictions[0],axis=2),
                plot_title = ['Original'],
                show_axis_labels = False
            )
        else:
            new_img = visualize_superimpose_arrs(
                img_arr[0],
                predictions.squeeze(),
                plot_title = ['Original'],
                show_axis_labels = False
            )

        #sending the pillow object as png files
        tempobj = fig2img(new_img)
        imageio = io.BytesIO()
        tempobj.save(imageio, "PNG", quality=85)
        imageio.seek(0)
        print(type(imageio))
        return imageio

    except Exception as err:
        print('ERR',err)
        print(str(request.files))
        print("no file recieved")



@app.route('/predict_fpn',methods=['POST'])
@cross_origin()
def upload():
    imageio = request_procedure(model_fpn, "fpn")
    response = send_file(imageio, as_attachment=True, attachment_filename='prediction.png', mimetype='image/png')
    return response


@app.route('/predict_multi',methods=['POST'])
@cross_origin()
def upload_multi():
    imageio = request_procedure(model_multi,"multi")
    response = send_file(imageio, as_attachment=True, attachment_filename='prediction.png', mimetype='image/png')
    return response



@app.route('/predict_linknet',methods=['POST'])
@cross_origin()
def upload_linknet():
    imageio = request_procedure(model_linknet, "linknet")
    response = send_file(imageio, as_attachment=True, attachment_filename='prediction.png', mimetype='image/png')
    return response



if __name__ == "__main__":
    app.run(debug=True)