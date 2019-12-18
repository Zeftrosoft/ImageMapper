import os
import json

class DBHelper:

  def init(self):
    self.path_to_enrolled = os.path.join(os.path.dirname(__file__), "web","static","images","enrolled")
    self.set_path = '/images/enrolled/'
    self.prediction_folder_path = '/images/prediction/'
    self.prediction_data_path = os.path.join(os.path.dirname(__file__), "web","static","images","prediction","recog.json")
    self.enrolled = []

  def getEnrolled(self):
    self.init()
    for dir_name in sorted(os.listdir(self.path_to_enrolled )):
      set_path_dir = self.set_path+dir_name + '/'+ sorted(os.listdir(os.path.join(self.path_to_enrolled ,dir_name)))[0]
      self.enrolled.append(set_path_dir)
    return self.enrolled

  def getPredictionData(self):
    self.init()
    with open(self.prediction_data_path) as jsonData:
      self.prediction_data = json.load(jsonData)
      self.prediction_data = self.prediction_data['recognitions']
      jsonData.close()

    prediction_data = []
    for predict_path in self.prediction_data:
      prediction = {}
      prediction['image_path'] = self.correct_image_path(predict_path['image_path'])
      prediction['recognised_images'] = []
      for dir_name in predict_path['recognised_ids']:
        image_path = self.set_path + str(dir_name) + '/' + sorted(os.listdir(os.path.join(self.path_to_enrolled ,str(dir_name))))[0]
        print(image_path)
        prediction['recognised_images'].append(image_path)
      prediction_data.append(prediction)
    return prediction_data

  def correct_image_path(self, image_path):
    parts = image_path.split('/')
    file_name = parts[len(parts)-1]
    corrected_path = self.prediction_folder_path + file_name
    return corrected_path