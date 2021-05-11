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

model_fpn = load_model('fpn_model.h5',compile = False)

model_fpn.compile()

def visualize_superimpose_arrs(*args, plot_title, show_axis_labels = True):
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


@app.route('/predict',methods=['POST'])
@cross_origin()
def upload():
    try:

        imagefile = request.files['image'].read()
        print("image successfully uploaded")

        img = cv2.imdecode(np.frombuffer(imagefile, np.uint8), cv2.IMREAD_UNCHANGED)
        print(img.shape)
        if img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
        img_resized = cv2.resize(img, (512,256))
        img_arr = np.zeros((1, 256, 512, 3), dtype=np.float32)
        img_arr[0] = img_resized / 255
        fpn_pred = model_fpn.predict(img_arr, verbose = 1).round()

        new_img = visualize_superimpose_arrs(
            img_arr[0],
            fpn_pred.squeeze(),
            plot_title = ['Original'],
            show_axis_labels = False
        )

        tempobj = fig2img(new_img)
        imageio = io.BytesIO()
        tempobj.save(imageio, "PNG", quality=85)
        imageio.seek(0)
        print(type(imageio))
        response = send_file(imageio, as_attachment=True, attachment_filename='prediction.png', mimetype='image/png')
        
        return response
    except Exception as err:
        print('ERR',err)
        print(str(request.files))
        print("no file recieved")

if __name__ == "__main__":
    app.run(debug=True)