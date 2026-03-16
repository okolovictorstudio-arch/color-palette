from flask import Flask, request, jsonify, render_template
from colorthief import ColorThief
import io

app = Flask(__name__)

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-palette', methods=['POST'])
def get_palette():
    file = request.files['image']
    image_bytes = io.BytesIO(file.read())
    color_thief = ColorThief(image_bytes)
    palette = color_thief.get_palette(color_count=6)
    hex_colors = [rgb_to_hex(color) for color in palette]
    return jsonify(hex_colors)

if __name__ == '__main__':
    app.run(debug=True)