from flask import Flask, render_template, request, redirect, jsonify
from dbhelper import DBHelper

app = Flask(__name__,
            static_url_path='', 
            static_folder='web/static',
            template_folder='web/templates')
helper = DBHelper()
@app.route('/', methods=['GET'])
def default():
    return redirect('/mapper')

@app.route('/enroll_data', methods=['GET'])
def enrolledData():
    res = {}
    res['status'] = True
    res['msg'] = "Success"
    res['details'] = helper.getEnrolled()
    return jsonify(res)

@app.route('/prediction_data', methods=['GET'])
def predictionData():
    res = {}
    res['status'] = True
    res['msg'] = "Success"
    res['details'] = helper.getPredictionData()
    return jsonify(res)

@app.route('/mapper', methods=['GET','POST'])
def mapper():
    res = {
        'init' : True,
        'status': False,
        'data':[],
        'msg':'',
        'title': 'Mapper'
    }
    return render_template('dashboard.html', data=res)

if __name__ == "__main__":
    app.run(debug=True)


