import numpy as np
from flask import Flask, request, jsonify, send_file
import tensorflow
from tensorflow.keras.models import load_model
import efficientnet.keras as efn
import matplotlib as plt
import cv2
from PIL import Image
from flask_cors import CORS




app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

model_fpn = load_model('fpn_model.h5',compile = False)
#model_unet = pickle.load(open('unet.pkl','rb'))
#model_multi = pickle.load(open('multi_fpn.pkl','rb'))
model_fpn.compile()

def visualize_superimpose_arrs(*args, plot_title, show_axis_labels = True):
  fig, axes = plt.subplots(nrows=1, ncols=1, figsize=(8, 8))

  axes.imshow(cv2.cvtColor(args[0], cv2.COLOR_BGR2RGB))
  axes.imshow(args[1], alpha=.4)
  #axes.set_title(plot_title[0])
  axes.get_xaxis().set_visible(show_axis_labels)
  axes.get_yaxis().set_visible(show_axis_labels)


def fig2img(fig):
    """Convert a Matplotlib figure to a PIL Image and return it"""
    import io
    buf = io.BytesIO()
    fig.savefig(buf)
    buf.seek(0)
    img = Image.open(buf)
    return img


@app.route('/predict',methods=['POST'])
def upload():
    try:
        imagefile = request.files['imagefile']
        print("image successfully uploaded")
        img = cv2.imread(imagefile)
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
        response = send_file(tempobj, as_attachment=True, attachment_filename='prediction.png', mimetype='image/png')
        return response
    except Exception as err:
        print("no file recieved")

if __name__ == "__main__":
    app.run(debug=True)